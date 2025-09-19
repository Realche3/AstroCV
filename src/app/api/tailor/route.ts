import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import mammoth from 'mammoth';
// Import the internal implementation to avoid debug code in pdf-parse's index.js
// which reads a test file in certain bundlers/environments.
// eslint-disable-next-line import/no-default-export
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/payments/jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Basic CORS helpers to gracefully handle unexpected preflights in production
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  } as Record<string, string>;
}


const DAILY_TAILOR_LIMIT = 3;
const TAILOR_WARNING_THRESHOLD = 2;
const TAILOR_QUOTA_COOKIE = 'tailor_quota';

const PRO_TAILOR_LIMIT = 20;
const PRO_TAILOR_WARNING_THRESHOLD = 15;
const PRO_TAILOR_COOKIE = 'tailor_pro_usage';

type TailorQuota = { date: string; count: number };
type ProUsage = { sid: string; exp: number; count: number };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function buildResponse(
  body: unknown,
  options: {
    status?: number;
    headers?: Record<string, string>;
    quota?: TailorQuota | null;
    proUsage?: ProUsage | null;
  } = {}
) {
  const headers = { ...corsHeaders(), ...(options.headers ?? {}) };
  const res = NextResponse.json(body, { status: options.status ?? 200, headers });

  if (options.quota) {
    res.cookies.set(TAILOR_QUOTA_COOKIE, JSON.stringify(options.quota), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
  } else if (options.quota === null) {
    res.cookies.delete(TAILOR_QUOTA_COOKIE);
  }

  if (options.proUsage) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const ttl = Math.max(options.proUsage.exp - nowSeconds, 0);
    if (ttl > 0) {
      res.cookies.set(PRO_TAILOR_COOKIE, JSON.stringify(options.proUsage), {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: ttl,
        path: '/',
      });
    } else {
      res.cookies.delete(PRO_TAILOR_COOKIE);
    }
  } else if (options.proUsage === null) {
    res.cookies.delete(PRO_TAILOR_COOKIE);
  }

  return res;
}

function quotaHeadersForCount(count: number) {
  const remaining = Math.max(DAILY_TAILOR_LIMIT - count, 0);
  const headers: Record<string, string> = { 'X-Tailor-Remaining': String(remaining) };
  if (count >= TAILOR_WARNING_THRESHOLD && count < DAILY_TAILOR_LIMIT) {
    headers['X-Tailor-Warning'] = 'You have one free tailoring left today. Unlock unlimited tailoring to continue.';
  }
  return headers;
}

function proHeadersForCount(count: number) {
  const remaining = Math.max(PRO_TAILOR_LIMIT - count, 0);
  const headers: Record<string, string> = {
    'X-Tailor-Remaining': String(remaining),
    'X-Pro-Tailor-Remaining': String(remaining),
    'X-Pro-Tailor-Limit': String(PRO_TAILOR_LIMIT),
  };
  if (count >= PRO_TAILOR_WARNING_THRESHOLD && count < PRO_TAILOR_LIMIT) {
    headers['X-Tailor-Warning'] = 'You are nearing the Pro tailoring cap for this session.';
  }
  return headers;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// Optional: lightweight health check for GET to avoid 405s from HEAD/GET pings
export async function GET() {
  return NextResponse.json({ ok: true }, { headers: corsHeaders() });
}

export const POST = async (req: Request) => {
  let hasUnlimitedTailoring = false;
  let quota: TailorQuota = { date: todayKey(), count: 0 };
  let proUsage: ProUsage | null = null;

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('[TAILOR_API_ERROR] Missing OPENAI_API_KEY');
      return buildResponse(
        { error: 'Server misconfigured: missing OpenAI credentials.' },
        { status: 500 }
      );
    }



const formData = await req.formData();
const accessTokenRaw = formData.get('accessToken');
const accessToken = typeof accessTokenRaw === 'string' ? accessTokenRaw.trim() : null;
const entitlement = accessToken ? verifyAccessToken(accessToken) : null;
const proSessionId = entitlement?.type === 'pro' && entitlement.sid ? entitlement.sid : null;
const proSessionExp = entitlement?.type === 'pro' && entitlement.exp ? entitlement.exp : null;
hasUnlimitedTailoring = Boolean(proSessionId && proSessionExp);

const cookieStore = await cookies();
const today = todayKey();
const nowSeconds = Math.floor(Date.now() / 1000);

quota = { date: today, count: 0 };
proUsage = null;

if (hasUnlimitedTailoring && proSessionId && proSessionExp) {
  const proCookieValue = cookieStore.get(PRO_TAILOR_COOKIE)?.value;
  if (proCookieValue) {
    try {
      const parsed = JSON.parse(proCookieValue) as ProUsage;
      if (parsed && parsed.sid === proSessionId && typeof parsed.count === 'number' && parsed.exp > nowSeconds) {
        proUsage = parsed;
      }
    } catch (err: unknown) {
      console.warn('[TAILOR_PRO_PARSE_ERROR]', err);
    }
  }

  if (!proUsage) {
    proUsage = { sid: proSessionId, exp: proSessionExp, count: 0 };
  }

  if (proUsage.count >= PRO_TAILOR_LIMIT) {
    return buildResponse(
      { error: 'You have reached the high-usage limit for this Pro session. Please try again shortly.' },
      { status: 429, headers: proHeadersForCount(proUsage.count), proUsage }
    );
  }
} else {
  const quotaCookie = cookieStore.get(TAILOR_QUOTA_COOKIE)?.value;
  if (quotaCookie) {
    try {
      const parsed = JSON.parse(quotaCookie) as TailorQuota;
      if (parsed && parsed.date === today && typeof parsed.count === 'number') {
        quota = parsed;
      }
    } catch (err: unknown) {
      console.warn('[TAILOR_QUOTA_PARSE_ERROR]', err);
    }
  }

  if (quota.date !== today) {
    quota = { date: today, count: 0 };
  }

  if (quota.count >= DAILY_TAILOR_LIMIT) {
    return buildResponse(
      { error: "You have reached today's free tailoring limit. Please unlock to continue." },
      { status: 429, headers: quotaHeadersForCount(quota.count), quota, proUsage: null }
    );
  }
}

const jobDescription = (formData.get('jobDescription') as string)?.trim();
const resumeText = (formData.get('resumeText') as string | null)?.trim() || null;
const resumeFile = formData.get('resumeFile') as File | null;

let extractedResumeText = '';

if (resumeFile) {
  const arrayBuffer = await resumeFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileType = resumeFile.name.split('.').pop()?.toLowerCase();

  if (fileType === 'pdf') {
    const data = await pdfParse(buffer);
    extractedResumeText = data.text;
  } else if (fileType === 'doc' || fileType === 'docx') {
    const data = await mammoth.extractRawText({ buffer });
    extractedResumeText = data.value;
  } else {
    return buildResponse(
      { error: 'Unsupported file type.' },
      {
        status: 400,
        quota: hasUnlimitedTailoring ? null : quota,
        proUsage: hasUnlimitedTailoring ? proUsage : null,
      }
    );
  }
}

const finalResumeText = resumeText || extractedResumeText.trim();

if (!finalResumeText || !jobDescription) {
  return buildResponse(
    { error: 'Missing resume or job description.' },
    {
      status: 400,
      quota: hasUnlimitedTailoring ? null : quota,
      proUsage: hasUnlimitedTailoring ? proUsage : null,
    }
  );
}

let updatedQuota: TailorQuota | null = null;
let updatedProUsage: ProUsage | null = null;
let responseHeaders: Record<string, string>;

if (hasUnlimitedTailoring && proUsage) {
  updatedProUsage = { ...proUsage, count: proUsage.count + 1 };
  responseHeaders = proHeadersForCount(updatedProUsage.count);
} else {
  updatedQuota = { date: today, count: quota.count + 1 };
  responseHeaders = quotaHeadersForCount(updatedQuota.count);
}

    const prompt = `
You are an AI resume optimization assistant. Your job is to take a candidate's resume and a job description, then produce three outputs:

1. **A tailored resume in strict JSON format** (see schema below).
2. **A professional, concise cover letter** (3 to 5 short paragraphs).
3. **A polite follow-up email** (3 to 4 sentences, suitable to send a few days after applying).

---

### dY"< RULES (Critical):
- **Do NOT invent or fabricate information.** Only use what is present in the candidate's resume.
- If a field is missing (e.g., no portfolio, no certifications), return it as an empty string or an empty array - never guess.
- Tailor the content by:
  - Reordering skills so the most relevant appear first.
  - Rewriting job responsibilities to highlight impact, quantify results if they are already mentioned.
  - Paraphrasing to match keywords from the job description naturally (for ATS).
- Keep the result **ATS-friendly**:
  - No special symbols, emojis, or fancy formatting.
  - Keep bullet points simple and concise.
- **Do not copy/paste the job description verbatim** - summarize or paraphrase it.
- Preserve the candidate's voice and experience level - don't make them sound overqualified or underqualified.
- The response **must** be valid JSON and must follow the schema exactly (see below).
- Do not include any text outside the JSON object - no explanations, no markdown.
- if resume and job descriptions languages are not the same, generate tailoredResume, followup email and coverLetter in using the original resume language.

---


### Resume Format (JSON only):
{
  "header": {
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "portfolio": ""
  },
  "summary": "",
  "skills": ["", "", ""],
  "education": [
    {
      "degree": "",
      "field": "",
      "institution": "",
      "location": "",
      "date": "",
      "details": ""
    }
  ],
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "date": "",
      "responsibilities": ["", "", ""]
    }
  ],
  "certifications": [""],
  "projects": [
    {
      "title": "",
      "link": "",
      "description": ""
    }
  ],
  "languages": [""]
}

### Format your reply strictly like this (no markdown):

{
  "tailoredResume": { ... },
  "coverLetter": "Cover letter goes here...",
  "followUpEmail": "Follow-up email goes here..."
}

Job Description:
${jobDescription}

Candidate Resume:
${finalResumeText}
`;

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful resume assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 3000,
        temperature: 0.3,
      });
    } catch (error: unknown) {
      const openAiError =
        typeof error === 'object' && error !== null
          ? (error as { status?: number; message?: string })
          : undefined;
      console.error('[OPENAI_REQUEST_ERROR]', openAiError?.status, openAiError?.message ?? error);
      const status = openAiError?.status;
      const msg =
        status === 401
          ? 'AI service authentication failed.'
          : status === 429
          ? 'AI service rate limited. Please retry shortly.'
          : 'AI service error. Please try again.';
      return buildResponse(
        { error: msg },
        {
          status: 502,
          headers: responseHeaders,
          quota: updatedQuota,
          proUsage: hasUnlimitedTailoring ? updatedProUsage : null,
        }
      );
    }

    const rawResponse = completion.choices[0].message.content?.trim() || '';
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[NO_JSON_MATCH]', rawResponse);
      return buildResponse(
        { error: 'OpenAI did not return valid JSON. Try again.' },
        {
          status: 500,
          headers: responseHeaders,
          quota: updatedQuota,
          proUsage: hasUnlimitedTailoring ? updatedProUsage : null,
        }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err: unknown) {
      console.error('[JSON_PARSE_ERROR]', err, jsonMatch[0]);
      return buildResponse(
        { error: 'Failed to parse JSON from AI response.' },
        {
          status: 500,
          headers: responseHeaders,
          quota: updatedQuota,
          proUsage: hasUnlimitedTailoring ? updatedProUsage : null,
        }
      );
    }

    console.log('FINAL PARSED OUTPUT', parsed);


return buildResponse(parsed, {
  headers: responseHeaders,
  quota: updatedQuota,
  proUsage: hasUnlimitedTailoring ? updatedProUsage : null,
});
  } catch (error: unknown) {
    console.error('[TAILOR_API_ERROR]', error);
    return buildResponse(
      { error: 'Internal server error.' },
      { status: 500, quota: hasUnlimitedTailoring ? null : quota, proUsage: hasUnlimitedTailoring ? proUsage : null }
    );
  }
};

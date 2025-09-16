import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import mammoth from 'mammoth';
// Import the internal implementation to avoid debug code in pdf-parse's index.js
// which reads a test file in certain bundlers/environments.
// eslint-disable-next-line import/no-default-export
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

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

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// Optional: lightweight health check for GET to avoid 405s from HEAD/GET pings
export async function GET() {
  return NextResponse.json({ ok: true }, { headers: corsHeaders() });
}

export const POST = async (req: Request) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('[TAILOR_API_ERROR] Missing OPENAI_API_KEY');
      return NextResponse.json({ error: 'Server misconfigured: missing OpenAI credentials.' }, { status: 500 });
    }

    const formData = await req.formData();
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
        return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
      }
    }

    const finalResumeText = resumeText || extractedResumeText.trim();

    if (!finalResumeText || !jobDescription) {
      return NextResponse.json({ error: 'Missing resume or job description.' }, { status: 400 });
    }

    const prompt = `
You are an AI resume optimization assistant. Your job is to take a candidate's resume and a job description, then produce three outputs:

1. **A tailored resume in strict JSON format** (see schema below).
2. **A professional, concise cover letter** (3 to 5 short paragraphs).
3. **A polite follow-up email** (3 to 4 sentences, suitable to send a few days after applying).

---

### 📋 RULES (Critical):
- **Do NOT invent or fabricate information.** Only use what is present in the candidate's resume.
- If a field is missing (e.g., no portfolio, no certifications), return it as an empty string or an empty array — never guess.
- Tailor the content by:
  - Reordering skills so the most relevant appear first.
  - Rewriting job responsibilities to highlight impact, quantify results if they are already mentioned.
  - Paraphrasing to match keywords from the job description naturally (for ATS).
- Keep the result **ATS-friendly**:
  - No special symbols, emojis, or fancy formatting.
  - Keep bullet points simple and concise.
- **Do not copy/paste the job description verbatim** — summarize or paraphrase it.
- Preserve the candidate's voice and experience level — don't make them sound overqualified or underqualified.
- The response **must** be valid JSON and must follow the schema exactly (see below).
- Do not include any text outside the JSON object — no explanations, no markdown.
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
    } catch (e: any) {
      console.error('[OPENAI_REQUEST_ERROR]', e?.status, e?.message || e);
      const msg = e?.status === 401
        ? 'AI service authentication failed.'
        : e?.status === 429
        ? 'AI service rate limited. Please retry shortly.'
        : 'AI service error. Please try again.';
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const rawResponse = completion.choices[0].message.content?.trim() || '';
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[NO_JSON_MATCH]', rawResponse);
      return NextResponse.json({ error: 'OpenAI did not return valid JSON. Try again.' }, { status: 500 });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('[JSON_PARSE_ERROR]', err, jsonMatch[0]);
      return NextResponse.json({ error: 'Failed to parse JSON from AI response.' }, { status: 500 });
    }
    
    console.log('FINAL PARSED OUTPUT', parsed);
    return NextResponse.json(parsed); // Includes all 3: tailoredResume, coverLetter, followUpEmail
  } catch (error) {
    console.error('[TAILOR_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
};

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

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
You are an expert AI job application assistant.

Given the following job description and candidate resume, generate:

1. A tailored, ATS-optimized resume (structured as JSON).
2. A short and professional cover letter for the job.
3. A short and polite follow-up email for after the application.

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

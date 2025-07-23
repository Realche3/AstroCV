import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: Request) => {
  try {
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

    // 🧠 JSON-structured prompt
    const prompt = `
You are an expert AI resume optimization assistant.

Given the following job description and resume, generate a tailored, ATS-friendly, keyword-optimized resume matching the job requirements while maintaining the candidate's voice and professional tone.

Return the result as **strict JSON** with the following format:

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

**Only return valid JSON. Do not include explanations or markdown.**

Job Description:
${jobDescription}

Candidate Resume:
${finalResumeText}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful resume optimization assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const rawResponse = completion.choices[0].message.content?.trim() || '';

    // Extract JSON from response (handles if extra text before/after)
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[NO_JSON_MATCH]', rawResponse);
      return NextResponse.json({ error: 'OpenAI did not return valid JSON. Try again.' }, { status: 500 });
    }

    let tailoredResume;
    try {
      tailoredResume = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('[JSON_PARSE_ERROR]', err, jsonMatch[0]);
      return NextResponse.json({ error: 'Failed to parse JSON from AI response.' }, { status: 500 });
    }

    return NextResponse.json({ tailoredResume });
  } catch (error) {
    console.error('[TAILOR_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
};

// src/types/TailoredResume.ts

export interface TailoredResume {
  header: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  skills: string[];
  education: {
    degree: string;
    field: string;
    institution: string;
    location: string;
    date: string;
    details: string;
  }[];
  experience: {
    title: string;
    company: string;
    location: string;
    date: string;
    responsibilities: string[];
  }[];
  certifications: string[];
  projects: {
    title: string;
    link: string;
    description: string;
  }[];
  languages: string[];
}

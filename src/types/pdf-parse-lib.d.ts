declare module 'pdf-parse/lib/pdf-parse.js' {
  import type { Buffer } from 'node:buffer';
  export interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }
  export default function pdfParse(
    data: Buffer | Uint8Array | ArrayBuffer,
    options?: { pagerender?: (page: any) => Promise<string>; max?: number; version?: string }
  ): Promise<PDFParseResult>;
}


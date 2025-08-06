import { Tool } from "langchain/tools";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CreateSourceSchema, type CreateSource } from "@schemas/source.model";

export class PdfTool extends Tool {
  name = "pdf_processor";
  description = "Process PDF files and format content for the Source model";

  async _call(input: string): Promise<string> {
    try {
      const { fileBuffer, fileName, url } = JSON.parse(input);
      
      if (!fileBuffer) {
        throw new Error("No PDF file buffer provided");
      }

      // Convert base64 to Buffer
      const buffer = Buffer.from(fileBuffer, 'base64');
      
      // Create a Blob from the buffer (PDFLoader can work with Blob)
      const blob = new Blob([buffer], { type: 'application/pdf' });
      
      // Load PDF content directly from blob
      const loader = new PDFLoader(blob, {
        splitPages: false, // Keep all content together
      });
      
      const docs = await loader.load();

      // Extract content from all pages
      const content = docs
        .map(doc => doc.pageContent)
        .join('\n\n')
        .trim();

      if (!content) {
        throw new Error("No content extracted from PDF");
      }

      // Create Source-compatible data
      const sourceData: CreateSource = {
        content,
        url: url || null,
      };

      // Validate against Source schema
      const validatedData = CreateSourceSchema.parse(sourceData);

      return JSON.stringify({
        success: true,
        data: validatedData,
        metadata: {
          title: fileName || "PDF Document",
          pageCount: docs.length,
          contentLength: content.length,
          extractedAt: new Date().toISOString(),
          originalMetadata: docs[0]?.metadata || {},
        },
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  // Helper method to get validated source data directly from Buffer
  async pdfToSource(buffer: Buffer, fileName?: string, url?: string): Promise<CreateSource> {
    try {
      const blob = new Blob([buffer], { type: 'application/pdf' });
      
      const loader = new PDFLoader(blob, {
        splitPages: false,
      });
      
      const docs = await loader.load();
      const content = docs
        .map(doc => doc.pageContent)
        .join('\n\n')
        .trim();

      if (!content) {
        throw new Error("No content extracted from PDF");
      }

      const sourceData: CreateSource = {
        content,
        url: url || null,
      };

      // Validate against Source schema
      const validatedData = CreateSourceSchema.parse(sourceData);
      return validatedData;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to process PDF");
    }
  }
}
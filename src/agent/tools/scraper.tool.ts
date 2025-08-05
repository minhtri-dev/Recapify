import { Tool } from "langchain/tools";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { HtmlToTextTransformer } from "@langchain/community/document_transformers/html_to_text";
import { CreateSourceSchema, type CreateSource } from "@schemas/source.model";

export class ScraperTool extends Tool {
  name = "web_scraper";
  description = "Scrape web content and format it for the Source model";

  async _call(url: string): Promise<string> {
    try {
      new URL(url)

      const loader = new CheerioWebBaseLoader(url);
      const docs = await loader.load();

      // Transform HTML to clean text
      const transformer = new HtmlToTextTransformer();
      const transformedDocs = await transformer.transformDocuments(docs);

      // Extract content and ensure it meets the Source model requirements
      const content = transformedDocs[0]?.pageContent?.trim() || "";

      if (!content) {
        throw new Error("No content extracted from URL");
      }

      // Create Source-compatible data
      const sourceData: CreateSource = {
        content,
        url,
      };

      // Validate against Source schema
      const validatedData = CreateSourceSchema.parse(sourceData);

      return JSON.stringify({
        success: true,
        data: validatedData,
        metadata: {
          title: docs[0]?.metadata?.title || "Unknown",
          originalMetadata: docs[0]?.metadata || {},
          contentLength: content.length,
          extractedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        url,
      });
    }
  }

  // Helper method to get validated source data directly
  async scrapeToSource(url: string): Promise<CreateSource> {
    const result = await this._call(url);
    const parsed = JSON.parse(result);

    if (!parsed.success) {
      throw new Error(parsed.error);
    }

    return parsed.data;
  }
}
import { Tool } from "langchain/tools";
import { searchSimilarNotes } from "@db/prisma.vector";

interface LookupInput {
  query: string;
  limit?: number;
}

export class LookupTool extends Tool {
  name = "lookup_notes";
  description = "Search for similar notes based on a query string. Use this when you need to find relevant information from the user's notes.";

  async _call(input: string): Promise<string> {
    try {
      const { query, limit = 5 } = JSON.parse(input) as LookupInput;

      if (!query) {
        throw new Error("Query parameter is required");
      }

      const results = await searchSimilarNotes(query, limit);
      
      if (!results || results.length === 0) {
        return JSON.stringify({
          success: true,
          data: [],
          message: "No similar notes found for the given query."
        });
      }

      // Format the results for the agent
      const formattedResults = results.map((note, index) => ({
        index: index + 1,
        content: note.pageContent,
        metadata: note.metadata
      }));

      return JSON.stringify({
        success: true,
        data: formattedResults,
        metadata: {
          query,
          resultsCount: results.length,
          searchedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during lookup",
      });
    }
  }

  // Helper method for direct use in API routes
  async searchNotes(query: string, limit: number = 5) {
    const input = JSON.stringify({ query, limit });
    const result = await this._call(input);
    const parsed = JSON.parse(result);

    if (!parsed.success) {
      throw new Error(parsed.error);
    }

    return parsed.data;
  }
}
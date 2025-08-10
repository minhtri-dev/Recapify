import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchSimilarNotes } from "@db/prisma.vector";

export const LookupTool = tool(
  async ({ query, limit = 5 }) => {
    try {
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
  },
  {
    name: "LookupNotes",
    description: "Search for similar notes based on a query string. Use this tool to find relevant information from the user's notes to help answer their questions. The results should be used as context to formulate your response.",
    schema: z.object({
      query: z.string().describe("The search query to find similar notes"),
      limit: z
        .number()
        .optional()
        .default(5)
        .describe("Maximum number of results to return"),
    }),
  }
);

// Helper function for direct use in API routes
export async function searchNotes(query: string, limit: number = 5) {
  const result = await LookupTool.invoke({ query, limit });
  const parsed = JSON.parse(result);

  if (!parsed.success) {
    throw new Error(parsed.error);
  }

  return parsed.data;
}
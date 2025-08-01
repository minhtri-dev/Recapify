
import { vi, expect, test } from 'vitest'
import { client, vectorStore } from '@db/weaviate.client'
import type { Document } from "@langchain/core/documents";

// Patch Array.isArray to workaround issue with onnxruntime
const originalImplementation = Array.isArray;
vi.spyOn(Array, "isArray").mockImplementation((value: unknown) => {
  if (
    value != null &&
    value.constructor &&
    (value.constructor.name === "Float32Array" ||
      value.constructor.name === "BigInt64Array")
  ) {
    return true;
  }
  return originalImplementation(value);
});

test('Check Weaviate client connectivity', async () => {
  const isReady = await client.isReady()
  expect(isReady).toBe(true)
})

test('Add a document to the vectorStore', async () => {
  const document: Document = {
    pageContent: "The powerhouse of the cell is the mitochondria",
    metadata: { source: "https://example.com" },
  };

  await vectorStore.addDocuments([document])

  const results = await vectorStore.similaritySearch("powerhouse of the cell", 1);

  expect(results).toHaveLength(1);
  expect(results[0].pageContent).toBe(document.pageContent);
  expect(results[0].metadata.source).toBe(document.metadata.source);
})
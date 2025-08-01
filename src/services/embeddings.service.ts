import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

export const Embeddings = new HuggingFaceTransformersEmbeddings({
  model: "Xenova/all-mpnet-base-v2",
});
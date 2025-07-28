

import { pipeline } from '@xenova/transformers'
import { type EmbeddingsInterface } from '@langchain/core/embeddings'

async function getEmbedding(data: string[]): Promise<number[][]> {
  try {
    const extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
    )
    const response = await extractor(data, { pooling: 'mean', normalize: true })
    return response.tolist()
  } catch (error) {
    console.error('Error fetching embeddings:', error)
    throw new Error('Failed to get embeddings')
  }
}

export class FacilityEmbeddings implements EmbeddingsInterface {
  async embedDocuments(texts: string[]): Promise<number[][]> {
    return getEmbedding(texts)
  }

  async embedQuery(text: string): Promise<number[]> {
    const embeddings = await getEmbedding([text])
    return embeddings[0]
  }
}
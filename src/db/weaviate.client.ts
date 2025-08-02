import weaviate, { WeaviateClient } from 'weaviate-client'
import { WeaviateStore } from '@langchain/weaviate'
import { Embeddings } from '@services/embeddings.service'

import '@env.config'

const weaviateURL = (process.env.WEAVIATE_URL as string) || undefined
const weaviateApiKey = (process.env.WEAVIATE_API_KEY as string) || undefined

let client: WeaviateClient | null = null
let vectorStore: WeaviateStore | null = null

async function getWeaviateClient(): Promise<WeaviateClient> {
  if (!client) {
    if (weaviateURL) {
      client = await weaviate.connectToWeaviateCloud(weaviateURL, {
        authCredentials: new weaviate.ApiKey(weaviateApiKey!),
      })
    } else {
      client = await weaviate.connectToLocal()
    }

    if (!client || !client.isReady()) {
      throw new Error('Could not connect to Weaviate client')
    }
  }
  return client
}

async function getVectorStore(): Promise<WeaviateStore> {
  if (!vectorStore) {
    const client = await getWeaviateClient()
    vectorStore = new WeaviateStore(Embeddings, {
      client: client,
      indexName: 'ProjectData',
    })
  }
  return vectorStore
}

export { getWeaviateClient, getVectorStore }

import weaviate, { WeaviateClient } from 'weaviate-client'
import { WeaviateStore } from '@langchain/weaviate'
import { Embeddings } from '@services/embeddings.service'

import '@env.config'

const weaviateURL = process.env.WEAVIATE_URL as string
const weaviateApiKey = process.env.WEAVIATE_API_KEY as string

export const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
  weaviateURL,
  {
    authCredentials: new weaviate.ApiKey(weaviateApiKey),
  },
)

export const vectorStore = new WeaviateStore(Embeddings, {
  client: client,
  indexName: 'ProjectData',
})

// console.log("Weaviate client is ready?", await client.isReady())

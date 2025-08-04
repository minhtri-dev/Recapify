// import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
// import { Prisma, Notes } from "@prisma/client";
// import { Embeddings } from "@services/embeddings.service";
// import prisma from "@db/prisma.client";

// let vectorStore: PrismaVectorStore<Notes>;

// if (!vectorStore) {
//   vectorStore = PrismaVectorStore.withModel<Notes>(prisma).create(
//     Embeddings,
//     {
//       prisma: Prisma,
//       tableName: "Notes",
//       vectorColumnName: "vector",
//       columns: {
//         id: PrismaVectorStore.IdColumn,
//         content: PrismaVectorStore.ContentColumn,
//       },
//     }
//   );
// }

// export default vectorStore

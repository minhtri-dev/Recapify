import { expect, test } from 'vitest'
import prisma from '@db/prisma.client'

test('Prisma client connectivity', async () => {
  const result = await prisma.$queryRaw<
    { result: number }[]
  >`SELECT 1+1 AS result;`

  expect(result).toBeDefined()
  expect(result[0]).toHaveProperty('result', 2)
})

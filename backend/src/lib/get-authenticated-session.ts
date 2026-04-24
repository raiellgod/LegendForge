import { prisma } from './prisma.js'

export async function getAuthenticatedSession(request: {
  headers: {
    authorization?: string
  }
}) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.replace('Bearer ', '').trim()

  const session = await prisma.session.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  })

  if (!session) {
    return null
  }

  if (session.expiresAt < new Date()) {
    return null
  }

  return session
}
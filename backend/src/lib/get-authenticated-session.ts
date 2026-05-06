import { fromNodeHeaders } from "better-auth/node"

import { auth } from "./auth.js"

export async function getAuthenticatedSession(request: {
  headers: Record<string, string | string[] | undefined>
}) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  })

  return session
}
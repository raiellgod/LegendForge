import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { openAPI } from "better-auth/plugins"

import { prisma } from "./prisma.js"

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.9:3000",

    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://192.168.0.9:8081",
  ],
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [openAPI()],
})
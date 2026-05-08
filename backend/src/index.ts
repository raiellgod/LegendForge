import "dotenv/config";

import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";

import { auth } from "./lib/auth.js";
import { campaignRoutes } from "./routes/campaigns.js";
import { systemRoutes } from "./routes/systems.js";

const app = Fastify({
  logger: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(fastifyCors, {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.9:3000",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
  ],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "LegendForge",
      description:
        "VTT de jogo para RPGs de mesa, totalmente escalável e personalizável para atender as necessidades de cada jogador",
      version: "1.0.0",
    },
    servers: [
      {
        description: "Localhost",
        url: "http://localhost:8081",
      },
    ],
  },
  transform: jsonSchemaTransform,
});

app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);

      const headers = new Headers();

      Object.entries(request.headers).forEach(([key, value]) => {
        if (!value) {
          return;
        }

        if (Array.isArray(value)) {
          headers.append(key, value.join(", "));
          return;
        }

        headers.append(key, value);
      });

      const body =
        request.method !== "GET" && request.body
          ? JSON.stringify(request.body)
          : undefined;

      const authRequest = new Request(url.toString(), {
        method: request.method,
        headers,
        body,
      });

      const response = await auth.handler(authRequest);

      reply.status(response.status);

      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      const responseBody = await response.text();

      return reply.send(responseBody || null);
    } catch (error) {
      app.log.error(error);

      return reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

await app.register(fastifyApiReference, {
  routePrefix: "/docs",
  configuration: {
    sources: [
      {
        title: "LegendForge API",
        slug: "legend-forge-api",
        url: "/swagger.json",
      },
      {
        title: "Auth API",
        slug: "auth-api",
        url: "/api/auth/open-api/generate-schema",
      },
    ],
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger();
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/",
  schema: {
    description: "Hello world",
    tags: ["Hello World"],
    response: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
  handler: () => {
    return {
      message: "Hello World",
    };
  },
});

await app.register(campaignRoutes);
await app.register(systemRoutes);

try {
  await app.listen({
    port: Number(process.env.PORT) || 8081,
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

import { FastifyInstance } from "fastify"
import WAClient from "../../libs/whatsapp"

export const whatsappRoutes = (fastify: FastifyInstance, client: WAClient) => {
  fastify.register(
    async (child) => {
      child.addHook("onRequest", async (request, reply) => {
        const { secret } = request.query as { secret: string }
        if (!secret || secret !== process.env.SECRET_API) {
          reply.code(403)
          throw new Error("Unauthorized access")
        }
      })

      // http://127.0.0.1:PORT/api/status?secret=yoursecret
      child.get("/status", () => {
        return {
          message: client.status,
          error: "Success",
          statusCode: 200
        }
      })

      child.get("/send/message/:id", (request, reply) => {
        const { id } = request.query as { id: string }
        const { message } = request.query as { message: string }
        if (!id || !message) {
          reply.code(400)
          throw new Error("Missing parameters")
        }
        const tx = client.sendMessage(id, {
          text: message
        }
        )
        return {
          message: tx,
          error: "Success",
          statusCode: 200
        }
      })
    },
    { prefix: "/api" }
  )
}

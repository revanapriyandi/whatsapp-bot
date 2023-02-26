import { inspect } from "util"

import cfonts from "cfonts"
import qrcode from "qrcode"
import NodeCache from "node-cache"

import fastifyServer, { whatsappRoutes } from "./libs/server"
import WAClient, { serialize } from "./libs/whatsapp"
import Database from "./libs/database"
import { i18nInit } from "./libs/international"

import * as callHandler from "./handlers/call"
import * as groupHandler from "./handlers/group"
import * as groupParticipantHandler from "./handlers/group-participant"
import * as messageHandler from "./handlers/message"

import { resetUserLimit, resetUserRole } from "./utils/cron"

/** Initial Server */
const fastify = fastifyServer({
  // fastify options
  trustProxy: true
})

/** Initial Client */
const client = new WAClient({
  // auth type "single" or "multi"
  authType: "single",
  // baileys options
  generateHighQualityLinkPreview: true,
  mediaCache: new NodeCache({
    stdTTL: 60 * 5, // 5 mins
    useClones: false
  }),
  syncFullHistory: false,
  markOnlineOnConnect: true,
  userDevicesCache: new NodeCache({
    stdTTL: 60 * 10, // 10 mins
    useClones: false
  })
})

  /** Handler Event */
  ; (() => {
    // handle call event
    client.on("call", (call) =>
      serialize
        .call(client, call)
        .then((call) => callHandler.execute(client, call).catch(() => void 0))
        .catch(() => void 0)
    )

    // handle group event
    client.on("group", (message) =>
      serialize
        .group(client, message)
        .then((message) => groupHandler.execute(client, message).catch(() => void 0))
        .catch(() => void 0)
    )

    // handle group participants event
    client.on("group.participant", (message) =>
      serialize
        .groupParticipant(client, message)
        .then((message) => groupParticipantHandler.execute(client, message).catch(() => void 0))
        .catch(() => void 0)
    )

    // handle message event
    client.on("message", (message) =>
      serialize
        .message(client, message)
        .then((message) => messageHandler.execute(client, message).catch(() => void 0))
        .catch(() => void 0)
    )

    // handle qr code event
    client.on("qr", (qrCode) =>
      qrcode
        .toString(qrCode, { type: "terminal", small: true })
        .then((qrResult) => console.log(qrResult))
        .catch(() => void 0)
    )
  })()

/** Pretty Sexy :D */
const clearProcess = () => {
  client.log("Clear all process", "info")
  resetUserLimit.stop()
  resetUserRole.stop()
  fastify.close()
  Database.$disconnect()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, clearProcess)
for (const signal of ["unhandledRejection", "uncaughtException"]) process.on(signal, (reason: unknown) => client.log(inspect(reason, true), "error"))

/** Start Client */
setImmediate(async () => {
  try {
    /** api routes */
    whatsappRoutes(fastify, client)

    // initialize
    await client.startClient()
    await fastify.ready()

    process.nextTick(
      () =>
        messageHandler
          .registerCommand("commands")
          .then((size) => client.log(`Success Register ${size} commands`))
          .catch(clearProcess),
      fastify
        .listen({ host: process.env.HOST || "127.0.0.1", port: process.env.PORT || 3000 })
        .then((address) => client.log(`Server run on ${address}`))
        .catch(clearProcess),
      i18nInit()
    )

    // logs <3
    cfonts.say("Whatsapp Bot", {
      align: "center",
      colors: ["#8cf57b" as HexColor],
      font: "block",
      space: false
    })
  } catch (err: unknown) {
    client.log(inspect(err, true), "error")
    clearProcess()
  }
})

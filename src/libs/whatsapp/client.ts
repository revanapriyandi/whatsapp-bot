import P from "pino"
import { Boom } from "@hapi/boom"
import EventEmitter from "@arugaz/eventemitter"
import makeWASocket, { BaileysEventMap, DisconnectReason, downloadContentFromMessage, fetchLatestBaileysVersion, generateForwardMessageContent, generateWAMessageFromContent, jidDecode, makeCacheableSignalKeyStore, MessageGenerationOptionsFromContent, proto, toBuffer, WAMediaUpload, WAMessageStubType } from "@adiwajshing/baileys"

import { auth, database } from "../../libs/whatsapp"
import Database from "../../libs/database"
import { WAProfile } from "../../libs/convert"
import color from "../../utils/color"
import config from "../../utils/config"
import type { Client, ClientConfig, ClientEventEmitter } from "../../types/client"
import type { MessageSerialize } from "../../types/serialize"

let first = !0
class WAClient extends (EventEmitter as new () => ClientEventEmitter) implements Client {
  #cfg: ClientConfig
  #status: "close" | "idle" | "open"
  /** whatsapp client */
  constructor(cfg: ClientConfig) {
    super()
    this.#cfg = cfg
    this.#status = "close"
  }

  /**
   * Decode jid to make it correctly formatted
   * @param {string} jid: user/group jid
   */
  public decodeJid(jid: string): string {
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid)
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid
    } else return jid
  }

  /**
   * Download media message and return buffer
   * @param {proto.IMessage} message:proto.IMessage
   */
  public async downloadMediaMessage(message: proto.IMessage): Promise<Buffer> {
    const type = Object.keys(message).find((type) => type !== "senderKeyDistributionMessage" && type !== "messageContextInfo")
    const mime = {
      imageMessage: "image",
      videoMessage: "video",
      stickerMessage: "sticker",
      documentMessage: "document",
      audioMessage: "audio"
    }
    return await toBuffer(await downloadContentFromMessage(message[type], mime[type]))
  }

  public async resendMessage(jid: string, message: Partial<MessageSerialize>, opts?: Omit<MessageGenerationOptionsFromContent, "userJid">) {
    message.message = message.message?.viewOnceMessage ? message.message.viewOnceMessage?.message : message.message?.viewOnceMessageV2 ? message.message.viewOnceMessage?.message : message.message?.viewOnceMessageV2Extension ? message.message.viewOnceMessageV2Extension?.message : message.message
    if (message.message[message.type]?.viewOnce) delete message.message[message.type].viewOnce
    const content = generateForwardMessageContent(proto.WebMessageInfo.fromObject(message), false)

    if (content.listMessage) content.listMessage.listType = 1
    const contentType = Object.keys(content).find((x) => x !== "senderKeyDistributionMessage" && x !== "messageContextInfo" && x !== "inviteLinkGroupTypeV2")
    if (content[contentType]?.contextInfo) {
      delete content[contentType]?.contextInfo.forwardingScore
      delete content[contentType]?.contextInfo.isForwarded
    }
    content[contentType].contextInfo = {
      ...(message.message[message.type]?.contextInfo ? message.message[message.type].contextInfo : {}),
      ...content[contentType].contextInfo
    }

    const waMessage = generateWAMessageFromContent(jid, content, {
      userJid: this.decodeJid(this.user.id),
      ...opts
    })

    if (waMessage?.message?.buttonsMessage?.contentText) waMessage.message.buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.EMPTY
    if (waMessage?.message?.buttonsMessage?.imageMessage) waMessage.message.buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.IMAGE
    if (waMessage?.message?.buttonsMessage?.videoMessage) waMessage.message.buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.VIDEO
    if (waMessage?.message?.buttonsMessage?.documentMessage) waMessage.message.buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.DOCUMENT
    if (waMessage?.message?.buttonsMessage?.locationMessage) waMessage.message.buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.LOCATION

    process.nextTick(() => this.upsertMessage(waMessage, "append"))
    await this.relayMessage(jid, waMessage.message, {
      ...opts,
      messageId: waMessage.key.id,
      cachedGroupMetadata: (jid) => database.getGroupMetadata(jid)
    })
    return waMessage
  }

  public async updateProfilePicture(jid: string, content: WAMediaUpload, crop = false) {
    let bufferOrFilePath: Buffer | string
    if (Buffer.isBuffer(content)) {
      bufferOrFilePath = content
    } else if ("url" in content) {
      bufferOrFilePath = content.url.toString()
    } else {
      bufferOrFilePath = await toBuffer(content.stream)
    }

    const img = WAProfile(bufferOrFilePath as Buffer, crop)

    await this.query({
      tag: "iq",
      attrs: {
        to: this.decodeJid(jid),
        type: "set",
        xmlns: "w:profile:picture"
      },
      content: [
        {
          tag: "picture",
          attrs: { type: "image" },
          content: await img
        }
      ]
    })
  }

  public async sendAcceptInviteV4(jid: string, participants: string, caption = "Invitation to join my WhatsApp group") {
    if (!jid.endsWith("g.us")) throw new TypeError("Invalid jid")
    const inviteCode = await this.groupInviteCode(jid)
    const groupName = (await database.getGroup(jid)).name

    const content = proto.Message.fromObject({
      groupInviteMessage: proto.Message.GroupInviteMessage.fromObject({
        inviteCode,
        inviteExpiration: Date.now() + 3 * 24 * 60 * 60 * 1000,
        groupJid: jid,
        groupName: groupName,
        caption
      })
    })

    const waMessage = generateWAMessageFromContent(participants, content, {
      userJid: this.decodeJid(this.user.id),
      ephemeralExpiration: 3 * 24 * 60 * 60
    })

    process.nextTick(() => this.upsertMessage(waMessage, "append"))
    await this.relayMessage(participants, waMessage.message, {
      messageId: waMessage.key.id,
      cachedGroupMetadata: (jid) => database.getGroupMetadata(jid)
    })
    return waMessage
  }

  /** Start Whatsapp Client */
  public async startClient(): Promise<void> {
    const logger = this.#cfg.logger || P({ level: "silent" }).child({ level: "silent" })

    const { saveState, clearState, state } = (this.#cfg.authType === "single" && (await auth.useSingleAuthState(Database))) || (this.#cfg.authType === "multi" && (await auth.useMultiAuthState(Database)))
    const { version, isLatest } = await fetchLatestBaileysVersion()

    const client: Client = makeWASocket({
      ...this.#cfg,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger, {
          stdTTL: 60 * 10, // 10 mins
          useClones: false
        })
      },
      browser: ["whatsapp-bot", "Safari", "3.0.0"],
      logger,
      patchMessageBeforeSending: (message) => {
        if (message.buttonsMessage || message.templateMessage || message.listMessage) {
          message = {
            viewOnceMessage: {
              message: {
                messageContextInfo: {
                  deviceListMetadataVersion: 2,
                  deviceListMetadata: {}
                },
                ...message
              }
            }
          }
        }
        return message
      },
      printQRInTerminal: false,
      version
    })

    // connection
    client.ev.on("connection.update", async ({ qr, connection, lastDisconnect }) => {
      if (qr) {
        this.emit("qr", qr)
      }

      if (connection === "close") {
        this.#status = "close"
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
        this.log("Disconnected!", "error")
        if (reason === DisconnectReason.loggedOut || reason === DisconnectReason.multideviceMismatch || reason === DisconnectReason.badSession) {
          this.log("Deleting session...", "error")
          await clearState()
          this.log("Session deleted!", "error")

          throw new Error("You have to re-scan QR Code! code: " + reason)
        } else {
          this.log("Reconnecting...", "warning")
          setTimeout(() => this.startClient().catch(() => this.startClient()), 1500)
        }
      }

      if (connection === "connecting") {
        this.#status = "idle"
        this.log("Connecting...", "warning")
      }

      if (connection === "open") {
        this.#status = "open"
        this.log("Connected!")
        if (first) {
          console.log(" ")
          this.log("Name    : " + (this.user?.name || "unknown"), "info")
          this.log("Number  : " + (this.user?.id?.split(":")[0] || "unknown"), "info")
          this.log("Version : " + version.join("."), "info")
          this.log("Latest  : " + `${isLatest ? "yes" : "nah"}`, "info")
          first = !first
          console.log(" ")
        }
      }
    })

    // credentials
    client.ev.on("creds.update", saveState)

    // call events
    client.ev.on("call", (calls) => {
      for (const call of calls) {
        this.emit("call", call)
      }
    })

    // message event
    client.ev.on("messages.upsert", (msg) => {
      for (const message of msg.messages) {
        if (message.message) this.emit("message", message)
      }
    })

    // group event
    client.ev.on("messages.upsert", (msg) => {
      for (const message of msg.messages) {
        if (
          message.messageStubType === WAMessageStubType.GROUP_CHANGE_SUBJECT ||
          message.messageStubType === WAMessageStubType.GROUP_CHANGE_ICON ||
          message.messageStubType === WAMessageStubType.GROUP_CHANGE_INVITE_LINK ||
          message.messageStubType === WAMessageStubType.GROUP_CHANGE_DESCRIPTION ||
          message.messageStubType === WAMessageStubType.GROUP_CHANGE_RESTRICT ||
          message.messageStubType === WAMessageStubType.GROUP_CHANGE_ANNOUNCE
        )
          this.emit("group", message)
      }
    })

    // group participant event
    client.ev.on("messages.upsert", (msg) => {
      for (const message of msg.messages) {
        if (
          message.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD ||
          message.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
          message.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_PROMOTE ||
          message.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_DEMOTE ||
          message.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_INVITE ||
          message.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE
        )
          this.emit("group.participant", message)
      }
    })

    /** wait, lemme ignore them */
    for (const events of [
      "blocklist.set",
      "blocklist.update",
      "call",
      "connection.update",
      "creds.update",
      "chats.delete",
      "chats.update",
      "chats.upsert",
      "contacts.update",
      "contacts.upsert",
      "group-participants.update",
      "groups.update",
      "groups.upsert",
      "message-receipt.update",
      "messages.delete",
      "messages.media-update",
      "messages.reaction",
      "messages.update",
      "messages.upsert",
      "messaging-history.set",
      "presence.update"
    ]) {
      if (events !== "call" && events !== "connection.update" && events !== "creds.update" && events !== "messages.upsert") client.ev.removeAllListeners(events as keyof BaileysEventMap)
    }

    // Set client functionality
    for (const method of Object.keys(client)) {
      if (method !== "ev") {
        if (method !== "ws" && method !== "updateProfilePicture") this[method] = client[method]
        delete client[method]
      }
    }
  }

  /**
   * @param {String} text:message
   * @param {String} type?:"error" | "warning" | "info" | "success"
   * @param {Number} date?:Date.now()
   * @returns {void} print logs
   */
  public log(text: string, type: "error" | "warning" | "info" | "success" = "success", date?: number): void {
    console.log(
      color[type === "error" ? "red" : type === "warning" ? "yellow" : type === "info" ? "blue" : "green"](`[ ${type === "error" ? "X" : type === "warning" ? "!" : "V"} ]`),
      color.hex("#ff7f00" as HexColor)(
        `${new Date(!date ? Date.now() : date).toLocaleString("en-US", {
          timeZone: config.timeZone
        })}`
      ),
      text
    )
  }

  /**
   * Connection status
   */
  public get status() {
    return this.#status
  }

  // I will comment out the functions I dont use
  public getOrderDetails: Client["getOrderDetails"]
  public getCatalog: Client["getCatalog"]
  public getCollections: Client["getCollections"]
  public productCreate: Client["productCreate"]
  public productDelete: Client["productDelete"]
  public productUpdate: Client["productUpdate"]
  public sendMessageAck: Client["sendMessageAck"]
  public sendRetryRequest: Client["sendRetryRequest"]
  public rejectCall: Client["rejectCall"]
  public getPrivacyTokens: Client["getPrivacyTokens"]
  public assertSessions: Client["assertSessions"]
  public relayMessage: Client["relayMessage"]
  public sendReceipt: Client["sendReceipt"]
  public sendReceipts: Client["sendReceipts"]
  public readMessages: Client["readMessages"]
  public refreshMediaConn: Client["refreshMediaConn"]
  public waUploadToServer: Client["waUploadToServer"]
  public fetchPrivacySettings: Client["fetchPrivacySettings"]
  public updateMediaMessage: Client["updateMediaMessage"]
  public sendMessage: Client["sendMessage"]
  public groupMetadata: Client["groupMetadata"]
  public groupCreate: Client["groupCreate"]
  public groupLeave: Client["groupLeave"]
  public groupUpdateSubject: Client["groupUpdateSubject"]
  public groupParticipantsUpdate: Client["groupParticipantsUpdate"]
  public groupUpdateDescription: Client["groupUpdateDescription"]
  public groupInviteCode: Client["groupInviteCode"]
  public groupRevokeInvite: Client["groupRevokeInvite"]
  public groupAcceptInvite: Client["groupAcceptInvite"]
  public groupAcceptInviteV4: Client["groupAcceptInviteV4"]
  public groupGetInviteInfo: Client["groupGetInviteInfo"]
  public groupToggleEphemeral: Client["groupToggleEphemeral"]
  public groupSettingUpdate: Client["groupSettingUpdate"]
  public groupFetchAllParticipating: Client["groupFetchAllParticipating"]
  public processingMutex: Client["processingMutex"]
  public upsertMessage: Client["upsertMessage"]
  public appPatch: Client["appPatch"]
  public sendPresenceUpdate: Client["sendPresenceUpdate"]
  public presenceSubscribe: Client["presenceSubscribe"]
  public profilePictureUrl: Client["profilePictureUrl"]
  public onWhatsApp: Client["onWhatsApp"]
  public fetchBlocklist: Client["fetchBlocklist"]
  public fetchStatus: Client["fetchStatus"]
  // public updateProfilePicture: Client["updateProfilePicture"]
  public updateProfileStatus: Client["updateProfileStatus"]
  public updateProfileName: Client["updateProfileName"]
  public updateBlockStatus: Client["updateBlockStatus"]
  public getBusinessProfile: Client["getBusinessProfile"]
  public resyncAppState: Client["resyncAppState"]
  public chatModify: Client["chatModify"]
  public type: Client["type"]
  // public ws: Client["ws"];
  // public ev: Client["ev"];
  public authState: Client["authState"]
  public user: Client["user"]
  public generateMessageTag: Client["generateMessageTag"]
  public query: Client["query"]
  public waitForMessage: Client["waitForMessage"]
  public waitForSocketOpen: Client["waitForSocketOpen"]
  public sendRawMessage: Client["sendRawMessage"]
  public sendNode: Client["sendNode"]
  public logout: Client["logout"]
  public end: Client["end"]
  public onUnexpectedError: Client["onUnexpectedError"]
  public uploadPreKeys: Client["uploadPreKeys"]
  public uploadPreKeysToServerIfRequired: Client["uploadPreKeysToServerIfRequired"]
  public waitForConnectionUpdate: Client["waitForConnectionUpdate"]
}

export default WAClient

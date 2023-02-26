import { WAMessage } from "@adiwajshing/baileys"
import WAClient from "../../../libs/whatsapp"
import config from "../../../utils/config"
import type { GroupParticipantSerialize } from "../../../types/serialize"

export const groupParticipant = async (client: WAClient, msg: WAMessage): Promise<GroupParticipantSerialize> => {
  const m = <GroupParticipantSerialize>{}
  m.from = client.decodeJid(msg.key.remoteJid)
  m.sender = client.decodeJid(msg.key.fromMe ? client.user.id : m.from.endsWith("g.us") || m.from === "status@broadcast" ? msg.key?.participant || msg.participant : m.from)
  m.body = msg.messageStubParameters
  m.type = msg.messageStubType
  m.timestamps = (typeof msg.messageTimestamp === "number" ? msg.messageTimestamp : msg.messageTimestamp.low ? msg.messageTimestamp.low : msg.messageTimestamp.high) * 1000 || Date.now()

  function reply(text: string) {
    return client.sendMessage(m.from, {
      text: "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" + "┃\n" + `┃ ${text}\n` + "┃\n" + `┗━━「 ꗥ${config.name}ꗥ 」`,
      mentions: (m.body[1] || m.body[0]).includes("@") ? [m.sender].concat(m.body) : [m.sender]
    })
  }
  m.reply = reply

  return m
}

import { WACallEvent } from "@adiwajshing/baileys"
import WAClient from "../../../libs/whatsapp"
import config from "../../../utils/config"
import type { CallSerialize } from "../../../types/serialize"

/** Call Serialize */
export const call = async (client: WAClient, call: WACallEvent): Promise<CallSerialize> => {
  const c = <CallSerialize>{}
  c.callFrom = client.decodeJid(call.from)
  c.callId = call.id
  c.status = call.status

  function reply(text: string) {
    return client.sendMessage(c.callFrom, {
      text: "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" + "┃\n" + `┃ ${text}\n` + "┃\n" + `┗━━「 ꗥ${config.name}ꗥ 」`,
      mentions: [c.callFrom]
    })
  }
  c.reply = reply

  return c
}

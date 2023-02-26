import type { Event } from "../../types/command"

export default <Event>{
  execute: async ({ client, message, group, isBotGroupAdmin }) => {
    if (message.isGroupMsg && isBotGroupAdmin && group.antibot && message.isBotMsg && !message.fromMe) {
      return await client.groupParticipantsUpdate(message.from, [message.sender], "remove")
    }
  }
}

import type { Event } from "../../types/command"

export default <Event>{
  execute: async ({ client, message, group, isBotGroupAdmin, isOwner, isGroupAdmin }) => {
    if (message.isGroupMsg && group.antilink && isBotGroupAdmin && message.body) {
      const groupCodeRegex = message.body.match(/chat.whatsapp.com\/(?:invite\/)?([\w\d]*)/)
      if (groupCodeRegex && groupCodeRegex.length === 2 && !isOwner && !isGroupAdmin) {
        const groupCode = groupCodeRegex[1]
        const groupNow = await client.groupInviteCode(message.from)

        if (groupCode !== groupNow) {
          await client.sendMessage(message.from, { delete: message.key })
          return await client.groupParticipantsUpdate(message.from, [message.sender], "remove")
        }
      }
    }
  }
}

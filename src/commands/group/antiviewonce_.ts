import type { Event } from "../../types/command"

export default <Event>{
  execute: async ({ client, message, group }) => {
    if (message.isGroupMsg && group.antiviewonce && message.viewOnce) {
      return await client.resendMessage(message.from, message, { ephemeralExpiration: message.expiration })
    }
  }
}

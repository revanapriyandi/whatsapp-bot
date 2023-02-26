import AI2D from "@arugaz/ai2d"
import type { Command } from "../../types/command"

export default <Command>{
  category: "convert",
  cd: 10,
  desc: "Generate a hyper-realistic photo an anime style",
  example: `
  Send a image message with caption
  @PREFIX@CMD
  --------
  or Reply a image message with text
  @PREFIX@CMD
  --------
  `.trimEnd(),
  execute: async ({ client, message }) => {
    if (message.type.includes("image") || (message.quoted && message.quoted.type.includes("image"))) {
      const buffer = message.quoted ? await client.downloadMediaMessage(message.quoted.message) : await client.downloadMediaMessage(message.message)
      // It works in my country (Indonesia), if it doesnt work in your country/server you may need a proxy
      // refer to https://www.npmjs.com/package/@client/ai2d#tldr
      const result = await AI2D(buffer, {
        crop: "SINGLE"
      })
      return await client.sendMessage(message.from, { image: result }, { quoted: message, ephemeralExpiration: message.expiration })
    }

    throw "noCmd"
  }
}

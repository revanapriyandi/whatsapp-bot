import { removebg } from './../../libs/convert/stickerMeme';
import type { Command } from "../../types/command"
import { uploadToUguu } from "../../utils/fetcher"

export default <Command>{
    category: "convert",
    aliases: ["removebg", "nobg"],
    cd: 20,
    desc: "Remove background from image",
    example: `
  Send a image message with caption
  @PREFIX@CMD
  --------
  or Reply a image message with text
  @PREFIX@CMD
  --------
  `,
    execute: async ({ client, message }) => {
        if (message.type.includes("image") || (message.quoted && message.quoted.type.includes("image"))) {
            const buffer = message.quoted ? await client.downloadMediaMessage(message.quoted.message) : await client.downloadMediaMessage(message.message)
            const ugu = await uploadToUguu(buffer, "png")
            const result = await removebg(ugu)
            return await client.sendMessage(message.from, { image: result }, { quoted: message, ephemeralExpiration: message.expiration })
        }

        throw "noCmd"
    }
}

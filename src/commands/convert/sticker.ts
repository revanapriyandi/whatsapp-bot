import { WASticker } from "../../libs/convert"
import config from "../../utils/config"
import type { Command } from "../../types/command"
import { uploadToUguu } from "../../utils/fetcher"
import { stickermeme } from "../../libs/convert/stickerMeme"

const wasticker = new WASticker({
  pack: config.name,
  author: config.footer,
  categories: ["👋"]
})

export default <Command>{
  category: "convert",
  aliases: ["stiker", "stikerline", "stikergif", "stikergiphy", "stikerwa", "stikerwhatsapp", "stikerwm", "stikerwm", "s", "smeme", "stikermeme"],
  desc: "Create sticker from photo or video",
  example: `
  Send a image/video message with caption
  @PREFIX@CMD
  --------
  or Reply a image/video message with text
  @PREFIX@CMD
  --------
  `.trimEnd(),
  execute: async ({ client, message, args }) => {
    await client.sendMessage(message.from, { react: { text: "⏳", key: message.key } })
    if (message.type.includes("image") || (message.quoted && message.quoted.type.includes("image"))) {
      const buffer = message.quoted ? await client.downloadMediaMessage(message.quoted.message) : await client.downloadMediaMessage(message.message)
      const result = await wasticker.ConvertMedia(buffer, "image")
      const teks = args.join(" ")
      if (teks.length > 0) {
        if (teks.length > 20) {
          await message.reply("Text too long! Maximum 20 characters")
          return await client.sendMessage(message.from, { react: { text: "❌", key: message.key } })
        }

        const ugu = await uploadToUguu(buffer, "png")
        const smeme = await stickermeme(ugu, teks)
        const res2 = await wasticker.ConvertMedia(smeme, "image")
        return await client.sendMessage(message.from, { sticker: res2 }, { quoted: message, ephemeralExpiration: message.expiration })
      }
      return await client.sendMessage(message.from, { sticker: result }, { quoted: message, ephemeralExpiration: message.expiration })
    }

    if (message.type.includes("video") || (message.quoted && message.quoted.type.includes("video"))) {
      const duration = message.quoted ? message.quoted.message.videoMessage.seconds : message.message.videoMessage.seconds
      if (duration && !isNaN(duration) && duration > 10) throw "Video duration is too long! Maximum duration of 10 seconds"

      const buffer = message.quoted ? await client.downloadMediaMessage(message.quoted.message) : await client.downloadMediaMessage(message.message)
      const result = await wasticker.ConvertMedia(buffer, "video")

      return await client.sendMessage(message.from, { sticker: result }, { quoted: message, ephemeralExpiration: message.expiration })
    }

    throw "noCmd"
  }
}

import config from "../../utils/config"
import type { Command } from "../../types/command"
import instagram from "../../libs/downloader/instagram"
import { isImage, isVideo } from "../../utils/fetcher"

export default <Command>{
    category: "downloader",
    aliases: ["ig", "igdl", "instadl", "insta", "igdownloader", "instadownloader"],
    cd: 10,
    desc: "Downloader Instagram Video, Photo, IGTV, Reels, IGTV, and Story",
    example: `
  Send a link with command or reply a link with command to download instagram
  @PREFIX@CMD add url to download
  `,
    execute: async ({ client, message, args, prefix }) => {
        if (args.length === 0) return message.reply("```Please provide a instagram url...🫤```")
        if (args[0].search("instagram.com") === -1) return message.reply("```Please provide a valid instagram url... 😒```")

        await client.sendMessage(message.from, { react: { text: "⏳", key: message.key } })
        const ig = await instagram(args[0])
        const res = await ig.data.result

        for (let i = 0; i < res.length; i++) {
            const buttons = [
                { buttonId: 'id1', urlButton: { displayText: 'High Quality', url: await res[i] }, type: 1 },
                { buttonId: 'id1', quickReplyButton: { displayText: 'Sticker', id: `${prefix}sticker` }, type: 1 },
            ]

            const fileType = await isVideo(await res[i]) ? "video" : await isImage(await res[i]) ? "image" : "video"
            if (fileType === "image") {
                const buttonMessage = {
                    text: "Download High Quality Video or Photo 📥 ",
                    footer: config.footer,
                    templateButtons: buttons,
                    image: { url: await res[i] },
                    headerType: 4
                }

                await client.sendMessage(message.from, { image: { url: await res[i] } }, { quoted: message, ephemeralExpiration: message.expiration })

                await client.sendMessage(
                    message.from,
                    buttonMessage,
                    { quoted: message, ephemeralExpiration: message.expiration }
                )
            }
            if (fileType === "video") {
                const buttonMessage = {
                    text: "Download High Quality Video or Photo 📥 ",
                    footer: config.footer,
                    templateButtons: buttons,
                    video: { url: await res[i] },
                    headerType: 4
                }

                await client.sendMessage(message.from, { video: { url: await res[i] } }, { quoted: message, ephemeralExpiration: message.expiration })

                await client.sendMessage(
                    message.from,
                    buttonMessage,
                    { quoted: message, ephemeralExpiration: message.expiration }
                )
            }
        }

        return await client.sendMessage(message.from, { react: { text: "✅", key: message.key } })

        throw "noCmd"
    }
}

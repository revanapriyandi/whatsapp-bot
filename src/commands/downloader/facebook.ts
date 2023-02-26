import config from "../../utils/config"
import type { Command } from "../../types/command"
import facebook from "../../libs/downloader/facebook"

export default <Command>{
    category: "downloader",
    aliases: ["fb", "fbdown", "facebookdownloader", "facebookdownload", "facebookdl", "fbdl", "fbdownload", "fbdownloader"],
    cd: 10,
    desc: "Downloader Facebook Video or Photo",
    example: `
  Send a link with command or reply a link with command to download facebook
  @PREFIX@CMD add url to download
  `,
    execute: async ({ client, message, args }) => {
        if (args.length === 0) return message.reply("```Please provide a facebook url...🫤```")

        await client.sendMessage(message.from, { react: { text: "⏳", key: message.key } })
        const fb = await facebook(args[0])
        const res = await fb.data.result

        const buttons = [
            { buttonId: 'id1', urlButton: { displayText: 'High Quality', url: res }, type: 1 },
        ]
        const buttonMessage = {
            text: "Download High Quality Video or Photo 📥 ",
            footer: config.footer,
            templateButtons: buttons,
            video: { url: res },
            headerType: 4
        }

        await client.sendMessage(message.from, { video: { url: res } }, { quoted: message, ephemeralExpiration: message.expiration })

        return await client.sendMessage(
            message.from,
            buttonMessage,
            { quoted: message, ephemeralExpiration: message.expiration }
        )


        throw "noCmd"
    }
}

import config from "../../utils/config"
import type { Command } from "../../types/command"
import tiktok from "../../libs/downloader/tiktok"

export default <Command>{
    category: "downloader",
    aliases: ["tt", "tiktok", "tiktokdl", "tiktokdownloader", "tiktokdownload", "tiktokvideo", "tiktokvideodl", "tiktokvideodownloader", "tiktokvideodownload", "tiktokmp4", "tiktokmp4dl", "tiktokmp4downloader", "tiktokmp4download"],
    cd: 20,
    desc: "Download TikTok video from link",
    example: `
  Send a link with command or reply a link with command to download TikTok video
  @PREFIX@CMD add link tiktok
  `,
    execute: async ({ client, message, args, prefix }) => {
        if (args.length === 0) return message.reply("```Please provide a tiktok video url...🫤```")
        if (args[0].search("tiktok.com") === -1) return message.reply("```Please provide a valid tiktok video url... 😒```")

        await client.sendMessage(message.from, { react: { text: "⏳", key: message.key } })
        const res = await tiktok(args[0])
        const videonowm = await res.data.video_data.nwm_video_url
        const videonowmHq = await res.data.video_data.nwm_video_url_HQ
        const desc = await res.data.desc
        const author = await res.data.author

        const buttons = [
            { buttonId: 'id1', urlButton: { displayText: 'High Quality', url: videonowmHq }, type: 1 },
            { buttonId: 'id2', quickReplyButton: { displayText: '🎵 Audio', id: `${prefix}tiktokaudio ${args[0]}` }, type: 1 }
        ]
        const buttonMessage = {
            text: `*${author.nickname}*\n${desc}\n\n__${author.signature}__`,
            footer: config.footer,
            templateButtons: buttons,
            video: { url: videonowm },
            headerType: 4
        }

        await client.sendMessage(message.from, { video: { url: videonowm } }, { quoted: message, ephemeralExpiration: message.expiration })

        return await client.sendMessage(
            message.from,
            buttonMessage,
            { quoted: message, ephemeralExpiration: message.expiration }
        )

        throw "noCmd"
    }
}

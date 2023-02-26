import config from "../../utils/config"
import type { Command } from "../../types/command"
import tiktok from "../../libs/downloader/tiktok"

export default <Command>{
    category: "downloader",
    cd: 20,
    aliases: ["tiktokmp3", "tiktokaudio", "ttmp3", "ttaudio"],
    desc: "Download TikTok video from link and convert to mp3",
    example: `
  Send a link with command or reply a link with command to download TikTok video
  @PREFIX@CMD add link tiktok
  `,
    execute: async ({ client, message, args, prefix }) => {
        if (args.length === 0) return message.reply("```Please provide a tiktok video url...🫤```")
        if (args[0].search("tiktok.com") === -1) return message.reply("```Please provide a valid tiktok video url... 😒```")

        await client.sendMessage(message.from, { react: { text: "⏳", key: message.key } })
        const res = await tiktok(args[0])
        const musik = await res.data.music.play_url.uri
        const desc = await res.data.desc
        const author = await res.data.author

        const buttons = [
            { buttonId: '1', urlButton: { displayText: 'Browser', url: musik }, type: 1 },
            { buttonId: '2', quickReplyButton: { displayText: '🎬 Video', id: `${prefix}tiktokmp4 ${args[0]}` }, type: 1 }
        ]
        const buttonMessage = {
            text: `*${author.nickname}*\n${desc}\n\n__${author.signature}__`,
            footer: config.footer,
            templateButtons: buttons,
            audio: { url: musik },
            headerType: 4
        }

        await client.sendMessage(message.from, { audio: { url: musik }, mimetype: 'audio/mp4' }, { quoted: message, ephemeralExpiration: message.expiration })

        return await client.sendMessage(
            message.from,
            buttonMessage,
            { quoted: message, ephemeralExpiration: message.expiration }
        )

        throw "noCmd"
    }
}

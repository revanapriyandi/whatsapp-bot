import config from "../../utils/config"
import type { Command } from "../../types/command"
import Youtube from "../../libs/downloader/youtube"
import { formatDurasi } from "../../utils/format"

export default <Command>{
    category: "downloader",
    aliases: ["youtube", "ytmp4", "yt", "ytv", "youtubedownload", "ytdownloader", 'ytvideo'],
    cd: 20,
    desc: "Download youtube video with link",
    example: `
  Send a link with command or reply a link with command to download youtube video
  @PREFIX@CMD add link youtube here
  `,
    execute: async ({ client, message, args, prefix }) => {
        if (args.length === 0) return message.reply("```_Please provide a youtube video url..._🫤```")

        await client.sendMessage(message.from, { react: { text: "⏳", key: message.key } })
        const video = new Youtube(args[0], 'video')
        if (!video.validateURL()) return message.reply("```_Please provide a valid youtube video url..._ 😒```")
        const { videoDetails } = await video.getInfo()
        if (Number(videoDetails.lengthSeconds) > 1800)
            return await message.reply('⚓ _Cannot download videos longer than 30 minutes_')

        const buttons = [
            { buttonId: 'id1', quickReplyButton: { displayText: '🎵 Audio', id: `${prefix}ytaudio ${args[0]}` }, type: 1 }
        ]
        const buttonMessage = {
            text: `*${videoDetails.title}*\n\n_${formatDurasi(Number(videoDetails.lengthSeconds))}_\n\n\n_${videoDetails.description}_`,
            footer: config.footer,
            templateButtons: buttons,
            video: await video.getBuffer(),
            headerType: 4
        }

        await client.sendMessage(message.from, { video: await video.getBuffer() }, { quoted: message, ephemeralExpiration: message.expiration })

        return await client.sendMessage(
            message.from,
            buttonMessage,
            { quoted: message, ephemeralExpiration: message.expiration }
        )

        throw "noCmd"
    }
}

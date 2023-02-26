import type { Command } from "../../types/command"
import yts from 'yt-search'
import config from "../../utils/config"
import { formatAngka, formatDurasi } from "../../utils/format"

export default <Command>{
    category: "downloader",
    aliases: ["yts", "youtubesearch", "ytsearch", "youtubes"],
    cd: 10,
    desc: "Search music from youtube on whatsapp",
    example: `
    Send or reply a title with command to download youtube 
  @PREFIX@CMD add title 
  `,
    execute: async ({ client, message, arg, prefix }) => {
        if (arg.length === 0) return message.reply("```_Masukkan judul lagu yang ingin diputar..._🫤```")

        await client.sendMessage(message.from, { react: { text: "⏳", key: message.key } })
        const { videos } = await yts(arg)
        if (!videos || videos.length <= 0) return await message.reply(`⚓ No Matching videos found for the term : *${arg}*`)
        const teks = `🔎 *Results for ${arg.toUpperCase()}*\n\n *Terpopuler*: \n${videos[0].title} \n👀 ${formatAngka(videos[0].views)} Views | ⏱ ${formatDurasi(videos[0].duration.seconds)}\n\nPilih salah satu untuk memutar lagu di whatsapp\n\n *Note: Jika tidak ada respon, coba perintah ini lagi*`
        const sections = [
            {
                title: "🎵 Youtube Music 🎵",
                rows: videos.map((v) => {
                    return {
                        title: v.title,
                        rowId: `${prefix}ytmp3 https://www.youtube.com/watch?v=${v.videoId}`,
                        description: `👀 ${formatAngka(v.views)} Views         ⏱ ${formatDurasi(v.duration.seconds)}`,
                    }
                })
            }
        ]

        return await client.sendMessage(message.from, {
            title: "🎵 Youtube Music 🎵",
            text: teks,
            footer: config.footer,
            sections,
            buttonText: '🎶SHOW',
            viewOnce: true
        })

        throw "noCmd"
    }
}

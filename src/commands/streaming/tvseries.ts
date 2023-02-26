import type { Command } from "../../types/command"
import config from "../../utils/config"
import { tmdbTVDetail } from "../../libs/misc/film"

export default <Command>{
    category: "streaming",
    aliases: ["tvseriessearch", "searchtvseries", "searchtv", "searchtvseries", "searchtv", "searchtvseries", 'tv'],
    cd: 10,
    desc: "Search tvseries and get link to stream it",
    example: `
      @PREFIX@CMD title 
  `,
    execute: async ({ client, message, arg, prefix }) => {
        if (arg.length === 0) return message.reply("```_Masukkan judul Film yang ingin diputar..._🫤```")

        const res = await tmdbTVDetail(arg)
        const tv = res.data.results
        if (!tv || tv.length <= 0) return await message.reply(`⚓ No Matching videos found for the term : *${arg}*`)
        const teks = `🔎 *Results for ${arg.toUpperCase()}*\n\n *Terpopuler*: \n${tv[0].name} \n👀 ${tv[0].popularity} Views | ⏱ ${tv[0].first_air_date}\n\nPilih salah satu untuk mendapatkan link stream di whatsapp\n\n *Note: Jika tidak ada respon, coba perintah ini lagi*`
        const sections = [
            {
                title: "🎬 TVSeries Stream 🎬",
                rows: tv.map((v) => {
                    return {
                        title: v.name + ` | ${v.first_air_date}`,
                        rowId: `${prefix}playtvseries ${v.id}`,
                        description: `${v.overview}`,
                    }
                })
            }
        ]

        return await client.sendMessage(message.from, {
            title: "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n",
            text: teks,
            footer: config.footer,
            sections,
            buttonText: '🎶SHOW',
            viewOnce: true
        })

        throw "noCmd"
    }
}

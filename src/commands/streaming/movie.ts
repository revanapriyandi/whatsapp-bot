import type { Command } from "../../types/command"
import config from "../../utils/config"
import { searchMovieTmdb } from "../../libs/misc/film"

export default <Command>{
    category: "streaming",
    aliases: ["moviesearch", "searchmovie", "searchmovies", "searchfilm", "searchfilms", 'film', 'films', 'movies'],
    cd: 10,
    desc: "Search movies and get link to stream it",
    example: `
      @PREFIX@CMD title 
  `,
    execute: async ({ client, message, arg, prefix }) => {
        if (arg.length === 0) return message.reply("```_Masukkan judul movie yang ingin diputar..._🫤```")

        const res = await searchMovieTmdb(arg)
        const movie = res.data.results
        if (!movie || movie.length <= 0) return await message.reply(`⚓ No Matching videos found for the term : *${arg}*`)
        const teks = `🔎 *Results for ${arg.toUpperCase()}*\n\n *Terpopuler*: \n${movie[0].title} \n👀 ${movie[0].popularity} Views | ⏱ ${movie[0].release_date}\n\nPilih salah satu untuk mendapatkan link stream di whatsapp\n\n *Note: Jika tidak ada respon, coba perintah ini lagi*`
        const sections = [
            {
                title: "🎬 Movie Stream 🎬",
                rows: movie.map((v) => {
                    return {
                        title: v.title + ` | ${v.release_date}`,
                        rowId: `${prefix}playmovie ${v.id}`,
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

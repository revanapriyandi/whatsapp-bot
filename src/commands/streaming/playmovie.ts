import type { Command } from "../../types/command"
import config from "../../utils/config"
import { searchMovieTmdb, tmdbDetailMovie } from "../../libs/misc/film"

export default <Command>{
    category: "streaming",
    aliases: ["playm", "playmovies", "playfilm", "playfilms"],
    cd: 10,
    desc: "Play movies and get link to stream it",
    example: `
      @PREFIX@CMD title 
  `,
    execute: async ({ client, message, arg }) => {
        if (arg.length === 0) return message.reply("```_Masukkan movie yang ingin diputar..._🫤```")
        let id = arg
        if (isNaN(parseInt(arg))) {
            const smovie = await searchMovieTmdb(arg)
            const movie = smovie.data.results
            if (!movie || movie.length <= 0) return await message.reply(`⚓ No Matching videos found for the term : *${arg}*`)
            id = movie[0].id
        }
        const res = await tmdbDetailMovie(id)
        const movie = res.data
        const genre = movie.genres.map((v) => v.name).join(", ")
        const text =
            "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
            `📃*Title*: *${movie.title}*` +
            `*Genre*: *${genre}*` +
            `*Vote*: *${movie.vote_average}*` +
            `*Release*: *${movie.release_date}*` +
            "\n" +
            "Note: Silahkan klik tombol dibawah untuk mendapatkan link stream di whatsapp\n\n" +
            `┗━━「 ꗥ${config.name}ꗥ 」`
        const stream = `https://v2.vidsrc.me/embed/${movie.id}`
        const buttons = [
            { buttonId: 'id1', urlButton: { displayText: '🔗Streaming', url: stream }, type: 1 },
        ]
        const poster = await movie.backdrop_path
        const img = `https://image.tmdb.org/t/p/original${poster}`
        const buttonMessage = {
            text: text,
            footer: config.footer,
            templateButtons: buttons,
            image: { url: img },
            headerType: 4
        }

        return await client.sendMessage(
            message.from,
            buttonMessage,
            { quoted: message, ephemeralExpiration: message.expiration }
        )

        throw "noCmd"
    }
}

import type { Command } from "../../types/command"
import config from "../../utils/config"
import { searchTvTmdb } from "../../libs/misc/film"

export default <Command>{
    category: "streaming",
    aliases: ["geteps", "getepisode", "getep", "getepisodes", "getep", "getepisodes"],
    cd: 10,
    desc: "Search tvseries and get link to stream it",
    maintenance: true,
    example: `
      @PREFIX@CMD title 
  `,
    execute: async ({ client, message, arg, prefix }) => {
        if (arg.length === 0) return message.reply("```_Masukkan judul Film yang ingin diputar..._🫤```")
        if (isNaN(parseInt(arg))) {
            return await message.reply(`⚓ No Matching videos found for the term : *${arg}*`)
        }
        const res = await searchTvTmdb(arg)
        const tv = res.data.results
        const genre = tv.genres.map((v) => v.name).join(", ")
        if (!tv || tv.length <= 0) return await message.reply(`⚓ No Matching videos found for the term : *${arg}*`)
        const teks =
            "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
            `📃*Title*: *${tv.name}*` +
            `*Genre*: *${genre}*` +
            `*Vote*: *${tv.vote_average}*` +
            `*Release*: *${tv.first_air_date}*` +
            "\n" +
            "Note: Silahkan klik tombol dibawah untuk mendapatkan link stream di whatsapp\n\n" +
            `┗━━「 ꗥ${config.name}ꗥ 」`
        const sections = [
            {
                title: `🎬 ${tv.name} 🎬`,
                rows: tv.map((v) => {
                    return {
                        title: `Episode ${v.episode_number} | ${v.name} | ${v.air_date}`,
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

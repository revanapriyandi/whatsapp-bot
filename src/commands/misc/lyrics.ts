import lirik from "../../libs/misc/lirik"
import type { Command } from "../../types/command"
import config from "../../utils/config";

export default <Command>{
    category: "misc",
    aliases: ["lyric", "lyrics", "lrc", "lirik", "liriklagu"],
    desc: "Gives you the lyrics of the given song.",
    example: `
    Search for the lyrics of the song
    @PREFIX@CMD <song title>
    `,
    execute: async ({ message, arg }) => {
        if (!arg) return await message.reply("```_Please provide the song title..._🫤```")

        const res = await lirik(arg);
        const teks = `🎶 *Song Title: ${res.data.title}*\n🎗 *Artist: ${res.data.artist}*\n💫 *Lyrics:* \n\n${res.data.lyrics}\n${config.footer}`
        return await message.reply(teks, true)

        throw "noCmd"
    }
}

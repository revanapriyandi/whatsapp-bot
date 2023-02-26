import type { Command } from "../../types/command"
import Youtube from "../../libs/downloader/youtube"
import yts from 'yt-search'

export default <Command>{
  category: "downloader",
  aliases: ["ytplay", "play", "musik", "music", "ytmusik", "ytplayer", "ytmusic"],
  cd: 10,
  desc: "🎵 play a song with just search term!",
  example: `
  Send or reply a title with command to download youtube audio
  @PREFIX@CMD add title 
  `,
  execute: async ({ client, message, arg }) => {
    if (arg.length === 0) return message.reply("```🔎 _Provide a search term_```")

    await client.sendMessage(message.from, { react: { text: "⏳", key: message.key } })
    const { videos } = await yts(arg)
    if (!videos || videos.length <= 0) return await message.reply(`⚓ No Matching videos found for the term : *${arg}*`)
    const audio = new Youtube(videos[0].url, 'audio')
    if (!audio.url) return
    return await client.sendMessage(message.from, { audio: await audio.getBuffer(), mimetype: 'audio/mp4' }, { quoted: message, ephemeralExpiration: message.expiration })

    throw "noCmd"
  }
}

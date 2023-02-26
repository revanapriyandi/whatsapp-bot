import config from "../../utils/config"
import type { Command } from "../../types/command"
import spotify from "../../libs/downloader/spotify"
import { uploadToUguu } from '../../utils/fetcher';

export default <Command>{
    category: "downloader",
    aliases: ["spotify", "spotifyd", "spotifydownload", "spotifydl", "spotifydownloader", "spotifydown", "spotifydownl"],
    cd: 20,
    desc: "Download Spotify Music or Playlist ",
    example: `
    Send or reply a spotify url with command to download spotify
    @PREFIX@CMD spotify url
    `,
    execute: async ({ client, message, args, prefix }) => {
        if (args.length === 0) return message.reply("```_Please provide the Spotify Track URL that you want to download..._🫤```")

        await client.sendMessage(message.from, { react: { text: "⏳", key: message.key } })
        const track = new spotify(args[0])
        const info = await track.getInfo()
        if (info.error) return await message.reply(`😖 _Error Fetching: ${args[0]}. Check if the url is valid and try again_`)
        const caption = `🎧 *Title:* ${info.name || ''}\n🎤 *Artists:* ${(info.artists || []).join(',')}\n💽 *Album:* ${info.album_name
            }\n📆 *Release Date:* ${info.release_date || ''}`

        const buttons = [
            { buttonId: `${prefix}menu spotify`, buttonText: { displayText: '🎶 Spotify Downloader' }, type: 1 },
        ]
        const buttonMessage = {
            image: { url: `${info?.cover_url}` },
            caption: `${caption}`,
            footer: config.footer,
            buttons: buttons,
            headerType: 1
        }
        const audio = await track.getAudio()
        const ugu = await uploadToUguu(audio, "mp3")

        await client.sendMessage(message.from, { audio: { url: ugu }, mimetype: 'audio/mp4' }, { quoted: message, ephemeralExpiration: message.expiration })

        return await client.sendMessage(
            message.from,
            buttonMessage,
            { quoted: message, ephemeralExpiration: message.expiration }
        )

        throw "noCmd"
    }
}

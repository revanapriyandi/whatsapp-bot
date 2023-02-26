import config from "../../utils/config"
import type { Command } from "../../types/command"
import twitter from "../../libs/downloader/twitter"

export default <Command>{
  category: "downloader",
  aliases: ["tw", "twitterdl", "twitterdownloader", "twitterdownload", "twitterd"],
  cd: 10,
  desc: "Downloader Twitter Post",
  example: `
  Send a link with command or reply a link with command to download twitter post
  @PREFIX@CMD add url to download
  `,
  execute: async ({ client, message, args }) => {
    if (args.length === 0) return message.reply("```Please provide a twitter url...🫤```")

    await client.sendMessage(message.from, { react: { text: "⏳", key: message.key } })
    const tw = await twitter(args[0])
    if (tw.type.includes('image')) {
      const buttons = [
        { buttonId: 'id1', urlButton: { displayText: 'High Quality', url: tw.download }, type: 1 },
      ]
      const buttonMessage = {
        text: `*Twitter Downloader*\n\n*Name:* ${tw.tweet_user.name}\n*Username:* ${tw.tweet_user.username}\n*Caption:* ${tw.tweet_user.text}`,
        footer: config.footer,
        templateButtons: buttons,
        image: { url: tw.download },
        headerType: 4
      }

      await client.sendMessage(message.from, { image: { url: tw.download } }, { quoted: message, ephemeralExpiration: message.expiration })

      return await client.sendMessage(
        message.from,
        buttonMessage,
        { quoted: message, ephemeralExpiration: message.expiration }
      )
    }
    if (tw.type.includes('video')) {
      const buttons = [
        { buttonId: 'id1', urlButton: { displayText: 'High Quality', url: tw.download[tw.download - 1].url }, type: 1 },
      ]
      const buttonMessage = {
        text: `*Twitter Downloader*\n\n*Name:* ${tw.tweet_user.name}\n*Username:* ${tw.tweet_user.username}\n*Caption:* ${tw.tweet_user.text}`,
        footer: config.footer,
        templateButtons: buttons,
        video: { url: tw.download[tw.download - 1].url },
        headerType: 4
      }

      await client.sendMessage(message.from, { video: { url: tw.download[tw.download - 1].url } }, { quoted: message, ephemeralExpiration: message.expiration })

      return await client.sendMessage(
        message.from,
        buttonMessage,
        { quoted: message, ephemeralExpiration: message.expiration }
      )
    }

    throw "noCmd"
  }
}

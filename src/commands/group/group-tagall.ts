import config from "../../utils/config"
import type { Command } from "../../types/command"

export const name = "tagall"

export default <Command>{
  category: "group",
  aliases: ["mentions", "mentionall", "everyone", "all", "tagall", "pengumuman"],
  desc: "Mention all participants",
  groupOnly: true,
  adminGroup: true,
  example: `
  Tags all participants w/o description
  @PREFIX@CMD description

  eg, @PREFIX@CMD hello everyone!
  --------
  `.trimEnd(),
  execute: async ({ client, message, arg }) => {
    const participantsId = message.groupMetadata.participants.map((v) => v.id)

    const text =
      "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
        arg ? (arg && "┃\n" + `┃ ${arg}\n` + "┃\n" + "┣━━━━━━━━━━━━━━━━━━\n") : '' +
        "┃\n" +
        `${participantsId.map((id) => "┃ @" + id.split("@")[0]).join("\n")}\n` +
        "┃\n" +
      `┗━━「 ꗥ${config.name}ꗥ 」`

    return await client.sendMessage(message.from, { text, mentions: participantsId }, { quoted: message, ephemeralExpiration: message.expiration })
  }
}

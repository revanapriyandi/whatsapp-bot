import i18n from "../../libs/international"
import config from "../../utils/config"
import type { Command } from "../../types/command"

export const name = "gdemote"

export default <Command>{
  category: "group",
  aliases: ["gcdemote"],
  desc: "Demote group admins become members of group",
  groupOnly: true,
  adminGroup: true,
  botGroupAdmin: true,
  example: `
  Demote with number / mention
  @PREFIX@CMD <number | @mention>

  eg, @PREFIX@CMD 62851xxxxxx
  --------
  Demote multiple members / mentions
  @PREFIX@CMD <number> <@mention> ...<other member>

  eg, @PREFIX@CMD 62851xxxxx @mention
  --------
  `.trimEnd(),
  execute: async ({ client, message, args, group }) => {
    if (!args.length) throw "noCmd"

    for (const number of args) {
      const members = await client.onWhatsApp(number.replace(/\D+/g, "").trim())
      const member = members[0]
      if (!members.length || !member.exists) {
        const text =
          "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
          "┃\n" +
          `┃ ${i18n.translate("default.onWhatsApp", { "@NUM": number }, group.language)}\n` +
          "┃\n" +
          `┗━━「 ꗥ${config.name}ꗥ 」`

        return await message.reply(text, true)
      }

      await client.groupParticipantsUpdate(message.from, [member.jid], "demote")

      const text =
        "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
        "┃\n" +
        `┃ ${i18n.translate("commands.group.group-demote", { "@ADM": `@${member.jid.split("@")[0]}` }, group.language)}\n` +
        "┃\n" +
        `┗━━「 ꗥ${config.name}ꗥ 」`

      return await message.reply(text, true)
    }
  }
}

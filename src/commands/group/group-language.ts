import { readFile } from "fs/promises"
import { join as pathJoin } from "path"
import i18n from "../../libs/international"
import config from "../../utils/config"
import { database } from "../../libs/whatsapp"
import type { Command } from "../../types/command"

export const name = "glang"

export default <Command>{
  category: "general",
  aliases: ["gclang", "glanguage", "gclanguage"],
  desc: "Show/Set group language",
  groupOnly: true,
  adminGroup: true,
  execute: async ({ client, message, prefix, args, group, command }) => {
    const listLanguages: {
      iso: string
      lang: string
    }[] = JSON.parse(await readFile(pathJoin(__dirname, "..", "..", "..", "database", "languages.json"), "utf-8"))

    if (args.length >= 1 && !!listLanguages.find((value) => value.iso === args[0])) {
      const lang = listLanguages.find((value) => value.iso === args[0])
      const group = await database.updateGroup(message.from, { language: lang.iso })
      return await message.reply(i18n.translate("commands.general.language.changed", { "@LANGUAGE": lang.lang }, group.language), true)
    }

    const text =
      "\n\n" +
      "┏━━「 𓆩 𝐻ɪᴅᴅᴇɴ 𝐹ɪɴᴅᴇʀ ⁣𓆪 」\n" +
      "┃\n" +
      `┃ ${i18n.translate("commands.group.group-language", {}, group.language)}\n` +
      "┃\n" +
      `┗━━「 ꗥ${config.name}ꗥ 」` +
      "\n\n"

    return await client.sendMessage(
      message.from,
      {
        title: `*${i18n.translate("commands.general.language.title", {}, group.language)}*`,
        text,
        footer: config.footer,
        buttonText: i18n.translate("commands.general.language.buttonText", {}, group.language),
        sections: [
          {
            rows: listLanguages
              .filter((v) => i18n.listLanguage().includes(v.iso))
              .sort((first, last) => first.lang.localeCompare(last.lang))
              .map((value) => {
                return {
                  title: value.lang,
                  rowId: `${prefix}${command} ${value.iso}`
                }
              })
          }
        ]
      },
      { ephemeralExpiration: message.expiration }
    )
  }
}

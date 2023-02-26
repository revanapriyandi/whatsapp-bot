import translate from "../../libs/misc/translate"
import type { Command } from "../../types/command"

export default <Command>{
    category: "misc",
    aliases: ["tr", "tl", "trans", "t"],
    desc: "Translate teks or quoted .",
    example: `
    @PREFIX@CMD id Hello
    `,
    execute: async ({ message, args }) => {
        if (message.quoted) {
            const res = await translate(message.quoted.body, args[0]);
            return await message.reply(res.data.translated, true)
        }

        if (args.length > 1) {
            const res = await translate(args.slice(1).join(" "), args[0]);
            return await message.reply(res.data.translated, true)
        }

        throw "noCmd"
    }
}

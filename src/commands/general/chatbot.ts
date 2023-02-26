import { database } from "../../libs/whatsapp"
import type { Command } from "../../types/command"
import config from "../../utils/config"

export default <Command>{
    aliases: ["setchatbot"],
    category: "general",
    desc: "Set user chatbot to SimiSimi or ChatGPT (Default: ChatGPT) (true: SimiSimi, false: ChatGPT)",
    example: `
    @PREFIX@CMD chatgpt
    OR
    @PREFIX@CMD chatai`,
    privateOnly: true,
    execute: async ({ client, message, prefix, args, user }) => {
        if (args.length > 0 && args[0] === 'true' || args[0] === 'chatai' || args[0] === '1') {
            await database.updateUser(user.userId, { chatbot: true, isNew: false })
            const buttons = [
                { buttonId: '.setchatbot false', buttonText: { displayText: '🧑‍🏫 ChatGpt' }, type: 1 },
            ]
            const buttonMessage = {
                text: `_Chatbot has been enabled for you. (Default: false), you can disable it by typing *${prefix}setchatbot false* \n\n*Note: You can change this anytime* \n\n*Default: ChatGpt*._`,
                footer: config.footer,
                buttons: buttons,
                headerType: 1
            }
            return await client.sendMessage(message.from, buttonMessage, { quoted: message })
        } else if (args.length > 0 && args[0] === 'false' || args[0] === 'chatgpt' || args[0] === '2') {
            await database.updateUser(user.userId, { chatbot: false, isNew: false })
            const buttons = [
                { buttonId: '.setchatbot true', buttonText: { displayText: '😎 Friendly' }, type: 1 },
            ]
            const buttonMessage = {
                text: `_Chatbot has been enabled for you *ChatGPT*, You can ask anyting\n\n*Note: You can change this anytime* \n\n*Default: ChatGpt*`,
                footer: config.footer,
                buttons: buttons,
                headerType: 1
            }
            return await client.sendMessage(message.from, buttonMessage, { quoted: message })
        }
        return await message.reply('```Please provide a valid argument...```')

        throw "noCmd"
    }
}

import { ApiChat } from "../../libs/general/chatAi"
import { createCompletionChatGTP } from "../../libs/openai"
import { database } from "../../libs/whatsapp"
import type { Event } from "../../types/command"
import config from "../../utils/config"

export default <Event>{
    execute: async ({ client, message, command }) => {
        if (!message.isGroupMsg && !message.fromMe && !command) {
            if ((await database.getUser(message.sender)).isNew === true && !message.isGroupMsg) {
                const buttons = [
                    { buttonId: '.setchatbot true', buttonText: { displayText: '😎 Friendly' }, type: 1 },
                    { buttonId: '.setchatbot false', buttonText: { displayText: '🧑‍🏫 ChatGpt' }, type: 1 },
                ]

                const buttonMessage = {
                    text: "_Choose your chatbot type :_\n\n*Friendly* - Friendly chatbot\n*ChatGpt* - ChatGpt chatbot\n\n*Note: You can change this anytime* \n\n*Default: ChatGpt*",
                    footer: config.footer,
                    buttons: buttons,
                    headerType: 1
                }
                return await client.sendMessage(message.from, buttonMessage, { quoted: message })
            }
            const schatbot = (await database.getUser(message.sender)).chatbot
            if (schatbot === true && !message.isGroupMsg) {
                return await ApiChat(message)
            }
            if (schatbot === false && !message.isGroupMsg) {
                const { data } = await createCompletionChatGTP(message.body);
                return await message.reply(data.choices[0]?.text.trim());
            }

            if (message.isGroupMsg && message.body.startsWith(">")) {
                const { data } = await createCompletionChatGTP(message.body);
                return await message.reply(data.choices[0]?.text.trim());
            }
            if (message.isGroupMsg && message.quoted?.body.startsWith(">")) {
                const { data } = await createCompletionChatGTP(message.body);
                return await message.reply(data.choices[0]?.text.trim(), true);
            }
        }
    }
}

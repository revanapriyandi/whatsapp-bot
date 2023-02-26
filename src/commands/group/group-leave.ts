import type { Command } from "../../types/command"
import config from "../../utils/config"

export default <Command>{
    category: "group",
    aliases: ["leave", "out"],
    desc: "Tags all users in group chat",
    groupOnly: true,
    cd: 10,
    example: `
    Tag all users in group chat
    @PREFIX@CMD <message>
    `,
    execute: async ({ client, message }) => {
        await client.sendMessage(message.from, {
            image: { url: 'https://64.media.tumblr.com/1e5e02c7519903ca77076e51243b8897/22f2679ebeabc6a0-2e/s1280x1920/62a7ef4d5c4e302ae8aabd763e39b7a097ba4f2d.png' },
            caption: `Goodbye!, I will miss you all! :( `,
            footer: config.footer,
        })
        return await client.groupLeave(message.groupMetadata.groupId)
    }
}

import axios from "axios"
import { database } from "../whatsapp"

export const ApiChat = async (message: any) => {
    const response = await api(message)
    if (response != false) {
        return await message.reply(await response)
    }
    return await message.reply(`Maaf, saya sedang sibuk. Coba lagi nanti.`)
}

const api = async (message: any) => {
    try {
        const user = await (await database.getUser(message.from)).language
        const res = await axios.get(`https://api.simsimi.net/v2/?text=${message.body}&lc=${user}`)
        return await res.data.success
    } catch (error) {
        return false
    }
}

export const chatAI = async (bid: string, key: string, uid: string, text: string): Promise<{ creator: string, status: boolean, msg?: string }> => {
    try {
        const response = await axios.get(`http://api.brainshop.ai/get?bid=${bid}&key=${key}&uid=${uid}&msg=${encodeURI(text)}`)
        const json = response.data
        if (typeof json.cnt == 'undefined') {
            return {
                creator: global.creator,
                status: false
            }
        }
        return {
            creator: global.creator,
            status: true,
            msg: json.cnt
        }
    } catch (error) {
        console.log(error)
        return {
            creator: global.creator,
            status: false
        }
    }
}


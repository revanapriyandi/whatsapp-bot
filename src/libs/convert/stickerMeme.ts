import axios from "axios"

export const stickermeme = async (url: string, teks: string) => {
    const create = `https://api.memegen.link/images/custom/_/${teks}.png?background=${url}`
    const res = await axios.get(create, {
        responseType: "arraybuffer"
    })

    return res.data
}

export const removebg = async (url: string) => {
    const create = `https://api.zahwazein.xyz/convert/sticker-nobg?url=${url}&apikey=aae2a4669845`
    const res = await axios.get(create, {
        responseType: "arraybuffer"
    })

    return res.data
}

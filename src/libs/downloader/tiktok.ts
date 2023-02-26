import axios from "axios"

const tiktok = async (url: string) => {
    const data = await axios.get("https://api.douyin.wtf/api?url=" + url)
    return data
}

export default tiktok

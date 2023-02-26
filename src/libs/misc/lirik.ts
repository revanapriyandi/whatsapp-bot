import axios from "axios"

const lirik = async (song: string) => {
    const data = await axios.get("https://api.popcat.xyz/lyrics?song=" + song)
    return data
}

export default lirik

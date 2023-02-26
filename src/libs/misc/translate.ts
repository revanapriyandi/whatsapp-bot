import axios from "axios"

const translate = async (arg: string, toLang: string) => {
    const data = await axios.get(`https://api.popcat.xyz/translate?to=${toLang}&text=${arg}`)
    return data
}

export default translate

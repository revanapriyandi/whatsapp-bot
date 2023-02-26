import axios from "axios"

const facebook = async (url: string) => {
    const apikey = ["87622a3962ad1fd9763bf0aa", "455d2d46ec59b220edc6c2ca"]
    let currentKey = 0
    let res = await axios.get("https://api.lolhuman.xyz/api/facebook?apikey=" + apikey[currentKey] + "&url=" + url)
    if (res.data.status !== 200) {
        currentKey = currentKey === 0 ? 1 : 0
        res = await axios.get("https://api.lolhuman.xyz/api/facebook?apikey=" + apikey[currentKey] + "&url=" + url)
    }
    return res
}

export default facebook

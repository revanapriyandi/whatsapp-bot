// import axios from "axios"
import twitterGetUrl from "twitter-url-direct"

const twitter = async (url: string) => {
    const response = await twitterGetUrl(url)
    return response
}

export default twitter

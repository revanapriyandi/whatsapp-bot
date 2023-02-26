import axios from "axios"

export const searchMovieTmdb = async (query: string) => {
    const data = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=2008e6975c7b2ea6f1ba2c9d179d8579&query=${encodeURI(query)}`)
    return data
}

export const tmdbDetailMovie = async (id: string) => {
    const data = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=2008e6975c7b2ea6f1ba2c9d179d8579&language=id_ID`)
    return data
}

export const searchTvTmdb = async (query: string) => {
    const data = await axios.get(`https://api.themoviedb.org/3/search/tv?api_key=2008e6975c7b2ea6f1ba2c9d179d8579&query=${encodeURI(query)}`)
    return data
}
export const tmdbTVDetail = async (id: string) => {
    const data = await axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=2008e6975c7b2ea6f1ba2c9d179d8579`)
    return data
}



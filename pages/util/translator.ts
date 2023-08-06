import axios from "axios"

export default async function translate(src: string, dest: string, text: string) {
    // TODO: handle when text is > 5k chars
    const response = await axios.get('/api/translate', {'params': {'src': src, 'dest': dest, 'text': text}});
    return response.data.translated;
}
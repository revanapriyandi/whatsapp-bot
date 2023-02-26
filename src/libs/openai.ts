
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function createCompletionChatGTP(message: string): Promise<any> {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: message,
        max_tokens: 2048,
        temperature: 0,
    });
    return response;
}

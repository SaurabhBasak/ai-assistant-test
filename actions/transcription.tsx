"use server";

import OpenAI from "openai";

const openai = new OpenAI();

type ChatRequestMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};

async function transcript(prevState: any, formData: FormData) {
    console.log("Previous state: ", prevState);

    const id = Math.random().toString(36);

    const file = formData.get("audio") as File;

    if (file.size === 0) {
        return {
            sender: "",
            response: "No audio file was uploaded.",
        };
    }

    console.log(">>", file);

    // const arrayBuffer = await file.arrayBuffer();
    // const audio = new Uint8Array(arrayBuffer);
    // const buffer = Buffer.from(audio);

    // get audio transcription from Azure Whisper AI service

    console.log("-- Transcribe Audio Sample ==");

    const result = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1'
    })

    console.log(`Transcription result: ${result.text}`);

    // get chat completion from Azure OpenAI service

    const messages: ChatRequestMessage[] = [
        {
            role: "system",
            content:
                "You are a helpful assistant. You will answer questions and reply I cannot answer that if you don't know the answer.",
        },
        {
            role: "user",
            content: result.text,
        },
    ];

    const completions = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
    })

    const response = completions.choices[0].message.content;

    console.log(prevState.sender, "+++", result.text);

    return {
        sender: result.text,
        response: response,
        id: id,
    };
}

export default transcript;

"use client";

import transcript from "@/actions/transcription";
import Messages from "@/components/Messages";
import Recorder, { mimeType } from "@/components/Recorder";
import VoiceSynthesizer from "@/components/VoiceSynthesizer";
import { SettingsIcon } from "lucide-react";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";

const initialState = {
    sender: "",
    response: "",
    id: "",
};

export type Message = {
    sender: string;
    response: string;
    id: string;
};

export default function Home() {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const submitButtonRef = useRef<HTMLButtonElement | null>(null);
    const [state, formAction] = useFormState(transcript, initialState);
    const [messages, setMessages] = useState<Message[]>([]);
    const [displaySettings, setDisplaySettings] = useState(false);

    // Responsible for updating the messages array when the Server Action completes
    useEffect(() => {
        if (state.response && state.sender && state.id) {
            setMessages((messages) => [
                {
                    sender: state.sender || "",
                    response: state.response || "",
                    id: state.id || "",
                },
                ...messages,
            ]);
        }
    }, [state]);

    const uploadAudio = (blob: Blob) => {
        const file = new File([blob], "audio.webm", { type: mimeType });

        // set the file as the value of the hidden file input field
        if (fileRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileRef.current.files = dataTransfer.files;

            // simulate a click & submit the form
            if (submitButtonRef.current) {
                submitButtonRef.current.click();
            }
        }
    };

    console.log(messages);

    return (
        <div className="bg-black h-screen overflow-y-auto">
            {/* Header */}
            <header className="flex justify-between fixed top-0 text-white w-full p-5">
                <Image
                    alt="Logo"
                    src="https://i.imgur.com/fWHjATY.png"
                    width={50}
                    height={50}
                    className="object-contain"
                />

                <SettingsIcon
                    size={40}
                    className="p-2 m-2 rounded-full cursor-pointer bg-purple-600 text-black transition-all ease-in-out duration-150 hover:bg-purple-700 hover:text-white"
                    onClick={() => setDisplaySettings(!displaySettings)}
                />
            </header>

            {/* Form */}

            <form action={formAction} className="flex flex-col bg-black">
                <div className="flex-1 bg-gradient-to-b from-purple-500 to-black">
                    <Messages messages={messages}/>
                </div>

                {/* Hidden fields */}
                <input type="file" name="audio" hidden ref={fileRef} />
                <button
                    type="submit"
                    name="submit"
                    hidden
                    ref={submitButtonRef}
                >
                    Submit Audio
                </button>

                <div className="fixed bottom-0 w-full overflow-hidden bg-black rounded-t-3xl">
                    {/* Recorder */}
                    <Recorder uploadAudio={uploadAudio} />

                    <div>
                        <VoiceSynthesizer
                            state={state}
                            displaySettings={displaySettings}
                         />
                    </div>
                </div>
            </form>
        </div>
    );
}

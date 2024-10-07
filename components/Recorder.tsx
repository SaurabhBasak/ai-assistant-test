"use client";

import React, { useEffect, useRef, useState } from "react";
import activeAssitantIcon from "@/img/active.gif";
import notActiveAssistantIcon from "@/img/notactive.png";
import Image from "next/image";
import { useFormStatus } from "react-dom";

export const mimeType = "audio/webm";

function Recorder({ uploadAudio }: { uploadAudio: (blob: Blob) => void }) {
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const { pending } = useFormStatus();
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    useEffect(() => {
        getMicrophonePermission();
    }, []);

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err) {
                if (err instanceof DOMException) {
                    console.error("DOMException:", err.message);
                } else if (err instanceof Error) {
                    console.error("Error:", err.message);
                    alert("Error: " + err.message);
                } else {
                    console.error("Unknown error:", err);
                    alert("Unknown error: " + err);
                }
            }
        } else {
            alert("Mediarecorder not supported in browser.");
        }
    };

    const startRecording = async () => {
        if (stream === null || pending) return;

        setRecordingStatus("recording");

        // Create new media recorder instance using the stream
        const media = new MediaRecorder(stream, { mimeType });
        mediaRecorder.current = media;
        mediaRecorder.current.start();

        const localAudioChunks: Blob[] = [];

        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined" || event.data.size === 0)
                return;

            localAudioChunks.push(event.data);
        };

        setAudioChunks(localAudioChunks);
    };

    const stopRecording = async () => {
        if (mediaRecorder.current === null || pending) return;

        setRecordingStatus("inactive");
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType});
            // const audioUrl = URL.createObjectURL(audioBlob);
            uploadAudio(audioBlob);
            setAudioChunks([]);
        }
    }

    return (
        <div className="flex items-center justify-center text-white">
            {!permission && (
                <button className="assistant text-gray-400 font-bold" onClick={getMicrophonePermission}>
                    Allow Microphone
                </button>
            )}

            {pending && (
                <Image
                    src={activeAssitantIcon}
                    alt="Recording"
                    unoptimized
                    priority={true}
                    width={350}
                    height={350}
                    className="assistant grayscale"
                />
            )}

            {permission && recordingStatus === "inactive" && !pending && (
                <Image
                    src={notActiveAssistantIcon}
                    onClick={startRecording}
                    alt="Not Recording"
                    unoptimized
                    priority={true}
                    width={350}
                    height={350}
                    className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out"
                />
            )}

            {recordingStatus === "recording" && (
                <Image
                    src={activeAssitantIcon}
                    onClick={stopRecording}
                    alt="Recording"
                    unoptimized
                    priority={true}
                    width={350}
                    height={350}
                    className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out"
                />
            )}
        </div>
    );
}

export default Recorder;

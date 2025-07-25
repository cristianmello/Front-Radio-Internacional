import React, { createContext, useContext, useState } from 'react';

const AudioPlayerContext = createContext();

export const useAudioPlayer = () => useContext(AudioPlayerContext);

export const AudioPlayerProvider = ({ children }) => {
    const [playingAudio, setPlayingAudio] = useState(null); // Guardará el objeto del audio en reproducción

    const playAudio = (audio) => setPlayingAudio(audio);
    const stopAudio = () => setPlayingAudio(null);

    const value = {
        playingAudio,
        playAudio,
        stopAudio,
    };

    return (
        <AudioPlayerContext.Provider value={value}>
            {children}
        </AudioPlayerContext.Provider>
    );
};
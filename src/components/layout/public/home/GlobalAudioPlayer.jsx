import React, { useState, useRef, useEffect } from 'react';
import { useAudioPlayer } from '../../../../context/AudioPlayerContext';

// --- Iconos SVG para los controles ---
const PlayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
);
const PauseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
);
const VolumeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
);


const GlobalAudioPlayer = () => {
    // 1. CONTEXTO Y REFERENCIAS
    const { playingAudio, stopAudio } = useAudioPlayer();
    const audioRef = useRef(null); // Ref para el elemento <audio>

    // 2. ESTADOS DEL REPRODUCTOR
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.75);

    // 3. EFECTOS PARA SINCRONIZAR
    // Este efecto se activa cuando cambia el audio del contexto global
    useEffect(() => {
        if (playingAudio && audioRef.current) {
            audioRef.current.src = playingAudio.url;
            audioRef.current.play().catch(error => console.error("Error al reproducir audio:", error));
            setIsPlaying(true);
        } else if (!playingAudio && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [playingAudio]);

    // 4. MANEJADORES DE EVENTOS DEL AUDIO
    const onLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    const onTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const onEnded = () => {
        stopAudio(); // Limpia el audio del contexto
        setIsPlaying(false);
    };

    // 5. FUNCIONES DE INTERACCIÓN DEL USUARIO
    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgressChange = (e) => {
        audioRef.current.currentTime = e.target.value;
        setCurrentTime(e.target.value);
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        audioRef.current.volume = newVolume;
        setVolume(newVolume);
    };

    // 6. HELPER PARA FORMATEAR TIEMPO
    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds)) return '0:00';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Si no hay audio, no renderizar nada
    if (!playingAudio) {
        return null;
    }

    // 7. RENDERIZADO DEL COMPONENTE
    return (
        <div className="custom-audio-player">
            {/* El elemento de audio real, pero oculto. Es el motor. */}
            <audio
                ref={audioRef}
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
            />

            <div className="player-controls">
                <button onClick={togglePlayPause} className="play-pause-btn">
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
            </div>

            <div className="player-timeline">
                <div className="player-info">
                    <span className="audio-title">Reproduciendo: {playingAudio.title}</span>
                    <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleProgressChange}
                    className="progress-bar"
                />
            </div>

            <div className="player-volume">
                <VolumeIcon />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                />
            </div>
        </div>
    );
};

export default GlobalAudioPlayer;
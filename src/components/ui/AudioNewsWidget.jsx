import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import PropTypes from 'prop-types';
import { useSectionEdit } from "../../context/SectionEditContext";
import { useAudioPlayer } from '../../context/AudioPlayerContext';

const ITEMS_PER_PAGE = 6;

const AudioItem = React.memo(({ audio, isPlaying, onPlay, onStop, onEditItem, onRemoveItem }) => {
  const { canEdit } = useSectionEdit();

  // Handlers estables para los clicks
  const handlePlay = useCallback(() => onPlay(audio), [audio, onPlay]);
  const handleEdit = useCallback(() => onEditItem(audio), [audio, onEditItem]);
  const handleRemove = useCallback(() => onRemoveItem(audio.audio_code), [audio.audio_code, onRemoveItem]);

  return (
    <div className={`audio-news-item ${isPlaying ? 'is-playing' : ''}`}>
      <div className="compact-row">
        {/* --- LÓGICA CORREGIDA PARA MOSTRAR PLAY/PAUSA --- */}
        {isPlaying ? (
          // Si este audio está sonando, muestra el botón de PAUSA
          <button className="play-btn" title="Pausar" onClick={onStop}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
        ) : (
          // Si no, muestra el botón de PLAY
          <button className="play-btn" title="Reproducir" onClick={handlePlay}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
        <h5 className="audio-title">{audio.title || 'Título no disponible'}</h5>
      </div>

      {canEdit && (
        <div className="item-actions">
          <button className="edit-item-btn" title="Editar nota de audio" onClick={handleEdit}>
            <i className="fas fa-pen" />
          </button>
          <button className="delete-item-btn" title="Quitar nota de audio de la sección" onClick={handleRemove}>
            <i className="fas fa-trash" />
          </button>
        </div>
      )}
    </div>
  );
});

const AudioNewsWidget = React.memo(({ sectionTitle, data: audios = [] }) => {
  const { canEdit, onAddItem, onRemove, onEdit } = useSectionEdit();
  // Usamos el estado y las funciones del contexto global
  const { playingAudio, playAudio, stopAudio } = useAudioPlayer();

  const [currentPage, setCurrentPage] = useState(1);
  const widgetRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [audios]);

  if (!audios || audios.length === 0) {
    return canEdit ? (
      <div className="widget audio-news">
        <div className="widget-header">
          {sectionTitle && <h3>{sectionTitle}</h3>}
          <button className="add-btn" onClick={onAddItem}>
            + Añadir Audio
          </button>
        </div>
        <p className="no-items">No hay notas de audio en esta sección.</p>
      </div>
    ) : null;
  }

  const totalPages = useMemo(() => Math.ceil(audios.length / ITEMS_PER_PAGE), [audios]);

  const pageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return audios.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, audios]);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (widgetRef.current) {
        widgetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [totalPages]);

  return (
    <div className="widget audio-news" ref={widgetRef}>
      <div className="widget-header">
        {sectionTitle && <h3>{sectionTitle}</h3>}
        {canEdit && (
          <button className="add-btn" onClick={onAddItem}>
            + Añadir Audio
          </button>
        )}
      </div>

      <div className="audio-news-list">
        {pageItems.map((audio) => (
          <AudioItem
            key={audio.audio_code}
            audio={audio}
            isPlaying={playingAudio?.audio_code === audio.audio_code}
            onPlay={playAudio}
            onStop={stopAudio}
            onEditItem={onEdit}
            onRemoveItem={onRemove}
          />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination widget-pagination">
          <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>←</button>
          <span className="pagination-info">{currentPage} / {totalPages}</span>
          <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>→</button>
        </div>
      )}
    </div>
  );
});

AudioNewsWidget.propTypes = {
  sectionTitle: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape({
    audio_code: PropTypes.any.isRequired,
    title: PropTypes.string,
    audio_url: PropTypes.string,
  })),
};
export default AudioNewsWidget;
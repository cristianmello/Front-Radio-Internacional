// src/components/ui/ProfileSidebar.jsx
import React, { useState, useEffect } from 'react';
import { useProfileSidebar } from '../../context/ProfileSidebarContext';
import useAuth from '../../hooks/UseAuth';
import Url from '../../helpers/Url';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProfileSidebar() {
    const { targetUserId, closeSidebar } = useProfileSidebar();
    const { authFetch } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!targetUserId) {
            setProfileData(null);
            return;
        }

        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const res = await authFetch(`${Url.url}/api/users/${targetUserId}/profile-summary`);
                const json = await res.json();
                if (res.ok) {
                    setProfileData(json.data);
                }
            } catch (err) {
                console.error("Error fetching profile summary:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [targetUserId, authFetch]);

    const handleClose = () => {
        setProfileData(null); // Limpia los datos al cerrar
        closeSidebar();
    };

    //if (!targetUserId) return null;

    return (
        <>
            <div className={`profile-sidebar-overlay ${!targetUserId ? 'hidden' : ''}`} onClick={handleClose}></div>
            <div className={`profile-sidebar-content ${!targetUserId ? 'hidden' : ''}`}>
                <div className="sidebar-close-header">
                    <button className="close-btn" onClick={handleClose}>
                        <i className="fas fa-times"></i> Cerrar
                    </button>
                </div>

                {loading && <p>Cargando perfil...</p>}
                {profileData && (
                    <>
                        {/* El resto de tu sidebar no cambia */}
                    </>
                )}                {loading && <p>Cargando perfil...</p>}
                {profileData && (
                    <>
                        <div className="sidebar-profile-header">
                            <div className="sidebar-avatar">
                                <img src={profileData.user.user_image || '/default-avatar.png'} alt="avatar" />
                            </div>
                            <h2>{profileData.user.user_name} {profileData.user.user_lastname}</h2>
                            {/* Aquí irían los botones de Seguir / Silenciar */}
                        </div>
                        <div className="sidebar-stats">
                            <div><span>{profileData.stats.comments}</span> COMENTARIOS</div>
                            <div><span>{profileData.stats.likesReceived}</span> ME GUSTA</div>
                            {/* <div><span>{profileData.stats.followers}</span> SEGUIDORES</div>*/}
                        </div>
                        <div className="sidebar-activity">
                            <h4>Actividad Reciente</h4>
                            <ul>
                                {profileData.recentComments.map(comment => (
                                    <li key={comment.comment_id}>
                                        <p>"{comment.comment_content}"</p>
                                        <div className="sidebar-activity-meta">
                                            <i className="fas fa-clock"></i>
                                            <span>
                                                {comment.created_at
                                                    ? formatDistanceToNow(new Date(comment.created_at.replace(' ', 'T')), { locale: es, addSuffix: true })
                                                    : ''
                                                }
                                            </span>
                                            <span>en</span>
                                            <Link to={`/articulos/${comment.article.article_code}/${comment.article.article_slug}`} onClick={handleClose}>
                                                {comment.article.article_title}
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {profileData.stats.comments > 5 && (
                                <Link to="/perfil/mis-comentarios" className="view-all-link" onClick={handleClose}>
                                    Ver todos los comentarios
                                </Link>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
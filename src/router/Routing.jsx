import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider } from '../context/AuthProvider'
import { AudioPlayerProvider } from '../context/AudioPlayerContext';
import { NotificationProvider } from '../context/NotificationContext';
import ScrollToTop from '../helpers/ScrollToTop';
// Layouts
import PublicLayout from '../components/layout/PublicLayout'
import AdminLayout from '../components/layout/private/AdminLayout'

// Páginas públicas
import HomePage from '../pages/HomePage'
import ArticlePage from '../pages/ArticlePage'
import ProfilePage from '../pages/ProfilePage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import Contact from '../pages/ContactPage';
import About from '../pages/AboutPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';

import UserListPage from '../pages/admin/UserListPage';
import LogsPage from '../pages/admin/LogsPage';


// Artículos (privados)
/*import ArticleList from '../components/articles'
import CreateArticle from '../components/articles/CreateArticle'
import EditArticle from '../components/articles/EditArticle'

// Categorías (privadas)
import CategoryList from '../components/categories/CategoryList'
import CreateCategory from '../components/categories/CreateCategory'
import EditCategory from '../components/categories/EditCategory'
*/

// Página 404
const NotFound = () => (
    <div style={{ padding: '2rem' }}>
        <h1>Error 404 - Página no encontrada</h1>
        <Link to="/">Volver al inicio</Link>
    </div>
)

export const Routing = () => (
    <BrowserRouter>
        <AudioPlayerProvider>
            <AuthProvider>
                <NotificationProvider>

                    <ScrollToTop />
                    <Routes>
                        {/* Público */}
                        <Route path="/" element={<PublicLayout />}>
                            <Route index element={<HomePage />} />
                            <Route path="/home" element={<HomePage />} />
                            <Route path="categoria/:category" element={<HomePage />} />
                            <Route path="articulos/:code/:slug" element={<ArticlePage />} />
                            <Route path="perfil" element={<ProfilePage />} />
                            <Route path="politica-de-privacidad" element={<PrivacyPolicyPage />} />
                            <Route path="verify-email" element={<VerifyEmailPage />} />
                            <Route path="reset-password" element={<ResetPasswordPage />} />
                            <Route path="about" element={<About />} />
                            <Route path="contact" element={<Contact />} />
                        </Route>

                        {/* Administración */}
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<Navigate to="users" />} />
                            <Route path="users" element={<UserListPage />} />
                            <Route path="logs" element={<LogsPage />} />
                            <Route path="*" element={<NotFound />} />
                        </Route>


                        {/* Categorías privadas
                <Route path="/categorias-privado" element={<PrivateLayout />}>
                    {/*<Route index element={<CategoryList />} />*/}
                        {/*<Route path="crear" element={<CreateCategory />} />*/}
                        {/*<Route path="editar/:id" element={<EditCategory />} />
                </Route>

                <Route path="/articulos" element={<PrivateLayout />}>
                    {/*<Route index element={<ArticleList />} />*/}
                        {/*<Route path="crear" element={<CreateArticle />} />*/}
                        {/*<Route path="editar/:id" element={<EditArticle />} />
                </Route>
*/}
                        {/* Ruta no encontrada */}
                        <Route path="*" element={<NotFound />} />

                    </Routes>
                </NotificationProvider>
            </AuthProvider>
        </AudioPlayerProvider>

    </BrowserRouter>
)

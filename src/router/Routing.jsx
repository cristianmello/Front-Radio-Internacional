import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider } from '../context/AuthProvider'
import ScrollToTop from '../helpers/ScrollToTop';
// Layouts
import PublicLayout from '../components/layout/public/PublicLayout'
import AdminLayout from '../components/layout/private/AdminLayout'

// Páginas públicas
import HomePage from '../components/layout/public/home/index'
import ArticlePage from '../components/layout/public/home/ArticlePage'
import ProfilePage from '../components/layout/public/home/ProfilePage';
import VerifyEmailPage from '../components/layout/public/home/VerifyEmailPage';
import ResetPasswordPage from '../components/layout/public/home/ResetPasswordPage';
//import Index from '../components/layout/public/home/index'
//import ArticleDetail from '../components/layout/public/article/ArticleDetail'
//import CategoryListPublic from '../components/layout/public/categoryarticle/CategoryListPublic'
//import LoginRegister from '../components/layout/public/user/LoginRegister'
//import ResetPassword from '../components/layout/public/user/ForgotPassword'
//import VerifyEmail from '../components/layout/public/user/VerifyEmail'
import Contact from '../components/layout/ContactPage';
import About from '../components/layout/AboutPage';
import PrivacyPolicyPage from '../components/layout/PrivacyPolicyPage';

import UserListPage from '../components/layout/private/admin/UserListPage';
import LogsPage from '../components/layout/private/admin/LogsPage';


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
        <AuthProvider>
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
                    {/*<Route path="login" element={<LoginRegister />} />*/}
                    {/* <Route path="reset-password" element={<ResetPassword />} />*/}
                    {/*<Route path="verificar-email" element={<VerifyEmail />} />*/}
                    {/*<Route path="articulo/:id" element={<ArticleDetail />} />*/}
                    {/*<Route path="categorias" element={<CategoryListPublic />} />*/}
                    {/*<Route path="*" element={<NotFound />} />*/}
                </Route>

                {/* Administración */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="users" />} />
                    <Route path="users" element={<UserListPage />} />
                    <Route path="logs" element={<LogsPage />} />
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* Usuario autenticado 
                <Route path="/usuario" element={<PrivateLayout />}>
                    {/*<Route index element={<Profile />} />*/}
                {/*<Route path="perfil" element={<Profile />} />*/}
                {/*<Route path="actualizar-perfil" element={<UpdateProfile />} />*/}
                {/*<Route path="cambiar-password" element={<ChangePassword />} />*/}
                {/*<Route path="actualizar-imagen-perfil" element={<UpdateImage />} />*/}
                {/*<Route path="cerrar-sesion" element={<Logout />} />
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
        </AuthProvider>
    </BrowserRouter>
)

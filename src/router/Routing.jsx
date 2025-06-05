import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider } from '../context/AuthProvider'

// Layouts
import PublicLayout from '../components/layout/public/PublicLayout'
import PrivateLayout from '../router/privateroute'

// Páginas públicas
//import Index from '../components/layout/public/home/index'
//import ArticleDetail from '../components/layout/public/article/ArticleDetail'
//import CategoryListPublic from '../components/layout/public/categoryarticle/CategoryListPublic'
import LoginRegister from '../components/layout/public/user/LoginRegister'
import ResetPassword from '../components/layout/public/user/ForgotPassword'
//import VerifyEmail from '../components/layout/public/user/VerifyEmail'
import Contact from '../components/layout/ContactPage';
import About from '../components/layout/AboutPage';

// Usuario autenticado
//import Profile from '../components/layout/private/user/Profile'
//import UpdateProfile from '../components/layout/private/user/UpdateProfile'
//import Logout from '../components/layout/private/user/Logout'

// Administración
import UserList from '../components/layout/private/admin/UserList'
import UpdateRole from '../components/layout/private/admin/UpdateRole'
import RoleChangeHistory from '../components/layout/private/admin/RoleChangeHistory'
import RoleChangeCSV from '../components/layout/private/admin/RoleChangeCSV'
import AdminControls from '../components/layout/private/content/AdminControls';

import AdminHomePage from '../components/layout/private/content/AdminHomePage';

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
            <Routes>

                {/* Público */}
                <Route path="/" element={<PublicLayout />}>
                    <Route index element={<AdminHomePage />} />
                    <Route path="home" element={<AdminHomePage />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="login" element={<LoginRegister />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    {/*<Route path="verificar-email" element={<VerifyEmail />} />*/}
                    {/*<Route path="articulo/:id" element={<ArticleDetail />} />*/}
                    {/*<Route path="categorias" element={<CategoryListPublic />} />*/}
                    {/*<Route path="*" element={<NotFound />} />*/}
                </Route>

                {/* Usuario autenticado */}
                <Route path="/usuario" element={<PrivateLayout />}>
                    {/*<Route index element={<Profile />} />*/}
                    {/*<Route path="perfil" element={<Profile />} />*/}
                    {/*<Route path="actualizar-perfil" element={<UpdateProfile />} />*/}
                    {/*<Route path="cambiar-password" element={<ChangePassword />} />*/}
                    {/*<Route path="actualizar-imagen-perfil" element={<UpdateImage />} />*/}
                    {/*<Route path="cerrar-sesion" element={<Logout />} />*/}
                    <Route path="*" element={<NotFound />} />

                </Route>

                {/* Administración */}
                <Route path="/admin" element={<PrivateLayout />}>
                    <Route path="usuarios" element={<UserList />} />
                    <Route path="usuarios/:user_code/actualizar-rol" element={<UpdateRole />} />
                    <Route path="usuarios/historial-roles" element={<RoleChangeHistory />} />
                    <Route path="usuarios/historial-roles/export" element={<RoleChangeCSV />} />
                    <Route path="controles" element={<AdminHomePage />} />
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* Categorías privadas */}
                <Route path="/categorias-privado" element={<PrivateLayout />}>
                    {/*<Route index element={<CategoryList />} />*/}
                    {/*<Route path="crear" element={<CreateCategory />} />*/}
                    {/*<Route path="editar/:id" element={<EditCategory />} />*/}
                </Route>

                {/* Artículos privados */}
                <Route path="/articulos" element={<PrivateLayout />}>
                    {/*<Route index element={<ArticleList />} />*/}
                    {/*<Route path="crear" element={<CreateArticle />} />*/}
                    {/*<Route path="editar/:id" element={<EditArticle />} />*/}
                </Route>

                {/* Ruta no encontrada */}
                <Route path="*" element={<NotFound />} />

            </Routes>
        </AuthProvider>
    </BrowserRouter>
)

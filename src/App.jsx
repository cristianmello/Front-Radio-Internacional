import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/public/publiclayout';
import Home from './components/layout/public/Main';
import About from './components/layout/public/AboutPage';
import Contact from './components/layout/public/ContactPage';
import LoginRegister from './components/layout/public/LoginRegister';
//import Register from './components/user/Register';
//import ForgotPassword from './components/user/';
//import Profile from './components/user/Profile';
//import Logout from './components/user/Logout';
import PrivateRoute from './router/privateroute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout general con Header y Footer */}
        <Route path="/" element={<Layout />}>

          {/* Rutas públicas */}
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<LoginRegister />} />
          {/*<Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />*/}

          {/* Rutas protegidas */}
          <Route element={<PrivateRoute />}>
            {/*<Route path="profile" element={<Profile />} />
            <Route path="logout" element={<Logout />} />*/}
          </Route>

        </Route>
      </Routes>
    </Router>
  );
}

export default App;

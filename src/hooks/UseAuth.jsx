import { useContext } from 'react'
import AuthContext from '../context/AuthProvider'

const useAuth = () => {
    return useContext(AuthContext);
    //Fix
}

export default useAuth;

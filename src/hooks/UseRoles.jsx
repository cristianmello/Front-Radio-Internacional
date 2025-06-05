import { useContext } from 'react'
import AuthContext from '../contexts/AuthProvider'

const useRoles = () => {
    return useContext(AuthContext);
}

export default useRoles;


import { useContext, createContext, useState } from "react"
import { setCookies, removeCookies } from 'cookies-next'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import fetchers from "../utils/fetchers"

const Context = createContext()

export const StateContext = ({ children }) =>{
    // Global state
    const [state, setState] = useState({
        user: null
    })
    const setStateUser = user =>{
        setState({...state, user})
    }
    // Alerts
    const [alerts, setAlerts] = useState([])
    const setAlert = (alertMessage, alertType, timeout = 3000) =>{
        const id = uuidv4()
        setAlerts([...alerts, {id, alertMessage, alertType, timeout}])
        setTimeout(() => {
            setAlerts([])
        }, timeout)
    }
    // Register user
    const register = async ({ account_type, name, email, password, gender, birthdate, phone }) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const body = JSON.stringify({ account_type, name, email, password, gender, birthdate, phone })
        try {
            const res = await axios.post('http://localhost:5000/api/users', body, config)
            setCookies("token",res.data.token)
            fetchers.loadUser()
            setState({...state, user: res.data})
            setAlert('Registration completed successfully.','success')
        } catch (err) {
            const errors = err.response.data.errors
            if(errors){
                errors.forEach(error => setAlert(error.msg,'danger'))
            }
            removeCookies('token')
        }
    }
    // Login
    const login = async (email, password) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const body = JSON.stringify({ email, password })
        try {
            const res = await axios.post('http://localhost:5000/api/auth',body,config)
            setCookies("token",res.data.token)
            fetchers.loadUser()
            setState({...state, user: res.data})
            setAlert('Welcome back.','success')
        } catch (err) {
            if(err.response){
                const errors = err.response.data.errors
                errors.forEach(error => setAlert(error.msg,'danger'))
            }
            console.log(err.response)
            removeCookies('token')
        }
    }
    // Logout
    const logout = () => {
        removeCookies('token')
        setState({...state, user: null})
        setAlert('See you next time.','success')
    }

    return(
        <Context.Provider value={{
            state,
            setStateUser,

            alerts,
            setAlert,

            register,
            login,
            logout
        }}>
            {children}
        </Context.Provider>
    )
}

export function useStateContext() {
    return useContext(Context)
}
  
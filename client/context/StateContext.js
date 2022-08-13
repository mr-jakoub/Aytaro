import { useContext, createContext, useState } from "react"
import { setCookie, deleteCookie } from 'cookies-next'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import fetchers from "../utils/fetchers"

const Context = createContext()

export const StateContext = ({ children }) =>{
    // Global state
    const [state, setState] = useState({
        user: null,
        popupForm: "none"
    })
    // Alerts
    const [alerts, setAlerts] = useState([])
    const setAlert = (alertMessage, alertType, timeout = 3000) =>{
        setAlerts([])
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
            setCookie("token",res.data.token)
            fetchers.loadUser()
            setState({...state, user: res.data})
            setAlert('Registration completed successfully.','success')
        } catch (err) {
            const errors = err.response.data.errors
            if(errors){
                errors.forEach(error => setAlert(error.msg,'danger'))
            }
            deleteCookie('token')
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
            const res = await axios.post('http://localhost:5000/api/auth', body, config)
            setCookie("token",res.data.token)
            fetchers.loadUser()
            setState({...state, user: res.data})
        } catch (err) {
            if(err.response){
                const errors = err.response.data.errors
                errors.forEach(error => setAlert(error.msg,'danger'))
            }
            deleteCookie('token')
        }
    }
    // Logout
    const logout = () => {
        deleteCookie('token')
        setState({...state, user: null})
        setAlert('See you next time.','success')
    }
    // Get profile by ID
    const getProfileById = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/profile/${userId}`)
            return res.data
        } catch (err) {
            
        }
    }
    // Add rise
    const addRise = async (courseId) => {
        try {
            await axios.put(`http://localhost:5000/api/courses/rise/${courseId}`)
        } catch (err) {
            if(err.response){
                setAlert(err.response.statusText,'danger')
            }
        }
    }
    // Add course
    const addCourse = async formData => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        try {
            await axios.post('http://localhost:5000/api/courses', formData, config)
            setAlert('Course created Successfully','success')
        } catch (err) {
            setAlert(err.response.statusText,'danger')
        }
    }

    return(
        <Context.Provider value={{
            state,
            setState,

            // Alerts
            alerts,
            setAlert,

            // User
            getProfileById,
            register,
            login,
            logout,
            
            // Courses
            addRise,
            addCourse
        }}>
            {children}
        </Context.Provider>
    )
}

export function useStateContext() {
    return useContext(Context)
}
  
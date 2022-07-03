import axios from 'axios'
import { getCookie } from 'cookies-next'
import setAuthToken from "./setAuthToken"

export const loadUser = async() =>{
  if(getCookie('token')){
      const tokenSeted = await setAuthToken(getCookie('token'))
      if(tokenSeted){
        const resLoad = await axios.get('http://localhost:5000/api/auth')
        return resLoad.data
      }
  } return false

}

export const getCourses = async() =>{
  const resCourses = await axios.get('http://localhost:5000/api/courses')
  return resCourses.data
}

const fetchers = {
  loadUser,
  getCourses
}

export default fetchers
import axios from 'axios'

const setAuthToken = token =>{
    if(token){
        axios.defaults.headers.common['aytaro-auth-token'] = token
        return true
    }else{
        delete axios.defaults.headers.common['aytaro-auth-token']
        return false
    }
}

export default setAuthToken
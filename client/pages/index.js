import { useState } from "react"
import Landing from "../components/layout/Landing"
import { getCookie } from 'cookies-next'
import useSWR from "swr"
import fetchers from "../utils/fetchers"
import Dashboard from "../components/dashboard/Dashboard"
import LoadingBar from 'react-top-loading-bar'

const Aytaroo = ({ users }) =>{
    const [loadingProgress, setLoadingProgress] = useState(100)
    const user = useSWR('/api/auth', fetchers.loadUser).data
    return user === undefined ? '' : user === false && !getCookie('token') ?<><Landing users={users} /><LoadingBar color='var(--Primary-color)' shadow={true} progress={loadingProgress} onLoaderFinished={() => setLoadingProgress(0)} /></>:<> <Dashboard user={user}/> <LoadingBar color='var(--Primary-color)' shadow={true} progress={loadingProgress} onLoaderFinished={() => setLoadingProgress(0)} /></>
        
}

export default Aytaroo

export async function getServerSideProps(){
    const resUsers = await fetch('http://localhost:5000/api/users/recent')
    const users = await resUsers.json()
    return {
        props:{
            users
        }
    }
}
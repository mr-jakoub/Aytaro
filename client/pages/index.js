import Landing from "../components/layout/Landing"
import { getCookie } from 'cookies-next'
import useSWR from "swr"
import fetchers from "../utils/fetchers"
import Dashboard from "../components/dashboard/Dashboard"

const Hutaroo = ({ users }) =>{
    const user = useSWR('/api/auth', fetchers.loadUser).data
    return user === undefined ? <h1>Loading...</h1> : user === false && !getCookie('token') ?<Landing users={users} />: <Dashboard />
        
}

export default Hutaroo

export async function getServerSideProps(){
    const resUsers = await fetch('http://localhost:5000/api/users/recent')
    const users = await resUsers.json()
    return {
        props:{
            users
        }
    }
}
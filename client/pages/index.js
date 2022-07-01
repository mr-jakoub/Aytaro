import Landing from "../components/layout/Landing"
import { getCookie } from 'cookies-next'
import useSWR from "swr"
import Link from 'next/link'
import fetchers from "../utils/fetchers"
import { useStateContext } from "../context/StateContext"

const Hutaroo = ({ users }) =>{
    const { logout } = useStateContext()
    const user = useSWR('/api/auth', fetchers.loadUser).data
  return user === undefined ? <h1>Loading...</h1> :
    <>
    {user === false && !getCookie('token') ?<Landing users={users} />: (<><br /><br /><br /><Link href="/login"><a onClick={()=>logout()}>Home</a></Link></>)
    }
    </>
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
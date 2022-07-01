import '../styles/globals.css'
import { StateContext } from '../context/StateContext'
import NavBar from '../components/layout/Navbar'
import loadUser from '../utils/fetchers'
import useSWR from "swr"

const Aytaro = ({ Component, pageProps }) =>{
  const { data, error } = useSWR('/api/auth', loadUser)
  if(error){
    return 'Error'
  }
  return (
    <>
    <StateContext>
      <NavBar user={data} />
      <Component {...pageProps} />
    </StateContext>
    </>
  )
}
export default Aytaro
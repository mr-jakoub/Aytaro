import '../styles/globals.css'
import { StateContext } from '../context/StateContext'
import NavBar from '../components/layout/Navbar'
import fetchers from '../utils/fetchers'
import useSWR from "swr"
import { useEffect } from 'react'

const Aytaro = ({ Component, pageProps }) =>{
  const { data, error } = useSWR('/api/auth', fetchers.loadUser)
  if(error){
    return 'error hna lzm dir skeleton navbar w posts sides'
  }
  // Remove 'Next js' unneeded elements
  useEffect(()=>{
    if(document.getElementById('__next')) document.getElementById('__next').id = '__yonefo'
    if(document.getElementById('__next-build-watcher')) document.getElementById('__next-build-watcher').remove()
  },[])
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
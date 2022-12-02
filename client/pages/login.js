import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { getCookie } from 'cookies-next'
import { useRouter } from 'next/router'
import { useStateContext } from "../context/StateContext"
import Alert from "../components/layout/Alert"
import fetchers from "../utils/fetchers"
import LoadingBar from 'react-top-loading-bar'

const Login = () =>{
    const { alerts, login } = useStateContext()
    const router = useRouter()
    const [visiblePass, setVisiblePass] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const { email, password } = formData
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })
    const onSubmit = e =>{
        e.preventDefault()
        login(email,password)
    }
    // Redirect if logged in
    const { data, error } = useSWR('/api/auth', fetchers.loadUser)
    if(error){
        return 'Error'
    }
    if(getCookie('token')){
        if (process.browser) sessionStorage.setItem("loggedIn", "start")
        router.push('/')
    }
    const [loadingProgress, setLoadingProgress] = useState(100)

    return data === undefined || getCookie('token') ? <LoadingBar color='var(--Primary-color)' shadow={true} progress={loadingProgress} onLoaderFinished={() => setLoadingProgress(0)} /> :
        <>
        {alerts.length > 0 && <div className="alerts">
            <Alert alerts={alerts} />
        </div>}
        <div className="register">
            <div className="content">
                <div className="box">
                    <p className='form-title'>Sign in</p>
                    <form onSubmit={e=>onSubmit(e)}>
                        <div className="row justify-content-around fields">
                            <div className="col-10">
                                <label className="required" htmlFor="login_email">Email Address <span>*</span></label>
                                <input id="login_email" className="input-item" type="email" name="email" value={email} onChange={e => onChange(e)} placeholder="info@hutaro.com" />
                            </div>
                            <div className="col-10">
                                <label className="required" htmlFor="login_pass">Password <span>*</span></label>
                                <div className="pass">
                                    <input id="login_pass" className="input-item" name="password" value={password} onChange={e => onChange(e)} type={visiblePass?'text':'password'} placeholder="******" />
                                    <span id="visible-pass" className="svg-icon visible" onClick={()=> setVisiblePass(!visiblePass)}>
                                        <svg viewBox="0 0 512.001 512.001">
                                            <g>
                                                <g>
                                                    <path d="M510.096,249.937c-4.032-5.867-100.928-143.275-254.101-143.275C124.56,106.662,7.44,243.281,2.512,249.105
                                                        c-3.349,3.968-3.349,9.792,0,13.781C7.44,268.71,124.56,405.329,255.995,405.329S504.549,268.71,509.477,262.886
                                                        C512.571,259.217,512.848,253.905,510.096,249.937z M255.995,383.996c-105.365,0-205.547-100.48-230.997-128
                                                        c25.408-27.541,125.483-128,230.997-128c123.285,0,210.304,100.331,231.552,127.424
                                                        C463.013,282.065,362.256,383.996,255.995,383.996z"/>
                                                </g>
                                            </g>
                                            <g>
                                                <g>
                                                    <path d="M255.995,170.662c-47.061,0-85.333,38.272-85.333,85.333s38.272,85.333,85.333,85.333s85.333-38.272,85.333-85.333
                                                        S303.056,170.662,255.995,170.662z M255.995,319.996c-35.285,0-64-28.715-64-64s28.715-64,64-64s64,28.715,64,64
                                                        S291.28,319.996,255.995,319.996z"/>
                                                </g>
                                            </g>
                                            {visiblePass ? '' : (
                                                <g>
                                                    <g>
                                                        <path d="M444.865,67.128c-4.16-4.16-10.923-4.16-15.083,0L67.116,429.795c-4.16,4.16-4.16,10.923,0,15.083
                                                            c2.091,2.069,4.821,3.115,7.552,3.115c2.731,0,5.461-1.045,7.531-3.115L444.865,82.211
                                                            C449.025,78.051,449.025,71.288,444.865,67.128z"/>
                                                    </g>
                                                </g>
                                            ) }
                                        </svg>
                                    </span>
                                </div>
                            </div>
                            <div className="col-10 forgot">
                                <Link href="/forgot-password" className="text-xxs primary-color"><a>Forgot password ?</a></Link>
                            </div>
                            <div className="col-12 footer">
                                <div className="link">
                                    <p className="link">New here ? <Link href="/register"><a>Sign up</a></Link></p>
                                </div>
                                <div className="submit">
                                    <button className="btn btn-primary svg-icon">Login</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </>
}

export default Login
import { useEffect, useState } from 'react'
import Link from "next/link"
import TextareaAutosize from 'react-autosize-textarea'
import userNameHandler from '../../utils/userNameHandler'
import feelings from '../../utils/feelings.json'
import { useStateContext } from '../../context/StateContext'
import fetchers from '../../utils/fetchers'
import useSWR from 'swr'

const CourseForm = ({ addPost }) => {
    const { state, setState } = useStateContext()
    const user = useSWR('/api/auth', fetchers.loadUser).data
    const [activeBox, setActiveBox] = useState({
        backPage: false,
        next: false,
        oldFormSlideWidth: 0,
        formSlideWidth: 0
    })
    const { backPage, oldFormSlideWidth, formSlideWidth, next } = activeBox
    // Create post
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        feeling: '',
        location: '',
        link: ''
    })
    const { title, description, location, feeling } = formData
    const onChange = e => setFormData({...formData,[e.target.name]: e.target.value})
    const onSubmit = e =>{
        e.preventDefault()
        if(description) addPost(formData)
        setFormData({
            title: '',
            description: '',
            feeling: '',
            location: '',
            link: ''
        })
    }
  return (
    <div className='postForm'>
        <div className="box">
            <div className="header">
                <p className='text-xs'>General Information</p>
                <span onClick={()=>setState({...state, popupForm: "none"})} className="close svg-icon active">
                    <svg viewBox="0 0 512 512"><path d="M289.94,256l95-95A24,24,0,0,0,351,127l-95,95-95-95A24,24,0,0,0,127,161l95,95-95,95A24,24,0,1,0,161,385l95-95,95,95A24,24,0,0,0,385,351Z"/></svg>
                </span>
            </div>
            <div className="line"></div>
            <div className="inner">
                <div className="head">
                    <div className="off-user">
                        <Link href={`/profile/${user._id}`}><a>
                            <div className="avatar">
                                <img src={user.avatar === "default"?'/default/defaultProfile.png':user.avatar} alt="avatar" />
                            </div>
                        </a></Link>
                        <div className="user-info">
                            <div className="inline">
                                <span className="text-bold underline"><Link href={`/profile/${user._id}`} title={user.name}><a>{userNameHandler(user.name)}</a></Link></span>
                            </div>
                            <span className="date underline" title='Just now'>Just now {location &&
                                (<p className="text-bold svg-icon">
                                    <svg viewBox="0 0 512 512">
                                            <g>
                                            <path style={{fill:'var(--Primary-color)'}} d="M258.499,512c-5.186,0-10.008-2.68-12.745-7.091L102.869,274.652C85.289,246.26,76,213.534,76,180 C76,80.748,156.748,0,256,0s180,80.748,180,180c0,32.539-8.779,64.428-25.389,92.22L271.368,504.707 c-2.688,4.488-7.52,7.251-12.75,7.292C258.578,512,258.539,512,258.499,512z M256,30c-82.71,0-150,67.29-150,150 c0,27.95,7.734,55.214,22.368,78.846l129.905,209.34l126.594-211.368C398.689,233.688,406,207.121,406,180 C406,97.29,338.71,30,256,30z"/>
                                            <path style={{fill:'var(--Primary-color)'}} d="M256,270c-31.397,0-60.044-15.977-76.631-42.737C170.62,213.117,166,196.778,166,180 c0-49.626,40.374-90,90-90s90,40.374,90,90c0,16.284-4.371,32.209-12.639,46.055C316.913,253.574,287.994,270,256,270z M256,120 c-33.084,0-60,26.916-60,60c0,11.2,3.069,22.082,8.875,31.47C215.945,229.33,235.06,240,256,240 c21.337,0,40.629-10.965,51.607-29.331c5.49-9.193,8.393-19.8,8.393-30.669C316,146.916,289.084,120,256,120z"/>
                                            </g>
                                    </svg>
                                    <span>{location}</span>
                                </p>)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <form onSubmit={e =>onSubmit(e)} className="body">
                <div style={{"--formSlideWidth": `-${formSlideWidth}%`, "--oldFormSlideWidth": `-${oldFormSlideWidth}%` }} className={next ? "forms row next" : "forms row" } onAnimationEnd={()=>setActiveBox({...activeBox, next: false })}>
                    <div className="col-12">
                        <div className="input-groupe">
                            <label htmlFor="categories">Title</label>
                            <TextareaAutosize className='title' name="title" value={title} onChange={e => onChange(e)} placeholder="Course title..." />
                        </div>
                        <div className="input-groupe">
                            <label htmlFor="categories">Description</label>
                            <TextareaAutosize name="description" value={description} onChange={e => onChange(e)} placeholder="A short description..." />
                        </div>
                        <div className="input-groupe">
                            <label htmlFor="categories">Categories</label>
                            <input id='categories' type="text" className='input-item' placeholder='programming,design,art,math...' />
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="input-groupe">
                            <label htmlFor="categories">target</label>
                            <TextareaAutosize className='title' name="title" value={title} onChange={e => onChange(e)} placeholder="Course title..." />
                        </div>
                        <div className="input-groupe">
                            <label htmlFor="categories">Description</label>
                            <TextareaAutosize name="description" value={description} onChange={e => onChange(e)} placeholder="A short description..." />
                        </div>
                        <div className="input-groupe">
                            <label htmlFor="lang">lang</label>
                            <input id='lang' type="text" className='input-item' placeholder='programming,design,art,math...' />
                        </div>
                    </div>
                </div>
                <div className="moreinfo">
                    <p>Add to your course</p>
                    <div className='items'>
                        <span onClick={()=>setActiveBox({...activeBox,backPage: true})} className="svg-icon">
                            <svg viewBox="0 0 256 256">
                                <path fill='var(--Primary-color)' d="M159.999,83.99414h-112a12.01343,12.01343,0,0,0-12,12v112a12.01343,12.01343,0,0,0,12,12h112a12.01343,12.01343,0,0,0,12-12v-112A12.01343,12.01343,0,0,0,159.999,83.99414Zm4,124a4.00426,4.00426,0,0,1-4,4h-112a4.00427,4.00427,0,0,1-4-4v-112a4.00428,4.00428,0,0,1,4-4h112a4.00427,4.00427,0,0,1,4,4ZM140,40a4.0002,4.0002,0,0,1,4-4h16a4,4,0,0,1,0,8H144A4.0002,4.0002,0,0,1,140,40Zm80,8v8a4,4,0,0,1-8,0V48a4.00427,4.00427,0,0,0-4-4h-8a4,4,0,0,1,0-8h8A12.01343,12.01343,0,0,1,220,48Zm0,48v16a4,4,0,0,1-8,0V96a4,4,0,0,1,8,0Zm0,56v8a12.01343,12.01343,0,0,1-12,12h-8a4,4,0,0,1,0-8h8a4.00427,4.00427,0,0,0,4-4v-8a4,4,0,0,1,8,0ZM84,56V48A12.01343,12.01343,0,0,1,96,36h8a4,4,0,0,1,0,8H96a4.00427,4.00427,0,0,0-4,4v8a4,4,0,0,1-8,0Z"/>
                            </svg>
                        </span>
                        <span onClick={()=>setActiveBox({...activeBox, formSlideWidth: formSlideWidth + 100, oldFormSlideWidth : formSlideWidth === 0 ? 0 : oldFormSlideWidth + 100, next: true })} role='button' className="svg-icon">
                            <svg viewBox="0 0 16 16">
                                <path fill='var(--Primary-color)' d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"/>
                                <path fill='var(--Primary-color)' d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                        </span>
                    </div>
                </div>
            </form>
            <div className={backPage ? "backPage active overpop":"backPage overpop"}>
                <div className="header">
                    <p className='text-xs'>Appearance</p>
                    <span onClick={()=>setActiveBox({...activeBox,backPage: false})} className="back svg-icon active">
                        <svg style={{padding:".15rem"}} viewBox="0 0 476.213 476.213">
                            <polygon points="476.213,223.107 57.427,223.107 151.82,128.713 130.607,107.5 0,238.106 130.607,368.714 151.82,347.5 
                                57.427,253.107 476.213,253.107 "/>
                        </svg>
                    </span>
                </div>
                <div className="line"></div>
            </div>
        </div>
    </div>
  )
}

export default CourseForm
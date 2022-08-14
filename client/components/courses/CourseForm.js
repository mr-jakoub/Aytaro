import { useEffect, useRef, useState } from 'react'
import Link from "next/link"
import TextareaAutosize from 'react-autosize-textarea'
import userNameHandler from '../../utils/userNameHandler'
import feelings from '../../utils/feelings.json'
import { v4 as uuidv4 } from 'uuid'
import { useStateContext } from '../../context/StateContext'
import fetchers from '../../utils/fetchers'
import useSWR from 'swr'

const CourseForm = () => {
    const { state, setState, addCourse } = useStateContext()
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
        categories: [],
        language: [],
        willLearnList: [],
        requirementsList: [],
        level: '',
        funds: [],
        thumbnail: null,
        sections: []
    })
    const { title, description, categories, language, willLearnList, requirementsList, level, funds, thumbnail, sections } = formData
    const onChange = e => setFormData({...formData,[e.target.name]: e.target.value})
    const handleSelect = (e, type) =>{
        let selected
        switch(type){
            case 'languages': selected = language.map(lang=>lang)
            break
            case 'categories': selected = categories.map(cat=>cat)
            break
            default: selected = language.map(lang=>lang)
        }
        !selected.includes(e.target.value) && selected.push(e.target.value)
        setFormData({...formData, [e.target.name]: selected})
    }
    // Next form
    const [nextForm, setNextForm] = useState(false)
    const handleNextBack = type =>{
        if(!next){
            setNextForm(false)
            switch(type){
                case 'next':
                    setActiveBox({...activeBox, formSlideWidth: formSlideWidth + 100, oldFormSlideWidth : formSlideWidth === 0 ? 0 : oldFormSlideWidth > formSlideWidth ? oldFormSlideWidth - 100 : oldFormSlideWidth + 100, next: true })
                    break
                case 'back':
                    setActiveBox({...activeBox, formSlideWidth: formSlideWidth - 100, oldFormSlideWidth : oldFormSlideWidth > formSlideWidth ? oldFormSlideWidth - 100 : oldFormSlideWidth + 100, next: true })
                    break
                default: return
            }
        }
        return
    }
    // Add answer
    const [willLearn, setWillLearn] = useState([])
    const [requirements, setRequirements] = useState([])
    const handleAddAnswer = (type) =>{
        const id = uuidv4()
        switch(type){
            case 1:
                let willLearnNew = willLearn.length > 0 ? willLearn.map(item=> item) : []
                willLearnNew.push({id})
                setWillLearn(willLearnNew)
            break
            case 2:
                let requirementsNew = requirements.length > 0 ? requirements.map(item=> item) : []
                requirementsNew.push({id})
                setRequirements(requirementsNew)
            break
            default: return
        }
    }
    const answersChange = (e, key, type) => {
        let exists, newAnswer
        switch(type){
            case 1:
                exists = willLearnList.filter(item=> item.key === key).length > 0
                newAnswer = willLearnList.length > 0 ? willLearnList.map(item=> item) : []
            break
            case 2:
                exists = requirementsList.filter(item=> item.key === key).length > 0
                newAnswer = requirementsList.length > 0 ? requirementsList.map(item=> item) : []
            break
            default: return
        }
        if(exists){
            let itemIndex = newAnswer.findIndex(item => item.key === key)
            newAnswer[itemIndex].value = e.target.value
        }else{
            newAnswer.push({
                key,
                value: e.target.value
            })
        }
        setFormData({...formData,[e.target.name]: newAnswer})
    }
    // Categories
    const categoriesList = ['Development', 'Business', 'Marketing', 'Personal development', 'Design', 'Photography and video', 'Health and wellbeing', 'Trainings and diplomas']
    // Price
    const handlePriceChange = e =>{
        setFormData({...formData,funds: {...funds,[e.target.name]:e.target.value}})
    }
    // Thumbnail
    const [thumbnailPreview, setThumbnailPreview] = useState(null)
    const handelFileChange = e => {
        if(e.target.files[0]){
            setThumbnailPreview(URL.createObjectURL(e.target.files[0]))
            setFormData({...formData,thumbnail: e.target.files[0]})
        }
    }
    const onSubmit = e =>{
        e.preventDefault()
        // setFormData({
        //     title: '',
        //     description: '',
        //     feeling: '',
        //     location: '',
        //     language: []
        // })
        let courseData = new FormData()
        // for ( var key in formData ) {
        //     courseData.append(key, formData[key]);
        // }
        courseData.append('title', title)
        courseData.append('description', description)
        courseData.append('categories', categories)
        courseData.append('language', language)
        courseData.append('willLearnList', willLearnList)
        courseData.append('requirementsList', requirementsList)
        courseData.append('level', level)
        courseData.append('funds', JSON.stringify(funds))
        courseData.append('thumbnail', thumbnail)
        // Append videos to sections
        sections.forEach(section=>{
            section.videos.forEach(video=>{
                courseData.append(`video__${section.title.split('@')[1]}`, video.directory)
            })
        })
        // Build sections
        let newSections = []
        sections.forEach((section, key)=>{
            newSections.push({title: section.title, videos:[], resources:[]})
            section.videos.forEach(video=>{
                newSections[key].videos.push({title: video.title, directory: '', public: video.public})
            })
        })
        courseData.append('sections', JSON.stringify(newSections))
        addCourse(courseData)
    }
    // Section groupe
    const [dropDown, setDropDown] = useState([{id:"main_section"}])
    const handleDropDown = id =>{
        let newDropDown = dropDown.length > 0 ? dropDown.map(item=> item) : []
        if(newDropDown.filter(item=> item.id === id).length > 0){
            newDropDown = dropDown.filter(item=> item.id !== id)
        }else{
            newDropDown.push({id})
        }
        setDropDown(newDropDown)
    }
    const [manipulator, setManipulator] = useState({
        sectionItems: true,
        addVideo: false,
        addSection: true
    })
    const [addItem, setAddItem] = useState([{id: 'main_section', type:'section', index:'0', title: 'Introduction'}])
    const handleAddItem = (type, pos) =>{
        const id = uuidv4().replaceAll('-','_')
        let index = pos ? pos : id
        let addItemNew = addItem.length > 0 ? addItem.map(item=> item) : []
        addItemNew.push({id: id, type, index, title:''})
        setAddItem(addItemNew)
    }
    const sectionStructure = (e, id, isFile) =>{
        let resIndex = addItem.findIndex(item => item.id === id)
        let newStructure = addItem.map(item=> item)
        if(isFile){
            newStructure[resIndex].file = e.target.files[0]
        }else{
            switch(e.target.name){
                case 'title': newStructure[resIndex].title = e.target.value
                    break
                case 'type': newStructure[resIndex].public = e.target.value === '0' ? true : false
                    break
                default: return
            }
        }
        setAddItem(newStructure)
        // Build sections
        let affector = []
        addItem.forEach(item=>{
            if(item.type === 'section'){
                affector.push({title: `${item.title}@${item.id}`, videos:[], resources:[]})
            }
        })
        addItem.forEach(item=>{
            switch(item.type){
                case 'video':
                    let sectionIndex = affector.findIndex(el=> el.title.split('@')[1] === item.index) // Get section index
                    affector[sectionIndex].videos.push({title: item.title, directory: item.file, public: item.public})
                break
                case 'resource': return
                break
                default: return
            }
        })
        setFormData({...formData, sections: affector})
    }
    useEffect(()=>{
        console.log(formData)
    },[formData])
  return (
    <div className='postForm'>
        <div className="box">
            <div className="header">
                <p className='text-xs'>General Information</p>
                <span onClick={()=>setState({...state, popupForm: "none"})} className="close svg-button svg-icon active">
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
                            <span className="date underline" title='Just now'>Just now</span>
                        </div>
                    </div>
                </div>
            </div>
            <form onSubmit={e =>onSubmit(e)} className="body" encType="multipart/form-data">
                <div style={{"--formSlideWidth": `-${formSlideWidth}%`, "--oldFormSlideWidth": `-${oldFormSlideWidth}%` }} className={next ? "forms row next" : "forms row" } onAnimationEnd={()=>setActiveBox({...activeBox, next: false })}>
                    <div className="col-12">
                        <div className="input-groupe">
                            <label htmlFor="title">Title</label>
                            <input id='title' type="text" className='input-item' name="title" value={title} onChange={e => onChange(e)} placeholder='Course title' />
                        </div>
                        <div className="input-groupe">
                            <label htmlFor="description">Description</label>
                            <TextareaAutosize id='description' className='input-item' name="description" value={description} onChange={e => onChange(e)} placeholder="A short description" />
                        </div>
                        <div className="input-groupe">
                            <label htmlFor="categories">Categories</label>
                            <div className="select-groupe">
                                <svg className='select-arrow' viewBox="0 0 330 330">
                                    <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393
                                    c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393
                                    s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"/>
                                </svg>
                                {categories.length > 0 && <label htmlFor="categories" className="select-items input-item"> 
                                    {categories.map((category, key)=>(
                                        <span key={key} className='select-item svg-icon svg-button'>
                                            <svg name={category} className='delete' role='button' onClick={() =>setFormData({...formData, categories: categories.filter(cat => cat != category)})} viewBox="0 0 512 512"><path d="M289.94,256l95-95A24,24,0,0,0,351,127l-95,95-95-95A24,24,0,0,0,127,161l95,95-95,95A24,24,0,1,0,161,385l95-95,95,95A24,24,0,0,0,385,351Z"/></svg>
                                            &nbsp;
                                            <svg id='hashtag' viewBox="0 0 490 490">
                                                <path d="M327.08,180.984H192.677L161.05,309.958h133.984L327.08,180.984z M180.58,294.646l24.12-98.35h102.791l-24.419,98.35
                                                    H180.58z"/>
                                                <path d="M60.517,490h72.241l32.763-133.386h102.492L235.639,490h72.211l32.763-133.386h117.625v-61.968H355.702l24.434-98.35
                                                    h78.103v-61.968h-63.044L427.957,0h-72.615l-32.763,134.328H219.728L252.492,0h-72.256l-32.748,134.328H31.762v61.968h100.683
                                                    l-24.12,98.35H31.762v61.968h61.519L60.517,490z M47.074,341.301v-31.343h73.273l31.627-128.975h-104.9v-31.343H159.51
                                                    l32.748-134.328h40.734l-32.763,134.328h134.373l32.763-134.328h41.093l-32.763,134.328h67.231v31.343h-74.753l-32.061,128.975
                                                    h106.814v31.343H328.621l-32.763,133.386h-40.749l32.375-133.386H153.529l-32.763,133.386H80.047l32.763-133.386H47.074z"/>
                                            </svg>
                                            &nbsp;{category}
                                        </span>
                                    ))}
                                </label>}
                                <select id='categories' defaultValue='Default' className='input-item' name='categories' onChange={e => handleSelect(e, 'categories')}>
                                    {categoriesList.map((categoryItem, key) => (
                                        <option key={key} className={categories.includes(categoryItem) ? 'd-none' : ''} value={categoryItem}>{categoryItem}</option>
                                    ))}
                                    <option disabled className={categories.length === categoriesList.length ? '' : 'd-none'} value="More categories soon">More categories soon</option>
                                    <option disabled className='d-none' value="Default">Select a category</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="input-groupe">
                            <label htmlFor="languages">Select a language</label>
                            <div className="select-groupe">
                                <svg className='select-arrow' viewBox="0 0 330 330">
                                    <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393
                                    c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393
                                    s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"/>
                                </svg>
                                {language.length > 0 && <div className="select-items input-item"> 
                                    <span className={language.includes("Arabic") ? 'select-item svg-icon svg-button' : "d-none"}>
                                        <svg className='delete' role='button' onClick={()=>setFormData({...formData, language: language.filter(lang => lang != "Arabic")})} viewBox="0 0 512 512"><path d="M289.94,256l95-95A24,24,0,0,0,351,127l-95,95-95-95A24,24,0,0,0,127,161l95,95-95,95A24,24,0,1,0,161,385l95-95,95,95A24,24,0,0,0,385,351Z"/></svg>
                                        &nbsp;Arabic
                                    </span>
                                    <span className={language.includes("English") ? 'select-item svg-icon svg-button' : "d-none"}>
                                    <svg className='delete' role='button' onClick={()=>setFormData({...formData, language: language.filter(lang => lang != "English")})} viewBox="0 0 512 512"><path d="M289.94,256l95-95A24,24,0,0,0,351,127l-95,95-95-95A24,24,0,0,0,127,161l95,95-95,95A24,24,0,1,0,161,385l95-95,95,95A24,24,0,0,0,385,351Z"/></svg>
                                        &nbsp;English
                                    </span>
                                    <span className={language.includes("French") ? 'select-item svg-icon svg-button' : "d-none"}>
                                    <svg className='delete' role='button' onClick={()=>setFormData({...formData, language: language.filter(lang => lang != "French")})} viewBox="0 0 512 512"><path d="M289.94,256l95-95A24,24,0,0,0,351,127l-95,95-95-95A24,24,0,0,0,127,161l95,95-95,95A24,24,0,1,0,161,385l95-95,95,95A24,24,0,0,0,385,351Z"/></svg>
                                        &nbsp;French
                                    </span>
                                </div>}
                                <select id='languages' defaultValue={language.length === 0 ? 'Default' : ''} className='input-item' name='language' onChange={e => handleSelect(e, 'languages')}>
                                    <option className={language.includes("Arabic") ? 'd-none' : ''} value="Arabic">Arabic</option>
                                    <option className={language.includes("English") ? 'd-none' : ''} value="English">English</option>
                                    <option className={language.includes("French") ? 'd-none' : ''} value="French">French</option>
                                    <option disabled className={language.length === 3 ? '' : 'd-none'} value="More languages soon">More languages soon</option>
                                    <option disabled className='d-none' value="Default">Select a language</option>
                                </select>
                            </div>
                        </div>
                        <div className="input-groupe">
                            <label htmlFor="willLearn">What will students learn in your course?</label>
                            <input name='willLearnList' onChange={e => answersChange(e, 'first', 1)} id='willLearn' type="text" className='input-item' placeholder='Example: algorithmes' />
                            {willLearn.length > 0 && willLearn.map(item=>
                                <div key={item.id} className='svg-icon answer-item'>
                                    <svg className='delete svg-button' role='button' onClick={()=>{setWillLearn(willLearn.filter(val => val.id != item.id)),setFormData({...formData, willLearnList: willLearnList.filter(val => val.key != item.id)})}} viewBox="0 0 512 512"><path d="M289.94,256l95-95A24,24,0,0,0,351,127l-95,95-95-95A24,24,0,0,0,127,161l95,95-95,95A24,24,0,1,0,161,385l95-95,95,95A24,24,0,0,0,385,351Z"/></svg>
                                    <input name='willLearnList' onChange={e => answersChange(e, item.id, 1)} type='text' className='input-item'/>
                                </div>
                            )}
                            <span onClick={()=>handleAddAnswer(1)} className='svg-icon svg-button add-answer'>
                                <svg viewBox="0 0 45.402 45.402">
                                    <path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141
                                        c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27
                                        c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435
                                        c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"/>
                                </svg>
                                Add an answer
                            </span>
                        </div>
                        <div className="input-groupe">
                            <label htmlFor="requirements">Are there any course requirements?</label>
                            <input name='requirementsList' onChange={e => answersChange(e, 'first', 2)} id='requirements' type="text" className='input-item' placeholder='Example: Be able to create any stock management application' />
                            {requirements.length > 0 && requirements.map(item=>
                                <div key={item.id} className='svg-icon answer-item'>
                                    <svg className='delete svg-button' role='button' onClick={()=>{setRequirements(requirements.filter(val => val.id != item.id)),setFormData({...formData, requirementsList: requirementsList.filter(val => val.key != item.id)})}} viewBox="0 0 512 512"><path d="M289.94,256l95-95A24,24,0,0,0,351,127l-95,95-95-95A24,24,0,0,0,127,161l95,95-95,95A24,24,0,1,0,161,385l95-95,95,95A24,24,0,0,0,385,351Z"/></svg>
                                    <input name='requirementsList' onChange={e => answersChange(e, item.id, 2)} type='text' className='input-item'/>
                                </div>
                            )}
                            <span onClick={()=>handleAddAnswer(2)} className='svg-icon svg-button add-answer'>
                                <svg viewBox="0 0 45.402 45.402">
                                    <path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141
                                        c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27
                                        c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435
                                        c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"/>
                                </svg>
                                Add an answer
                            </span>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="input-groupe">
                            <label htmlFor="level">Level</label>
                            <div className="select-groupe">
                                <svg className='select-arrow' viewBox="0 0 330 330">
                                    <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393
                                    c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393
                                    s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"/>
                                </svg>
                                <select defaultValue='Default' className='input-item' name='level' id="level" onChange={e => onChange(e)}>
                                    <option value="0">All levels</option>
                                    <option value="1">Beginner</option>
                                    <option value="2">Intermediate</option>
                                    <option value="3">Expert</option>
                                    <option disabled className='d-none' value="Default">Select a level</option>
                                </select>
                            </div>
                        </div>
                        <div className="input-groupe">
                            <div className="row">
                                <div className="col-6">
                                    <label htmlFor="price">Price</label>
                                    <input name='price' onChange={e=>handlePriceChange(e)} id='price' type="text" className='input-item' placeholder='Example: 100' />
                                </div>
                                <div className="col-6">
                                    <label htmlFor="currency">Currency</label>
                                    <div className="select-groupe">
                                        <svg className='select-arrow' viewBox="0 0 330 330">
                                            <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393
                                            c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393
                                            s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"/>
                                        </svg>
                                        <select defaultValue='Default' className='input-item' id="currency" name='currency' onChange={e=>handlePriceChange(e)}>
                                            <option value="DZD">Algerian Dinar</option>
                                            <option value="USD">US Dollar</option>
                                            <option value="EUR">Euro</option>
                                            <option disabled className='d-none' value="Default">Select a currency</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="input-groupe">
                            <div className="row">
                                <div className="col-8">
                                    <label htmlFor="thumbnail">Select a thumbnail</label>
                                    <span className='mini-label'>Accepted files : format .jpg, .jpeg,. gif, or .png</span>
                                    <input accept=".gif,.jpg,.jpeg,.png" id='thumbnail' onChange={handelFileChange} type="file" />
                                    <label htmlFor="thumbnail" className='input-item input-file' type="file">{thumbnail ? thumbnail.name : 'No file selected'}
                                        <svg className='select-arrow svg-button' viewBox="0 0 294.156 294.156">
                                            <path d="M227.002,108.256c-2.755-41.751-37.6-74.878-80.036-74.878c-42.447,0-77.298,33.141-80.038,74.907
                                                C28.978,113.059,0,145.39,0,184.184c0,42.234,34.36,76.595,76.595,76.595h116.483c3.313,0,6-2.687,6-6s-2.687-6-6-6H76.595
                                                C40.977,248.778,12,219.801,12,184.184c0-34.275,26.833-62.568,61.087-64.411c3.184-0.171,5.678-2.803,5.678-5.991
                                                c0-0.119-0.003-0.236-0.01-0.355c0.09-37.536,30.654-68.049,68.211-68.049c37.563,0,68.132,30.518,68.211,68.063
                                                c-0.005,0.116-0.009,0.238-0.009,0.329c0,3.196,2.505,5.831,5.696,5.992c34.37,1.741,61.292,30.038,61.292,64.421
                                                c0,19.526-8.698,37.801-23.864,50.138c-2.571,2.091-2.959,5.87-0.868,8.44c2.091,2.571,5.87,2.959,8.44,0.868
                                                c17.98-14.626,28.292-36.293,28.292-59.447C294.156,145.269,265.08,112.926,227.002,108.256z"/>
                                            <path d="M140.966,141.078v76.511c0,3.313,2.687,6,6,6s6-2.687,6-6v-76.511c0-3.313-2.687-6-6-6S140.966,137.765,140.966,141.078z"
                                                />
                                            <path d="M181.283,152.204c1.536,0,3.071-0.586,4.243-1.757c2.343-2.343,2.343-6.142,0-8.485l-34.317-34.317
                                                c-2.343-2.343-6.143-2.343-8.485,0l-34.317,34.317c-2.343,2.343-2.343,6.142,0,8.485c2.343,2.343,6.143,2.343,8.485,0
                                                l30.074-30.074l30.074,30.074C178.212,151.618,179.748,152.204,181.283,152.204z"/>
                                        </svg>
                                    </label>
                                </div>
                                <div className="col-4">
                                    <label htmlFor="thumbnail" className="thumbnail">
                                        <svg viewBox="0 0 816.22237 700.597"><path d="M772.0209,797.89518a34.81426,34.81426,0,0,1-16.74561-4.30859L278.867,533.04069a35.03942,35.03942,0,0,1-13.9137-47.50147L466.00063,117.924a34.99945,34.99945,0,0,1,47.50171-13.91358l476.4082,260.5459a35.03913,35.03913,0,0,1,13.91382,47.50147L802.777,779.673a34.7714,34.7714,0,0,1-20.86914,16.79492A35.147,35.147,0,0,1,772.0209,797.89518Zm-13.8667-9.57227a29.00079,29.00079,0,0,0,39.35864-11.5288L998.5602,409.17887A29.03345,29.03345,0,0,0,987.03164,369.82L510.62344,109.27409a29.00081,29.00081,0,0,0-39.35865,11.5288L270.21743,488.41813A29.03335,29.03335,0,0,0,281.746,527.777Z" transform="translate(-191.88882 -99.7015)" fill="#f2f2f2"></path><path d="M781.84414,669.32487a32.70567,32.70567,0,0,1-15.68262-4.0166L380.99917,454.66471a32.46947,32.46947,0,0,1-12.91992-44.1084L488.151,191.005a32.49693,32.49693,0,0,1,44.10865-12.91992L917.42226,388.72868a32.49758,32.49758,0,0,1,12.91993,44.10839l-.43873-.23974.43873.23974L810.27041,652.38834A32.3643,32.3643,0,0,1,781.84414,669.32487Z" transform="translate(-191.88882 -99.7015)" fill="#f2f2f2"></path><path d="M769.88882,797.7985h-543a32.53692,32.53692,0,0,1-32.5-32.5v-419a32.53692,32.53692,0,0,1,32.5-32.5h543a32.53685,32.53685,0,0,1,32.5,32.5v419A32.53685,32.53685,0,0,1,769.88882,797.7985Z" transform="translate(-191.88882 -99.7015)" fill="#fff"></path><path d="M769.88882,800.2985h-543a35.03947,35.03947,0,0,1-35-35v-419a35.03947,35.03947,0,0,1,35-35h543a35.03947,35.03947,0,0,1,35,35v419A35.03947,35.03947,0,0,1,769.88882,800.2985Zm-543-483a29.03275,29.03275,0,0,0-29,29v419a29.03275,29.03275,0,0,0,29,29h543a29.03276,29.03276,0,0,0,29-29v-419a29.03276,29.03276,0,0,0-29-29Z" transform="translate(-191.88882 -99.7015)" fill="#e6e6e6"></path><path d="M582.89156,451.586a40.76358,40.76358,0,0,0-32.55116,16.18593,26.83976,26.83976,0,0,0-37.44912,24.64757H623.72505A40.83342,40.83342,0,0,0,582.89156,451.586Z" transform="translate(-191.88882 -99.7015)" fill="#e6e6e6"></path><circle cx="148.19669" cy="445.96036" r="65.75727" fill="var(--Primary-color)"></circle><path d="M725.24868,681.17851a31.87811,31.87811,0,0,1-7.35986.85h-439a31.87492,31.87492,0,0,1-15.46-3.97l1.16992-1.68,48.98-70.53,72.58008-104.49,1.06-1.53,11.41993-16.44a8.33693,8.33693,0,0,1,13.70019,0l37.93994,54.61v.01l22.31983,32.14,53.28027,76.7,80.80957-115.35a8.34782,8.34782,0,0,1,13.68018,0l51.83984,73.99,2.98,4.25Z" transform="translate(-191.88882 -99.7015)" fill="#3f3d56"></path><path d="M495.61848,519.76805A50.29271,50.29271,0,0,0,455.458,539.7377,33.114,33.114,0,0,0,409.2545,570.147h136.743A50.3789,50.3789,0,0,0,495.61848,519.76805Z" transform="translate(-191.88882 -99.7015)" fill="#ccc"></path><path d="M717.88882,683.02848h-439a32.97007,32.97007,0,0,1-33-33V399.78873a33.03734,33.03734,0,0,1,33-33h439a33.03734,33.03734,0,0,1,33,33V650.02848a32.96211,32.96211,0,0,1-33,33Zm-439-314.23975a31.0352,31.0352,0,0,0-31,31V650.02848a30.97077,30.97077,0,0,0,31,31h439a30.9637,30.9637,0,0,0,31-31V399.78873a31.03521,31.03521,0,0,0-31-31Z" transform="translate(-191.88882 -99.7015)" fill="#3f3d56"></path></svg>
                                        {thumbnailPreview && <img src={thumbnailPreview} alt="thumbnail" />}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        {/* map section */}
                        {addItem.map(section=>(
                            section.type === 'section' ?
                        <div key={section.id} className={dropDown.filter(item=> item.id === section.id).length > 0 ?"section-groupe active":"section-groupe"}>
                            <div className="section-head">
                                <input name='title' onChange={e=>sectionStructure(e,section.id,false)} value={addItem[addItem.findIndex(item => item.id === section.id)].title} type="text" className='section-title' placeholder='Section title' />
                                <div className="addons">
                                    <div className="svg-icon addons-item">
                                        <svg onClick={()=>handleDropDown(section.id)} className='select-arrow' viewBox="0 0 330 330">
                                            <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393
                                            c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393
                                            s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"/>
                                        </svg>
                                    </div>
                                    {section.id !== 'main-section' &&<div className="svg-icon delete-item addons-item">
                                        <svg className='delete svg-button' role='button' onClick={()=>setAddItem(addItem.filter(val => val.index != section.index ))} viewBox="0 0 512 512"><path d="M289.94,256l95-95A24,24,0,0,0,351,127l-95,95-95-95A24,24,0,0,0,127,161l95,95-95,95A24,24,0,1,0,161,385l95-95,95,95A24,24,0,0,0,385,351Z"/></svg>
                                    </div>}
                                </div>
                            </div>
                            {/* map videos and resources */}
                            {addItem.map(item=>(
                                item.index === section.id ?
                                item.type === 'video' ?
                                <div key={item.id} className={dropDown.filter(element=> element.id === item.id).length > 0 ?"section-groupe active":"section-groupe"}>
                                    <div className="section-head">
                                        <input name='title' onChange={e=>sectionStructure(e,item.id,false)} type="text" className='section-title' placeholder='Video title' />
                                        <div className="addons">
                                            <div className="svg-icon addons-item">
                                                <svg onClick={()=>handleDropDown(item.id)} className='select-arrow' viewBox="0 0 330 330">
                                                    <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393
                                                    c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393
                                                    s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"/>
                                                </svg>
                                            </div>
                                            <div className="svg-icon delete-item addons-item">
                                                <svg className='delete svg-button' role='button' onClick={()=>setAddItem(addItem.filter(val => val.id != item.id))} viewBox="0 0 512 512"><path d="M289.94,256l95-95A24,24,0,0,0,351,127l-95,95-95-95A24,24,0,0,0,127,161l95,95-95,95A24,24,0,1,0,161,385l95-95,95,95A24,24,0,0,0,385,351Z"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="input-groupe">
                                        <label htmlFor={`${item.id + section.id}-type`}>Video type</label>
                                        <div className="select-groupe">
                                            <svg className='select-arrow' viewBox="0 0 330 330">
                                                <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393
                                                c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393
                                                s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"/>
                                            </svg>
                                            <select name='type' onChange={e=>sectionStructure(e,item.id,false)} defaultValue='Default' className='input-item' id={`${item.id + section.id}-type`}>
                                                <option value="0">Public</option>
                                                <option value="1">Private</option>
                                                <option disabled className='d-none' value="Default">Select a type</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="input-groupe">
                                        <label htmlFor={item.id + section.id}>Select a video for this section</label>
                                        <span className='mini-label'>Note: All files must be at least 720p and less than 4.0 GB in size.</span>
                                        <input name='file' onChange={e=>sectionStructure(e,item.id,true)} id={item.id + section.id} accept=".avi,.mpg,.mpeg,.flv,.mov,.m2v,.m4v,.mp4,.rm,.ram,.vob,.ogv,.webm,.wmv" type="file" />
                                        <label htmlFor={item.id + section.id} className='input-item input-file' type="file">No file selected
                                            <svg className='select-arrow svg-button' viewBox="0 0 294.156 294.156">
                                                <path d="M227.002,108.256c-2.755-41.751-37.6-74.878-80.036-74.878c-42.447,0-77.298,33.141-80.038,74.907
                                                    C28.978,113.059,0,145.39,0,184.184c0,42.234,34.36,76.595,76.595,76.595h116.483c3.313,0,6-2.687,6-6s-2.687-6-6-6H76.595
                                                    C40.977,248.778,12,219.801,12,184.184c0-34.275,26.833-62.568,61.087-64.411c3.184-0.171,5.678-2.803,5.678-5.991
                                                    c0-0.119-0.003-0.236-0.01-0.355c0.09-37.536,30.654-68.049,68.211-68.049c37.563,0,68.132,30.518,68.211,68.063
                                                    c-0.005,0.116-0.009,0.238-0.009,0.329c0,3.196,2.505,5.831,5.696,5.992c34.37,1.741,61.292,30.038,61.292,64.421
                                                    c0,19.526-8.698,37.801-23.864,50.138c-2.571,2.091-2.959,5.87-0.868,8.44c2.091,2.571,5.87,2.959,8.44,0.868
                                                    c17.98-14.626,28.292-36.293,28.292-59.447C294.156,145.269,265.08,112.926,227.002,108.256z"/>
                                                <path d="M140.966,141.078v76.511c0,3.313,2.687,6,6,6s6-2.687,6-6v-76.511c0-3.313-2.687-6-6-6S140.966,137.765,140.966,141.078z"
                                                    />
                                                <path d="M181.283,152.204c1.536,0,3.071-0.586,4.243-1.757c2.343-2.343,2.343-6.142,0-8.485l-34.317-34.317
                                                    c-2.343-2.343-6.143-2.343-8.485,0l-34.317,34.317c-2.343,2.343-2.343,6.142,0,8.485c2.343,2.343,6.143,2.343,8.485,0
                                                    l30.074-30.074l30.074,30.074C178.212,151.618,179.748,152.204,181.283,152.204z"/>
                                            </svg>
                                        </label>
                                    </div>
                                </div> : item.type === 'resource' ? <div key={item.id}>resource</div> : ''
                                :''
                            ))}
                            {manipulator.addVideo && (addItem.filter(item=> (item.type === 'video' || item.type === 'resource') && item.index === section.id).length > 0) &&<span onClick={()=>setManipulator({...manipulator,sectionItems: true, addVideo: false})} className="add-video svg-icon svg-button">
                                <svg viewBox="0 0 45.402 45.402">
                                    <path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141 c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27 c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435 c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"/>
                                </svg>
                            </span>}
                            {((manipulator.sectionItems) || !(addItem.filter(item=> (item.type === 'video' || item.type === 'resource') && item.index === section.id).length > 0)) && (
                            <>
                            <span className='sub-title'>Select the main content type. Files and links can be added as resources.</span>
                            <div className="section-items">
                                <div onClick={()=>{handleAddItem('video', section.id),setManipulator({...manipulator,sectionItems: false, addVideo: true})}} className="section-items-video section-item svg-button svg-icon">
                                    <svg viewBox="0 0 45.402 45.402">
                                        <path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141 c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27 c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435 c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"/>
                                    </svg>
                                    &nbsp;New video
                                </div>
                                <div onClick={()=>{handleAddItem('resource', section.id),setManipulator({...manipulator,sectionItems: false, addVideo: true})}} className="section-items-resource section-item svg-button svg-icon">
                                    <svg viewBox="0 0 45.402 45.402">
                                        <path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141 c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27 c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435 c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"/>
                                    </svg>
                                    &nbsp;New resource
                                </div>
                            </div></>)}
                        </div> :''
                        ))}
                        {manipulator.addSection &&<span onClick={()=>handleAddItem('section')} className="add-video svg-icon svg-button">
                            <svg viewBox="0 0 45.402 45.402">
                                <path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141 c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27 c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435 c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"/>
                            </svg>
                        </span>}
                    </div>
                </div>
                <div className="moreinfo">
                    <p>Add to your course</p>
                    <div className='items'>
                        <span onClick={()=>setActiveBox({...activeBox,backPage: true})} className="svg-icon svg-button">
                            <svg viewBox="0 0 29.872 29.872">
                                <path fill='var(--Primary-color)' d="M26.761,15.56L16.861,5.66c-0.829-0.83-2.17-1.3-3.335-1.171L9.814,4.902l0.548-3.758
                                    c0.079-0.546-0.299-1.054-0.846-1.134C8.97-0.068,8.462,0.308,8.382,0.855L7.759,5.13L5.965,5.329
                                    c-1.386,0.155-2.714,1.481-2.87,2.872l-0.839,7.558c-0.13,1.166,0.34,2.507,1.17,3.337l9.899,9.899
                                    c1.17,1.169,3.072,1.169,4.242,0l9.192-9.191C27.93,18.633,27.93,16.729,26.761,15.56z M7.878,11.245
                                    c0.324,0.047,0.636-0.066,0.852-0.283c0.147-0.146,0.25-0.34,0.282-0.562L9.26,8.697c0.06,0.047,0.122,0.089,0.177,0.145
                                    c0.781,0.781,0.78,2.047,0,2.828c-0.781,0.781-2.047,0.782-2.829,0c-0.78-0.78-0.78-2.047,0-2.828
                                    c0.199-0.199,0.43-0.347,0.675-0.443l-0.25,1.713C6.954,10.658,7.332,11.165,7.878,11.245z M16.315,21.407l-1.012,1.011
                                    l-2.079-9.803l1.019-1.02L16.315,21.407z M15.974,16.596c-0.016-0.565,0.206-1.077,0.665-1.535
                                    c0.441-0.442,0.915-0.656,1.421-0.643c0.505,0.015,0.995,0.259,1.472,0.733c0.488,0.489,0.74,1.015,0.758,1.578
                                    c0.017,0.562-0.203,1.073-0.658,1.529c-0.423,0.422-0.897,0.629-1.424,0.618c-0.525-0.01-1.017-0.24-1.47-0.693
                                    C16.244,17.689,15.988,17.16,15.974,16.596z M13.581,17.422c0.015,0.562-0.207,1.069-0.662,1.524
                                    c-0.423,0.423-0.897,0.629-1.424,0.62c-0.526-0.01-1.016-0.241-1.469-0.694c-0.494-0.494-0.749-1.023-0.765-1.589
                                    c-0.015-0.564,0.207-1.076,0.665-1.535c0.439-0.438,0.914-0.65,1.424-0.636c0.51,0.015,1.002,0.26,1.477,0.735
                                    C13.316,16.336,13.567,16.861,13.581,17.422z M26.054,19.095l-9.192,9.191c-0.779,0.78-2.048,0.78-2.828,0l-9.899-9.898
                                    c-0.606-0.607-0.979-1.666-0.883-2.52l0.838-7.556c0.054-0.471,0.292-0.939,0.672-1.319c0.38-0.38,0.849-0.618,1.316-0.67
                                    l1.533-0.17L7.462,7.176L6.189,7.316C5.642,7.377,5.145,7.874,5.085,8.421l-0.839,7.559c-0.062,0.547,0.207,1.312,0.596,1.701
                                    l9.899,9.898c0.389,0.39,1.024,0.39,1.413,0l9.192-9.191c0.39-0.39,0.39-1.025,0-1.414l-9.898-9.899
                                    c-0.389-0.389-1.154-0.658-1.701-0.596L9.518,6.947l0.148-1.021l3.972-0.441c0.852-0.095,1.911,0.276,2.518,0.883l9.899,9.899
                                    C26.833,17.046,26.833,18.315,26.054,19.095z"/>
                                <path fill='var(--Primary-color)' d="M18.951,17.479c0.393-0.393,0.312-0.864-0.24-1.417c-0.257-0.257-0.509-0.403-0.754-0.439
                                    c-0.246-0.036-0.455,0.032-0.626,0.203c-0.4,0.4-0.32,0.881,0.239,1.442C18.101,17.8,18.561,17.869,18.951,17.479z"/>
                                <path fill='var(--Primary-color)' d="M10.631,16.502c-0.403,0.403-0.325,0.886,0.236,1.446c0.53,0.53,0.987,0.604,1.371,0.22
                                    c0.392-0.392,0.312-0.864-0.24-1.417C11.459,16.212,11.004,16.129,10.631,16.502z"/>
                            </svg>
                        </span>
                        <span onClick={()=>setActiveBox({...activeBox,backPage: true})} className="svg-icon svg-button">
                            <svg viewBox="0 0 256 256">
                                <path fill='var(--Primary-color)' d="M159.999,83.99414h-112a12.01343,12.01343,0,0,0-12,12v112a12.01343,12.01343,0,0,0,12,12h112a12.01343,12.01343,0,0,0,12-12v-112A12.01343,12.01343,0,0,0,159.999,83.99414Zm4,124a4.00426,4.00426,0,0,1-4,4h-112a4.00427,4.00427,0,0,1-4-4v-112a4.00428,4.00428,0,0,1,4-4h112a4.00427,4.00427,0,0,1,4,4ZM140,40a4.0002,4.0002,0,0,1,4-4h16a4,4,0,0,1,0,8H144A4.0002,4.0002,0,0,1,140,40Zm80,8v8a4,4,0,0,1-8,0V48a4.00427,4.00427,0,0,0-4-4h-8a4,4,0,0,1,0-8h8A12.01343,12.01343,0,0,1,220,48Zm0,48v16a4,4,0,0,1-8,0V96a4,4,0,0,1,8,0Zm0,56v8a12.01343,12.01343,0,0,1-12,12h-8a4,4,0,0,1,0-8h8a4.00427,4.00427,0,0,0,4-4v-8a4,4,0,0,1,8,0ZM84,56V48A12.01343,12.01343,0,0,1,96,36h8a4,4,0,0,1,0,8H96a4.00427,4.00427,0,0,0-4,4v8a4,4,0,0,1-8,0Z"/>
                            </svg>
                        </span>
                        {formSlideWidth > 0 && <span onClick={()=>handleNextBack('back')} role='button' className={nextForm ? "svg-icon next-form" :"svg-icon svg-button"}>
                            <svg style={{'transform': 'rotate(180deg)'}} viewBox="0 0 16 16">
                                <path fill='var(--Primary-color)' d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"/>
                                <path fill='var(--Primary-color)' d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                        </span>}
                        <span onClick={()=>handleNextBack('next')} role='button' className={nextForm ? "svg-icon next-form" :"svg-icon svg-button"}>
                            <svg viewBox="0 0 16 16">
                                <path fill='var(--Primary-color)' d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"/>
                                <path fill='var(--Primary-color)' d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                        </span>
                    </div>
                </div>
                <button type='submit'>submit</button>
            </form>
            <div className={backPage ? "backPage active overpop":"backPage overpop"}>
                <div className="header">
                    <p className='text-xs'>Appearance</p>
                    <span onClick={()=>setActiveBox({...activeBox,backPage: false})} className="back svg-icon svg-button active">
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
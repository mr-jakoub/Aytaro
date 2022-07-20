import { useStateContext } from "../../context/StateContext"
import CourseForm from "../courses/CourseForm"

const Popup = () => {
    const { state, setState } = useStateContext()
    const { popupForm } = state
  return (
    <div className={popupForm !== "none" ?"popup-back-container":"d-none"}>
        <div onClick={()=>setState({...state, popupForm: "none"})} className="popup-back">
        </div>
        {popupForm === "course"? <CourseForm /> : popupForm === "room"?'room':''}
    </div>
    )
}

export default Popup
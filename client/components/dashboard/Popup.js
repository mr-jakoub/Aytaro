import { useStateContext } from "../../context/StateContext"
import CourseForm from "../courses/CourseForm"
import Alert from "../layout/Alert"

const Popup = () => {
    const { state, setState, alerts } = useStateContext()
    const { popupForm } = state
  return (
    <div className={popupForm !== "none" ?"popup-back-container":"d-none"}>
        <div className="alerts">
            <Alert alerts={alerts} />
        </div>
        <div onClick={()=>setState({...state, popupForm: "none"})} className="popup-back">
        </div>
        {popupForm === "course"? <CourseForm /> : popupForm === "room"?'room':''}
    </div>
    )
}

export default Popup
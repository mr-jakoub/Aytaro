
const Alert = ({ alerts }) => alerts !== null && alerts.length > 0 &&
alerts.map(alert=> (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
        <p>{alert.alertMessage}</p>
    </div>
))

export default Alert
import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

const Alert = ({alerts}) =>
alerts.map(alerts=>(
<div key={alert.id} className={`alert alert-${alert.alertType}`}>
    {alerts.msg}
</div>
));

Alert.propTypes = {
alerts:PropTypes.func.isRequired
}

const mapStateToProps=state=>({
alerts:state.alert
});

export default connect(mapStateToProps)(Alert);

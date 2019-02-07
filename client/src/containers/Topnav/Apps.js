import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import appList from './AppList'
import './Apps.css'

class Apps extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render() {

    return (
      <ul id="dropdown-apps" className="dropdown-content">
        {
          appList.map((app, index) => (
            <span key={index}>
            <li>
              <Link to={app.link}>
                <i className="material-icons center">{app.icon}</i>
                {app.name}
              </Link>
            </li>
            </span>
          ))
        }
      </ul>
    )
  }
}

const mapStateToProps = ({ user }) => ({ 

})

const mapDispatchToProps = (dispatch) => ({

})

export default connect(mapStateToProps, mapDispatchToProps) (Apps);

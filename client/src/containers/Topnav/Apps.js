import React, { Component } from 'react'
import { connect } from 'react-redux'

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
          appList.map(app => (
            <span>
            <li>
              <a href={app.link}>
                <i className="material-icons center">{app.icon}</i>
                {app.name}
              </a>
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

import React, { Component } from 'react'
import M from 'materialize-css/dist/js/materialize.min.js'

import './UserMenu.css'

class UserMenu extends Component {
	componentDidMount() {
		// materialize css initialization
		M.AutoInit()
	}

	render() {
		return (
			<span className={this.props.className + " user-menu-container dropdown-trigger"} 
				 data-target="dropdown-user-menu">
		    <ul id="dropdown-user-menu" className="dropdown-content">
		      {this.props.item}
		    </ul>
		  	{this.props.user.name}
		  </span>
		)
	}
}

UserMenu.defaultProps = {
	user: {
		name: 'Richard'
	}
}

export default UserMenu
import React, { Component } from 'react'
import { connect } from 'react-redux'

import './SidenavDesigner.css'

class SidenavDesigner extends Component {
	constructor(props) {
		super(props)

		this.state = {
		}
	}

	render() {
		return (
			<div className="row sidenav-designer">
				<p>Sidenav designer coming soon</p>
      </div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SidenavDesigner)

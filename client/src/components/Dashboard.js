import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import * as ACT from '../actions'

class Dashboard extends Component {

	render() {
	  return (
			<div>
				<p>Welcome to dashboard</p>
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
		setDefaultNavItem: () => dispatch(ACT.setDefaultNavItem()),
		setCollectionNavItem: () => dispatch(ACT.setCollectionNavItem()),
		loadCollectionNavItemLinks: () => dispatch(ACT.loadCollectionNavItemLinks())
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import TaskList from './tasks/TaskList'
import * as ACT from '../actions'

class Dashboard extends Component {
	componentWillMount() {
		this.props.setCollectionNavItem()
		this.props.loadCollectionNavItemLinks()
    this.props.setDefaultNavItem()
	}

	render() {
	  return (
			<div>
				<TaskList />
				<div className="fixed-action-btn">
					<Link to="/tasks/new" className="btn-floating btn-large red">
					<i className="material-icons">add</i>
					</Link>
				</div>
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

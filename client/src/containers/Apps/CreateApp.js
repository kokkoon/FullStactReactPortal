import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'
import axios from 'axios'
import M from 'materialize-css/dist/js/materialize.min.js'

import initialSidenavConfig from '../Sidenav/initialSidenavConfig'
import API_URL from '../../utils/api_url'
import * as ACT from '../../actions'
import './CreateApp.css'

class CreateApp extends Component {
	state = {
		appName: '',
		appIcon: '',
		users: [],
		selectedUsers: [],
		isAppNameOk: false
	}

  render() {
  	const { 
  		appName, 
  		appIcon, 
  		users, 
  		selectedUsers, 
  		isAppNameOk 
  	} = this.state

    return (
      <div className="create-app-page">
        <h4>Create new app</h4>
        <span className="btn btn-create-app right" 
        	onClick={this.handleClickCreateApp}
        	disabled={!isAppNameOk}>
        	Create
      	</span>
        <div className="row">
        	<div className="col s3">
		        <div className="input-field">
		        	<input id="app-name" type="text" value={appName} onChange={this.handleChangeAppName} />
		        	<label htmlFor="app-name">App name</label>
		        </div>
        	</div>
        	<div className="col s2">
        		<span className="btn btn-check-app-name" onClick={this.handleClickCheckAppName}>Check</span>
	        </div>
        	<div className="col s3">
		        <div className="input-field">
		        	<input id="app-icon" type="text" value={appIcon} onChange={this.handleChangeAppIcon} />
		        	<label htmlFor="app-icon">App icon</label>
		        </div>
        	</div>
        	<div className="col s3">
	        	<a href="https://materializecss.com/icons.html" 
	        		target="_blank" 
	        		rel="noopener noreferrer">
	        		Icon name reference
	        	</a>
        	</div>
      	</div>
      	<div className="row left-align">
      	<div className="col s3">
      	<p><strong>Choose users</strong></p>
      	{
      		users.map((user, index) => (
      			<div>
	      			<label key={index}>
				        <input type="checkbox" 
				        	className="filled-in" 
				        	checked={selectedUsers.includes(user)}
				        	onChange={e => this.handleChangeSelectedUsers(user)}
				        />
				        <span>{user.firstname + ' ' + user.lastname}</span>
				      </label>
				    </div>
      		))
      	}
      	</div>
      	<div className="col s3">
      		<p><strong>Selected users</strong></p>
      		{
      			selectedUsers.map(user => user.firstname + ' ' + user.lastname)
      				.sort((a, b) => { // ignore case comparison
      					const A = a.toUpperCase()
      					const B = b.toUpperCase()

      					if (A < B) return -1
      					else if (A > B) return 1
      					return 0
      				})
      				.map((userFullName, index) => (
      					<p key={index} className="selected-users">{`${index + 1}. ${userFullName}`}</p>
      				))
      		}
      	</div>
      	<div className="col s3"></div>
      	<div className="col s3">
      		<p><strong>Apps preview</strong></p>
      	</div>
      	</div>
      </div>
    )
  }

  componentWillMount () {
  	this.loadUsers()
  }

  loadUsers () {
  	axios.get(`${API_URL}/users`)
  		.then(res => {
  			const users = res.data
  			this.setState({ users })
  		})
  }

  handleChangeAppName = ({ target }) => {
  	this.setState({ appName: target.value })
  }

  handleChangeAppIcon = ({ target }) => {
  	this.setState({ appIcon: target.value })
  }

  handleClickCheckAppName = () => {
  	const { appName } = this.state

  	axios.get(`${API_URL}/check-app-name?name=${appName}`)
  		.then(res => {
  			const { isAppNameOk } = res.data
  			this.setState({ isAppNameOk })

  			let message, icon = ''
  			if (isAppNameOk) {
  				message = '<span>&nbsp;Name is unique, you can create new template with it</span>'
					icon = '<i class="material-icons">check_circle</i>'
  			} else {
  				message = '<span>&nbsp;Name is already used, please change</span>'
					icon = '<i class="material-icons">highlight_off</i>'
  			}

  			M.toast({ html: icon + message })
  		})
  }

  handleChangeSelectedUsers = (user) => {
  	const { selectedUsers } = this.state
  	let newSelectedUsers = [...selectedUsers]

  	if (selectedUsers.includes(user)) {
  		const idx = selectedUsers.findIndex(user2 => isEqual(user, user2))
  		newSelectedUsers.splice(idx, 1)
  	} else {
	  	newSelectedUsers = [...selectedUsers, user]
  	}

  	this.setState({ selectedUsers: newSelectedUsers })
  }

  handleClickCreateApp = () => {
  	const { appName, appIcon, selectedUsers } = this.state
  	const { user, history } = this.props

  	const body = {
  		name: appName,
  		icon: appIcon,
  		owner: user,
  		userList: selectedUsers
  	}

  	const sidenav = {
  		appName,
  		groupLinks: initialSidenavConfig.groupLinks
  	}

  	axios.post(`${API_URL}/create-app`, body)
  		.then(res => {
  			axios.post(`${API_URL}/sidenav-config`, sidenav)
		  		.then(res2 => {
		  			M.toast({ html: res.data.message })
		  			// history.push('/')
		  		})
  		})
  }
}

const mapStateToProps = ({ user }) => ({
	user
})

const mapDispatchToProps = (dispatch) => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(CreateApp)

import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import M from 'materialize-css/dist/js/materialize.min.js'

import './Sidenav.css'
import * as ACT from '../actions'

class Sidenav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedNavItem: undefined,
			collectionNavItemLinks: []
		}
	}

	componentWillMount() {
		const pathname = window.location.pathname.slice(1)
		const query = window.location.search.slice(4)
		let selectedNavItem
		const { 
			// userGroupLinkAccess, 
			// currentUserGroup, 
			collectionNavItemLinks,
			setCollectionNavItem,
			loadCollectionNavItemLinks
		} = this.props

		const shownCollectionNavItemLinks = collectionNavItemLinks
		
		// show menu based on user group authorization
		// const shownCollectionNavItemLinks = collectionNavItemLinks ?
		// 	collectionNavItemLinks.filter(item => 
		// 		userGroupLinkAccess[currentUserGroup].indexOf(item.name) >= 0) : []

		const offset = collectionNavItemLinks ? shownCollectionNavItemLinks.length : 0

		if (pathname.length > 0) {
			switch (pathname) {
				case 'dashboard':
					selectedNavItem = offset
					break
				case 'data-input': 
					selectedNavItem = offset + 1
					break
				case 'record': 
					selectedNavItem = offset + 2
					break
				case 'user':
					selectedNavItem = offset + 3
					break
				default:
					selectedNavItem = offset
			}

			if (pathname.indexOf('collection') >= 0) {
				selectedNavItem = Number(query) - 1
			}

			this.setState({ selectedNavItem })
		}

		// get collection links from backend
		setCollectionNavItem()
		loadCollectionNavItemLinks()
	}

	componentDidMount() {
		document.addEventListener('DOMContentLoaded', function() {
			let sidenav = document.querySelectorAll('.sidenav')
		  let modal = document.querySelectorAll('.modal')
		  
		  M.Sidenav.init(sidenav)
		  M.Modal.init(modal)
		})
	}

	handleClickNavItem(i) {
		this.setState({
			selectedNavItem: i,
		})
	}

	render() {
		const { selectedNavItem } = this.state
		const { 
			user,
			defaultNavItem, 
			collectionNavItem, 
			// userGroupLinkAccess, 
			// currentUserGroup,
			collectionNavItemLinks
		} = this.props;

		const shownDefaultNavItemLinks = defaultNavItem.links
		const shownCollectionNavItemLinks = user.isLoggedIn ? collectionNavItemLinks : []

		// show menu based on user group authorization
		// const shownDefaultNavItemLinks = 
		// 	defaultNavItem.links.filter(item => 
		// 		userGroupLinkAccess[currentUserGroup].indexOf(item.name) >= 0)
		
			// collectionNavItem.links.filter(item => 
				// userGroupLinkAccess[currentUserGroup].indexOf(item.name) >= 0)
		// console.log('shownCollectionNavItemLinks = ', shownCollectionNavItemLinks)
		
		const offset = shownCollectionNavItemLinks ? shownCollectionNavItemLinks.length : 0

		return (
			<Fragment>
				<a data-target="slide-out" className="sidenav-trigger"><i className="material-icons">menu</i></a>

				<ul id="slide-out" className="sidenav">
			    {
			    	collectionNavItem && collectionNavItem.header.length > 0 &&
			    	<li><a className="subheader">{collectionNavItem.header}</a></li>
			    }
			    {
			    	shownCollectionNavItemLinks && shownCollectionNavItemLinks.map((item, i) => (
			    		<div key={i} >
				    		<div className={selectedNavItem === i ? 'active' : ''} onClick={this.handleClickNavItem.bind(this, i)}>
					    		<li>
							    	<Link to={item.route}>
							    		<i className="material-icons">{item.icon}</i>
							    		{item.text}
							    	</Link>
							    </li>
							  </div>
						    {
						    	item.sublink &&
					    		item.sublink.length > 0 && 
					    		item.sublink.map((subitem, idx) => (
					    			<li key={idx} className="sublink">
								    	<Link to={subitem.route}>
								    		<i className="material-icons">{subitem.icon}</i>
								    		{subitem.text}
								    	</Link>
								    </li>
					    		))
					    	}
						  </div>
			    	))
			  	}
			  	{
			  		collectionNavItem && collectionNavItem.dividerBottom &&
			  		<li><div className="divider"></div></li>
			  	}
			  	{
			    	defaultNavItem.header.length > 0 &&
			    	<li><a className="subheader">{defaultNavItem.header}</a></li>
			    }
			    {
			    	shownDefaultNavItemLinks.map((item, i) => (
			    		<div key={i} className={selectedNavItem === offset + i ? 'active' : ''} onClick={this.handleClickNavItem.bind(this, offset + i)}>
				    		<li>
						    	{
						    		user.isLoggedIn && 
						    		<Link to={item.route}>
							    		<i className="material-icons">{item.icon}</i>
							    		{item.text}
							    	</Link>
						    	}
						    	{
						    		!user.isLoggedIn && 
						    		<a className="modal-trigger" href="#modal1">
							    		<i className="material-icons">{item.icon}</i>
							    		{item.text}
							    	</a>
						    	}
						    </li>
						  </div>
			    	))
			  	}
			  	{
			  		defaultNavItem.dividerBottom &&
			  		<li><div className="divider"></div></li>
			  	}
			  </ul>

			  <div id="modal1" className="modal">
			  	<div className="modal-content">
						<i className="large material-icons">info</i>
			      <h5>Please login to access the page</h5>
			    </div>
			  </div>
	    </Fragment>
		);
	}
}

Sidenav.defaultProps = {
	defaultNavItem: {
		header: 'Setup',
		links: [
			{	name: 'dashboard',
				route: '/dashboard',
				icon: 'assignment',
				text: 'Task list',
			},
			{	name: 'collection-list',
				route: '/collection-list',
				icon: 'apps',
				text: 'Collections',
			},
		],
		dividerBottom: false,
	},

	// options of current user group links authorization
	// menu in sidenav will be filtered based on the specified menu name
	// in the strings array
	// userGroupLinkAccess:  {
	// 	admin: [
	// 		'dashboard',
	// 		'form-list',
	// 		'record', 
	// 		'user',
	// 	],
		
	// 	premiumUser: [
	// 		'dashboard',
	// 		'record',
	// 		'user', 
	// 		'collection1',
	// 		'collection3',
	// 	]
	// },

	// current group that the user belongs
	// test: change below value to be: 'admin' or 'premiumUser'
	// currentUserGroup: 'admin'
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    collectionNavItemLinks: state.user ? state.user.collectionNavItemLinks : [],
    collectionNavItem: state.user.collectionNavItem,
    defaultNavItem: state.user.defaultNavItem,
  }
}

const mapDispatchToProps = (dispatch) => {
	return {
		setCollectionNavItem: () => dispatch(ACT.setCollectionNavItem()),
		loadCollectionNavItemLinks: () => dispatch(ACT.loadCollectionNavItemLinks())
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidenav);
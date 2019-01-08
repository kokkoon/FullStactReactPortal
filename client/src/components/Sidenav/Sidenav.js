import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import M from 'materialize-css/dist/js/materialize.min.js'

import './Sidenav.css'
import * as ACT from '../../actions'

class Sidenav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedNavItem: undefined,
			collectionNavItemLinks: []
		}
	}

	componentWillMount() {
		// const pathname = window.location.pathname.slice(1)
		// const query = window.location.search.slice(4)
		// let selectedNavItem
		const { 
			setApp,
			loadSidenavConfig,
			// userGroupLinkAccess, 
			// currentUserGroup, 
			// setSidenavFromConfig,
			// setSidenavGroupLinks,
			// collectionNavItemLinks,
			// setDefaultNavItem,
			// setCollectionNavItem,
			// loadCollectionNavItemLinks,
		} = this.props

		// const shownCollectionNavItemLinks = collectionNavItemLinks
    
    setApp('default')
    loadSidenavConfig('default')
		// setDefaultNavItem()
		// setSidenavGroupLinks([])
		// get collection links from backend
		// setCollectionNavItem()
		
		// show menu based on user group authorization
		// const shownCollectionNavItemLinks = collectionNavItemLinks ?
		// 	collectionNavItemLinks.filter(item => 
		// 		userGroupLinkAccess[currentUserGroup].indexOf(item.name) >= 0) : []

		// const offset = collectionNavItemLinks ? shownCollectionNavItemLinks.length : 0

		// if (pathname.length > 0) {
		// 	switch (pathname) {
		// 		case 'dashboard':
		// 			selectedNavItem = offset
		// 			break
		// 		case 'data-input': 
		// 			selectedNavItem = offset + 1
		// 			break
		// 		case 'record': 
		// 			selectedNavItem = offset + 2
		// 			break
		// 		case 'user':
		// 			selectedNavItem = offset + 3
		// 			break
		// 		default:
		// 			selectedNavItem = offset
		// 	}

		// 	if (pathname.indexOf('collection') >= 0) {
		// 		selectedNavItem = Number(query) - 1
		// 	}

		// 	this.setState({ selectedNavItem })
		// }
	}

	componentDidUpdate(prevProps) {
		const { 
			appName, 
			sidenavConfig, 
			setSidenavFromConfig,
		} = this.props

		if (appName !== prevProps.appName || sidenavConfig !== prevProps.sidenavConfig) {
			if (sidenavConfig !== prevProps.sidenavConfig && sidenavConfig) {
					setSidenavFromConfig([], sidenavConfig.groupLinks)
			}
		}
	}

	componentDidMount() {
		// materialize css initialization
		// M.AutoInit()
		let sidenav = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenav);

    let modal = document.querySelectorAll('.modal');
    M.Modal.init(modal);
	}

	handleClickNavItem(i) {
		const elems = document.querySelectorAll('.sidenav');
		const sidenavInstance = M.Sidenav.getInstance(elems[0])
		sidenavInstance.close()

		this.setState({
			selectedNavItem: i,
		})
	}

	render() {
		const { selectedNavItem } = this.state
		const { 
			user,
			// defaultNavItem, 
			// collectionNavItem, 
			// userGroupLinkAccess, 
			// currentUserGroup,
			// collectionNavItemLinks,
			groupLinks
		} = this.props;

		// const shownDefaultNavItemLinks = defaultNavItem ? defaultNavItem.links : []
		// const shownCollectionNavItemLinks = user.isLoggedIn && collectionNavItem ? collectionNavItem.links : []
		// const shownCollectionNavItemLinks = user.isLoggedIn ? collectionNavItemLinks : []

		// show menu based on user group authorization
		// const shownDefaultNavItemLinks = 
		// 	defaultNavItem.links.filter(item => 
		// 		userGroupLinkAccess[currentUserGroup].indexOf(item.name) >= 0)
		
			// collectionNavItem.links.filter(item => 
				// userGroupLinkAccess[currentUserGroup].indexOf(item.name) >= 0)
		
		// const offset = shownCollectionNavItemLinks ? shownCollectionNavItemLinks.length : 0

		return (
			<Fragment>
			{/* eslint-disable-next-line */}
				<a data-target="slide-out" className="sidenav-trigger"><i className="material-icons">menu</i></a>

				<ul id="slide-out" className="sidenav">
			    {
			    	// collectionNavItem && collectionNavItem.header && collectionNavItem.header.length > 0 &&
			    	// <li><a className="subheader">{collectionNavItem.header}</a></li>
			    }
			    {
			    	// shownCollectionNavItemLinks && shownCollectionNavItemLinks.map((item, i) => (
			    	// 	<div key={i} >
				    // 		<div className={selectedNavItem === i ? 'active' : ''} onClick={this.handleClickNavItem.bind(this, i)}>
					   //  		<li>
							 //    	{
					   //  				item.isExternal ?
								// 	    	<a href={item.route}>
								// 	    		<i className="material-icons">{item.icon}</i>
								// 	    		{item.text}
								// 	    	</a>
								// 	    : <Link to={item.route}>
								// 	    		<i className="material-icons">{item.icon}</i>
								// 	    		{item.text}
								// 	    	</Link>
					   //  			}
							 //    </li>
							 //  </div>
						  //   {
						  //   	item.sublink &&
					   //  		item.sublink.length > 0 && 
					   //  		item.sublink.map((subitem, idx) => (
					   //  			<li key={idx} className="sublink">
								//     	{
						  //   				subitem.isExternal ?
								// 		    	<a href={subitem.route}>
								// 		    		<i className="material-icons">{subitem.icon}</i>
								// 		    		{subitem.text}
								// 		    	</a>
								// 		    : <Link to={subitem.route}>
								// 		    		<i className="material-icons">{subitem.icon}</i>
								// 		    		{subitem.text}
								// 		    	</Link>
						  //   			}
								//     </li>
					   //  		))
					   //  	}
						  // </div>
			    	// ))
			  	}
			  	{
			  		// collectionNavItem && collectionNavItem.dividerBottom &&
			  		// <li><div className="divider"></div></li>
			  	}
			  	{
			  		groupLinks &&
			  		groupLinks.map((groupLink, index) => (
			  			<div key={index}>
			  			{
			  				groupLink.header.length > 0 &&
			    			<li>
			  					{/* eslint-disable-next-line */}
			    				<a className="subheader">{groupLink.header}</a>
			    			</li>
			    		}
			  			{
			  				groupLink.links.map((item, i) => (
			  					<div key={i} >
						    		<div className={selectedNavItem === i ? 'active' : ''} onClick={this.handleClickNavItem.bind(this, i)}>
							    		<li>
									    	{
									    		user.isLoggedIn ?
								    				item.isExternal ?
												    	<a href={item.route}>
												    		<i className="material-icons">{item.icon}</i>
												    		{item.text}
												    	</a>
												    : <Link to={item.route}>
												    		<i className="material-icons">{item.icon}</i>
												    		{item.text}
												    	</Link>
												  : <a className="modal-trigger" href="#modal-login-message">
											    		<i className="material-icons">{item.icon}</i>
											    		{item.text}
											    	</a>
							    			}
									    </li>
									  </div>
								    {
								    	item.sublink &&
							    		item.sublink.length > 0 && 
							    		item.sublink.map((subitem, idx) => (
							    			<li key={idx} className="sublink" onClick={this.handleClickNavItem.bind(this,i)}>
										    	{
										    		user.isLoggedIn ?
									    				subitem.isExternal ?
													    	<a href={subitem.route}>
													    		<i className="material-icons">{subitem.icon}</i>
													    		{subitem.text}
													    	</a>
													    : <Link to={subitem.route}>
													    		<i className="material-icons">{subitem.icon}</i>
													    		{subitem.text}
													    	</Link>
													  : <a className="modal-trigger" href="#modal-login-message">
												    		<i className="material-icons">{subitem.icon}</i>
												    		{subitem.text}
												    	</a>
								    			}
										    </li>
							    		))
							    	}
								  </div>
			  				))
			  			}
			  			{
			  				groupLink.dividerBottom &&
			  				<li><div className="divider"></div></li>
			  			}
			  			</div>
			  		))
			  	}
			  	{
			  		// defaultNavItem &&
			  		// defaultNavItem.header &&
			    // 	defaultNavItem.header.length > 0 &&
			    // 	<li><a className="subheader">{defaultNavItem.header}</a></li>
			    }
			    {
			    	// shownDefaultNavItemLinks.map((item, i) => (
			    	// 	<div key={i} className={selectedNavItem === offset + i ? 'active' : ''} onClick={this.handleClickNavItem.bind(this, offset + i)}>
				    // 		<li>
						    	// {
						    	// 	user.isLoggedIn && 
						    	// 	<Link to={item.route}>
							    // 		<i className="material-icons">{item.icon}</i>
							    // 		{item.text}
							    // 	</Link>
						    	// }
						    	// {
						    	// 	!user.isLoggedIn && 
						    	// 	<a className="modal-trigger" href="#modal-login-message">
							    // 		<i className="material-icons">{item.icon}</i>
							    // 		{item.text}
							    // 	</a>
						    	// }
						  //   </li>
						  // </div>
			    	// ))
			  	}
			  	{
			  		// defaultNavItem &&
			  		// defaultNavItem.dividerBottom &&
			  		// <li><div className="divider"></div></li>
			  	}
			  </ul>

			  <div id="modal-login-message" className="modal">
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
	// defaultNavItem: {
	// 	header: 'Setup',
	// 	links: [
	// 		{	name: 'collection-list',
	// 			route: '/collection-list',
	// 			icon: 'apps',
	// 			text: 'Collections',
	// 		},
	// 		{	name: 'sidenav-setup',
	// 			route: '/sidenav-setup',
	// 			icon: 'settings',
	// 			text: 'Sidenav',
	// 		},
	// 	],
	// 	dividerBottom: false,
	// },

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
  	appName: state.user.appName,
    collectionNavItemLinks: state.user ? state.user.collectionNavItemLinks : [],
    collectionNavItem: state.user.collectionNavItem,
    defaultNavItem: state.user.defaultNavItem,
    groupLinks: state.user.sidenavGroupLinks ? state.user.sidenavGroupLinks : [],
    sidenavConfig: state.user.sidenavConfig,
  }
}

const mapDispatchToProps = (dispatch) => {
	return {
		setApp: (appName) => dispatch(ACT.setApp(appName)),
		loadSidenavConfig: (appName) => dispatch(ACT.loadSidenavConfig(appName)),
		setSidenavFromConfig: (collections, groupLinks) => dispatch(ACT.setSidenavFromConfig(collections, groupLinks)),
		setDefaultNavItem: () => dispatch(ACT.setDefaultNavItem()),
		setCollectionNavItem: () => dispatch(ACT.setCollectionNavItem()),
		setSidenavGroupLinks: (groupLinks) => dispatch(ACT.setSidenavGroupLinks(groupLinks)),
		loadCollectionNavItemLinks: () => dispatch(ACT.loadCollectionNavItemLinks())
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidenav);
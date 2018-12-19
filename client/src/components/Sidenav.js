import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import M from 'materialize-css/dist/js/materialize.min.js'

import './Sidenav.css'

class Sidenav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedNavItem: undefined,
			collectionNavItemLinks: []
		}
	}

	componentWillMount() {
		const { userGroupLinkAccess, currentUserGroup, collectionNavItem } = this.props
		const pathname = window.location.pathname.slice(1)
		const query = window.location.search.slice(4)
		let selectedNavItem

		// show menu based on user group authorization
		const shownCollectionNavItemLinks =
			collectionNavItem.links.filter(item => 
				userGroupLinkAccess[currentUserGroup].indexOf(item.name) >= 0)

		const offset = shownCollectionNavItemLinks.length

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

		// get collection data from backend
		axios.get('http://localhost:5000/sidenav-links')
			.then(res => {
				this.setState({
					collectionNavItemLinks: res.data.data
				})
			})
			.catch(e => console.error(e))
	}

	componentDidMount() {
		document.addEventListener('DOMContentLoaded', function() {
			var elems = document.querySelectorAll('.sidenav');
		  var instances = M.Sidenav.init(elems);
		})
	}

	handleClickNavItem(i) {
		this.setState({
			selectedNavItem: i,
		})
	}

	render() {
		const { selectedNavItem, collectionNavItemLinks } = this.state;
		const { 
			defaultNavItem, 
			collectionNavItem, 
			userGroupLinkAccess, 
			currentUserGroup 
		} = this.props;

		// show menu based on user group authorization
		const shownDefaultNavItemLinks = 
			defaultNavItem.links.filter(item => 
				userGroupLinkAccess[currentUserGroup].indexOf(item.name) >= 0)
		
		const shownCollectionNavItemLinks = collectionNavItemLinks

			// collectionNavItem.links.filter(item => 
				// userGroupLinkAccess[currentUserGroup].indexOf(item.name) >= 0)
		// console.log('shownCollectionNavItemLinks = ', shownCollectionNavItemLinks)
		
		const offset = shownCollectionNavItemLinks.length

		return (
			<>
				<a data-target="slide-out" class="sidenav-trigger"><i class="material-icons">menu</i></a>

				<ul id="slide-out" class="sidenav">
			    {
			    	collectionNavItem.header.length > 0 &&
			    	<li><a class="subheader" className="subheader">{collectionNavItem.header}</a></li>
			    }
			    {
			    	shownCollectionNavItemLinks.map((item, i) => (
			    		<div key={i} >
				    		<div className={selectedNavItem === i ? 'active' : ''} onClick={this.handleClickNavItem.bind(this, i)}>
					    		<li>
							    	<Link to={item.route}>
							    		<i class="material-icons">{item.icon}</i>
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
								    		<i class="material-icons">{subitem.icon}</i>
								    		{subitem.text}
								    	</Link>
								    </li>
					    		))
					    	}
						  </div>
			    	))
			  	}
			  	{
			  		collectionNavItem.dividerBottom &&
			  		<li><div class="divider"></div></li>
			  	}
			  	{
			    	defaultNavItem.header.length > 0 &&
			    	<li><a class="subheader" className="subheader">{defaultNavItem.header}</a></li>
			    }
			    {
			    	shownDefaultNavItemLinks.map((item, i) => (
			    		<div key={i} className={selectedNavItem === offset + i ? 'active' : ''} onClick={this.handleClickNavItem.bind(this, offset + i)}>
				    		<li>
						    	<Link to={item.route}>
						    		<i class="material-icons">{item.icon}</i>
						    		{item.text}
						    	</Link>
						    </li>
						  </div>
			    	))
			  	}
			  	{
			  		defaultNavItem.dividerBottom &&
			  		<li><div class="divider"></div></li>
			  	}
			  </ul>
	    </>
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
			{	name: 'setup-page',
				route: '/setup',
				icon: 'settings',
				text: 'Setup page', 
			},
			{	name: 'form-list',
				route: '/collection-list',
				icon: 'apps',
				text: 'Collections',
			},
			{	name: 'record',
				route: '/record',
				icon: 'view_headline',
				text: 'Record list', 
			},
			{	name: 'user',
				route: '/user',
				icon: 'account_circle',
				text: 'User', 
			},
		],
		dividerBottom: false,
	},

	collectionNavItem: {
		header: 'Collections',
		links: [
			{	name: 'collection1',
				route: '/collection?id=1',
				icon: 'format_list_bulleted',
				text: 'Collection 1',
				sublink: [
					{	name: 'collection1a',
						route: '/collection?id=1a',
						icon: 'format_list_bulleted',
						text: 'Collection 1a', 
					},
					{	name: 'collection1b',
						route: '/collection?id=1b',
						icon: 'format_list_bulleted',
						text: 'Collection 1b', 
					},
				],
			},
			{	name: 'collection2',
				route: '/collection?id=2',
				icon: 'format_list_bulleted',
				text: 'Collection 2', 
			},
			{	name: 'collection3',
				route: '/collection?id=3',
				icon: 'format_list_bulleted',
				text: 'Collection 3', 
			},
		],
		dividerBottom: true,
	},

	// options of current user group links authorization
	// menu in sidenav will be filtered based on the specified menu name
	// in the strings array
	userGroupLinkAccess:  {
		admin: [
			'dashboard', 
			'setup-page',
			'form-list',
			'record', 
			'user',
		],
		
		premiumUser: [
			'dashboard',
			'record',
			'user', 
			'collection1',
			'collection3',
		]
	},

	// current group that the user belongs
	// test: change below value to be: 'admin' or 'premiumUser'
	currentUserGroup: 'admin'
} 

export default Sidenav;

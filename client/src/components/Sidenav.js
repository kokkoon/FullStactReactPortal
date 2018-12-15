import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './Sidenav.css'

class Sidenav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedNavItem: undefined,
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
			}

			if (pathname.indexOf('collection') >= 0) {
				selectedNavItem = Number(query) - 1
			}

			this.setState({ selectedNavItem })
		}
	}

	handleClickNavItem(i) {
		this.setState({
			selectedNavItem: i,
		})
	}

	render() {
		const { selectedNavItem } = this.state;
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
		
		const shownCollectionNavItemLinks = 
			collectionNavItem.links.filter(item => 
				userGroupLinkAccess[currentUserGroup].indexOf(item.name) >= 0)
		
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
							    		{item.icon}
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
								    		{subitem.icon}
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
						    		{item.icon}
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
		header: 'Default menu',
		links: [
			{	name: 'dashboard',
				route: '/dashboard',
				icon: <i class="material-icons">assignment</i>,
				text: 'Task list',
			},
			{	name: 'data-input',
				route: '/data-input',
				icon: <i class="material-icons">input</i>,
				text: 'Data input', 
			},
			{	name: 'record',
				route: '/record',
				icon: <i class="material-icons">view_headline</i>,
				text: 'Record list', 
			},
			{	name: 'user',
				route: '/user',
				icon: <i class="material-icons">account_circle</i>,
				text: 'User', 
			},
		],
		dividerBottom: false,
	},

	collectionNavItem: {
		header: 'List of collection',
		links: [
			{	name: 'collection1',
				route: '/collection?id=1',
				icon: <i class="material-icons">format_list_bulleted</i>,
				text: 'Collection 1',
				sublink: [
					{	name: 'collection1a',
						route: '/collection?id=1a',
						icon: <i class="material-icons">format_list_bulleted</i>,
						text: 'Collection 1a', 
					},
					{	name: 'collection1b',
						route: '/collection?id=1b',
						icon: <i class="material-icons">format_list_bulleted</i>,
						text: 'Collection 1b', 
					},
				],
			},
			{	name: 'collection2',
				route: '/collection?id=2',
				icon: <i class="material-icons">format_list_bulleted</i>,
				text: 'Collection 2', 
			},
			{	name: 'collection3',
				route: '/collection?id=3',
				icon: <i class="material-icons">format_list_bulleted</i>,
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
			'data-input', 
			'record', 
			'user', 
			'collection1',
			'collection2', 
			'collection3',
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
	currentUserGroup: 'premiumUser'
} 

export default Sidenav;

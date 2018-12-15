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
		const offset = this.props.collectionNavItem.length
		const pathname = window.location.pathname.slice(1)
		const query = window.location.search.slice(4)
		let selectedNavItem

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
		const { defaultNavItem, collectionNavItem } = this.props;

		return (
			<>
				<a data-target="slide-out" class="sidenav-trigger"><i class="material-icons">menu</i></a>

				<ul id="slide-out" class="sidenav">
			    <li><a class="subheader" className="subheader">Menu</a></li>
			    {
			    	collectionNavItem.map((item, i) => (
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
			  	<li><div class="divider"></div></li>
			    {
			    	defaultNavItem.map((item, i) => (
			    		<div key={i} className={selectedNavItem === i + collectionNavItem.length ? 'active' : ''} onClick={this.handleClickNavItem.bind(this, i + collectionNavItem.length)}>
				    		<li>
						    	<Link to={item.route}>
						    		{item.icon}
						    		{item.text}
						    	</Link>
						    </li>
						  </div>
			    	))
			  	}
			  </ul>
	    </>
		);
	}
}

Sidenav.defaultProps = {
	defaultNavItem: [
		{	route: '/dashboard',
			icon: <i class="material-icons">assignment</i>,
			text: 'Task list', 
		},
		{	route: '/data-input',
			icon: <i class="material-icons">input</i>,
			text: 'Data input', 
		},
		{	route: '/record',
			icon: <i class="material-icons">view_headline</i>,
			text: 'Record list', 
		},
		{	route: '/user',
			icon: <i class="material-icons">account_circle</i>,
			text: 'User', 
		},
	],
	collectionNavItem: [
		{	route: '/collection?id=1',
			icon: <i class="material-icons">format_list_bulleted</i>,
			text: 'Collection 1',
			sublink: [
				{	route: '/collection?id=1a',
					icon: <i class="material-icons">format_list_bulleted</i>,
					text: 'Collection 1a', 
				},
				{	route: '/collection?id=1b',
					icon: <i class="material-icons">format_list_bulleted</i>,
					text: 'Collection 1b', 
				},
			],
		},
		{	route: '/collection?id=2',
			icon: <i class="material-icons">format_list_bulleted</i>,
			text: 'Collection 2', 
		},
		{	route: '/collection?id=3',
			icon: <i class="material-icons">format_list_bulleted</i>,
			text: 'Collection 3', 
		},
	]
} 

export default Sidenav;
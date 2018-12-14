import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Sidenav.css';

// const SidenavWithRouter = withRouter(props => <Sidenav {...props}/>);

class Sidenav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedNavItem: undefined,
		}
	}

	componentWillMount() {
		const pathname = window.location.pathname.slice(1);

		if (pathname.length > 0) {
			switch(pathname) {
				case 'dashboard': 
					this.setState({
						selectedNavItem: 0,
					});
					break;
				case 'data-input': 
					this.setState({
						selectedNavItem: 1,
					});
					break;
				case 'record': 
					this.setState({
						selectedNavItem: 2,
					});
					break;
				case 'user':
						this.setState({
							selectedNavItem: 3,
						});
					break;
				default:
			}
		}
	}

	componentDidUpdate() {
		const pathname = window.location.pathname.slice(1);
		const { selectedNavItem } = this.state;

		if (pathname.length > 0) {
			switch(pathname) {
				case 'dashboard': 
					if (selectedNavItem !== 0) {
						this.setState({
							selectedNavItem: 0,
						});
					}
					break;
				case 'data-input': 
					if (selectedNavItem !== 1) {
						this.setState({
							selectedNavItem: 1,
						});
					}
					break;
				case 'record': 
					if (selectedNavItem !== 2) {
						this.setState({
							selectedNavItem: 2,
						});
					}
					break;
				case 'user':
					if (selectedNavItem !== 3) {
						this.setState({
							selectedNavItem: 3,
						});
					}
					break;
				default:
			}
		}
	}

	handleClickNavItem(i) {
		this.setState({
			selectedNavItem: i,
		})
	}

	render() {
		const { selectedNavItem } = this.state;
		const { defaultNavItem } = this.props;

		return (
			<>
				<a data-target="slide-out" class="sidenav-trigger"><i class="material-icons">menu</i></a>

				<ul id="slide-out" class="sidenav">
			    <li><a class="subheader" className="subheader">Menu</a></li>
			    {
			    	defaultNavItem.map((item, i) => (
			    		<div key={i} className={selectedNavItem === i ? 'active' : ''} onClick={this.handleClickNavItem.bind(this, i)}>
				    		<li>
						    	<Link to={item.pathname}>
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
		{	pathname: '/dashboard',
			icon: <i class="material-icons">assignment</i>,
			text: 'Task list', 
		},
		{	pathname: '/data-input',
			icon: <i class="material-icons">input</i>,
			text: 'Data input', 
		},
		{	pathname: '/record',
			icon: <i class="material-icons">view_headline</i>,
			text: 'Record list', 
		},
		{	pathname: '/user',
			icon: <i class="material-icons">account_circle</i>,
			text: 'User', 
		},
	]
} 

export default Sidenav;
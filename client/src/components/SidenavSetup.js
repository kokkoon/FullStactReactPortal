import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'

import API_URL from '../utils/api_url'
import * as ACT from '../actions'
import './SidenavSetup.css'

class SidenavSetup extends Component {
	constructor(props) {
		super(props);

		this.state = {
			collectionList: [],
			Links: [],
			newLink: {
				name: '',
				url: '',
				icon: '',
				showInSidenav: true
			},
			groupLinks: [],
			newGroupLink: {
				header: '',
				links: [],
				dividerBottom: true,
			}
		}
	}

	componentWillMount() {
		// get form data from backend
		axios.get(`${API_URL}/sidenav-links`)
			.then(res => {
				const collectionList =  res.data.data.map(collection => {
					return { 
						name: collection.name, 
						url: collection.route, 
						icon: collection.icon,
						showInSidenav: true 
					}
				})

				this.setState({ collectionList })
			})
			.catch(e => console.error(e))
	}

	handleCheck = (data, i) => {
		const { collectionList, Links } = this.state

		if (data === 'collection') {
			collectionList.map((collection, idx) => {
				if (i === idx) {
					collection.showInSidenav = !collection.showInSidenav
				}
				return collection
			})
		} else if (data === 'link') {
			Links.map((link, idx) => {
				if (i === idx) {
					link.showInSidenav = !link.showInSidenav
				}
				return link
			})
		}

		this.setState({ collectionList, Links })
	}

	handleInputNewLink = (event, inputType) => {
		const { newLink } = this.state

		switch (inputType) {
			case 'name': 
				newLink.name = event.target.value
				break

			case 'url':
				newLink.url = event.target.value
				break

			case 'icon':
				newLink.icon = event.target.value
				break

			case 'showInSidenav':
				newLink.showInSidenav = !newLink.showInSidenav
				break

			default:
		}
		
		this.setState({ newLink	})
	}

	handleAddNewLink = () => {
		const { Links, newLink } = this.state

		Links.push(newLink)

		this.setState({
			Links,
			newLink:  {
				name: '',
				url: '',
				icon: '',
				showInSidenav: true
			}
		})
	}

	deleteLink = (index) => {
    const { Links } = this.state
		
		const newLinks = Links.slice().splice(index, 1)

		this.setState({ Links: newLinks })
  }

  handleInputNewGroupLink = (event, inputType) => {
		const { newGroupLink } = this.state

		switch (inputType) {
			case 'header': 
				newGroupLink.header = event.target.value
				break

			case 'dividerBottom':
				newGroupLink.dividerBottom = !newGroupLink.dividerBottom
				break

			default:
		}
		
		this.setState({ newGroupLink	})
	}

	handleAddLinkToNewGroup = (event, link) => {
		const { newGroupLink } = this.state

		if (event.target.checked) newGroupLink.links.push(link)
		else {
			newGroupLink.links.forEach((searchLink, index) => {
				if (searchLink.name === link.name) {
					newGroupLink.links.splice(index, 1)
				}
			})
		}

		this.setState({ newGroupLink })
	}

	handleCreateNewGroupLink = () => {
		const { groupLinks, newGroupLink } = this.state

		const newGroupLinks = groupLinks.slice()
		newGroupLinks.push(newGroupLink)

		this.setState({ 
			groupLinks: newGroupLinks,
			newGroupLink: {
				header: '',
				links: [],
				dividerBottom: true,
			}
		})
	}

	deleteGroupLink = (index) => {
		const { groupLinks } = this.state		
		const newGroupLinks = groupLinks.slice().splice(index, 1)

		this.setState({ groupLinks: newGroupLinks })
	}

	handleApplySidenavConfig = () => {
		let { collectionList, groupLinks } = this.state
		const { setSidenavFromConfig } = this.props

		const newCollectionList = collectionList.filter(collection => collection.showInSidenav)
		.map(collection => {
			return {
				name: collection.name,
				route: collection.url,
				icon: collection.icon,
				text: collection.name,
			}
		})

		const newGroupLinks = groupLinks.map(groupLink => {
			const links = 
				groupLink.links.filter(link => link.showInSidenav)
				.map(link => {
					return {
						name: link.name,
						route: link.url,
						icon: link.icon,
						text: link.name,
					}
				})

			groupLink.links = links
			return groupLink
		})

		setSidenavFromConfig(newCollectionList, newGroupLinks)
	}

	render() {
		const { 
			collectionList, 
			Links, 
			newLink,
			groupLinks,
			newGroupLink,
		} = this.state

		// console.log('collectionList = ', collectionList)
		// console.log('newLink = ', newLink)
		// console.log('Links = ', Links)
		// console.log('newGroupLink = ', newGroupLink)
		console.log('groupLinks = ', groupLinks)

		return (
			<div className="sidenav-setup-page">
				<div className="row">
					<div className="col s6">
						<h3>Sidenav Setup Page</h3>
					</div>
					<div className="col s6 btn-apply-container">
						<a className="waves-effect waves-light btn"
		      		 onClick={this.handleApplySidenavConfig}>
				    	Apply sidenav config
				    </a>
				  </div>
				</div>
				<div className="row">
					<div className="col s4">
						<span>show or hide collections</span>
						{
							collectionList.map((collection, index) => (
								<div>
									<label>
						        <input 
						        	type="checkbox" 
						        	className="filled-in" 
						        	checked={collection.showInSidenav ? "checked" : ""} 
						        	onChange={this.handleCheck.bind(this, 'collection', index)} 
						        />
						        <span>{collection.name}</span>
						      </label>
					      </div>
							))
						}
					</div>
					<div className="col s4">
						<span>show or hide links</span>
						{
							Links.map((link, index) => (
								<div>
									<label>
						        <input 
						        	type="checkbox" 
						        	className="filled-in" 
						        	checked={link.showInSidenav ? "checked" : ""} 
						        	onChange={this.handleCheck.bind(this, 'link', index)} 
						        />
						        <span>{link.name}</span>
						      </label>
                  <a className="btn red btn-delete" onClick={e => this.deleteLink(index)}>
                  	<i className="tiny material-icons">delete</i>
                  </a>
					      </div>
							))
						}
					</div>
				</div>
				<div className="row">
					<div className="input-field col s12">
						<span>add or remove links</span>
					</div>
					<div className="input-field col s6">
						<input id="new-link-name" type="text" value={newLink.name} onChange={(e) => this.handleInputNewLink(e, 'name')}/>
						<label htmlFor="new-link-name">Link name</label>
					</div>
					<div className="input-field col s6">
						<input id="new-link-url" type="text" value={newLink.url} onChange={(e) => this.handleInputNewLink(e, 'url')}/>
						<label htmlFor="new-link-url">Link URL</label>
					</div>
					<div className="input-field col s6">
				    <select value={newLink.icon} onChange={(e) => this.handleInputNewLink(e, 'icon')}>
				      <option value="">Icon</option>
				      <option value="album">album</option>
				      <option value="archive">archive</option>
				      <option value="assessment">assessment</option>
				      <option value="attach_file">attach_file</option>
				    </select>
				  </div>
				  <div className="input-field col s3">
				  	<label>
			        <input 
			        	type="checkbox" 
			        	className="filled-in" 
			        	checked={newLink.showInSidenav ? "checked" : ""} 
			        	onChange={(e) => this.handleInputNewLink(e, 'showInSidenav')} 
			        />
			        <span>Show in sidenav</span>
			      </label>
			    </div>
				  <div className="input-field col s3">
						<a className="waves-effect waves-light btn"
		      		 onClick={this.handleAddNewLink}>
				    	Add
				    </a>
				  </div>
			  </div>
				<div className="row">
					<div className="col s12">
						<span>group links</span>
						{
							groupLinks.map((link, index) => (
								<div>
									<span>{link.header}</span>
                  <a className="btn red btn-delete" onClick={e => this.deleteGroupLink(index)}>
                  	<i className="tiny material-icons">delete</i>
                  </a>
					      </div>
							))
						}
					</div>
					<div className="input-field col s4">
						<input id="new-group-link-header" type="text" value={newGroupLink.header} onChange={(e) => this.handleInputNewGroupLink(e, 'header')}/>
						<label htmlFor="new-group-link-header">Group header</label>
					</div>
					<div className="input-field col s3">
				  	<label>
			        <input 
			        	type="checkbox" 
			        	className="filled-in" 
			        	checked={newGroupLink.dividerBottom ? "checked" : ""} 
			        	onChange={(e) => this.handleInputNewGroupLink(e, 'dividerBottom')} 
			        />
			        <span>Use bottom divider</span>
			      </label>
			    </div>
					<div className="input-field col s3">
					<p>choose links</p>
					{
						[...collectionList, ...Links].map((link, index) => (
							<div>
									<label>
						        <input 
						        	type="checkbox" 
						        	className="filled-in" 
						        	checked={newGroupLink.links.indexOf(link) >= 0 ? "checked" : ""} 
						        	onChange={e => this.handleAddLinkToNewGroup(e, link)} 
						        />
						        <span>{link.name}</span>
						      </label>
					      </div>
						))	
					}
			    </div>
					<div className="input-field col s2">
						<a className="waves-effect waves-light btn"
		      		 onClick={this.handleCreateNewGroupLink}>
				    	Create
				    </a>
			    </div>
				</div>
			</div>
		)
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		setSidenavFromConfig: (collections, groupLinks) => dispatch(ACT.setSidenavFromConfig(collections, groupLinks)),
	}
}

export default connect(null, mapDispatchToProps)(SidenavSetup)
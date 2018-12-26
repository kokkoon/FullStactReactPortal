import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../utils/api_url'
import * as ACT from '../actions'
import './SidenavSetup.css'

class SidenavSetup extends Component {
	constructor(props) {
		super(props);

		this.state = {
			appName: 'default',
			isConfigLoadedFromDB: false,
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
		this.props.loadSidenavConfig()

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

	componentDidMount() {
		M.AutoInit()
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
		
		Links.splice(index, 1)

		this.setState({ Links })
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

		groupLinks.push(newGroupLink)

		this.setState({ 
			groupLinks,
			newGroupLink: {
				header: '',
				links: [],
				dividerBottom: true,
			}
		})
	}

	deleteGroupLink = (index) => {
		const { groupLinks } = this.state		
		
		groupLinks.splice(index, 1)

		this.setState({ groupLinks })
	}

	handleLoadConfig = (appName) => {
		axios.get(`/api/sidenav-config?app_name=${appName}`)
		.then(res => {
			this.setState({ 
				isConfigLoadedFromDB: true,
				groupLinks: res.data.data.groupLinks
			})
		})
		.catch(e => console.error(e))
	}

	handleSaveSidenavConfig = () => {
		const { appName, collectionList, groupLinks } = this.state
		const { saveSidenavConfig } = this.props
		const { newCollectionList, newGroupLinks } = this.restructureConfig(collectionList, groupLinks)
		
		const collectionNavItem = {
			header: 'Collections',
			dividerBottom: true,
			links: [...newCollectionList]
		}

		const config = {
			appName,
			groupLinks: [...newGroupLinks, collectionNavItem]
		}

		console.log('config page = ', config)

		saveSidenavConfig(config)
	}

	restructureConfig = (collectionList, groupLinks) => {
		let newCollectionList = [...collectionList]
		newCollectionList = 
			newCollectionList.filter(collection => collection.showInSidenav)
				.map(collection => {
					return {
						name: collection.name,
						route: collection.url,
						icon: collection.icon,
						text: collection.name,
					}
				})

		let newGroupLinks = [...groupLinks]
		newGroupLinks = newGroupLinks.map(groupLink => {
		  const newLinks = [...groupLink.links] 
		  const newFilteredLinks = newLinks.filter(link => link.showInSidenav).map(link => {
				return {
					name: link.name,
					route: link.url,
					icon: link.icon,
					text: link.name,
				}
			})

			let newGroupLink = { ...groupLink, links: newFilteredLinks }

			return newGroupLink
		})

		return { newCollectionList, newGroupLinks }
	}

	handleApplySidenavConfig = () => {
		const { collectionList, groupLinks, isConfigLoadedFromDB } = this.state
		const { setSidenavFromConfig } = this.props
		const { newCollectionList, newGroupLinks } = this.restructureConfig(collectionList, groupLinks)

		if (!isConfigLoadedFromDB) setSidenavFromConfig(newCollectionList, newGroupLinks)
		else setSidenavFromConfig(newCollectionList, groupLinks)
	}

	handleChangeAppName = (e) => {
		this.setState({ appName: e.target.value })
	}

	render() {
		const { 
			appName,
			collectionList, 
			Links, 
			newLink,
			groupLinks,
			newGroupLink,
		} = this.state

		const { sidenavConfig } = this.props

		// console.log('collectionList = ', collectionList)
		// console.log('newLink = ', newLink)
		// console.log('Links = ', Links)
		// console.log('newGroupLink = ', newGroupLink)
		console.log('groupLinks = ', groupLinks)

		return (
			<div className="sidenav-setup-page">
				<div className="row">
					<div className="col s12 center">
						<h4>Sidenav Setup Page</h4>
					</div>
				  <div className="input-field col s6">
						<input id="app-name" type="text" value={appName} onChange={this.handleChangeAppName}/>
						<label htmlFor="new-link-name">App name</label>
					</div>
					<div className="col s6 btn-apply-container">
						<a className="waves-effect waves-light btn btn-apply"
		      		 onClick={this.handleApplySidenavConfig}>
				    	Apply config
				    </a>
						<a className="waves-effect waves-light btn"
		      		 onClick={this.handleSaveSidenavConfig}>
				    	Save config
				    </a>
				  </div>
				  <div className="col s12">
						<h5>Load config from database</h5>
						{
							sidenavConfig && 
							sidenavConfig.map(config => (
								<a className="waves-effect waves-light btn btn-config"
									 onClick={(e) => this.handleLoadConfig(config.appName)}>
									 {config.appName}
								</a>
							))
						}
					</div>
				</div>
				<div className="row">
					<div className="col s4">
						<h6>show or hide collections</h6>
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
						<h6>show or hide links</h6>
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
						<h5>Add or remove links</h5>
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
						<h5>Group links</h5>
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

const mapStateToProps = (state) => {
	return {
		sidenavConfig: state.user.sidenavConfig,
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		saveSidenavConfig: (config) => dispatch(ACT.saveSidenavConfig(config)),
		loadSidenavConfig: () => dispatch(ACT.loadSidenavConfig()),
		setSidenavFromConfig: (collections, groupLinks) => dispatch(ACT.setSidenavFromConfig(collections, groupLinks)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SidenavSetup)
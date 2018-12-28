import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import axios from 'axios'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../utils/api_url'
import * as ACT from '../actions'
import './SidenavSetup.css'

class SidenavSetup extends Component {
	constructor(props) {
		super(props)

		this.state = {
			appName: props.appName,
			JSONconfig: '',
			defaultConfig: {},
			config: {}
		}

		this.textJSONconfig = React.createRef()
	}

	componentWillMount() {
		const { loadSidenavConfig } = this.props
		const { appName } = this.state

		// load sidenav config based on app name
		loadSidenavConfig(appName)
	}

	componentDidMount() {
		M.AutoInit()
	}

	componentDidUpdate(prevProps) {
		const { appName, sidenavConfig, loadSidenavConfig } = this.props

		if (sidenavConfig !== prevProps.sidenavConfig) {
			const JSONconfig = this.stringifyPrettyJSON(sidenavConfig.groupLinks)

			this.setState({ 
				config: sidenavConfig, 
				defaultConfig: sidenavConfig,
				JSONconfig,
			})
		}

		if (appName !== prevProps.appName) {
			loadSidenavConfig(appName)
		}
	}

	stringifyPrettyJSON = (object) => {
		return JSON.stringify(object, undefined, 2)/*.replace(/": /g, '"\t:  ')*/
	}

	handleChangeJSONconfig = (event) => {
		this.setState({ JSONconfig: event.target.value })
	}

	handleTabPressedOnJSONTextarea = (event) => {
		if(event.keyCode === 9) {
			event.preventDefault()

			const thisTextarea = this.textJSONconfig.current
			let v = thisTextarea.value,
			s = thisTextarea.selectionStart,
			e = thisTextarea.selectionEnd

			thisTextarea.value = v.substring(0, s) + '\t' + v.substring(e)
			thisTextarea.selectionStart = thisTextarea.selectionEnd = s + 1
		}
	}

	handleDefaultConfig = () => {
		const { defaultConfig } = this.state
		const JSONconfig = this.stringifyPrettyJSON(defaultConfig.groupLinks)
		this.setState({ 
			config: defaultConfig,
			JSONconfig 
		})
	}

	handlePreviewConfig = () => {
		const newConfig = this.updateConfig()
		this.setState({ config: newConfig })
	}

	updateConfig = () => {
		const { JSONconfig, config, defaultConfig } = this.state
		let newConfig = defaultConfig
		let newJSONconfig
		try {
			newConfig = { ...config, groupLinks: JSON.parse(JSONconfig) }
		} catch (err) {
			alert('JSON config is not valid\nError : ' + err)
			// uncomment code below to apply default config if 
			// user try to preview or save invalid JSON
			// if (err) this.handleDefaultConfig()
		} 

		return newConfig
	}

	handleSaveApplyConfig = (JSONconfig) => {
		const config = this.updateConfig()
		const { saveSidenavConfig, setSidenavFromConfig } = this.props
		this.handlePreviewConfig()
		saveSidenavConfig(config)
		setSidenavFromConfig([], config.groupLinks)
	}

	render() {
		const { JSONconfig, config, defaultConfig } = this.state
		let groupLinks = config ? config.groupLinks : []

		return (
			<div className="row sidenav-setup">
				<div className="col s3">
					<ul id="sidenav-preview">
			  	{
			  		groupLinks && 
			  		groupLinks.map(groupLink => (
			  			<Fragment>
			  			{
			  				groupLink.header.length > 0 &&
			    			<li><span className="subheader">{groupLink.header}</span></li>
			    		}
			  			{
			  				groupLink.links.map((item, i) => (
			  					<div key={i} >
						    		<div>
							    		<li>
							    			{
							    				item.isExternal ?
											    	<a href={item.route}>
											    		<i className="material-icons">{item.icon}</i>
											    		{item.text}
											    	</a>
											    : <Link to={item.route}>
											    		<i className="material-icons">{item.icon}</i>
											    		{item.text}
											    	</Link>
							    			}
									    </li>
									  </div>
								    {
								    	item.sublink &&
							    		item.sublink.length > 0 && 
							    		item.sublink.map((subitem, idx) => (
							    			<li key={idx} className="sublink">
										    	{
								    				subitem.isExternal ?
												    	<a href={subitem.route}>
												    		<i className="material-icons">{subitem.icon}</i>
												    		{subitem.text}
												    	</a>
												    : <Link to={subitem.route}>
												    		<i className="material-icons">{subitem.icon}</i>
												    		{subitem.text}
												    	</Link>
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
			  			</Fragment>
			  		))
			  	}
			  	</ul>
				</div>
				<div className="col s7">
					<div class="input-field col s12">
	          <span className="left"><strong>Sidenav JSON config</strong></span>
	          <textarea 
	          	id="textarea-sidenav-json-config" 
	          	className="materialize-textarea"
	          	value={JSONconfig}
	          	onChange={this.handleChangeJSONconfig}
	          	ref={this.textJSONconfig}
	          	onKeyDown={this.handleTabPressedOnJSONTextarea} />
	        </div>
				</div>
				<div className="col s2 btn-actions">
					<span className="waves-effect waves-light btn" onClick={this.handleDefaultConfig}>Default</span>
					<span className="waves-effect waves-light btn" onClick={this.handlePreviewConfig}>Preview</span>
					<span className="waves-effect waves-light btn" onClick={this.handleSaveApplyConfig}>Save & Apply</span>
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		sidenavConfig: state.user.sidenavConfig,
		appName: state.user.appName,
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		saveSidenavConfig: (config) => dispatch(ACT.saveSidenavConfig(config)),
		loadSidenavConfig: (appName) => dispatch(ACT.loadSidenavConfig(appName)),
		setSidenavFromConfig: (collections, groupLinks) => dispatch(ACT.setSidenavFromConfig(collections, groupLinks)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SidenavSetup)

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

		this.textJSONconfig = React.createRef()
		this.state = {
			JSONconfig: '',
			defaultConfig: {
				appName: 'default',
				groupLinks: [
					{
	          "header": "Collections",
	          "dividerBottom": true,
	          "links": [
	            {
	                "name": "gogle",
	                "route": "http://www.google.com",
	                "icon": "format_list_bulleted",
	                "text": "google",
	                "isExternal": true
	            },
	            {
	                "name": "Taskr",
	                "route": "/collection?id=4",
	                "icon": "format_list_bulleted",
	                "text": "Taskr",
	                "isExternal": false
	            },
	            {
	                "name": "Ta",
	                "route": "/collection?id=5",
	                "icon": "format_list_bulleted",
	                "text": "Ta"
	            },
	            {
	                "name": "Vendor",
	                "route": "/collection?id=6",
	                "icon": "format_list_bulleted",
	                "text": "Vendor"
	            },
	            {
	                "name": "Cars",
	                "route": "/collection?id=2",
	                "icon": "format_list_bulleted",
	                "text": "Cars",
	                "sublink": [
	                	{
	                  	"name": "Cars",
		                  "route": "http://www.cars.com",
		                  "icon": "car",
		                  "text": "Cars",
		                  "isExternal": true
	                	}
	                ]
	            },
	            {
	                "name": "Task",
	                "route": "/collection?id=1",
	                "icon": "format_list_bulleted",
	                "text": "Task"
	            }
	          ]
	      	}
      	]
    	},
			config: {
				appName: 'default',
				groupLinks: [
					{
	          "header": "Collections",
	          "dividerBottom": true,
	          "links": [
	            {
	                "name": "gogle",
	                "route": "http://www.google.com",
	                "icon": "format_list_bulleted",
	                "text": "google",
	                "isExternal": true
	            },
	            {
	                "name": "Taskr",
	                "route": "/collection?id=4",
	                "icon": "format_list_bulleted",
	                "text": "Taskr",
	                "isExternal": false
	            },
	            {
	                "name": "Ta",
	                "route": "/collection?id=5",
	                "icon": "format_list_bulleted",
	                "text": "Ta"
	            },
	            {
	                "name": "Vendor",
	                "route": "/collection?id=6",
	                "icon": "format_list_bulleted",
	                "text": "Vendor"
	            },
	            {
	                "name": "Cars",
	                "route": "/collection?id=2",
	                "icon": "format_list_bulleted",
	                "text": "Cars",
	                "sublink": [
	                	{
	                  	"name": "Cars",
		                  "route": "http://www.cars.com",
		                  "icon": "car",
		                  "text": "Cars",
		                  "isExternal": true
	                	}
	                ]
	            },
	            {
	                "name": "Task",
	                "route": "/collection?id=1",
	                "icon": "format_list_bulleted",
	                "text": "Task"
	            }
	          ]
	      	}
      	]
    	}
		}
	}

	componentWillMount() {
		this.setState({
			JSONconfig: this.stringifyPrettyJSON(this.state.config.groupLinks)
		})
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
		const JSONconfig = this.stringifyPrettyJSON(this.state.defaultConfig.groupLinks)
		this.setState({ JSONconfig })
	}

	handlePreviewConfig = () => {
		const { JSONconfig, config } = this.state
		const newConfig = { ...config, groupLinks: JSON.parse(JSONconfig) }
		this.setState({ config: newConfig })
	}

	handleSaveApplyConfig = (JSONconfig) => {
		const { config } = this.state
		const { saveSidenavConfig, setSidenavFromConfig } = this.props

		saveSidenavConfig(config)
		setSidenavFromConfig([], config.groupLinks)
	}

	render() {
		const { JSONconfig, config } = this.state
		const { groupLinks } = config

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

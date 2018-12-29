import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
// import { Link } from 'react-router-dom'
import Form from 'react-jsonschema-form'

import API_URL from '../utils/api_url'
// import * as ACT from '../actions'
import './DesignForm.css'

class DesignForm extends Component {
	constructor(props) {
		super(props)

		this.state = {
			collectionName: '',
			stringUIschema: '',
			defaultUISchema: {},
			uiSchema: {},
			stringJSONschema: '',
			defaultJSONSchema: { title: 'Form', type: "object", properties: {} },
			JSONSchema: { title: 'Form', type: "object", properties: {} }
		}

		this.textareaUIschema = React.createRef()
		this.textareaJSONschema = React.createRef()
	}

	componentWillMount() {
		const { location } = this.props
		const formId = location.search.slice(4)

		axios.get(`${API_URL}/form?id=${formId}`)
		.then(res => {
			const stringJSONschema = this.stringifyPrettyJSON(res.data.data)

			this.setState({
				collectionName: res.data.collectionName,
				JSONSchema: res.data.data,
				defaultJSONSchema: res.data.data,
				stringJSONschema
			})
		})
		.catch(e => console.error(e))
	}

	log = (type) => console.log.bind(console, type)

	componentDidUpdate(prevProps) {
		// const { appName, sidenavConfig, loadSidenavConfig } = this.props

		// if (sidenavConfig !== prevProps.sidenavConfig) {
		// 	const JSONconfig = this.stringifyPrettyJSON(sidenavConfig.groupLinks)

		// 	this.setState({ 
		// 		config: sidenavConfig, 
		// 		defaultConfig: sidenavConfig,
		// 		JSONconfig,
		// 	})
		// }

		// if (appName !== prevProps.appName) {
		// 	loadSidenavConfig(appName)
		// }
	}

	stringifyPrettyJSON = (object) => {
		return JSON.stringify(object, undefined, 2)/*.replace(/": /g, '"\t:  ')*/
	}

	handleChangeJSONschema = (event) => {
		this.setState({ stringJSONschema: event.target.value })
	}

	handleChangeUIschema = (event) => {
		this.setState({ stringUIschema: event.target.value })
	}

	handleTabPressedOnJSONTextarea = (event, textarea) => {
		if(event.keyCode === 9) {
			event.preventDefault()

			let v = textarea.value,
			s = textarea.selectionStart,
			e = textarea.selectionEnd

			textarea.value = v.substring(0, s) + '\t' + v.substring(e)
			textarea.selectionStart = textarea.selectionEnd = s + 1
		}
	}

	handleDefaultSchema = () => {
		const { defaultJSONSchema, defaultUISchema } = this.state
		const stringJSONschema = this.stringifyPrettyJSON(defaultJSONSchema)
		const stringUIschema = this.stringifyPrettyJSON(defaultUISchema)
		
		console.log('stringJSONschema = ', stringJSONschema)

		this.setState({
			JSONSchema: defaultJSONSchema,
			uiSchema: defaultUISchema,
			stringUIschema,
			stringJSONschema
		})
	}

	handlePreviewSchema = () => {
		const newSchema = this.updateSchema()
		this.setState({ 
			JSONSchema: newSchema.JSON,
			uiSchema: newSchema.UI
		})
	}

	updateSchema = () => {
		const { 
			stringJSONSchema,
			stringUISchema,
			defaultJSONSchema, 
			defaultUISchema 
		} = this.state
		let newSchema = { JSON: defaultJSONSchema, UI: defaultUISchema }
		try {
			newSchema = { 
				JSON: JSON.parse(stringJSONSchema), 
				// UI: JSON.parse(stringUISchema) 
			}
		} catch (err) {
			alert('JSON schema is not valid\nError : ' + err)
			// uncomment code below to apply default config if 
			// user try to preview or save invalid JSON
			// if (err) this.handleDefaultConfig()
		} 

		return newSchema
	}

	handleSaveApplySchema = () => {
		// const config = this.updateConfig()
		// const { saveSidenavConfig, setSidenavFromConfig } = this.props
		// this.handlePreviewConfig()
		// saveSidenavConfig(config)
		// setSidenavFromConfig([], config.groupLinks)
	}

	render() {
		const { 
			collectionName, 
			stringUIschema,
			stringJSONschema,
			uiSchema,
			JSONSchema 
		} = this.state

		console.log('stringUIschema = ', stringUIschema)
		console.log('stringJSONschema = ', stringJSONschema)
		console.log('uiSchema = ', uiSchema)
		console.log('JSONSchema = ', JSONSchema)

	  return (
			<div className="row design-form-page">
				<div className="col s12 title">
					<h5>Design {collectionName} form</h5>
				</div>
				<div className="col s4">
					<div id="form-preview">
			  		<div className="json-form">
							<Form 
								uiSchema={uiSchema}
								schema={JSONSchema}
			        	// onSubmit={this.onSubmit.bind(this)}
			        	// onError={this.log("errors")} 
			        />
			      </div>
			  	</div>
				</div>
				<div className="col s6">
          <span className="left"><strong>JSON schema</strong></span>
          <textarea 
          	id="textarea-form-json-schema" 
          	value={stringJSONschema}
          	onChange={this.handleChangeJSONschema}
          	ref={this.textareaJSONschema}
          	onKeyDown={e => this.handleTabPressedOnJSONTextarea(e, this.textareaJSONschema.current)} 
          />
          <span className="left"><strong>UI schema</strong></span>
          <textarea 
          	id="textarea-form-ui-schema" 
          	value={stringUIschema}
          	onChange={this.handleChangeUIschema}
          	ref={this.textareaUIschema}
          	onKeyDown={e => this.handleTabPressedOnJSONTextarea(e, this.textareaUIschema.current)} 
          />
				</div>
				<div className="col s2 btn-actions">
					<span className="waves-effect waves-light btn" onClick={this.handleDefaultSchema}>Default</span>
					<span className="waves-effect waves-light btn" onClick={this.handlePreviewSchema}>Preview</span>
					<span className="waves-effect waves-light btn" onClick={this.handleSaveApplySchema}>Save & Apply</span>
				</div>
			</div>
	  )
	}
}

const mapStateToProps = (state) => {
  return {
  	
  }
}

const mapDispatchToProps = (dispatch) => {
	return {
		// setDefaultNavItem: () => dispatch(ACT.setDefaultNavItem()),
		// setCollectionNavItem: () => dispatch(ACT.setCollectionNavItem()),
		// loadCollectionNavItemLinks: () => dispatch(ACT.loadCollectionNavItemLinks())
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DesignForm)

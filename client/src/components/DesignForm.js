import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import queryString from 'query-string'
import M from 'materialize-css/dist/js/materialize.min.js'
import Form from 'react-jsonschema-form'

import API_URL from '../utils/api_url'
import './DesignForm.css'

class DesignForm extends Component {
	constructor(props) {
		super(props)

		this.state = {
			collectionName: '',
			stringUIschema: '',
			defaultUIschema: {},
			uiSchema: {},
			stringJSONschema: '',
			defaultJSONschema: { title: 'Form', type: "object", properties: {} },
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
			const schema = res.data.data
			const stringJSONschema = this.stringifyPrettyJSON(schema)
			
			const uiSchema = Object.keys(schema.properties).reduce((obj, key) => {
				if (schema.properties[key].type !== 'boolean') {
					return {...obj, [key] : { ['ui:widget']: 'text' }}
				} else {
					return {...obj, [key] : {}}
				}
			}, {})
			
			const stringUIschema = this.stringifyPrettyJSON(uiSchema)

			this.setState({
				collectionName: res.data.collectionName,
				JSONSchema: schema,
				defaultJSONschema: schema,
				uiSchema,
				defaultUIschema: uiSchema,
				stringJSONschema,
				stringUIschema
			})
		})
		.catch(e => console.error(e))
	}

	componentDidMount() {
		M.AutoInit()
	}

	log = (type) => console.log.bind(console, type)

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
		const { defaultJSONschema, defaultUIschema } = this.state
		const stringJSONschema = this.stringifyPrettyJSON(defaultJSONschema)
		const stringUIschema = this.stringifyPrettyJSON(defaultUIschema)
		
		this.setState({
			JSONSchema: defaultJSONschema,
			uiSchema: defaultUIschema,
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
			stringJSONschema,
			stringUIschema,
			defaultJSONschema, 
			defaultUIschema 
		} = this.state
		let newSchema = { JSON: defaultJSONschema, UI: defaultUIschema }
		try {
			newSchema = { 
				JSON: JSON.parse(stringJSONschema), 
				UI: JSON.parse(stringUIschema)
			}
		} catch (err) {
			alert('JSON schema is not valid\nError : ' + err)
			// uncomment code below to apply default config if 
			// user try to preview or save invalid JSON
			// if (err) this.handleDefaultSchema()
		} 
		
		return newSchema
	}

	handleSaveApplySchema = () => {
		const schema = this.updateSchema()
		this.handlePreviewSchema()

		this.saveFormSchema(schema)
		this.redirectToFormDesigner()
	}

	saveFormSchema(schema) {
		const { id } = queryString.parse(this.props.location.search)
		axios.patch(`${API_URL}/update-form-schema?id=${id}`, schema)
		.then(res => 
			M.toast({ html: res.data.message }))
		.catch(err => console.error(err))
	}

	handleCancel = () => {
		this.redirectToFormDesigner()
	}

	redirectToFormDesigner = () => {
		const { id } = queryString.parse(this.props.location.search)
		this.props.history.push(`/form-designer?id=${id}`)
	}

	render() {
		const { 
			collectionName, 
			stringUIschema,
			stringJSONschema,
			uiSchema,
			JSONSchema 
		} = this.state

	  return (
			<div className="row design-form-page">
				<div className="col s12 title">
					<h5>Design {collectionName} form</h5>
				</div>
				<div className="col s4">
					<div id="form-preview">
			  		<div className="design-form-page-json-form">
							<Form 
								uiSchema={uiSchema}
								schema={JSONSchema}
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
					<span className="waves-effect waves-light btn" onClick={this.handleCancel}>Cancel</span>
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

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DesignForm)

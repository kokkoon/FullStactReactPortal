import React, { Component } from 'react'
import axios from 'axios'
import queryString from 'query-string'
import M from 'materialize-css/dist/js/materialize.min.js'
import Form from 'react-jsonschema-form'

import { arrayFieldTemplate } from '../../utils/jsonSchemaFormUITemplate'
import * as helper from '../../utils/helperFunctions'
import API_URL from '../../utils/api_url'
import './DesignForm.css'

export default class DesignForm extends Component {
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
								ArrayFieldTemplate={arrayFieldTemplate}
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
          	onKeyDown={e => helper.handleTabPressedOnJSONTextarea(e, this.textareaJSONschema.current)} 
          />
          <span className="left"><strong>UI schema</strong></span>
          <textarea 
          	id="textarea-form-ui-schema" 
          	value={stringUIschema}
          	onChange={this.handleChangeUIschema}
          	ref={this.textareaUIschema}
          	onKeyDown={e => helper.handleTabPressedOnJSONTextarea(e, this.textareaUIschema.current)} 
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

	componentWillMount() {
		this.loadData()
	}

	componentDidMount() {
		M.AutoInit()
	}

	loadData() {
		const { location } = this.props
		const formId = location.search.slice(4)

		axios.get(`${API_URL}/form?id=${formId}`)
		.then(res => {
			const schema = res.data.data
			const stringJSONschema = helper.stringifyPrettyJSON(schema)
			let uiSchema = res.data.uiSchema
			
			if (uiSchema == null) {
				uiSchema = Object.keys(schema.properties).reduce((obj, key) => {
					if (schema.properties[key].type !== 'boolean') {
						 // eslint-disable-next-line 
						return {...obj, [key] : { ['ui:widget']: 'text' }}
					} else {
						return {...obj, [key] : {}}
					}
				}, {})
			}
				
			const stringUIschema = helper.stringifyPrettyJSON(uiSchema)

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

	log = (type) => console.log.bind(console, type)

	handleChangeJSONschema = (event) => {
		this.setState({ stringJSONschema: event.target.value })
	}

	handleChangeUIschema = (event) => {
		this.setState({ stringUIschema: event.target.value })
	}

	handleDefaultSchema = () => {
		const { defaultJSONschema, defaultUIschema } = this.state
		const stringJSONschema = helper.stringifyPrettyJSON(defaultJSONschema)
		const stringUIschema = helper.stringifyPrettyJSON(defaultUIschema)
		
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
}

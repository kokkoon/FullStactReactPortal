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
			stringJSONschema: '',
			defaultJSONschema: { title: 'Form', type: "object", properties: {} },
			JSONSchema: { title: 'Form', type: "object", properties: {} },
			stringUIschema: '',
			defaultUIschema: {},
			uiSchema: {},
			stringFormData: '',
			defaultFormData: {},
			formData: {}
		}

		this.textareaUIschema = React.createRef()
		this.textareaJSONschema = React.createRef()
		this.textareaFormData = React.createRef()
	}

	render() {
		const { 
			collectionName, 
			stringJSONschema,
			stringUIschema,
			stringFormData,
			JSONSchema,
			uiSchema,
			formData
		} = this.state

	  return (
			<div className="row design-form-page">
				<div className="col s6 title left-align">
					<h5 className="zero-margin">Design {collectionName} form</h5>
				</div>
				<div className="col s6 btn-actions right-align">
					<span className="waves-effect waves-light btn" onClick={this.handleCancel}>Cancel</span>
					<span className="waves-effect waves-light btn" onClick={this.handleDefaultSchema}>Default</span>
					<span className="waves-effect waves-light btn" onClick={this.handlePreviewSchema}>Preview</span>
					<span className="waves-effect waves-light btn" onClick={this.handleSaveApplySchema}>Save & Apply</span>
				</div>
				<div className="col s6">
          <span className="left"><strong>JSON schema</strong></span>
          <textarea 
          	id="textarea-form-json-schema"
          	className="textarea-json"
          	value={stringJSONschema}
          	onChange={this.handleChangeJSONschema}
          	ref={this.textareaJSONschema}
          	onKeyDown={e => helper.handleTabPressedOnJSONTextarea(e, this.textareaJSONschema.current)} 
          />
          <div className="UI-schema-container col s6">
	          <span className="left"><strong>UI schema</strong></span>
	          <textarea 
	          	id="textarea-form-ui-schema"
	          	className="textarea-json"
	          	value={stringUIschema}
	          	onChange={this.handleChangeUIschema}
	          	ref={this.textareaUIschema}
	          	onKeyDown={e => helper.handleTabPressedOnJSONTextarea(e, this.textareaUIschema.current)} />
					</div>
					<div className="form-data-container col s6">
	          <span className="left"><strong>Form data</strong></span>
	          <textarea 
	          	id="textarea-form-data"
	          	className="textarea-json"
	          	value={stringFormData}
	          	onChange={this.handleChangeFormData}
	          	ref={this.textareaFormData}
	          	onKeyDown={e => helper.handleTabPressedOnJSONTextarea(e, this.textareaFormData.current)} />
					</div>
				</div>
				<div className="col s6">
					<div id="form-preview">
			  		<div className="design-form-page-json-form">
							<Form 
								uiSchema={uiSchema}
								schema={JSONSchema}
								formData={formData}
								ArrayFieldTemplate={arrayFieldTemplate}
								onChange={this.handleChangeFormPreviewData}
			        />
			      </div>
			  	</div>
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
				collectionName: res.data.collectionDisplayName,
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

	handleChangeJSONschema = ({ target }) => {
		this.setState({ stringJSONschema: target.value })
	}

	handleChangeUIschema = ({ target }) => {
		this.setState({ stringUIschema: target.value })
	}

	handleChangeFormData = ({ target }) => {
		this.setState({ stringFormData: target.value })
	}

	handleDefaultSchema = () => {
		const { defaultJSONschema, defaultUIschema, defaultFormData } = this.state
		const stringJSONschema = helper.stringifyPrettyJSON(defaultJSONschema)
		const stringUIschema = helper.stringifyPrettyJSON(defaultUIschema)
		const stringFormData = helper.stringifyPrettyJSON(defaultFormData)
		
		this.setState({
			JSONSchema: defaultJSONschema,
			stringJSONschema,
			uiSchema: defaultUIschema,
			stringUIschema,
			formData: defaultFormData,
			stringFormData
		})
	}

	handlePreviewSchema = () => {
		const newSchema = this.updateSchema()

		if (!newSchema.error) {
			this.setState({ 
				JSONSchema: newSchema.JSON,
				uiSchema: newSchema.UI,
				formData: newSchema.formData
			})
		}
	}

	updateSchema = () => {
		const { 
			stringJSONschema,
			defaultJSONschema, 
			stringUIschema,
			defaultUIschema,
			stringFormData,
			defaultFormData 
		} = this.state

		let newSchema = { JSON: defaultJSONschema, UI: defaultUIschema, formData: defaultFormData }
		try {
			newSchema = { 
				JSON: JSON.parse(stringJSONschema), 
				UI: JSON.parse(stringUIschema),
				formData: JSON.parse(stringFormData)
			}
		} catch (err) {
			alert('JSON schema is not valid\nError : ' + err)
			return {error: true}
		} 
		
		return newSchema
	}

	handleChangeFormPreviewData = ({ formData }) => {
		this.updateFormData(formData)
	}

	updateFormData = (formData) => {
		const stringFormData = helper.stringifyPrettyJSON(formData)

		this.setState({ formData, stringFormData })
	}

	handleSaveApplySchema = () => {
		const schema = this.updateSchema()

		if (!schema.error) {
			this.handlePreviewSchema()
			this.saveFormSchema(schema)
		}
	}

	saveFormSchema(schema) {
		const { id } = queryString.parse(this.props.location.search)
		axios.patch(`${API_URL}/update-form-schema?id=${id}`, schema)
		.then(res => {
			M.toast({ html: res.data.message })
			this.redirectToFormDesigner()
		})
		.catch(err => console.error(err))
	}

	handleCancel = () => {
		this.redirectToFormDesigner()
	}

	redirectToFormDesigner = () => {
		const { location } = this.props
		const { id } = queryString.parse(location.search)
		this.props.history.push(`/form-designer?id=${id}`)
	}
}

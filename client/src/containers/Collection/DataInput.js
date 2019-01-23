import React, { Component } from 'react'
import axios from 'axios'
import queryString from 'query-string'
import lodash from 'lodash'
import Form from 'react-jsonschema-form'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../../utils/api_url'
import { arrayFieldTemplate } from '../../utils/jsonSchemaFormUITemplate'
import { dataURLtoBlob } from '../../utils/helperFunctions'
import './DataInput.css'

class DataInput extends Component {
	constructor(props) {
		super(props)

		this.state = {
			formStructure: { title: 'Form', type: "object", properties: {} },
			uiSchema: {}
		}
	}	

	render() {
		const { formStructure, uiSchema } = this.state
		return (
			<div className="form-input">
				<h5>Input form</h5>
				<div className="json-form">
					<Form 
						schema={formStructure}
						uiSchema={uiSchema}
	        	onSubmit={this.onSubmit.bind(this)}
	        	ArrayFieldTemplate={arrayFieldTemplate}
	        	onError={this.log("errors")} />
	      </div>
			</div>
		)
	}

	componentWillMount() {
		const { location } = this.props
		const formId = location.search.slice(4)

		this.loadFormData(formId)
	}

	loadFormData (formId) {
		axios.get(`${API_URL}/form?id=${formId}`)
			.then(res => {
				const {
					data: formStructure, 
					uiSchema, 
					createdActionAPI
				} = res.data

				this.setState({
					formStructure,
					uiSchema,
					createdActionAPI
				})
			})
			.catch(e => console.error(e))
	}
	 
	log = (type) => console.log.bind(console, type)

	onSubmit = ({ formData }) => {
		if (formData.file) {
			const { file } = formData
			const nameStartIdx = file.indexOf(';name=') + 6
			const nameEndIdx = file.indexOf(';base64,')
			const filename = file.slice(nameStartIdx, nameEndIdx)

			const sBoundary = "---------------------------" + Date.now().toString(16)

			const formFile = new FormData()
			formFile.append("file", dataURLtoBlob(file), filename)

			// upload attachment file
			axios.post(`${API_URL}/upload`, formFile, {headers: {'content-type': `multipart/form-data; boundary=${sBoundary}`}})
				.then(res => {
					const { filename, fileId, contentType, message } = res.data

					M.toast({ html: message })
					
					// submit form data fields
					let formFields = lodash.omit(formData, ['file'])
					formFields.filename = filename
					formFields.fileId = fileId
					formFields.contentType = contentType
					this.submitFormFields(formFields)
				})
				.catch(err => console.log(err))
		} else {
			this.submitFormFields(formData)
		}
	}

	submitFormFields (formFields) {
		const { createdActionAPI } = this.state
		const { location } = this.props
		const { id: formId } = queryString.parse(location.search)

		// submit form data fields
		axios.post(`${API_URL}/record?id=${formId}`, formFields)
			.then(res => {
				if (res.data.success) {
					M.toast({ html: 'Data submitted' })

					// call event api after saving data to database
					if (createdActionAPI.isActive && createdActionAPI.url) {
						axios.post(`${API_URL}/call-events-api?form_id=${formId}&action_type=created`, formFields)
							.then(res2 => {
								// redirect to collection page						
								this.props.history.push(`/collection?id=${formId}`)
							})
							.catch(err2 => console.error(err2))
					} else {
						this.props.history.push(`/collection?id=${formId}`)
					}
				}
			})
			.catch(err => console.log(err))
	}
}

export default DataInput

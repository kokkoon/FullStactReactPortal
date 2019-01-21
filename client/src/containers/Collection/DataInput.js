import React, { Component } from 'react'
import axios from 'axios'
import Form from 'react-jsonschema-form'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../../utils/api_url'
import { arrayFieldTemplate } from '../../utils/jsonSchemaFormUITemplate'
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

	onSubmit = (form) => {
		const { createdActionAPI } = this.state
		const { location } = this.props
		const formId = location.search.slice(4)
		const { formData } = form

		axios.post(`${API_URL}/record?id=${formId}`, formData)
			.then(res => {
				if (res.data.success) {
					M.toast({ html: 'Data submitted' })

					// call event api after saving data to database
					if (createdActionAPI.isActive && createdActionAPI.url) {
						axios.post(`${API_URL}/call-events-api?form_id=${formId}&action_type=created`, formData)
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

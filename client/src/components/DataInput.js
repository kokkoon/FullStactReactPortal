import React, { Component } from 'react'
import axios from 'axios'
import Form from 'react-jsonschema-form'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../utils/api_url'
import './DataInput.css'

class DataInput extends Component {
	constructor(props) {
		super(props)

		this.state = {
			formStructure: { title: 'Form', type: "object", properties: {} }
		}
	}

	componentWillMount() {
		const { location } = this.props
		const formId = location.search.slice(4)

		axios.get(`${API_URL}/form?id=${formId}`)
			.then(res => {
				this.setState({
					formStructure: res.data.data
				})
			})
			.catch(e => console.error(e))
	}
	 
	log = (type) => console.log.bind(console, type)

	onSubmit = (form) => {
		const { location } = this.props
		const formId = location.search.slice(4)
		const { formData } = form

		axios.post(`${API_URL}/record?id=${formId}`, formData)
			.then(res => {
				if (res.data.success) {
					M.toast({ html: 'Data submitted' })

					// call event api after saving data to database
					axios.post(`${API_URL}/call-events-api?form_id=${formId}&action_type=created`, formData)
					.then(res2 => {
						// redirect to collection page						
						window.location = `/collection?id=${formId}`
					})
					.catch(e2 => console.error(e2))
				}
			})
			.catch(err => console.log(err))
	}

	

	render() {
		const { formStructure } = this.state

		return (
			<div className="form-input">
				<h5>Input form</h5>
				<div className="json-form">
					<Form 
						schema={formStructure}
	        	onSubmit={this.onSubmit.bind(this)}
	        	onError={this.log("errors")} />
	      </div>
			</div>
		)
	}
}

export default DataInput;

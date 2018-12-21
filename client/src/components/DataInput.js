import React, { Component } from 'react'
import axios from 'axios'
import Form from 'react-jsonschema-form'

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

		axios.get(`http://localhost:5000/form?id=${formId}`)
			.then(res => {
				this.setState({
					formStructure: res.data.data
				})
			})
			.catch(e => console.error(e))
	}
	 
	log = (type) => console.log.bind(console, type)

	onSubmit = (formData) => {
		const { location } = this.props
		const formId = location.search.slice(4)

		axios.post(`${API_URL}/record?id=${formId}`, formData.formData)
			.then(res => console.log(res))
			.catch(err => console.log(err))
	}

	render() {
		const { formStructure } = this.state

		return (
			<div className="center form-input">
				<h3>Input form</h3>
				<Form 
					schema={formStructure}
        	onSubmit={this.onSubmit.bind(this)}
        	onError={this.log("errors")} />
			</div>
		)
	}
}

export default DataInput;

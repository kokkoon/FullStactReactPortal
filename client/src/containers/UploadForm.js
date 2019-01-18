import React, { Component } from 'react'
import axios from 'axios'
import Form from 'react-jsonschema-form'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../utils/api_url'
import './UploadForm.css'

class UploadForm extends Component {
	constructor(props) {
		super(props)

		this.state = {
			formStructure: { 
				title: 'Form', 
				type: "object", 
				properties: {
					"file": {
			      "type": "string",
			      "format": "data-url",
			      "title": "Single file"
			    },
				} 
			}
		}
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
	      <p id="file">

	      </p>
			</div>
		)
	}
	 
	log = (type) => console.log.bind(console, type)

	onSubmit = ({ formData }) => {
		const file = formData.file
		const startIdx = file.indexOf('base64,') + 7
		const content = file.slice(startIdx)
		document.getElementById('file').innerHTML = atob(content)
	}
}

export default UploadForm;

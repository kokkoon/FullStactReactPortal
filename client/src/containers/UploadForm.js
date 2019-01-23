import React, { Component } from 'react'
import axios from 'axios'
import Form from 'react-jsonschema-form'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../utils/api_url'
import { dataURLtoBlob, downloadURI } from '../utils/helperFunctions'
import './UploadForm.css'

class UploadForm extends Component {
	constructor(props) {
		super(props)

		this.state = {
			files: undefined,
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
		const { files, formStructure } = this.state

		return (
			<div className="form-input">
				<h5>Input form</h5>
				<div className="json-form">
					<Form 
						schema={formStructure}
	        	onSubmit={this.onSubmit.bind(this)}
	        	onError={this.log("errors")} />
	      </div>
	      {
	      	files &&
	      	files.map((file, index) => (
			      <p>
			      	<a 
				      	href="#"
				      	onClick={e => this.downloadFile(file.filename, file.contentType)}>
				      	download {file.filename.slice(33)}
				      </a>
			      </p>
	      	))
	      }
			</div>
		)
	}

	downloadFile = (filename, contentType) => {
		axios.get(`${API_URL}/download?filename=${filename}`, {responseType: 'arraybuffer'})
			.then(res => {
				const file = new Blob([res.data], { type: contentType });
      	const fileURL = URL.createObjectURL(file);
      	const originalName = filename.slice(33)

      	downloadURI(fileURL, originalName)
			})
			.catch(err => console.log(err))
	}

	componentWillMount() {
		axios.get(`${API_URL}/files`)
			.then(res => {
				console.log('res = ', res)
				this.setState({ files: res.data })
			})
			.catch(err => console.log(err))
	}

	componentDidMount() {
		M.AutoInit()
	}
	 
	log = (type) => console.log.bind(console, type)

	onSubmit = ({ formData }) => {
		const file = formData.file
		const nameStartIdx = file.indexOf(';name=') + 6
		const nameEndIdx = file.indexOf(';base64,')
		const filename = file.slice(nameStartIdx, nameEndIdx)
		const filetype = file.slice(5, nameStartIdx - 6)

		const sBoundary = "---------------------------" + Date.now().toString(16)

		const fd = new FormData()
		fd.append("file", dataURLtoBlob(file), filename)

		axios.post(`${API_URL}/upload`, fd, {headers: {'content-type': `multipart/form-data; boundary=${sBoundary}`}})
			.then(res => {
				M.toast({ html: res.data.message })
			})
			.catch(err => console.log(err))
	}
}

export default UploadForm;

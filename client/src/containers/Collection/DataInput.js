import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import queryString from 'query-string'
import lodash from 'lodash'
import Form from 'react-jsonschema-form'
import M from 'materialize-css/dist/js/materialize.min.js'

import { arrayFieldTemplate } from '../../utils/jsonSchemaFormUITemplate'
import { dataURLtoBlob, getDataFromStringPattern } from '../../utils/helperFunctions'
import API_URL from '../../utils/api_url'
import * as ACT from '../../actions'
import './DataInput.css'

class DataInput extends Component {
	constructor(props) {
		super(props)

		this.state = {
			formStructure: { title: 'Form', type: "object", properties: {} },
			uiSchema: {},
			clientUploadProgress: 0,
			totalSize: 0,
			second: 0
		}
	}

	render() {
		const { 
			formStructure, 
			uiSchema,
			clientUploadProgress
		} = this.state

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

	      <div id="modal-upload-progress" className="modal">
          <div className="modal-content center">
            <h4>Upload progress</h4>
            <p>Uploading: {this.countUploadProgress()}%</p>
            {
            	clientUploadProgress === 100 &&
            	<p>Please wait a moment until upload process to database completed in server side and this modal will close automatically</p>
            }
          </div>
        </div>
			</div>
		)
	}

	componentWillMount() {
		const { location } = this.props
		const formId = location.search.slice(4)

		this.loadCollectionList()
		this.loadFormData(formId)
	}

	componentDidMount() {
		M.AutoInit()
	}

	componentWillUnmount() {
		clearInterval(this.timer)
	}

	loadCollectionList () {
		const { setCollectionList } = this.props

		axios.get(`${API_URL}/collection-list`)
			.then(res => {
				setCollectionList(res.data.data)
			})
	}

	loadFormData (formId) {
		axios.get(`${API_URL}/form?id=${formId}`)
			.then(res => {
				const {
					data: formStructure, 
					uiSchema, 
					createdActionAPI
				} = res.data

				const newFormStructure = this.replaceDefaultValueStringPatternWithData(formStructure)

				this.setState({
					formStructure: newFormStructure,
					uiSchema,
					createdActionAPI
				})
			})
			.catch(e => console.error(e))
	}

	replaceDefaultValueStringPatternWithData (formStructure) {
		let newFormStructure = {...formStructure}
		const properties = newFormStructure.properties

		newFormStructure.properties = Object.keys(properties).reduce((obj, key) => {
			const value = properties[key]
			let newProperty = {[key] : value}

			if (value.type !== 'array') {
				const dataCheck = getDataFromStringPattern(value.default)

				if (dataCheck.isPatternExist) {
					const dataPath = dataCheck.data.split('.')
					const categoryGroup = dataPath[0]
					const category = dataPath[1]
					const field = dataPath[2]
					let newDefaultValue = 'not found'

					if (categoryGroup === 'user') {
						const { user } = this.props
						newDefaultValue = user[field]
					} 
					else if (categoryGroup === 'collection') {
						const { collectionList } = this.props
						const collectionIdx = collectionList.findIndex(collection => collection.id === category)
						const collection = collectionList[collectionIdx]
						const fieldIdx = collection.fields.findIndex(f => f.fieldName === field)

						if (fieldIdx > -1) {
							newDefaultValue = collection.fields[fieldIdx].defaultValue
						}
					}

					newProperty = {
						[key] : {
							...value,
							default: newDefaultValue
						}
					}
				}
			}

			return {
				...obj,
				...newProperty
			}
		}, {})

		return newFormStructure
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

			// open progress modal
	    let modal = document.getElementById('modal-upload-progress')
    	M.Modal.getInstance(modal).open()

    	this.timer = setInterval(() => {
    		this.setState({ second: this.state.second + 1 })
    	}, 1000)

			// upload attachment file
			const config = {
				headers: {'content-type': `multipart/form-data; boundary=${sBoundary}`},
	    	onUploadProgress: progressEvent => {
	    		const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        	this.setState({ 
        		totalSize: progressEvent.total,
        		clientUploadProgress: progress
        	})
	    	}
			}

			axios.post(`${API_URL}/upload`, formFile, config)
				.then(res => {
					const { filename, fileId, contentType, size, message } = res.data

					// close progress modal
			    let modal = document.getElementById('modal-upload-progress')
			    M.Modal.getInstance(modal).close()

					M.toast({ html: message })
					
					// submit form data fields
					let formFields = lodash.omit(formData, ['file'])
					formFields = {...formFields, filename, fileId, contentType, size}
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
					if (createdActionAPI && createdActionAPI.isActive && createdActionAPI.url) {
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

	countUploadProgress = () => {
		const { totalSize, second } = this.state

		// used 125000bytes/second as average upload speed
		const progress = Math.round((125000 * second) / totalSize * 100)
		return progress < 100 ? progress : 100
	}
}

const mapStateToProps = ({ user, form }) => ({
	user, 
	collectionList: form.collectionList
})

const mapDispatchToProps = (dispatch) => ({
	setCollectionList: (collections) => dispatch(ACT.setCollectionList(collections))
})

export default connect(mapStateToProps, mapDispatchToProps) (DataInput)

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

		this.loadFormData(formId)
		this.props.setDummyManagerAndDepartment()
	}

	componentDidMount() {
		M.AutoInit()

		const delay = setInterval(() => {
			const selects = document.getElementsByTagName('SELECT')
			if (selects.length > 0) {
				for (let i = 0; i < selects.length; i++) {
					selects[i].classList.add('browser-default')
					this.found = true
				}
			}
			if (this.found) clearInterval(delay)
		}, 500)
	}

	componentWillUnmount() {
		clearInterval(this.timer)
	}

	loadFormData (formId) {
		axios.get(`${API_URL}/form?id=${formId}`)
			.then(res => {
				const {
					data: formStructure, 
					uiSchema, 
					createdActionAPI
				} = res.data

				const promisedStructure = this.replaceDefaultValueStringPatternWithData(formStructure)
				promisedStructure.then(newFormStructure => {
					this.setState({
						formStructure: newFormStructure,
						uiSchema,
						createdActionAPI
					})
				})
			})
			.catch(e => console.error(e))
	}

	replaceDefaultValueStringPatternWithData (formStructure) {
		let newFormStructure = {...formStructure}
		const properties = newFormStructure.properties

		const promisedProperties = Object.keys(properties).reduce(async (obj, key) => {
			const value = properties[key]
			let newProperty = { [key] : value }

			if (value.type !== 'array') {
				const dataCheck = getDataFromStringPattern(value.default)

				if (dataCheck.isPatternExist) {
					const dataPath = dataCheck.data.split('.')
					const categoryGroup = dataPath[0]

					let enum_array = []
					let newDefaultValue = 'data not found: ' + value.default

					if (categoryGroup === 'user') {
						const field = dataPath[2]
						const { user } = this.props

						newDefaultValue = user[field]
					} 
					else if (categoryGroup === 'collection') {
						const category = dataPath[1]
						const field = dataPath[2]
						const recordId = dataPath[3]

						if (field === 'key') {
							enum_array = await axios.get(`${API_URL}/record?id=${category}&record_id=${recordId}`)
								.then(res => res.data.enum.map(item => item.field))
							console.log('enum_array = ', enum_array)
							newDefaultValue = enum_array[0]
						} else {
							newDefaultValue = await axios.get(`${API_URL}/record?id=${category}&record_id=${recordId}`)
								.then(res => res.data[field])
						}
					}
					else if (categoryGroup === 'date') {
						const datePattern = dataPath[1].split(':')

						if (datePattern[0] === 'today') {
							const today = new Date()
							const offset = Number(datePattern[1])

							let year = today.getYear() + 1900
							let month = today.getMonth()
							let date = today.getDate() + offset

							const targetDate = new Date(year, month, date)

							year = targetDate.getYear() + 1900
							month = targetDate.getMonth() + 1
							date = targetDate.getDate()

							date = date < 10 ? '0' + date : date
							month = month < 10 ? '0' + month : month

							newDefaultValue = `${year}-${month}-${date}`
						}
					}

					newProperty = {
						[key] : {
							...value,
							default: newDefaultValue
						}
					}

					if (enum_array.length > 0) {
						newProperty = {
							...newProperty,
							[key] : {
								...newProperty[key],
								enum: enum_array
							}
						}
					}
				}
			}
			else if (value.type === 'array') {
				let newItems = { ...value.items }
				const itemProperties = newItems.properties

				const promisedItemProperties = Object.keys(itemProperties).reduce(async (itemObj, itemKey) => {
					const itemValue = itemProperties[itemKey]
					let newItemProperty = { [itemKey] : itemValue }

					const dataCheck = getDataFromStringPattern(itemValue.default)

					if (dataCheck.isPatternExist) {
						const dataPath = dataCheck.data.split('.')
						const categoryGroup = dataPath[0]

						let enum_array = []
						let newItemDefaultValue = 'data not found: ' + itemValue.default

						if (categoryGroup === 'user') {
							const { user } = this.props
							const field = dataPath[2]
							newItemDefaultValue = user[field]
						} 
						else if (categoryGroup === 'collection') {
							const category = dataPath[1]
							const field = dataPath[2]
							const recordId = dataPath[3]

							if (field === 'key') {
								enum_array = await axios.get(`${API_URL}/record?id=${category}&record_id=${recordId}`)
									.then(res => res.data.enum.map(item => item.field))
								newItemDefaultValue = enum_array[0]
							} else {
								newItemDefaultValue = await axios.get(`${API_URL}/record?id=${category}&record_id=${recordId}`)
									.then(res => res.data[field])
							}
						}
						else if (categoryGroup === 'date') {
							const datePattern = dataPath[1].split(':')

							if (datePattern[0] === 'today') {
								const today = new Date()
								const offset = Number(datePattern[1])

								let year = today.getYear() + 1900
								let month = today.getMonth()
								let date = today.getDate() + offset

								const targetDate = new Date(year, month, date)

								year = targetDate.getYear() + 1900
								month = targetDate.getMonth() + 1
								date = targetDate.getDate()

								date = date < 10 ? '0' + date : date
								month = month < 10 ? '0' + month : month

								newItemDefaultValue = `${year}-${month}-${date}`
							}
						}

						newItemProperty = {
							[itemKey] : {
								...itemValue,
								default: newItemDefaultValue
							}
						}

						if (enum_array.length > 0) {
							newItemProperty = {
								...newItemProperty,
								[itemKey] : {
									...newItemProperty[itemKey],
									enum: enum_array,
								}
							}
						}
					}

					return itemObj.then(promisedItemObj => ({
						...promisedItemObj,
						...newItemProperty
					}))
				}, Promise.resolve({}))

				newProperty = await promisedItemProperties.then(newItemProperties => {
					newProperty = {
						[key] : {
							...value,
							items: {
								...value.items,
								properties: newItemProperties
							}
						}
					}
					return newProperty
				})
			}

			return obj.then(promisedObj => ({
					...promisedObj,
					...newProperty
			}))
		}, Promise.resolve({}))

		return promisedProperties.then(newProperties => {
			newFormStructure.properties = newProperties
			return newFormStructure
		})
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
	user
})

const mapDispatchToProps = (dispatch) => ({
	setDummyManagerAndDepartment: () => dispatch(ACT.setDummyManagerAndDepartment())
})

export default connect(mapStateToProps, mapDispatchToProps) (DataInput)

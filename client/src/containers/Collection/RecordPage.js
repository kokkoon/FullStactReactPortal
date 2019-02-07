import React, { Component } from 'react'
import axios from 'axios'
import queryString from 'query-string'
import Form from 'react-jsonschema-form'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../../utils/api_url'
import { getDataFromStringPattern } from '../../utils/helperFunctions'
import { arrayFieldTemplate } from '../../utils/jsonSchemaFormUITemplate'
import './RecordPage.css'

class RecordPage extends Component {
	constructor(props) {
		super(props)

		this.state = {
			formStructure: { title: 'Form', type: "object", properties: {} },
			uiSchema: {},
			formData: {}
		}
	}

	render() {
		const { 
			formStructure,
			uiSchema,
			formData
		} = this.state

		return (
			<div className="record-page">
				<div className="form-input">
					<div className="left-align">
						<h5>Record page</h5>
					</div>
					<div className="json-form">
						<Form 
							schema={formStructure}
							uiSchema={uiSchema}
		        	ArrayFieldTemplate={arrayFieldTemplate}
		        	formData={formData}
		        	onChange={this.onChange.bind(this)}
		        	onSubmit={this.onSubmit.bind(this)}
		        	onError={this.log("errors")} />
		      </div>
	      </div>
			</div>
		)
	}

	componentWillMount() {
		const { location } = this.props
		const { form_id, record_id } = queryString.parse(location.search)

		this.loadForm(form_id, record_id)
	}

	componentDidMount() {
		M.AutoInit()

		// fix hidden dropdown select due to materializecss override script
		// by adding 'browser-default' class
		const delay = setInterval(() => {
			const selects = document.getElementsByTagName('SELECT')

			if (selects.length > 0) {
				for (let i = 0; i < selects.length; i++) {
					selects[i].classList.add('browser-default')
					this.isFoundSelectElement = true
				}
			}

			if (this.isFoundSelectElement) clearInterval(delay)
		}, 100)
	}

	componentWillUnmount() {
		clearInterval(this.timer)
	}

	loadForm (formId, recordId) {
		axios.get(`${API_URL}/form?id=${formId}`)
			.then(res => {
				const {
					data: formStructure, 
					uiSchema, 
					modifiedActionAPI
				} = res.data

				this.setState({
					uiSchema,
					modifiedActionAPI
				})

				const promisedStructure = this.addEnumStructure(formStructure)
				promisedStructure.then(newFormStructure => {
					this.setState({
						formStructure: newFormStructure
					})
				})
			})
			.catch(e => console.error(e))

		axios.get(`${API_URL}/record?id=${formId}&record_id=${recordId}`)
			.then(res => {
				this.setState({
					formData: res.data
				})
			})
			.catch(e => console.error(e))
	}

	addEnumStructure (formStructure) {
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
					const category = dataPath[1]
					const field = dataPath[2]
					const recordId = dataPath[3]
					
					if (categoryGroup === 'collection' && field === 'key') {
						let enum_array = []

						enum_array = await axios.get(`${API_URL}/record?id=${category}&record_id=${recordId}`)
							.then(res => res.data.enum.map(item => item.field))

						newProperty = {
							[key] : {
								...value,
								default: enum_array[0],
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

	onChange = (props) => {
		const columnToSumEl = document.getElementById('sum-column-name')
		const columnToSum = columnToSumEl ? columnToSumEl.value : ''
		const total = this.countValuesOnCells(columnToSum, props)
		const totalCell = document.getElementById('total-amount-array-items')
		if (totalCell) totalCell.innerHTML = total
	}

	countValuesOnCells = (targetProperty, props) => {
		const properties = props.schema.properties
		let total = 0

		Object.keys(properties).forEach(key => {
			if (properties[key].type === 'array') {
				Object.keys(properties[key].items.properties).forEach(key2 => {
					if (key2 === targetProperty && properties[key].items.properties[key2].type === 'number') {
						const cells = Array.prototype.slice.call(document.getElementsByClassName(`${key2}-cell`))
						cells.forEach(cell => {
							const input = cell.children[0].children[0].children[0].children[2]
							if (input) total += Number(input.value)
						})
					}
				})
			}
		})

		return total
	}

	onSubmit = ({ formData }) => {
		this.submitFormFields(formData)
	}

	submitFormFields (formFields) {
		const { modifiedActionAPI } = this.state
		const { location } = this.props
		const { form_id, record_id } = queryString.parse(location.search)

		// submit form data fields
		axios.post(`${API_URL}/update-record?form_id=${form_id}&record_id=${record_id}`, formFields)
			.then(res => {
				M.toast({ html: res.data.message })

				if (res.data.success) {
					// call event api after saving data to database
					if (modifiedActionAPI && modifiedActionAPI.isActive && modifiedActionAPI.url) {
						axios.post(`${API_URL}/call-events-api?form_id=${form_id}&action_type=created`, formFields)
							.then(res2 => {
								// redirect to collection page						
								this.props.history.push(`/collection?id=${form_id}`)
							})
							.catch(err2 => console.error(err2))
					} else {
						this.props.history.push(`/collection?id=${form_id}`)
					}
				}
			})
			.catch(err => console.log(err))
	}
}

export default RecordPage

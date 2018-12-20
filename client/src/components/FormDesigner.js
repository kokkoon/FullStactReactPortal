import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Form from 'react-jsonschema-form'
import M from 'materialize-css/dist/js/materialize.min.js'
import { isEmpty } from 'lodash'

import './FormDesigner.css'

class FormDesigner extends Component {
	constructor(props) {
		super(props);

		this.state = {
			formId: undefined,
			// see formStructure data structure at the bottom of the code
			formStructure: { title: 'New Collection', type: "object", properties: {} },
			message: '',
			input: {
				collectionName: '',
				fieldName: '',
				dataType: '',
				defaultValue: ''
			},
			isNewField: true,
			currentIndex: -1,
			isFieldNameExisted: false,
			// see fields data structure at the bottom of the code
			fields: [],
		}
	}

	componentWillMount() {
		const { location } = this.props
		const id = location.search.slice(4)

		axios.get(`http://localhost:5000/form?id=${id}`)
			.then(res => {
				let { input } = this.state
				const { formId } = res.data
				const formStructure = res.data.data
				const { properties } = formStructure
				let fields = res.data.column

				fields = fields.map(field => { 
					const { fieldName } = field

					// take data type and default value fields from schema
					const derivedFields = Object.keys(properties[fieldName]).reduce((obj, key) => {
							if (key === 'type') {
								return { 
									...obj, 
									dataType : properties[fieldName][key]
								}
							} else if (key === 'default') {
								return { 
									...obj, 
									defaultValue : properties[fieldName][key] 
								}
							} else if (key === 'format' && properties[fieldName][key] === 'date') {
								return { 
									...obj, 
									dataType: properties[fieldName][key] 
								}
							}
						}, {})	

					return {
						...field,
						...derivedFields,
						action: [
							{
								name: 'edit',
								enable: true
							},
							{
								name: 'delete',
								enable: true
							}
						]
					}
				})

				input.collectionName = formStructure.title

				this.setState({
					formId,
					formStructure,
					fields,
					input
				})
			})
			.catch(e => console.error(e))

		// materialize css initialization
		// tooltip
		document.addEventListener('DOMContentLoaded', function() {
	    let elems = document.querySelectorAll('.tooltipped');
	    let instances = M.Tooltip.init(elems);
	  });
		// select
	  document.addEventListener('DOMContentLoaded', function() {
	    let elems = document.querySelectorAll('select');
	    let instances = M.FormSelect.init(elems);
	  });
	}

	handleCheck = (i) => {
		const { fields } = this.state

		fields.map((field, idx) => {
			if (i === idx) {
				field.showInTable = !field.showInTable
			}
		})

		this.setState({ fields })
	}

	handleClickAction = (actionType, index) => {
		let { fields } = this.state

		if (actionType === 'edit') {
			const input = {
				fieldName: fields[index].fieldName,
				dataType: fields[index].dataType,
				defaultValue: fields[index].defaultValue
			}

			fields[index].action = fields[index].action.map(action => ({ ...action, enable: false }))

			this.setState({ 
				input,
				isNewField: false,
				currentIndex: index,
				fields
			})
		} else if (actionType === 'delete') {
			fields.splice(index, 1)
			this.setState({ fields })
		}
	}

	handleAddField = () => {
		const { fields, input } = this.state
		const { fieldName, dataType, defaultValue } = this.state.input
		
		// show new field onto table
		fields.push({
			fieldName, 
			dataType, 
			defaultValue, 
			showInTable: true, 
			action: [
				{
					name: 'edit',
					enable: true
				},
				{
					name: 'delete',
					enable: true
				}
			]
		})

		const emptyInput = {
			fieldName: '',
			dataType: '',
			defaultValue: ''
		}

		this.updateFormStructure(fieldName, dataType, defaultValue)
		this.setState({ 
			input: {...input, ...emptyInput},
			fields 
		})
	}

	updateFormStructure = (fieldName, dataType, defaultValue) => {
		const { formStructure } = this.state

		if (dataType === 'date') {
			formStructure.properties[fieldName] = {
				title: fieldName,
				type: 'string',
				format: dataType,
				default: defaultValue
			}
		} else {
			formStructure.properties[fieldName] = {
				title: fieldName,
				type: dataType,
				default: defaultValue
			}
		}

		this.setState({ formStructure })
	}

	handleUpdateField = () => {
		const { fields, formStructure, currentIndex, input } = this.state
		const { fieldName, dataType, defaultValue } = this.state.input
		
		if (fields[currentIndex].fieldName !== fieldName) {
			delete formStructure[fields[currentIndex].fieldName]
		}
		this.updateFormStructure(fieldName, dataType, defaultValue)
		
		fields[currentIndex] = {
			fieldName, 
			dataType, 
			defaultValue, 
			showInTable: true, 
			action: [
				{
					name: 'edit',
					enable: true
				},
				{
					name: 'delete',
					enable: true
				}
			]
		}

		const emptyInput = {
			fieldName: '',
			dataType: '',
			defaultValue: ''
		}

		this.setState({
			input: {...input, ...emptyInput},
			isNewField: true,
			currentIndex: -1,
			fields
		})
	}

	handleInputChange = (inputType, event) => {
		const { input, fields } = this.state

		switch (inputType) {
			case 'collection_name': 
				input.collectionName = event.target.value
				break

			case 'field_name':
				input.fieldName = event.target.value
				this.setState({ 
					isFieldNameExisted: fields.map(f => f.fieldName).indexOf(event.target.value) >= 0 
				})
				break

			case 'data_type':
				input.dataType = event.target.value
				break

			case 'default_value':
				input.defaultValue = event.target.value
				break

			default:
		}
		
		this.setState({ input	})
	}

	handleCreateCollection = () => {
		const { location } = this.props
		const id = location.search.slice(4)
		const { formStructure, input, fields } = this.state
		const tableColumns = fields.reduce((arr, field) => {
														return [...arr, { fieldName: field.fieldName, showInTable: field.showInTable }]
												 }, [])
		
		formStructure.title = input.collectionName

		axios.post(`http://localhost:5000/create-form?id=${id}`, 
							 { collectionName: input.collectionName, tableColumns, formStructure })
			.then(res => {
				this.setState({
					message: res.data.message
				})
			})
			.catch(err => console.log(err))

		this.setState({ formStructure })
	}

	render() {
		const {
			formId,
			formStructure, 
			formControl, 
			message,
			isNewField, 
			currentIndex,
			fields,
			isFieldNameExisted
		} = this.state

		const {
			collectionName,
			fieldName,
			dataType,
			defaultValue
		} = this.state.input

		const { documentFieldsTableHeader } = this.props

		return (
			<div className="form-designer">
				<h4 className="center">{formId ? 'Update Collection' : 'Create New Collection'}</h4>
				<div className="row">
					<span className="collection-name-label"> Collection name : </span>
					<div className="input-field inline collection-name-input">
						<input id="collection_name" type="text" value={collectionName} onChange={(e) => this.handleInputChange('collection_name', e)}/>
					</div>
					<span className="document-fields-label">Document fields</span>
					<table className="table-collection centered responsive-table">
	          <thead>
	            <tr>
	              { documentFieldsTableHeader.map(header => <th className={header === "Name" ? "left" : ""}>{header}</th>) }
	            </tr>
	          </thead>

	          <tbody>
	            { 
	              !fields && <p> loading .... </p>
	            }
	            { 
	              fields && fields.map((field, index) => (
	                <tr>
	                  <td className="left">{field.fieldName}</td>
	                  <td>{field.dataType}</td>
	                  <td>{field.defaultValue}</td>
	                  <td>
	                  	<label>
								        <input 
								        	type="checkbox" 
								        	className="filled-in" 
								        	checked={field.showInTable? "checked" : ""} 
								        	onClick={this.handleCheck.bind(this, index)} 
								        />
								        <span> </span>
								      </label>
								    </td>
								    <td>
								    {
								    	field.action.map(action => {
								    		if (action.name === 'edit') {
							    				return (
							    			    <a className={action.enable 
							    			    							? "waves-effect waves-light btn btn-action blue lighten-2 tooltipped"
							    			    							: "waves-effect waves-light btn btn-action blue lighten-2 disabled"}
							    			    	 data-position="bottom" 
							    			    	 data-tooltip="edit field"
							    			    	 onClick={this.handleClickAction.bind(this, action.name, index)}
							    			    >
							    			    	<i className="material-icons">{action.name}</i>
							    			    </a>
							    			  )
						    			  } else if (action.name === 'delete') {
						    			  	return (
							    			    <a className={action.enable 
							    			    							? "waves-effect waves-light btn btn-action red lighten-2 tooltipped"
							    			    							: "waves-effect waves-light btn btn-action red lighten-2 disabled"}
							    			    	 data-position="bottom" 
							    			    	 data-tooltip="delete field"
							    			    	 onClick={this.handleClickAction.bind(this, action.name, index)}
							    			    >
							    			    	<i className="material-icons">{action.name}</i>
							    			    </a>
							    			  )
						    			  }
								    	})
								    }
								    </td>
	                </tr>
	              )) 
	            }
	          </tbody>
	        </table>
	        <div className="col s12">
	        	<a className="waves-effect waves-light btn btn-submit right" 
		        	 disabled={isEmpty(formStructure.properties) || isEmpty(collectionName)} 
	        		 onClick={this.handleCreateCollection}>
				    	{formId ? 'Update Collection' : 'Create collection'}
				    </a>
	        </div>
				</div>

				<h5>{message}</h5>

        <div className="add-new-field card-panel indigo lighten-5">
	        <h4 className="center">{isNewField ? 'Add new field' : 'Edit field'}</h4>	
	       	<div className="row">
						<div className="input-field col s6">
							<input id="field_name" type="text" value={fieldName} onChange={(e) => this.handleInputChange('field_name', e)}/>
		          <label for="field_name">Field name</label>
						</div>
						<div className="col s6">
						  <div className="input-field col s12">
						    <select value={dataType} onChange={(e) => this.handleInputChange('data_type', e)}>
						      <option value="">Data type</option>
						      <option value="string">String</option>
						      <option value="number">Number</option>
						      <option value="date">Date</option>
						      <option value="boolean">Boolean</option>
						      <option value="object">Object</option>
						    </select>
						  </div>
						</div>
						<div className="input-field col s6">
							<input id="default_value" type="text" value={defaultValue} onChange={(e) => this.handleInputChange('default_value', e)}/>
		          <label for="default_value">Default value</label>
						</div>
					</div>
					<div className="row btn-add-container">
		        <a className="waves-effect waves-light btn" 
		        	 disabled={isEmpty(fieldName) || isEmpty(dataType) || isFieldNameExisted && !isNewField} 
		        	 onClick={isNewField ? this.handleAddField : this.handleUpdateField}
		        >
				    	{isNewField ? 'Add' : 'Update'}
				    </a>
				  </div>
        </div>
      </div>
		)
	}
}

FormDesigner.defaultProps = {
	documentFieldsTableHeader: [ 'Name', 'Data Type', 'Default Value', 'Show in Table', 'Action' ],

	//data structure
	formStructure: {
	  title: "New Collection",
	  type: "object",
	  properties: {
	    name: { type: "string", title: "Name", default: "A new task" },
	    date: { type: "string", format: "date" },
	    due: { type: "string", format: "date" },
	    reminder: { type: "string", format: "date" },
	    assignedTo: { type: "string", title: "Assigned to" },
	    place: { type: "string", title: "Place" },
	    taskOwner: { type: "string", title: "Task owner" },
	    done: { type: "boolean", title: "Done?", default: false }
  	}
	},

	fields: [
		{ 
			fieldName: 'Title', 
			dataType: 'String', 
			defaultValue: 'test', 
			showInTable: false, 
			action: ['edit', 'delete'] 
		},
		{
			fieldName: 'Description', 
			dataType: 'String', 
			defaultValue: 'yes', 
			showInTable: true, 
			action: [
				{
					name: 'edit',
					enable: true
				},
				{
					name: 'delete',
					enable: true
				}
			] 
		},
	]
}

export default FormDesigner
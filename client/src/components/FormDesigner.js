import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'
import M from 'materialize-css/dist/js/materialize.min.js'
import { isEmpty } from 'lodash'

import API_URL from '../utils/api_url'
import * as ACT from '../actions'
import './FormDesigner.css'

class FormDesigner extends Component {
	constructor(props) {
		super(props);

		this.state = {
			formId: undefined,
			isCollectionNameOK: false,
			// see formStructure data structure at the bottom of the code
			formStructure: { title: 'New Collection', type: "object", properties: {} },
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

		axios.get(`${API_URL}/form?id=${id}`)
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
							return {...obj}
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
	}

	componentDidMount() {
		// materialize css initialization
		M.AutoInit()
	}

	handleCheck = (i) => {
		const { fields } = this.state

		fields.map((field, idx) => {
			if (i === idx) {
				field.showInTable = !field.showInTable
			}
			return field
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

	handleCheckCollectionName = () => {
		const { formId } = this.state
		const { collectionName } = this.state.input
		
		axios.get(`${API_URL}/check-collection-name?name=${collectionName}&id=${formId}`)
			.then(res => {
				const { data, currentName } = res.data
				let message, icon, isCollectionNameOK

				// found
				if (data === 1) {
					if (currentName === collectionName.toLowerCase()) {
						message = '<span> Name is the same with current collection name.</span>'
						icon = '<i class="material-icons">check_circle</i>'
						isCollectionNameOK = true
					} else {
						message = '<span> Name is already used for other collection, please change.</span>'
						icon = '<i class="material-icons">highlight_off</i>'
						isCollectionNameOK = false
					}
					
				} 
				// not found
				else if (data === 0) {
					message = '<span> Name is unique, you can create new collection with it.</span>'
					icon = '<i class="material-icons">check_circle</i>'
					isCollectionNameOK = true
				}

				M.toast({
					html: icon + message,
					displayLength: 5000,
				})

				this.setState({ isCollectionNameOK })
			})
			.catch(e => console.error(e))
	}

	handleCreateCollection = () => {
		const { location, loadCollectionNavItemLinks } = this.props
		const id = location.search.slice(4)
		const { formId, formStructure, input, fields } = this.state
		const tableColumns = fields.reduce((arr, field) => {
														return [...arr, { fieldName: field.fieldName, showInTable: field.showInTable }]
												 }, [])
		
		formStructure.title = input.collectionName

		axios.post(`${API_URL}/create-form?id=${id}`, 
							 { collectionName: input.collectionName, tableColumns, formStructure })
			.then(res => {

				M.toast({
					html: res.data.message,
					displayLength: 5000,
				})

				loadCollectionNavItemLinks()
			})
			.catch(err => console.log(err))

		// reset to initial state after new collection created
		if (formId === undefined) {
			this.setState({ 
				formId: undefined,
				isCollectionNameOK: false,
				formStructure: { title: 'New Collection', type: "object", properties: {} },
				input: {
					collectionName: '',
					fieldName: '',
					dataType: '',
					defaultValue: ''
				},
				isNewField: true,
				currentIndex: -1,
				isFieldNameExisted: false,
				fields: [], 
			})
		}
	}

	render() {
		const {
			formId,
			formStructure, 
			isNewField, 
			fields,
			isFieldNameExisted,
			isCollectionNameOK
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
					<div className="col s12 btn-form">
					{
						formId ?
						(
							<Fragment>
								<span className="waves-effect waves-light btn">
						    	Events
						    </span>
						    <span className="waves-effect waves-light btn">
						    	Edit View
						    </span>
						    <Link className="waves-effect waves-light btn" to={`/design-form?id=${formId}`}>
						    	Edit Form
						    </Link>
				    	</Fragment>
				    )
				    : (<span />)
					}
					</div>
					<div className="col s12 first-row-container">
						<span className="collection-name-label"> Collection name : </span>
						<div className="input-field inline collection-name-input">
							<input id="collection_name" type="text" value={collectionName} onChange={(e) => this.handleInputChange('collection_name', e)}/>
						</div>
						<span className="waves-effect waves-light btn btn-check-collection-name tooltipped"
							 disabled={this.isEmptyString(collectionName)}
							 data-position="right"
							 data-tooltip="Check collection name"
	        		 onClick={this.handleCheckCollectionName}>
				    	Check
				    </span>
				    {
				    	formId ? 
					      (<span />)
						  : (<span className="waves-effect waves-light btn btn-collection-templates">
						    	Collection Templates
						    </span>)
				    }
			    </div>
			    <div className="col s12">
						<span className="document-fields-label">Document fields</span>
						<table className="table-collection centered responsive-table">
		          <thead>
		            <tr>
		              { 
		              	documentFieldsTableHeader.map((header, i) => 
		              		<th key={i} className={header === "Name" ? "left" : ""}>{header}</th>) 
		              }
		            </tr>
		          </thead>

		          <tbody>
		            { 
		              !fields && <p> loading .... </p>
		            }
		            { 
		              fields && fields.map((field, index) => (
		                <tr key={index}>
		                  <td className="left">{field.fieldName}</td>
		                  <td>{field.dataType}</td>
		                  <td>{field.defaultValue}</td>
		                  <td>
		                  	<label>
									        <input 
									        	type="checkbox" 
									        	className="filled-in" 
									        	checked={field.showInTable ? "checked" : ""} 
									        	onChange={this.handleCheck.bind(this, index)} 
									        />
									        <span> </span>
									      </label>
									    </td>
									    <td>
									    {
									    	field.action.map((action, index2) => {
									    		if (action.name === 'edit') {
								    				return (
								    			    <span key={index2}
								    			    	 className={action.enable 
								    			    							? "waves-effect waves-light btn btn-action blue lighten-2 tooltipped"
								    			    							: "waves-effect waves-light btn btn-action blue lighten-2 disabled"}
								    			    	 data-position="bottom" 
								    			    	 data-tooltip="edit field"
								    			    	 onClick={this.handleClickAction.bind(this, action.name, index)}
								    			    >
								    			    	<i className="material-icons">{action.name}</i>
								    			    </span>
								    			  )
							    			  } else if (action.name === 'delete') {
							    			  	return (
								    			    <span key={index2}
								    			    	 className={action.enable 
								    			    							? "waves-effect waves-light btn btn-action red lighten-2 tooltipped"
								    			    							: "waves-effect waves-light btn btn-action red lighten-2 disabled"}
								    			    	 data-position="bottom" 
								    			    	 data-tooltip="delete field"
								    			    	 onClick={this.handleClickAction.bind(this, action.name, index)}
								    			    >
								    			    	<i className="material-icons">{action.name}</i>
								    			    </span>
								    			  )
							    			  }
							    			  return <div key={index2}/>
									    	})
									    }
									    </td>
		                </tr>
		              )) 
		            }
		          </tbody>
		        </table>
	        </div>
	        <div className="col s12">
	        	<span className="waves-effect waves-light btn btn-submit right" 
		        	 disabled={isEmpty(formStructure.properties) || isEmpty(collectionName) || !isCollectionNameOK} 
	        		 onClick={this.handleCreateCollection}>
				    	{formId ? 'Update Collection' : 'Create collection'}
				    </span>
	        </div>
				</div>

        <div className="add-new-field card-panel indigo lighten-5">
	        <h4 className="center">{isNewField ? 'Add new field' : 'Edit field'}</h4>	
	       	<div className="row">
						<div className="input-field col s6">
							<input id="field_name" type="text" value={fieldName} onChange={(e) => this.handleInputChange('field_name', e)}/>
		          <label htmlFor="field_name">Field name</label>
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
		          <label htmlFor="default_value">Default value</label>
						</div>
					</div>
					<div className="row btn-add-container">
		        <span className="waves-effect waves-light btn" 
		        	 disabled={isEmpty(fieldName) || isEmpty(dataType) || ( isFieldNameExisted && isNewField )} 
		        	 onClick={isNewField ? this.handleAddField : this.handleUpdateField}
		        >
				    	{isNewField ? 'Add' : 'Update'}
				    </span>
				  </div>
        </div>
      </div>
		)
	}

	// helper functions always put below the main code
	isEmptyString(string) {
		return /^\s*$/.test(string)
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

const mapStateToProps = (state) => {
  return {
    
  }
}

const mapDispacthToProps = (dispatch) => {
	return {
		loadCollectionNavItemLinks: () => dispatch(ACT.loadCollectionNavItemLinks())
	}
}

export default connect(mapStateToProps, mapDispacthToProps)(FormDesigner)
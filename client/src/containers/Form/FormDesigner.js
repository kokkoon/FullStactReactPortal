import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'
import M from 'materialize-css/dist/js/materialize.min.js'
import { isEmpty } from 'lodash'
import queryString from 'query-string'

import * as helper from '../../utils/helperFunctions'
import API_URL from '../../utils/api_url'
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
			isEventCreatedSwitchOn: false,
			isEventModifiedSwitchOn: false,
			isURLExtWorkflowConnected: undefined,
			apiUrlText: '',
			apiBody: undefined, // apiBody is set on handleConnectAPIURL method
			apiParameters: undefined, // apiParameters is set on handleConnectAPIURL method
			isModifiedURLExtWorkflowConnected: undefined,
			modifiedApiUrlText: '',
			modifiedApiBody: undefined,
			modifiedApiParameters: undefined,
			viewConfigString: '',
			defaultViewConfig: {}, // object
			viewConfig: {} // object
		}
	}

	render() {
		const { collectionName } = this.state.input
		const {
			formId,
			formStructure, 
			isCollectionNameOK
		} = this.state

		return (
			<div className="form-designer">
				<h4 className="center">{formId ? 'Update Collection' : 'Create New Collection'}</h4>
				<div className="row">
					<div className="col s12 btn-form">
					{
						formId &&
						(
							<Fragment>
								<span className="waves-effect waves-light btn" onClick={this.openModalFormEvent}>
						    	Events
						    </span>
						    <span className="waves-effect waves-light btn" onClick={this.openModalEditView}>
						    	Edit View
						    </span>
						    <Link className="waves-effect waves-light btn" to={`/design-form?id=${formId}`}>
						    	Edit Form
						    </Link>
				    	</Fragment>
				    )
					}
					</div>
					<div className="col s12 first-row-container">
						<span className="collection-name-label"> Collection name : </span>
						<div className="input-field inline collection-name-input">
							<input id="collection_name" type="text" value={collectionName} onChange={(e) => this.handleInputChange('collection_name', e)}/>
						</div>
						<span className="waves-effect waves-light btn btn-check-collection-name tooltipped"
							 disabled={helper.isEmptyString(collectionName)}
							 data-position="right"
							 data-tooltip="Check collection name"
	        		 onClick={this.handleCheckCollectionName}>
				    	Check
				    </span>
				    {
				    	!formId &&
				    	(
				    		<span className="waves-effect waves-light btn btn-collection-templates">
						    	Collection Templates
						    </span>
						  )
				    }
			    </div>
			    { this.renderTableFormFields() }
	        <div className="col s12">
	        	<span className="waves-effect waves-light btn btn-submit right" 
		        	 disabled={isEmpty(formStructure.properties) || isEmpty(collectionName) || !isCollectionNameOK} 
	        		 onClick={this.handleCreateCollection}>
				    	{formId ? 'Update Collection' : 'Create collection'}
				    </span>
	        </div>
				</div>
        { this.renderCardAddNewField() }
        { this.renderModalFormEvent() }
        { this.renderModalEditView() }
      </div>
		)
	}

	renderTableFormFields () {
		const { documentFieldsTableHeader } = this.props
		const { fields } = this.state

		return (
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
							    	field.action &&
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
		)
	}

	renderCardAddNewField () {
		const {
			isNewField,
			isFieldNameExisted
		} = this.state

		const {
			fieldName,
			dataType,
			defaultValue
		} = this.state.input

		return (
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
		)
	}

	renderModalFormEvent () {
		const {
			isEventCreatedSwitchOn,
			isURLExtWorkflowConnected,
			openApiTitle,
			apiUrlText, 
			apiBody,
			apiParameters,
			isEventModifiedSwitchOn,
			isModifiedURLExtWorkflowConnected,
			modifiedOpenApiTitle,
			modifiedApiUrlText,
			modifiedApiBody,
			modifiedApiParameters
		} = this.state

		const createdEventApi = {
			actionType: 'created',
			isEventSwitchOn: isEventCreatedSwitchOn,
			isURLConnected: isURLExtWorkflowConnected,
			openApiTitle: openApiTitle,
			apiUrlText: apiUrlText, 
			apiBody: apiBody,
			apiParameters: apiParameters,
			toggleSwitchEvent: this.toggleSwitchEventCreated,
			changeApiUrlText: this.handleApiUrlText,	
			handleConnectApiURL: this.handleConnectApiURL,
			handleInputProperties: this.handleInputCreatedApiProperties,
			handleSaveEventAPI: this.handleSaveCreatedEventAPI
		}

		const modifiedEventApi = {
			actionType: 'modified',
			isEventSwitchOn: isEventModifiedSwitchOn,
			isURLConnected: isModifiedURLExtWorkflowConnected,
			openApiTitle: modifiedOpenApiTitle,
			apiUrlText: modifiedApiUrlText, 
			apiBody: modifiedApiBody,
			apiParameters: modifiedApiParameters,
			toggleSwitchEvent: this.toggleSwitchEventModified,
			changeApiUrlText: this.handleModifiedApiUrlText,
			handleConnectApiURL: this.handleConnectModifiedApiURL,
			handleInputProperties: this.handleInputModifiedApiProperties,
			handleSaveEventAPI: this.handleSaveModifiedEventAPI
		}

		return (
			<div id="modal-form-event" className="modal">
	      <div className="modal-content">
	        <h5 className="title center"><strong>Event handler</strong></h5>
					{ this.renderEventContainer(createdEventApi) }
					{ this.renderEventContainer(modifiedEventApi) }
				</div>
			</div>
		)
	}

	renderEventContainer (input) {
		const {
			actionType,
			isEventSwitchOn,
			isURLConnected,
			openApiTitle,
			apiUrlText, 
			apiBody,
			apiParameters,
			toggleSwitchEvent,
			changeApiUrlText,
			handleConnectApiURL,
			handleInputProperties,
			handleSaveEventAPI
		} = input

		return (
			<div className="row bordered-container event-container">
	  		<div className="col s10 zero-padding">
	    		<span>
	    			Starts when documents are created
	    		</span>
	    	</div>
	    	<div className="col s2 right zero-padding">
	        <div className="switch">
				    <label>
				      <input 
				      	id="created-api-switch" 
				      	type="checkbox" 
				      	checked={isEventSwitchOn}
				      	onChange={toggleSwitchEvent} />
				      <span className="lever"></span>
				    </label>
				  </div>
				</div>
				{
					isEventSwitchOn &&
					<Fragment>
						<div className="col s12 bordered-container url-container">
							<div className="col s1">
								<span>URL</span>
							</div>
							<div className="col s11 zero-padding">
								<textarea className="textarea-url" value={apiUrlText} onChange={changeApiUrlText}>
								</textarea>
							</div>
							<div className="col s9">
							{ 
								isURLConnected &&
								<span className="connected-label">
									[Connected]
								</span>
							}
							{
								isURLConnected === false &&
								<span className="error-label">
									[Error]
								</span>
							}
							</div>
							<div className="col s3 zero-padding btn-connect-container">
								<span className={helper.isEmptyString(apiUrlText) ? 'btn disabled' : 'waves-effect waves-light btn'} onClick={handleConnectApiURL}>
									Connect
								</span>
							</div>
						</div>
						{
							isURLConnected &&
							<div className="col s12 bordered-container parameters-container">
								<div className="col s12 zero-padding border-bottom">
									<span>{openApiTitle}</span>
								</div>
								{
									apiParameters && 
									apiParameters.length > 0 &&
									apiParameters.map((parameter, paramIdx) => (
										<div key={paramIdx} className="col s12">
											<p className="parameter-name">{parameter.name}</p>
											{
												parameter.properties.map((property, propIdx) => (
													<div key={propIdx} className="col s12">
														<div className="col s4">
															<span className="col s12 property-name">{property.name}</span>
															<span className="col s12 property-type">{property.type}</span>
														</div>
														<div className="col s8">
															<input 
																id={`input-${actionType}-${parameter.name}-${property.name}`}
																value={apiBody[parameter.name][property.name]}
																onChange={e => handleInputProperties(parameter.name, property.name)} />
														</div>
													</div>
												))
											}
										</div>
									))
								}
							</div>
						}
	    			<span 
	    				className={isURLConnected ? 
	    					"waves-effect waves-light btn btn-save-api right" 
	    					: "btn btn-save-api disabled right"} 
	    				onClick={handleSaveEventAPI}
	    			>
	    				Save
	    			</span>
					</Fragment>
				}
	    </div>
	  )
	}

	renderModalEditView () {
		const {	viewConfigString } = this.state

		return (
			<div id="modal-edit-view" className="modal">
      	<div className="modal-content">
      		<h5 className="center title"><strong>Edit view</strong></h5>
      		<textarea 
      			id="textarea-edit-view" 
      			value={viewConfigString}
      			onChange={this.changeViewConfig}/>
      		<div className="btn-footer-modal">
	      		<span className="waves-effect waves-light btn" onClick={this.setDefaultTableView}>Default</span>
	      		<span className="waves-effect waves-light btn" onClick={this.closeModalEditView}>Cancel</span>
	      		<span className="waves-effect waves-light btn" onClick={this.saveTableView}>Save</span>
      		</div>
      	</div>
      </div>
		)
	}

	componentWillMount() {
		const { id: formId } = queryString.parse(this.props.location.search)

		if (formId === 'new') {
			this.loadDefaultFields()
		} else {
			this.loadFormData(formId)
			this.loadEventApiData(formId)
			this.loadViewConfig(formId)
		}
	}

	componentDidMount() {
		// materialize css initialization
		M.AutoInit()
	}

	reloadData() {
		const { formId } = this.state
		
		this.loadFormData(formId)
		this.loadEventApiData(formId)
		this.loadViewConfig(formId)
	}

	loadDefaultFields() {
		this.setState({ fields: this.generateDefaultFields() })
	}

	loadFormData (formId) {
		axios.get(`${API_URL}/form?id=${formId}`)
			.then(res => {
				let { input } = this.state
				const { formId, data: formStructure, formFields: fields } = res.data
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

	generateDefaultFields () {
		const { user } = this.props
		const date = new Date().toISOString()
		
		const createdTime = { 
			fieldName: 'Created time', 
			dataType: 'date', 
			defaultValue: date,
			showInTable: false
		}

		const createdBy = {
			fieldName: 'Created by', 
			dataType: 'string', 
			defaultValue: user._id, 
			showInTable: false
		}

		const modifiedTime = { 
			fieldName: 'Modified time', 
			dataType: 'date', 
			defaultValue: date, 
			showInTable: false
		}

		const modifiedBy = {
			fieldName: 'Modified by', 
			dataType: 'string', 
			defaultValue: user._id, 
			showInTable: false
		}

		const newFields = [
			createdTime,
			createdBy,
			modifiedTime,
			modifiedBy
		]

		return newFields
	}

	loadEventApiData (formId) {
		axios.get(`${API_URL}/form?id=${formId}`)
			.then(res => {
				const { createdActionAPI, modifiedActionAPI } = res.data
				let {
					isEventCreatedSwitchOn, 
					isURLExtWorkflowConnected, 
					openApiTitle,
					apiUrlText,
					apiBody,
					apiParameters,
					isEventModifiedSwitchOn, 
					isModifiedURLExtWorkflowConnected, 
					modifiedOpenApiTitle,
					modifiedApiUrlText,
					modifiedApiBody,
					modifiedApiParameters
				} = this.state

				if (createdActionAPI) {
					isEventCreatedSwitchOn = createdActionAPI.isActive
					isURLExtWorkflowConnected = true
					openApiTitle = createdActionAPI.openApiTitle
					apiUrlText = createdActionAPI.openApiUrl
					apiBody = createdActionAPI.body
					apiParameters = createdActionAPI.parameters
				}

				if (modifiedActionAPI) {
					isEventModifiedSwitchOn = modifiedActionAPI.isActive
					isModifiedURLExtWorkflowConnected = true
					modifiedOpenApiTitle = modifiedActionAPI.openApiTitle
					modifiedApiUrlText = modifiedActionAPI.openApiUrl
					modifiedApiBody = modifiedActionAPI.body
					modifiedApiParameters = modifiedActionAPI.parameters
				}

				this.setState({
					isEventCreatedSwitchOn,
					isURLExtWorkflowConnected,
					openApiTitle,
					apiUrlText,
					apiBody,
					apiParameters,
					isEventModifiedSwitchOn,
					isModifiedURLExtWorkflowConnected,
					modifiedOpenApiTitle,
					modifiedApiUrlText,
					modifiedApiBody,
					modifiedApiParameters
				})
			})
			.catch(e => console.error(e))
	}

	loadViewConfig = (formId) => {
		axios.get(`${API_URL}/retrieve-table-view-config?form_id=${formId}`)
		.then(response => {
			const viewConfig = response.data.data
			const viewConfigString = helper.stringifyPrettyJSON(viewConfig)

			this.setState({
				viewConfig,
				defaultViewConfig: viewConfig,
				viewConfigString
			})
		})
		.catch(error => console.error(error))
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
				const { isFound, currentName } = res.data
				let message, icon, isCollectionNameOK

				if (isFound) {
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
				else { // not found
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
		const { location } = this.props
		const { id } = queryString.parse(location.search)
		const { 
			formId, 
			formStructure, 
			input, 
			fields
		} = this.state

		let updatedFields = fields

		if (formId !== undefined) {
			updatedFields = this.updateModifiedFields(fields)
		}

		const tableColumns = updatedFields.reduce((arr, field) => {
			return [...arr, { fieldName: field.fieldName, showInTable: field.showInTable }]
		}, [])
		
		formStructure.title = input.collectionName

		const data = {
			collectionName: input.collectionName, 
			tableColumns, 
			formStructure,
			formFields: updatedFields
		}

		axios.post(`${API_URL}/create-form?id=${id}`, data)
			.then(response => {
				M.toast({
					html: response.data.message,
					displayLength: 5000,
				})

				if (id === 'new') this.props.history.push('/collection-list')
				else this.reloadData()
			})
			.catch(error => console.error(error))
	}

	// reset to initial state
	resetState() {
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

	updateModifiedFields (fields) {
		const { user } = this.props
		const newDate = new Date().toISOString()

		return fields.map(field => {
			const { fieldName } = field

			if (fieldName === 'Modified time') {
				return { 
					...field,
					defaultValue: newDate, 
				}
			} else if (fieldName === 'Modified by') {
				return {
					...field,
					defaultValue: user._id, 
				}
			}
			
			return field
		})
	}

	openModalFormEvent = () => {
		const elem = document.getElementById('modal-form-event')
		const modal = M.Modal.getInstance(elem)
		modal.open()
	}

	toggleSwitchEventCreated = () => {
		const { formId, isEventCreatedSwitchOn } = this.state
		const actionType = 'created'

		axios.patch(`${API_URL}/toggle-external-api?formId=${formId}&actionType=${actionType}`, {isActive: !isEventCreatedSwitchOn})
			.then(response => {
				M.toast({ html: response.data.message })
			})
			.catch(error => console.error(error))
		
		this.setState({ isEventCreatedSwitchOn: !isEventCreatedSwitchOn})
	}

	toggleSwitchEventModified = () => {
		const { formId, isEventModifiedSwitchOn } = this.state
		const actionType = 'modified'

		axios.patch(`${API_URL}/toggle-external-api?formId=${formId}&actionType=${actionType}`, {isActive: !isEventModifiedSwitchOn})
			.then(response => {
				M.toast({ html: response.data.message })
			})
			.catch(error => console.error(error))

		this.setState({ isEventModifiedSwitchOn: !isEventModifiedSwitchOn})
	}

	handleConnectApiURL = () => {
		const { apiUrlText } = this.state

		axios.get(`${API_URL}/ping-open-api?url=${apiUrlText}`)
		.then(res => {
			M.toast({ html: res.data.message })

			// if API URL valid, retrieve the API parameters
			if (res.data.success) {
				axios.get(`${API_URL}/retrieve-external-workflow-parameters?url=${apiUrlText}`)
				.then(res2 => {
					const { openApiTitle, apiBody, apiParameters } = res2.data
					this.setState({ openApiTitle, apiBody, apiParameters })
				})
				.catch(e2 => console.error(e2))
			}

			this.setState({
				isURLExtWorkflowConnected: res.data.success
			})
		})
		.catch(e => console.error(e))
	}

	handleConnectModifiedApiURL = () => {
		const { modifiedApiUrlText } = this.state

		axios.get(`${API_URL}/ping-open-api?url=${modifiedApiUrlText}`)
		.then(res => {
			M.toast({ html: res.data.message })

			// if API URL valid, retrieve the API parameters
			if (res.data.success) {
				axios.get(`${API_URL}/retrieve-external-workflow-parameters?url=${modifiedApiUrlText}`)
				.then(res2 => {
					const { 
						openApiTitle: modifiedOpenApiTitle, 
						apiBody: modifiedApiBody, 
						apiParameters: modifiedApiParameters 
					} = res2.data

					this.setState({ modifiedOpenApiTitle, modifiedApiBody, modifiedApiParameters })
				})
				.catch(e2 => console.error(e2))
			}

			this.setState({
				isModifiedURLExtWorkflowConnected: res.data.success
			})
		})
		.catch(e => console.error(e))
	}

	handleApiUrlText = (event) => {
		this.setState({ apiUrlText: event.target.value })
	}

	handleModifiedApiUrlText = (event) => {
		this.setState({ modifiedApiUrlText: event.target.value })
	}

	handleCloseModal = () => {
		const elem = document.getElementById('modal-form-event')
		const modal = M.Modal.getInstance(elem)
		modal.close()
	}

	handleSaveCreatedEventAPI = () => {
		const { formId, openApiTitle, apiUrlText: openApiUrl, apiBody } = this.state

		const data = { openApiTitle, formId, openApiUrl, apiBody }

		axios.post(`${API_URL}/save-external-workflow?action_type=created`, data )
		.then(res => {
			M.toast({ html: res.data.message })
		})
		.catch(e => console.error(e))
	}

	handleSaveModifiedEventAPI = () => {
		const { 
			formId, 
			modifiedOpenApiTitle: openApiTitle,
			modifiedApiUrlText:	openApiUrl, 
			modifiedApiBody: apiBody 
		} = this.state

		const data = { formId, openApiTitle, openApiUrl, apiBody }

		axios.post(`${API_URL}/save-external-workflow?action_type=modified`, data )
		.then(res => {
			M.toast({ html: res.data.message })
		})
		.catch(e => console.error(e))
	}

	handleInputCreatedApiProperties = (parameter, property) => {
		const { apiBody } = this.state
		const value = document.getElementById(`input-created-${parameter}-${property}`).value

		const newApiBody = { 
			...apiBody,
			[parameter] : { 
				...apiBody[parameter], 
				[property] : value
			}
		}

		this.setState({ apiBody: newApiBody })
	}

	handleInputModifiedApiProperties = (parameter, property) => {
		const { modifiedApiBody } = this.state
		const value = document.getElementById(`input-modified-${parameter}-${property}`).value

		const newApiBody = { 
			...modifiedApiBody,
			[parameter] : { 
				...modifiedApiBody[parameter], 
				[property] : value
			}
		}

		this.setState({ modifiedApiBody: newApiBody })
	}

	openModalEditView = () => {
		const elem = document.getElementById('modal-edit-view')
		const modal = M.Modal.getInstance(elem)
		modal.open()
	}

	closeModalEditView = () => {
		const elem = document.getElementById('modal-edit-view')
		const modal = M.Modal.getInstance(elem)
		modal.close()
	}

	changeViewConfig = ({ target }) => {
		this.setState({ viewConfigString: target.value })
	}

	setDefaultTableView = () => {
		const { defaultViewConfig } = this.state
		const viewConfigString = helper.stringifyPrettyJSON(defaultViewConfig)

		this.setState({
			viewConfig: defaultViewConfig,
			viewConfigString 
		})
	}

	saveTableView = () => {
		const form_id = queryString.parse(this.props.location.search).id
		const { viewConfigString, defaultViewConfig, fields } = this.state
		let viewConfig = defaultViewConfig

		try {
			viewConfig = JSON.parse(viewConfigString)
		} catch (error) {
			alert('JSON config is not valid\n' + error)
		}

		const data = { tableViewConfig: viewConfig, formFields: fields }

		axios.post(`${API_URL}/save-table-view-config?form_id=${form_id}`, data)
		.then(response => {
			this.reloadData()
			M.toast({ html: response.data.message })
		})
		.catch(error => console.error(error))

		this.setState({ viewConfig })
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

const mapStateToProps = ({ user }) => ({ user })

export default connect(mapStateToProps, null) (FormDesigner)
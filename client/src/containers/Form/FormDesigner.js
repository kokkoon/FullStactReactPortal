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
			hasCollectionNameChanged: false,
			hasFormFieldsChanged: false,
			formStructure: { title: 'New Collection', type: "object", properties: {} }, // see formStructure data structure at the bottom of the code
			input: {
				collectionName: '',
				fieldName: '',
				dataType: '',
				defaultValue: '',
				arrayField: ''
			},
			collectionName: '',
			isNewField: true,
			currentIndex: -1,
			fields: [], // see fields data structure at the bottom of the code
			hasArrayInFormField: false,
			arrayFields: [],
			isFieldOfArray: false,
			isUpdatingArrayField: '',
			isUpdatingArrayFieldItem: false,
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
			viewConfig: {}, // object
			isAllowAttachment: false
		}
	}

	render() {
		const { collectionName: inputCollectionName, collectionDescription } = this.state.input
		const {
			hasCollectionNameChanged,
			collectionDisplayName,
			hasFormFieldsChanged,
			isCollectionNameOK,
			isAllowAttachment,
			collectionName,
			formStructure, 
			collectionId,
			formId,
			input
		} = this.state
		// console.log('fields = ', this.state.fields)
		// console.log('arrayFields = ', this.state.arrayFields)
		// console.log('formStructure = ', this.state.formStructure)
		// console.log('viewConfig = ', this.state.viewConfig)

		return (
			<div className="form-designer">
				<h4 className="center">{formId ? `Edit ${collectionDisplayName} Collection` : 'Create New Collection'}</h4>
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
				<div className="col s12 first-row-container collection-details">
					<span className="collection-name-label">
						<span className="collection-detail-label">Collection display name</span> : 
					</span>
					<div className="input-field inline collection-name-input">
						<input id="collection_display_name" type="text" value={inputCollectionName} onChange={event => this.handleInputChange('collection_name', event)}/>
					</div>
					<span className="waves-effect waves-light btn btn-check-collection-name tooltipped"
						 disabled={helper.isEmptyString(inputCollectionName) || !hasCollectionNameChanged}
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
		    <div className="col s12 collection-details">
					<span className="collection-name-label">
						<span className="collection-detail-label">Collection description</span> : 
					</span>
					<div className="input-field inline collection-name-input collection-description">
						<input id="collection_description" type="text" value={collectionDescription} onChange={event => this.handleInputChange('collection_description', event)}/>
					</div>
		    </div>
		    {
		    	formId &&
		    	<Fragment>
				    <div className="col s12 collection-details">
							<span className="collection-name-label">
								<span className="collection-detail-label">Collection name</span> : </span>{collectionName}
				    </div>
				    <div className="col s12 collection-details">
							<span className="collection-name-label"> 
								<span className="collection-detail-label">Collection id</span> : </span>{collectionId}
				    </div>
		    	</Fragment>
		    }
		    { this.renderTableFormFields() }
        <div className="row btn-submit-container">
        	<span className="left allow-attachment-container">
						<label>
			        <input 
			        	type="checkbox" 
			        	className="filled-in" 
			        	checked={isAllowAttachment ? "checked" : ""}
			        	onChange={this.handleToggleAllowAttachment} 
			        />
			        <span>Allow attachment</span>
			      </label>
					</span>
        	<span className="waves-effect waves-light btn btn-submit right" 
	        	 disabled={
	        	 	isEmpty(formStructure.properties) || 
	        	 	isEmpty(inputCollectionName) || 
	        	 	!isCollectionNameOK || 
	        	 	!hasFormFieldsChanged
	        	 } 
        		 onClick={this.handleCreateCollection}>
			    	{formId ? 'Update Collection' : 'Create collection'}
			    </span>
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
			<div className="col s12 document-fields-container">
				<span className="document-fields-label">Document fields</span>
				<table className="table-form-fields centered responsive-table">
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
              !fields && <span> loading .... </span>
            }
            { 
              fields && fields.map((field, index) => (
            		<Fragment key={index}>
	                <tr key={index}>
	                  <td className="left">
                  	{
                  		field.fieldName
                  	}
                  	{
                  		field.dataType === 'array' 
                  		? <i className="material-icons icon-show-array-item" 
                  				onClick={e => this.handleShowArrayItems(field)}>
                  				arrow_drop_down
                  			</i>
                  		: ''
	                  }
	                  </td>
	                  <td>{field.dataType}</td>
	                  <td>{field.defaultValue}</td>
	                  <td>
	                  	<label>
								        <input 
								        	type="checkbox" 
								        	className="filled-in" 
								        	checked={field.showInTable ? "checked" : ""} 
								        	onChange={this.handleToggleShowInTable.bind(this, index)} 
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
                	{ this.renderArrayItems(field) }
                </Fragment>
            	))
            }
          </tbody>
        </table>
      </div>
		)
	}

	renderArrayItems(field) {
		const { arrayFields } = this.state
		const index = arrayFields.findIndex(arrField => arrField.fieldName === field.fieldName)
		const arrayField = arrayFields[index]

		if ( field.dataType === 'array' && 
				 arrayField && 
				 arrayField.isShowItems &&
				 field.items ) {
			return field.items.map((item, idx) => (
				<tr key={idx}>
					<td className="left cell-array-item name-field">{item.fieldName}</td>
          <td className="cell-array-item">{item.dataType}</td>
          <td className="cell-array-item">{item.defaultValue}</td>
          <td></td>
          <td>
          {
			    	item.action &&
			    	item.action.map((action, idx2) => {
			    		if (action.name === 'edit') {
		    				return (
		    			    <span key={idx2}
		    			    	 className={action.enable 
		    			    							? "waves-effect waves-light btn btn-action blue lighten-2 tooltipped"
		    			    							: "waves-effect waves-light btn btn-action blue lighten-2 disabled"}
		    			    	 data-position="bottom" 
		    			    	 data-tooltip="edit field"
		    			    	 onClick={e => this.handleClickActionArray(action.name, arrayField.fieldName, idx)}
		    			    >
		    			    	<i className="material-icons">{action.name}</i>
		    			    </span>
		    			  )
	    			  } else if (action.name === 'delete') {
	    			  	return (
		    			    <span key={idx2}
		    			    	 className={action.enable 
		    			    							? "waves-effect waves-light btn btn-action red lighten-2 tooltipped"
		    			    							: "waves-effect waves-light btn btn-action red lighten-2 disabled"}
		    			    	 data-position="bottom" 
		    			    	 data-tooltip="delete field"
		    			    	 onClick={e => this.handleClickActionArray(action.name, arrayField.fieldName, idx)}
		    			    >
		    			    	<i className="material-icons">{action.name}</i>
		    			    </span>
		    			  )
	    			  }
	    			  return <div key={idx2}/>
			    	})
			    }
          </td>
        </tr>
			))
		}
	}

	renderCardAddNewField () {
		const {
			isNewField,
			isFieldOfArray
		} = this.state

		const {
			fieldName,
			dataType,
			defaultValue,
			arrayField
		} = this.state.input

		return (
			<div className="add-new-field card-panel indigo lighten-5">
        <span className="title"><strong>{isNewField ? 'Add new field' : 'Edit field'}</strong></span>	
       	<div className="row zero-margin field-input-row">
       		<div className="input-field-container col s10">
       			<div className="row zero-margin">
							<div className="input-field col s4">
								<input id="field_name" type="text" value={fieldName} onChange={event => this.handleInputChange('field_name', event)}/>
			          <label htmlFor="field_name">Field name</label>
							</div>
							<div className="col s4">
							  <div className="input-field">
							    <select value={dataType} onChange={event => this.handleInputChange('data_type', event)}>
							      <option value="">Data type</option>
							      <option value="string">String</option>
							      <option value="number">Number</option>
							      <option value="date">Date</option>
							      <option value="boolean">Boolean</option>
							      <option value="object">Object</option>
							      <option value="array">Array</option>
							    </select>
							  </div>
							</div>
							<div className="input-field col s4">
								<input id="default_value" type="text" value={defaultValue} onChange={event => this.handleInputChange('default_value', event)}/>
			          <label htmlFor="default_value">Default value</label>
							</div>
						</div>
					</div>
					<div className="col s2 btn-add-container">
		        <span className="waves-effect waves-light btn" 
		        	 disabled={
		        	 	isEmpty(fieldName) || 
		        	 	isEmpty(dataType) || 
		        	 	(isFieldOfArray && isEmpty(arrayField)) ||
		        	 	( this.isFieldNameExisted(fieldName) && isNewField )} 
		        	 onClick={isNewField ? this.handleAddField : this.handleUpdateField}
		        >
				    	{isNewField ? 'Add' : 'Update'}
				    </span>
				  </div>
				</div>
			  { this.renderInputFieldOfArray() }
      </div>
		)
	}

	renderInputFieldOfArray() {
		const { arrayField, dataType } = this.state.input
		const { 
			hasArrayInFormField, 
			isFieldOfArray, 
			arrayFields, 
			isUpdatingArrayFieldItem 
		} = this.state

		return (
			hasArrayInFormField &&
			<div className="row">
				<div className="col s10">
					<div className="col s4 zero-padding">
				  	<label>
			        <input 
			        	type="checkbox" 
			        	className="filled-in" 
			        	disabled={dataType === 'array' || isUpdatingArrayFieldItem}
			        	checked={isFieldOfArray ? "checked" : ""} 
			        	onChange={this.handleToggleIsFieldOfArray} 
			        />
			        <span>{isFieldOfArray ? 'Field of array : ' : 'Field of array ?'}</span>
			      </label>
			  	</div>
			  	<div className="col s4 zero-padding">
					  <div>
					    <select 
					    	id="array-field-select" 
					    	className="browser-default"
					    	disabled={!isFieldOfArray || isUpdatingArrayFieldItem}
					    	value={arrayField} 
					    	onChange={event => this.handleInputChange('array_field', event)}
					    >
					      <option value="" disabled>Array field</option>
					      {
					      	arrayFields.map((field, index) => (
					      		<option key={index} value={field.fieldName}>{field.fieldName}</option>
					      	))
					      }
					    </select>
					  </div>
					</div>
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

			this.setState({ isCollectionNameOK: true })
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
				const { 
					formId, 
					collectionId,
					collectionName,
					collectionDisplayName,
					collectionDescription,
					data: formStructure, 
					formFields: fields,
					isAllowAttachment
				} = res.data

				input.collectionName = collectionDisplayName
				input.collectionDescription = collectionDescription

				// insert field to arrayFields
				const arrayFields = fields.reduce((array, field) => {
					if (field.dataType === 'array') {
						return [
							...array,
							{
								fieldName: field.fieldName,
								isShowItems: false
							}
						]
					}

					return array
				}, [])

				const hasArrayInFormField = arrayFields.length > 0

				this.setState({
					formId,
					collectionId,
					collectionName,
					collectionDisplayName,
					formStructure,
					isAllowAttachment,
					fields,
					hasArrayInFormField,
					arrayFields,
					input
				})
			})
			.catch(e => console.error(e))
	}

	generateDefaultFields () {
		const { user } = this.props
		const date = new Date().toISOString()
		
		const createdTime = { 
			fieldName: 'createdTime', 
			dataType: 'date', 
			defaultValue: date,
			showInTable: false
		}

		const createdBy = {
			fieldName: 'createdBy', 
			dataType: 'string', 
			defaultValue: user._id, 
			showInTable: false
		}

		const modifiedTime = { 
			fieldName: 'modifiedTime', 
			dataType: 'date', 
			defaultValue: date, 
			showInTable: false
		}

		const modifiedBy = {
			fieldName: 'modifiedBy', 
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

	handleToggleAllowAttachment = () => {
		const { isAllowAttachment } = this.state
		const fileField = {
			fieldName: 'file',
			dataType: 'file',
			defaultValue: ''
		}

		if (!isAllowAttachment) {
			this.updateFormStructure(false, fileField)
		} else {
			this.deleteFieldOnFormStructure(fileField.fieldName)
		}

		this.setState({ 
			isAllowAttachment: !isAllowAttachment,
			hasFormFieldsChanged: true
		})
	}

	handleShowArrayItems = (field) => {
		let { arrayFields, isUpdatingArrayField } = this.state

		if (isUpdatingArrayField !== field.fieldName) {
			const index = arrayFields.findIndex(arrField => arrField.fieldName === field.fieldName)
			arrayFields[index].isShowItems = !arrayFields[index].isShowItems
		}

		this.setState({ arrayFields })
	}

	handleToggleShowInTable = (i) => {
		const { fields } = this.state

		fields.map((field, idx) => {
			if (i === idx) {
				field.showInTable = !field.showInTable
			}
			return field
		})

		this.setState({ fields, hasFormFieldsChanged: true })
	}

	handleClickAction = (actionType, index) => {
		let { 
			fields,
			arrayFields: arrayFields_state, 
			input
		} = this.state
		const field = fields[index]

		if (actionType === 'edit') {
			const newInput = {
				...input, // get existing collectionName and collectionDescription
				fieldName: field.fieldName,
				dataType: field.dataType,
				defaultValue: field.defaultValue
			}

			// disabled all action buttons until user click update field button
			fields = this.toggleActionButtons(fields, false)

			document.getElementById('field_name').focus()

			// delete related item in arrayFields when updating
			let isUpdatingArrayField = ''
			if (field.dataType === 'array') {
				isUpdatingArrayField = field.fieldName
				const idx = arrayFields_state.findIndex(arrField => arrField.fieldName === field.fieldName)
				arrayFields_state.splice(idx, 1)
			}

			this.setState({ 
				input: newInput,
				isNewField: false,
				currentIndex: index,
				arrayFields: arrayFields_state,
				isUpdatingArrayField,
				fields
			})
		} else if (actionType === 'delete') {
			const hasArrayInFormField = this.update_hasArrayInFormField_onDeletion(fields, field)
			const arrayFields = this.deleteArrayField(arrayFields_state, field)
			this.deleteFieldOnFormStructure(field.fieldName)
			this.deleteFieldOnViewConfig(field.fieldName)
			fields.splice(index, 1)

			this.setState({ 
				fields, 
				hasFormFieldsChanged: true,
				hasArrayInFormField ,
				arrayFields
			})
		}
	}

	deleteFieldOnViewConfig (fieldName) {
		const { viewConfig } = this.state
		let newViewConfig = { ...viewConfig }
		
		delete newViewConfig[fieldName]

		this.setState({ viewConfig: newViewConfig })
	}

	handleClickActionArray = (actionType, arrayField, index) => {
		let { input, fields } = this.state
		const field_idx = fields.findIndex(field => field.fieldName === arrayField)
		const field = fields[field_idx].items[index]

		if (actionType === 'edit') {
			const newInput = {
				...input, // get existing collectionName and collectionDescription
				arrayField,
				fieldName: field.fieldName,
				dataType: field.dataType,
				defaultValue: field.defaultValue
			}

			// disabled all action buttons until user click update field button
			fields = this.toggleActionButtons(fields, false)

			document.getElementById('field_name').focus()

			this.setState({
				input: newInput,
				isNewField: false,
				isUpdatingArrayFieldItem: true,
				isFieldOfArray: true,
				fields,
				currentIndex: field_idx,
				currentItemIndex: index
			})
		} else if (actionType === 'delete') {
			this.deleteFieldOnFormStructure(field.fieldName, arrayField)
			fields[field_idx].items.splice(index, 1)

			this.setState({ 
				fields, 
				hasFormFieldsChanged: true
			})
		}
	}

	toggleActionButtons = (fields, toBeEnable) => {
		return fields.map(field => {
			if(field.action) {
				field.action = field.action.map(action => ({ ...action, enable: toBeEnable }))
			}	
			if (field.dataType === 'array') {
				field.items.map(item => {
					if(item.action) {
						item.action = item.action.map(action => ({ ...action, enable: toBeEnable }))
					}

					return item	
				})
			}
			return field
		})
	}

	deleteFieldOnFormStructure = (fieldName, arrayField) => {
		const { formStructure } = this.state
		const newFormStructure = {...formStructure}

		if (arrayField === undefined) { // non-array field item
			delete newFormStructure.properties[fieldName]
		} else if (arrayField.length > 0 && arrayField !== '') { // array field item
			delete newFormStructure.properties[arrayField].items.properties[fieldName]
		}

		this.setState({ formStructure: newFormStructure })
	}

	update_hasArrayInFormField_onDeletion = (fields, deletedField) => {
		const { hasArrayInFormField: hasArrayInFormField_state  } = this.state

		if (isEmpty(fields)) return false
		
		else if (hasArrayInFormField_state && deletedField.dataType === 'array') {
			let hasArrayInFormField = false

			fields.forEach(field => {
				if (field !== deletedField) {
					hasArrayInFormField = hasArrayInFormField || field.dataType === 'array'
				}
			})

			return hasArrayInFormField
		}

		return hasArrayInFormField_state
	}

	deleteArrayField = (arrayFields_state, { dataType, fieldName }) => {
		let arrayFields = [...arrayFields_state]

		if (dataType === 'array') {
			const index = arrayFields_state.findIndex(field => field.fieldName === fieldName)
			arrayFields.splice(index, 1)
		}
		
		return arrayFields
	}

	handleAddField = () => {
		const { id } = queryString.parse(this.props.location.search)
		const { fieldName, dataType, defaultValue, arrayField } = this.state.input
		const { 
			fields, 
			arrayFields,
			hasArrayInFormField: hasArrayInFormField_state,
			isFieldOfArray 
		} = this.state

		const newField = { fieldName, dataType, defaultValue }
		let newFields = fields

		if (isFieldOfArray && !helper.isEmptyString(arrayField)) {
			newFields = this.addNewArrayFieldItem(fields, arrayField, newField)
		} else {
			newFields = this.addNewFormFields(fields, newField)
		}

		this.updateFormStructure(isFieldOfArray, newField)
		this.emptyFieldInput()

		let hasArrayInFormField = false || hasArrayInFormField_state
		let newArrayFields = arrayFields

		if (dataType === 'array') {
			hasArrayInFormField = true
			newArrayFields = this.addNewArrayField(arrayFields, newField)
		}

		// update viewConfig for exisiting collection
		if (id !== 'new' && !isFieldOfArray) {
			this.addFieldToViewConfig(fieldName)
		}

		this.setState({ 
			hasFormFieldsChanged: true,
			hasArrayInFormField,
			fields: newFields,
			arrayFields: newArrayFields
		})
	}

	addFieldToViewConfig (fieldName) {
		const { viewConfig } = this.state

		const lastOrder = Object.keys(viewConfig).reduce((order, item) => { 
      if (viewConfig[item].order > order) {
        return viewConfig[item].order
      }
      return order
    }, 0)

		const newViewConfig = {
			...viewConfig,
			[fieldName] : {
				displayName: fieldName,
				order: lastOrder + 1,
				showInTable: true
			}
		}

		this.setState({
			viewConfig: newViewConfig
		})
	}

	addNewArrayFieldItem = (fields, arrayField, newField) => {
		return fields.map(field => {
			if (field.fieldName === arrayField) {
				field.items.push({
					...newField,
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
			}

			return field
		})
	}

	addNewFormFields = (fields, { fieldName, dataType, defaultValue }) => {
		let newField = {
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

		if (dataType === 'array') {
			newField.items = []
		}

		return [...fields, newField]
	}

	emptyFieldInput = () => {
		const { input } = this.state

		const emptyInput = {
			fieldName: '',
			dataType: '',
			defaultValue: '',
			arrayField: ''
		}

		this.setState({ 
			isFieldOfArray: false,
			input: {
				...input, 
				...emptyInput
			}
		})
	}

	updateFormStructure = (isFieldOfArray, newField, field) => {
		const { isUpdatingArrayFieldItem } = this.state
		const newFormStructure = {...this.state.formStructure}
		const { fieldName, dataType, defaultValue } = newField

		if (isFieldOfArray) {
			const { arrayField } = this.state.input

			if (field != null && !isUpdatingArrayFieldItem) delete newFormStructure.properties[field.fieldName]

			if (dataType === 'date') {
				newFormStructure.properties[arrayField].items.properties[fieldName] = {
					title: fieldName,
					type: 'string',
					format: dataType,
					default: defaultValue
				}
			} else {
				newFormStructure.properties[arrayField].items.properties[fieldName] = {
					title: fieldName,
					type: dataType,
					default: defaultValue
				}
			}
		} else {
			if (dataType === 'date') {
				newFormStructure.properties[fieldName] = {
					title: fieldName,
					type: 'string',
					format: dataType,
					default: defaultValue
				}
			} else if (dataType === 'array') {
				newFormStructure.properties[fieldName] = {
					title: fieldName,
					type: dataType,
					items: {
						title: fieldName + '-items',
						type: 'object',
						properties: {}
					}
				}
			}	else if (dataType === 'file') {
				newFormStructure.properties[fieldName] = {
		      title: "Upload single file",
					type: "string",
		      format: "data-url"
				}
			} else {
				newFormStructure.properties[fieldName] = {
					title: fieldName,
					type: dataType,
					default: defaultValue
				}
			}
		}

		this.setState({ formStructure: newFormStructure })
	}

	addNewArrayField = (arrayFields, { fieldName }) => {
		return [
			...arrayFields, 
			{ fieldName, isShowItems: false }
		]
	}

	handleUpdateField = () => {
		const { id } = queryString.parse(this.props.location.search)
		const { fieldName, dataType, defaultValue, arrayField } = this.state.input
		let { fields } = this.state
		const { 
			isFieldOfArray, 
			currentIndex, 
			currentItemIndex, 
			arrayFields: arrayFields_state,
			isUpdatingArrayFieldItem
		} = this.state
		const field = fields[currentIndex]

		const newField = { fieldName, dataType, defaultValue }

		if (!isUpdatingArrayFieldItem && field.fieldName !== fieldName) {
			this.deleteFieldOnFormStructure(field.fieldName)
		} 
		else if (isUpdatingArrayFieldItem) {
			const fieldItem = field.items[currentItemIndex]

			if (fieldItem.fieldName !== fieldName) {
				this.deleteFieldOnFormStructure(fieldItem.fieldName, arrayField)
			}
		}

		this.updateFormStructure(isFieldOfArray, newField, field)

		let field_properties = { 
			fieldName, 
			dataType, 
			defaultValue,
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
		
		if (!isFieldOfArray) {
			field_properties = {
				...field_properties, 
				showInTable: true
			}	

			if (dataType === 'array') {
				const { items } = field
				field_properties = {...field_properties, items}
			}

			fields[currentIndex] = field_properties
		}


		// re-enable all action buttons
		fields = this.toggleActionButtons(fields, true)
		this.emptyFieldInput()

		let arrayFields = arrayFields_state

		if (dataType === 'array') { 
			arrayFields = this.addNewArrayField(arrayFields_state, newField)
			
			if (field.dataType !== 'array') {
				fields[currentIndex].items = []
			}
		}
		
		// if update is aimed to change a field to be items of other array field,
		// move field position to be inside that array field items and remove current field
		if (!isUpdatingArrayFieldItem && isFieldOfArray && !isEmpty(arrayField)) {
			const index = fields.findIndex(field => field.fieldName === arrayField)
			fields[index].items.push(field_properties)

			fields.splice(currentIndex, 1)
		}
		else if (isUpdatingArrayFieldItem) {
			fields[currentIndex].items[currentItemIndex] = field_properties
		}

		// update viewConfig for existing collection
		if (id !== 'new' && !isFieldOfArray) {
			this.updateViewConfig(field, fieldName)
		}

		this.setState({
			hasFormFieldsChanged: true,
			isNewField: true,
			currentIndex: -1,
			currentItemIndex: -1,
			isUpdatingArrayFieldItem: false,
			isUpdatingArrayField: '',
			isFieldOfArray: false,
			fields, 
			arrayFields
		})
	}

	updateViewConfig (field, fieldName) {
		const { viewConfig } = this.state
		let newViewConfig = {...viewConfig}

		if (field.fieldName !== fieldName) {		
			newViewConfig[fieldName] = {
				displayName: fieldName,
				order: newViewConfig[`${field.fieldName}`].order,
				showInTable: newViewConfig[`${field.fieldName}`].showInTable
			}

			delete newViewConfig[`${field.fieldName}`]
		}

		this.setState({
			viewConfig: newViewConfig
		})
	}

	handleInputChange = (inputType, {target}) => {
		const { input } = this.state

		switch (inputType) {
			case 'collection_name': 
				input.collectionName = target.value
				this.setState({	
					hasCollectionNameChanged: true,
					isCollectionNameOK: false
				})
				break

			case 'collection_description': 
				input.collectionDescription = target.value
				this.setState({
					hasFormFieldsChanged: true
				})
				break

			case 'field_name':
				input.fieldName = target.value
				break

			case 'data_type':
				input.dataType = target.value
				break

			case 'default_value':
				input.defaultValue = target.value
				break

			case 'array_field':
				input.arrayField = target.value
				break

			default:
		}
		
		this.setState({ input	})
	}

	isFieldNameExisted(fieldname) {
		const { input, fields, isFieldOfArray } = this.state
		const { arrayField } = input

		let isFieldNameExisted = fields.map(f => f.fieldName).indexOf(fieldname) >= 0
		
		if (isFieldOfArray) {
			if (arrayField) {
				// check inside array field		
				const index = fields.findIndex(f => f.fieldName === input.arrayField)
				isFieldNameExisted = fields[index].items.map(f => f.fieldName).indexOf(fieldname) >= 0
			} else {
				isFieldNameExisted = false
			}
		}

		return isFieldNameExisted
	}

	handleToggleIsFieldOfArray = ({ target }) => {
		this.setState({ isFieldOfArray: target.checked })
	}

	handleCheckCollectionName = () => {
		const { formId } = this.state
		const { collectionName } = this.state.input
		
		axios.get(`${API_URL}/check-collection-name?name=${collectionName}&id=${formId}`)
			.then(res => {
				const { isFound, currentName } = res.data
				let message, icon, isCollectionNameOK
				let hasFormFieldsChanged = false

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
					hasFormFieldsChanged = true
				}

				M.toast({
					html: icon + message,
					displayLength: 5000,
				})

				this.setState({ isCollectionNameOK, hasFormFieldsChanged })
			})
			.catch(e => console.error(e))
	}

	handleCreateCollection = () => {
		const { location } = this.props
		const { id } = queryString.parse(location.search)
		const { 
			formStructure, 
			fields,
			viewConfig,
			isAllowAttachment
		} = this.state
		const { collectionName, collectionDescription } = this.state.input

		let updatedFields = fields

		if (id !== 'new') {
			updatedFields = this.updateModifiedFields(fields)
		}

		const tableColumns = updatedFields.reduce((arr, field) => {
			return [...arr, { fieldName: field.fieldName, showInTable: field.showInTable }]
		}, [])
		
		formStructure.title = collectionName

		let data = {
			collectionName,
			collectionDescription,
			tableColumns, 
			isAllowAttachment,
			formStructure,
			formFields: updatedFields,
		}

		if (id !== 'new') {
			data = {...data, viewConfig}
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

	updateModifiedFields (fields) {
		const { user } = this.props
		const newDate = new Date().toISOString()

		return fields.map(field => {
			const { fieldName } = field

			if (fieldName === 'modifiedTime') {
				return { 
					...field,
					defaultValue: newDate, 
				}
			} else if (fieldName === 'modifiedBy') {
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
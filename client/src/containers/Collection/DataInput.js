import React, { Component } from 'react'
import axios from 'axios'
import Form from 'react-jsonschema-form'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../../utils/api_url'
import './DataInput.css'

class DataInput extends Component {
	constructor(props) {
		super(props)

		this.state = {
			formStructure: { title: 'Form', type: "object", properties: {} }
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
	        	ArrayFieldTemplate={this.arrayFieldTemplate}
	        	onError={this.log("errors")} />
	      </div>
			</div>
		)
	}

	componentWillMount() {
		const { location } = this.props
		const formId = location.search.slice(4)

		this.loadFormData(formId)
	}

	loadFormData (formId) {
		axios.get(`${API_URL}/form?id=${formId}`)
			.then(res => {
				this.setState({
					formStructure: res.data.data
				})
			})
			.catch(e => console.error(e))
	}
	 
	log = (type) => console.log.bind(console, type)

	onSubmit = (form) => {
		const { location } = this.props
		const formId = location.search.slice(4)
		const { formData } = form

		axios.post(`${API_URL}/record?id=${formId}`, formData)
			.then(res => {
				if (res.data.success) {
					M.toast({ html: 'Data submitted' })

					// call event api after saving data to database
					axios.post(`${API_URL}/call-events-api?form_id=${formId}&action_type=created`, formData)
					.then(res2 => {
						// redirect to collection page						
						this.props.history.push(`/collection?id=${formId}`)
					})
					.catch(err2 => console.error(err2))
				}
			})
			.catch(err => console.log(err))
	}

	arrayFieldTemplate = (props) => {
		const innerObjectProperties = props.items[0] ? props.items[0].children.props.schema.properties : {}
	  return (
	    <div>
	    	<fieldset>
	    	<legend className="array-field-title">{props.schema.title}</legend>
	    	<div className="row">
		    	<div className="col s11">
			    	<table>
							<thead>
								<tr className="array-item-table-head">
								{
									Object.keys(innerObjectProperties).map((property, index) => (
										<th key={index}>{innerObjectProperties[property].title}</th>
									))
								}
								</tr>
							</thead>
						</table>
					</div>
				</div>
	      {
	      	props.items.map((element, idx1) => {
	      		element.children.props.registry.ObjectFieldTemplate = innerObjectFieldTemplate
	      		return (
	      			<div className="row zero-margin">
		      			<div className="col s11">{element.children}</div>
		      			<div className="btn-actions-container">
			            {element.hasMoveDown && (
			              <span
			              	className="waves-effect waves-light btn btn-action-array-field"
			                onClick={element.onReorderClick(
			                  element.index,
			                  element.index + 1
			                )}>
			                <i className="material-icons">arrow_drop_down</i>
			              </span>
			            )}
			            {element.hasMoveUp && (
			              <span
			              	className="waves-effect waves-light btn btn-action-array-field"
			                onClick={element.onReorderClick(
			                  element.index,
			                  element.index - 1
			                )}>
			                <i className="material-icons">arrow_drop_up</i>
			              </span>
			            )}
			            <span 
			            	className="waves-effect waves-light btn btn-action-array-field"
			            	onClick={element.onDropIndexClick(element.index)}>
			              <i className="material-icons">delete</i>
			            </span>
			          </div>
	            </div>
	      		)
	      	})
	      }
	      {
	      	props.canAdd && 
	      	<span className="waves-effect waves-light btn btn-floating red right" onClick={props.onAddClick}>
	      		<i className="material-icons">add</i>
	      	</span>
	      }
	      </fieldset>
	    </div>
	  )
	}	
}

const innerObjectFieldTemplate = (props) => {
	return (
		<table>
		<tbody>
			<tr className="array-object-properties-row">
			{
				props.properties.map((property, idx2) => (
					<td key={idx2}>{property.content}</td>
				))
			}
			</tr>
		</tbody>
		</table>
	)
}

export default DataInput

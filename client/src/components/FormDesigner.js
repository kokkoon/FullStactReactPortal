import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Form from 'react-jsonschema-form'

import './FormDesigner.css'

class FormDesigner extends Component {
	constructor(props) {
		super(props);

		this.state = {
			formStructure: { title: 'New Form', type: "object", properties: {} },
			formControl: Object.keys(props.schema.properties).map(p => ({
											name: p,
											checked: false
										})),
			message: ''

		}
	}

	componentWillMount() {
		const { location } = this.props
		const id = location.search.slice(4)

		axios.get(`http://localhost:5000/form-designer?id=${id}`)
			.then(res => {
				this.setState({
					formStructure: res.data.data,
				})
			})
			.catch(e => console.error(e))
	}

	uiSchema: {
	  a_date: {
	    "alt-datetime": {
	      "ui:widget": "alt-datetime",
	      "ui:options": {
	        yearsRange: [1980, 2030],
	      },
	    },
	  },
	}
	 
	log = (type) => console.log.bind(console, type)

	onSubmit = (formData) => {
		const { location } = this.props
		const id = location.search.slice(4)
		const { formStructure } = this.state

		axios.post(`http://localhost:5000/create-form?id=${id}`, formStructure)
			.then(res => {
				this.setState({
					message: res.data.message
				})
			})
			.catch(err => console.log(err))
	}

	handleCheck(i) {
		const { formControl } = this.state
		const { schema } = this.props

		const newFormControl = formControl.map((c, idx) => {
			if (idx === i) {
				c.checked = !c.checked
			}

			return c
		})

		const checkedFormControl = newFormControl.filter(c => c.checked).map(c => c.name)

		const newProperties = 
			Object.keys(schema.properties)
				.filter(key => checkedFormControl.includes(key))
				.reduce((obj, key) => {
				    return {
				      ...obj,
				      [key]: schema.properties[key]
				    }
				  }, {})

		const formStructure = { ...schema, properties: { ...newProperties } }
		
		this.setState({
			formStructure,
			formControl: newFormControl
		})
	}

	render() {
		const { formStructure, formControl, message } = this.state

		return (
			<div className="form-designer">
			{
				formControl.map((c, i) => (
					<label>
		        <input 
		        	type="checkbox" 
		        	className="filled-in" 
		        	checked={c.checked ? "checked" : ""} 
		        	onClick={this.handleCheck.bind(this, i)}
		        />
		        <span>{c.name}</span>
		      </label>
				))
			}
			<Form 
				schema={formStructure}
      	onSubmit={this.onSubmit.bind(this)}
      	onError={this.log("errors")} />
			<h5>{message}</h5>
      </div>
		)
	}
}

FormDesigner.defaultProps = {
	schema: {
	  title: "Untitled Form",
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
	}
}

export default FormDesigner
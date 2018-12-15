import React, { Component } from 'react'
import axios from 'axios'
import Form from 'react-jsonschema-form'

import './DataInput.css'

class DataInput extends Component {
	// constructor(props) {
	// 	super(props)

	// 	this.state = {
			
	// 	}
	// }

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

	schema = {
	  title: "Task Form",
	  type: "object",
	  required: ["name", "assignedTo", "date"],
	  properties: {
	    name: { type: "string", title: "Name", default: "A new task" },
	    date: { type: "string", format: "date" },
	    assignedTo: { type: "string", title: "Assigned to" },
	    done: { type: "boolean", title: "Done?", default: false }
  	}
	};
	 
	log = (type) => console.log.bind(console, type)

	onSubmit = (formData) => {
		const formId = window.location.pathname.slice(12)
		console.log('formId = ', formId)
		axios.post(`http://localhost:5000/record?id=${formId}`, formData.formData)
			.then(res => console.log(res))
			.catch(err => console.log(err))
	}

	render() {
		return (
			<div className="center form-input">
				<h3>Input form</h3>
				<Form 
					uiSchema={this.uiSchema}
					schema={this.schema}
        	onSubmit={this.onSubmit.bind(this)}
        	onError={this.log("errors")} />
			</div>
		)
	}
}

export default DataInput;

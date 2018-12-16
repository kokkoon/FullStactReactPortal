import React, { Component } from 'react'
import axios from 'axios'

import './SetupPage.css'

class FormList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			formList: []
		}
	}

	componentWillMount() {
		// get form data from backend
		axios.get('http://localhost:5000/all-form')
			.then(res => {
				this.setState({
					formList: res.data.data
				})
			})
			.catch(e => console.error(e))
	}

	render() {
		const { formList } = this.state

		return (
			<div className="form-list">
			<h3>Form List</h3>
			{
				formList.map(form => (
					<a href={form.urlForm}>
						<div className="form-card">
							{form.name}
						</div>
					</a>
				))
			}
			</div>
		)
	}
}

export default FormList
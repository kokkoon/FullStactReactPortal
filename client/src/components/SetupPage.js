import React, { Component } from 'react'
import axios from 'axios'

import './SetupPage.css'

class SetupPage extends Component {
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
			<div className="setup-page">
			<h3>Form Setup Page</h3>
			<div className="new-form">
				<a className="waves-effect waves-light btn" href="/form-designer?id=new">create new form</a>
			</div>
			{
				formList.map(form => (
					<a href={form.urlDesigner}>
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

export default SetupPage
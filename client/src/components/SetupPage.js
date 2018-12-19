import React, { Component } from 'react'
import axios from 'axios'

import './SetupPage.css'

class SetupPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			collectionList: []
		}
	}

	componentWillMount() {
		// get form data from backend
		axios.get('http://localhost:5000/collection-list')
			.then(res => {
				this.setState({
					collectionList: res.data.data
				})
			})
			.catch(e => console.error(e))
	}

	render() {
		const { collectionList } = this.state

		return (
			<div className="setup-page">
			<h3>Form Setup Page</h3>
			<div className="new-form">
				<a className="waves-effect waves-light btn" href="/form-designer?id=new">create new form</a>
			</div>
			{
				collectionList.map(collection => (
					<a href={collection.urlDesigner}>
						<div className="form-card">
							{collection.name}
						</div>
					</a>
				))
			}
			</div>
		)
	}
}

export default SetupPage
import React, { Component } from 'react'
import axios from 'axios'

import './CollectionList.css'

class CollectionList extends Component {
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
			<div className="collection-list">
			<h3>Collection List</h3>
				<a href="/form-designer?id=new">
					<div className="collection-card">
						<span>New collection</span>
					</div>
				</a>
				{
					collectionList.map(collection => (
						<a href={collection.urlForm}>
							<div className="collection-card">
								{collection.name}
							</div>
						</a>
					))
				}
			</div>
		)
	}
}

export default CollectionList
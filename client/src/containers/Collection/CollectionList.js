import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

import API_URL from '../../utils/api_url'
import './CollectionList.css'

class CollectionList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			collectionList: []
		}
	}

	render() {
		const { collectionList } = this.state

		return (
			<div className="collection-list">
			<h3>Collection List</h3>
				<Link to="/form-designer?id=new">
					<div className="collection-card">
						<span className="collection-name">
							New collection
							<i className="material-icons new-collection-icon">add_circle</i>
						</span>
					</div>
				</Link>
				{
					collectionList.map((collection, i) => (
						<div key={i} className="collection-card">
							<span className="collection-name">{collection.name}</span>
							<Link className='link-open' to={collection.urlCollection}>Open</Link>
							<Link className='link-edit' to={collection.urlDesigner}>Edit</Link>
						</div>
					))
				}
			</div>
		)
	}

	componentWillMount () {
		this.loadCollectionList()
	}

	loadCollectionList () {
		axios.get(`${API_URL}/collection-list`)
			.then(res => {
				this.setState({
					collectionList: res.data.data
				})
			})
			.catch(e => console.error(e))
	}
}

export default CollectionList
import React, { Component } from 'react';
import axios from 'axios';

import Input from './Input';
import './Collection.css';

class Collection extends Component {
	constructor(props) {
		super(props);

		this.state = {
			schemaName: '',
			field1: '',
			field2: '',
		};
	}


	handleChangeSchemaName(e) {
		const schemaName = e.target.value;

		this.setState({ schemaName });
	}

	handleChangeField1(e) {
		const field1 = e.target.value;

		this.setState({ field1 });
	}

	handleChangeField2(e) {
		const field2 = e.target.value;

		this.setState({ field2 });
	}

	handleSubmit() {
		const data = this.state;

		axios.post('http://localhost:5000/create/collection', data)
			.then(res => console.log(res))
			.catch(err => console.log(err));

		// axios.get('http://localhost:5000/dbcheck')
		// 	.then(res => console.log(res))
		// 	.catch(err => console.log(err));

			// axios.post('http://localhost:5000/address', data)
			// .then(res => console.log(res))
			// .catch(err => console.log(err));
	}

	render() {
		const { name, address, email } = this.state;

		return (
			<div className="center">
				<h3>Create dynamic collection</h3>
				<div className="collection-form ">
					<Input autocomplete={'Schema Name'} value={name} onChange={this.handleChangeSchemaName.bind(this)} />
					<Input autocomplete={'Field 1'} value={address} onChange={this.handleChangeField1.bind(this)} />
					<Input autocomplete={'Field 2'} value={email} onChange={this.handleChangeField2.bind(this)} />
					<button class="btn waves-effect waves-light" type="submit" name="action" onClick={this.handleSubmit.bind(this)}>
						Submit
				    <i class="material-icons right">send</i>
				  </button>
				</div>
			</div>
		)
	}
}

export default Collection;

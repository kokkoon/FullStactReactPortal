import React, { Component } from 'react';
import axios from 'axios';

import Input from './Input';
import './Collection.css';

class DataInput extends Component {
	constructor(props) {
		super(props);

		this.state = {
			schemaName: '',
			field: '',
			type: '',
			value: '',
		};
	}


	handleChangeSchemaName(e) {
		const schemaName = e.target.value;

		this.setState({ schemaName });
	}

	handleChangeField(e) {
		const field = e.target.value;

		this.setState({ field });
	}

	handleChangeType(e) {
		const type = e.target.value;

		this.setState({ type });
	}

	handleChangeValue(e) {
		const value = e.target.value;

		this.setState({ value });
	}

	handleSubmit() {
		const data = this.state;

		axios.post('http://localhost:5000/create/collection', data)
			.then(res => console.log(res))
			.catch(err => console.log(err));
	}

	render() {
		const { name, field, type, value } = this.state;

		return (
			<div className="center">
				<h3>Create dynamic collection</h3>
				<div className="collection-form ">
					<Input autocomplete={'Schema Name'} value={name} onChange={this.handleChangeSchemaName.bind(this)} />
					<Input autocomplete={'Field'} value={field} onChange={this.handleChangeField.bind(this)} />
					<Input autocomplete={'Type'} value={type} onChange={this.handleChangeType.bind(this)} />
					<Input autocomplete={'Value'} value={value} onChange={this.handleChangeValue.bind(this)} />
					<button class="btn waves-effect waves-light" type="submit" name="action" onClick={this.handleSubmit.bind(this)}>
						Submit
				    <i class="material-icons right">send</i>
				  </button>
				</div>
			</div>
		)
	}
}

export default DataInput;

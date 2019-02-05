import React, { Component } from 'react'
import { connect } from 'react-redux'
// import axios from 'axios'
// import queryString from 'query-string'
// import M from 'materialize-css/dist/js/materialize.min.js'
// import Form from 'react-jsonschema-form'
// import { isEqual } from 'lodash'

// import { arrayFieldTemplate } from '../../utils/jsonSchemaFormUITemplate'
// import customFields from '../../utils/RJSFCustomFields'
// import * as helper from '../../utils/helperFunctions'
// import API_URL from '../../utils/api_url'
// import * as ACT from '../../actions'
import './FormDesigner.css'

class FormDesigner extends Component {
	constructor(props) {
		super(props)

		this.state = {
		}
	}

	render() {
		// const {		} = this.state

	  return (
			<div className="row form-designer">
				<div className="col s6 title left-align">
					<h5 className="zero-margin">Form designer</h5>
				</div>
			</div>
	  )
	}

	componentWillMount() {
		this.loadData()
	}

	componentDidMount() {
		// M.AutoInit()
	}

	loadData() {
		// const { location } = this.props

		// axios.get(`${API_URL}/form?id=${formId}`)
		// 	.then(res => {
				
		// 	})
		// 	.catch(e => console.error(e))
	}
}

const mapStateToProps = ({ user, form }) => ({
})

const mapDispatchToProps = (dispatch) => ({
})

export default connect(mapStateToProps, mapDispatchToProps) (FormDesigner)

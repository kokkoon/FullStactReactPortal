import React, { Component, Fragment } from 'react'
import Form from 'react-jsonschema-form'
// import { Link } from 'react-router-dom'
import M from 'materialize-css/dist/js/materialize.min.js'
import axios from 'axios'
import { isEmpty } from 'lodash'

import API_URL from '../utils/api_url'
import './ExternalCollectionPage.css'

class ExternalCollectionPage extends Component {
	constructor(props) {
    super(props)

    this.state = {
      // id: undefined,
      collectionName: 'External Content',
      column: ['name', 'subject', 'description', 'created', 'status', 'workflow', 'action'],
    	record: null,
      formSchema: { title: '', type: "object", properties: {} },
      uiSchema: {},
    }
  }

	componentWillMount() {
    axios.get(`${API_URL}/external-content`)
      .then(res => {
        const record = res.data.data.tasks
        // map keys in returned data to form schema properties
        let properties = Object.keys(record[0]).reduce((obj, key) => {
          return {...obj, [key] : {type: 'string', title: key, default: '' }}
        }, {})
        // add comment field in the form schema
        properties.comment = {type: 'string', title: 'comment'}

        const schema = {...this.state.formSchema, properties}

        this.setState({ 
          record,
          formSchema: schema
        })
      })
      .catch(err => console.log(err))
  }

  componentDidMount() {
    // materialize css initialization
    M.AutoInit()

    // alternative modal initialization in case error happens in future
    // let modal = document.querySelectorAll('.modal');
    // M.Modal.init(modal);
  }

  // deleteRecord = (index) => {
    // const { record } = this.state
    // // TODO: change formInstanceId to recordId from backend
    // const formId = record[index].formId
    // const recordId = record[index].formInstanceId

    // axios.delete(`${API_URL}/record?form_id=${formId}&record_id=${recordId}`)
    //   .then(res => {
    //     record.splice(index, 1)
    //     this.setState({ record })
    //   })
    //   .catch(e => console.error(e))
  // }

  handleEditRecord = (index) => {
    const { formSchema, record } = this.state
    const selectedRecord = record[index]
    const properties = formSchema.properties

    // add default value to show fields value in the form based on selected record
    const newProperties = Object.keys(properties).reduce((obj, key) => {
      if (key !== 'comment') {
        return {...obj, [key]: {...properties[key], default: selectedRecord[key] }}
      } else {
        return {...obj, [key]: {...properties[key] }}
      }
    }, {})

    // set UI schema for those fields to read-only
    const uiSchema = Object.keys(properties).reduce((obj, key) => {
      if (key !== 'comment') {
        return {...obj, [key] : { ["ui:readonly"]: true }}
      } else {
        return obj
      }
    }, {})

    this.setState({
      formSchema: {...formSchema, properties: newProperties},
      uiSchema
    })
  }

  onApprove = () => {
    const { formSchema } = this.state
    const id = formSchema.properties.id.default

    axios.patch(`${API_URL}/external-content?task_id=${id}`, {outcome: 'Approve'})
      .then(res => console.log('res = ', res))
      .catch(e => console.error(e))
  }

  onReject = () => {
    const { formSchema } = this.state
    const id = formSchema.properties.id.default

    axios.patch(`${API_URL}/external-content?task_id=${id}`, {outcome: 'Reject'})
      .then(res => console.log('res = ', res))
      .catch(e => console.error(e))
  }

  onSubmit = (formData) => {
    console.log('formData = ', formData)
  }

  render() {
    const { 
      collectionName, 
      column, 
      record,
      formSchema, 
      uiSchema,
      formData
    } = this.state
		// const id = window.location.search.slice(4)

    return (
      <div className="collection-page center">
        <div className="row">
        	<h5 className="collection-title">/ {collectionName}</h5>
          {/*<span className="button-new">
                      <Link className="waves-effect waves-light btn" to={`/data-input?id=${id}`}>New</Link>
                    </span>*/}
        </div>
        <div className="row">
        { 
          !record && <p> loading .... </p>
        }
        {
          record &&
          <Fragment>
            <div className="col s11">
                <table className="table-collection">
                  <thead>
                    <tr>
                      { !isEmpty(column) && column.map((c, i) => <th key={i}>{c}</th>) }
                    </tr>
                  </thead>

                  <tbody>
                    { 
                      record.map((r,i) => (
                        <tr key={i}>
                          {
                            Object.keys(r).filter(k => column.indexOf(k) >= 0) // filter data based on column
                            .sort((a, b) => (column.indexOf(a) - column.indexOf(b))) // sort data based on column order
                            .map((k, i_2) => (
                              <td key={i_2}>{r[k]}</td>
                            ))
                          }
                          <td>
                            <a className="modal-trigger" href="#modal-edit-record" onClick={e => this.handleEditRecord(i)}>
                              ...
                            </a> 
                          </td>
                        </tr>
                      )) 
                    }
                  </tbody>
                </table>
            </div>
            {/*<div className="col s1 delete-button-container">
                          <table className="table-delete-button">
                            <thead><tr><th></th></tr></thead>
                            <tbody>
                              { 
                                record && record.map((r, i) => (
                                  <tr key={i}>
                                    <td className="cell-delete-btn-container">
                                      <span className="waves-effect waves-light btn-floating red" 
                                         onClick={e => this.deleteRecord(i)}>
                                        <i className="small material-icons">delete</i>
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        </div>*/}
          </Fragment>
        }
        </div>
        <div id="modal-edit-record" className="modal">
          <div className="modal-content">
            <h5 className="title"><strong>Action on record</strong></h5>
            <div className="row">
              <div className="json-form">
                <Form 
                  uiSchema={uiSchema}
                  schema={formSchema}
                  onSubmit={this.onSubmit.bind(this)}
                >
                  <div className="btn-action-container">
                    <button className="btn btn-approve" type="button" onClick={this.onApprove}>Approve</button>
                    <button className="btn btn-reject" type="button" onClick={this.onReject}>Reject</button>
                    <button className="btn btn-submit" type="submit">Submit</button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ExternalCollectionPage

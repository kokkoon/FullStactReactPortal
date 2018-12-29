import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { isEmpty } from 'lodash'

import API_URL from '../utils/api_url'
import './ExternalCollectionPage.css'

class ExternalCollectionPage extends Component {
	constructor(props) {
    super(props)

    this.state = {
      id: undefined,
      collectionName: 'External Content',
      column: ['name', 'subject', 'description', 'created', 'status', 'workflow'],
    	record: null
    }
  }

	componentWillMount() {
    axios.get(`${API_URL}/external-content`)
      .then(res => {
        this.setState({ record: res.data.data.tasks })
      })
      .catch(err => console.log(err))
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

  render() {
    const { collectionName, column, record } = this.state
		const id = window.location.search.slice(4)

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
      </div>
    )
  }
}

export default ExternalCollectionPage

import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { isEmpty } from 'lodash'

import API_URL from '../utils/api_url'
import './CollectionPage.css'

class CollectionPage extends Component {
	constructor(props) {
    super(props)

    this.state = {
      id: undefined,
      collectionName: '',
      column: [],
    	record: null
    }
  }

	componentWillMount() {
		const id = window.location.search.slice(4)

    axios.get(`${API_URL}/form/?id=${id}`)
      .then(res => {
        const collectionName = res.data.data.title
        const rawColumn = res.data.column
        const column = rawColumn.filter(c => c.showInTable).map(c => c.fieldName)

        this.setState({ 
          collectionName,
          column 
        })
      })
      .catch(err => console.log(err))

    axios.get(`${API_URL}/record/?id=${id}`)
      .then(res => {
        this.setState({ 
          record: res.data.data
        })
      })
      .catch(err => console.log(err))
  }

  componentDidUpdate() {
		const id = window.location.search.slice(4)

    if (id !== this.state.id) {
      axios.get(`${API_URL}/form/?id=${id}`)
      .then(res => {
        const collectionName = res.data.data.title
        const rawColumn = res.data.column
        const column = rawColumn.filter(c => c.showInTable).map(c => c.fieldName)

        this.setState({ 
          collectionName,
          column 
        })
      })
      .catch(err => console.log(err))

      axios.get(`${API_URL}/record/?id=${id}`)
      .then(res => {
        this.setState({ record: res.data.data })
      })
      .catch(err => console.log(err))

      this.setState({ id })
    }
  }

  deleteRecord = (index) => {
    const { record } = this.state
    // TODO: change formInstanceId to recordId from backend
    const formId = record[index].formId
    const recordId = record[index].formInstanceId

    axios.delete(`${API_URL}/record?form_id=${formId}&record_id=${recordId}`)
      .then(res => {
        console.log(res)
        record.splice(index, 1)
        this.setState({ record })
      })
      .catch(e => console.error(e))
  }

  render() {
    const { collectionName, column, record } = this.state
		const id = window.location.search.slice(4)

    return (
      <div className="collection-page center">
        <div className="row">
        	<h5 className="collection-title">/ {collectionName}</h5>
          <span className="button-new">
            <Link className="waves-effect waves-light btn" to={`/data-input?id=${id}`}>New</Link>
          </span>
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
                            Object.keys(r).filter(k => column.indexOf(k) >= 0).map((k, i_2) => (
                              <td key={i_2}>{r[k]}</td>
                            ))
                          }
                        </tr>
                      )) 
                    }
                  </tbody>
                </table>
            </div>
            <div className="col s1 delete-button-container">
              <table className="table-delete-button">
                <thead><tr><th></th></tr></thead>
                <tbody>
                  { 
                    record && record.map((r, i) => (
                      <tr key={i}>
                        <td className="cell-delete-btn-container">
                          <a className="waves-effect waves-light btn-floating red" 
                             onClick={e => this.deleteRecord(i)}>
                            <i className="small material-icons">delete</i>
                          </a>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </Fragment>
        }
        </div>
      </div>
    )
  }
}

export default CollectionPage;

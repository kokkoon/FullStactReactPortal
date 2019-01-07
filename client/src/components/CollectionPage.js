import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { isEmpty } from 'lodash'
import queryString from 'query-string'

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
    const { id } = queryString.parse(this.props.location.search)

    this.setState({ id })
    this.loadCollectionName(id)
    this.loadRecord(id)
    this.loadTableViewConfig(id)
  }

  loadCollectionName(id) {
    axios.get(`${API_URL}/form/?id=${id}`)
      .then(res => {
        this.setState({ 
          collectionName: res.data.data.title 
        })
      })
      .catch(err => console.log(err))
  }

  loadRecord(id) {
    axios.get(`${API_URL}/record/?id=${id}`)
      .then(res => {
        this.setState({ 
          record: res.data.data
        })
      })
      .catch(err => console.log(err))
  }

  loadTableViewConfig(id) {
    axios.get(`${API_URL}/retrieve-table-view-config?form_id=${id}`)
      .then(response => {
        const tableViewConfig = response.data.data
        const filteredColumn = Object.keys(tableViewConfig).filter(key => tableViewConfig[key].showInTable)
        const sortedColumn = filteredColumn.sort((a, b) => tableViewConfig[a].order - tableViewConfig[b].order)
        
        this.setState({
          tableViewConfig,
          column: sortedColumn
        })
      })
      .catch(error => console.error(error))
  }

  componentDidUpdate() {
    const { id } = queryString.parse(this.props.location.search)

    if (id !== this.state.id) {
      this.setState({ id })
      this.loadCollectionName(id)
      this.loadRecord(id)
      this.loadTableViewConfig(id)
    }
  }

  deleteRecord = (index) => {
    const { record } = this.state
    // TODO: change formInstanceId to recordId from backend
    const formId = record[index].formId
    const recordId = record[index].formInstanceId

    axios.delete(`${API_URL}/record?form_id=${formId}&record_id=${recordId}`)
      .then(res => {
        record.splice(index, 1)
        this.setState({ record })
      })
      .catch(e => console.error(e))
  }

  render() {
    const { 
      id,
      collectionName, 
      column, 
      record, 
      tableViewConfig 
    } = this.state

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
                      { 
                        !isEmpty(column) && 
                        !isEmpty(tableViewConfig) &&
                        column.map((c, i) => <th key={i}>{tableViewConfig[c].displayName}</th>) 
                      }
                    </tr>
                  </thead>

                  <tbody>
                    { 
                      record.map((r,i) => (
                        <tr key={i}>
                          {
                            Object.keys(r).filter(key => column.indexOf(key) >= 0)
                              .sort((a, b) => tableViewConfig[a].order - tableViewConfig[b].order)
                              .map((filteredKey, idx) => (
                                <td key={idx}>{r[filteredKey]}</td>
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
            </div>
          </Fragment>
        }
        </div>
      </div>
    )
  }
}

export default CollectionPage;

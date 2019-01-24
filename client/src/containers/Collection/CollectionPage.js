import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { isEmpty } from 'lodash'
import queryString from 'query-string'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../../utils/api_url'
import { downloadURI } from '../../utils/helperFunctions'
import './CollectionPage.css'

export default class CollectionPage extends Component {
	constructor(props) {
    super(props)

    this.state = {
      id: undefined,
      collectionName: '',
      column: [],
    	record: null,
      downloadProgress: 0,
    }
  }

  render() {
    const { 
      id,
      collectionName, 
      column, 
      record, 
      tableViewConfig,
      downloadProgress
    } = this.state

    return (
      <div className="collection-page center">
        <div className="row">
        	<h5 className="collection-title">/ {collectionName}</h5>
          <span className="download-progress">

          </span>
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
          <div className="col s12 table-container zero-padding">
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
                        // show column that exists in 'column' variable
                        // sort the order of the filtered column based on order value in tableViewConfig
                        Object.keys(r).filter(key => column.indexOf(key) >= 0)
                          .sort((a, b) => tableViewConfig[a].order - tableViewConfig[b].order)
                          .map((filteredKey, idx) => (
                            <td key={idx}>{typeof(r[filteredKey]) === 'string' ? r[filteredKey] : JSON.stringify(r[filteredKey])}</td>
                          ))
                      }
                      {
                        r.filename &&
                        r.contentType &&
                        column.indexOf('attachment') > -1 &&
                        <td>
                          <span
                            className="download-link"
                            onClick={e => this.downloadFile(r.filename, r.contentType, r.size)}>
                            {r.filename.slice(33)}
                          </span>
                        </td>
                      }
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
        }
        </div>

        <div id="modal-download-progress" className="modal">
          <div className="modal-content">
            <h4>Download progress</h4>
            <div>
              <p>Downloading: {downloadProgress}%</p>
              <p>Please wait until download completed and this modal will close automatically</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  componentWillMount() {
    const { id } = queryString.parse(this.props.location.search)

    this.setState({ id })
    this.loadCollectionName(id)
    this.loadRecord(id)
    this.loadTableViewConfig(id)
  }

  componentDidMount() {
    M.AutoInit()
  }

  componentDidUpdate(prevProps, prevState) {
    const { id } = queryString.parse(this.props.location.search)

    if (id !== this.state.id) {
      this.setState({ id })
      this.loadCollectionName(id)
      this.loadRecord(id)
      this.loadTableViewConfig(id)
    }
  }

  loadCollectionName(id) {
    axios.get(`${API_URL}/form/?id=${id}`)
      .then(response => {
        this.setState({ 
          collectionName: response.data.data.title 
        })
      })
      .catch(error => console.log(error))
  }

  loadRecord(id) {
    axios.get(`${API_URL}/record/?id=${id}`)
      .then(response => {
        this.setState({ 
          record: response.data.data
        })
      })
      .catch(error => console.log(error))
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

  downloadFile = (filename, contentType, size) => {
    // open progress modal
    let modal = document.getElementById('modal-download-progress')
    M.Modal.getInstance(modal).open()

    const config = {
      responseType: 'arraybuffer',
      onDownloadProgress: progressEvent => {
        const progress = Math.round(progressEvent.loaded / size * 100)
        this.setState({ downloadProgress: progress })
      }
    }

    axios.get(`${API_URL}/download?filename=${filename}`, config)
      .then(res => {
        const file = new Blob([res.data], { type: contentType });
        const fileURL = URL.createObjectURL(file);
        const originalName = filename.slice(33)

        downloadURI(fileURL, originalName)

        // close modal dowload progress and reset value
        let modal = document.getElementById('modal-download-progress')
        M.Modal.getInstance(modal).close()
        this.setState({ downloadProgress: 0 })
      })
      .catch(err => console.log(err))
  }

  deleteRecord = (index) => {
    const { record } = this.state
    const { formId, _id: recordId } = record[index]

    axios.delete(`${API_URL}/record?form_id=${formId}&record_id=${recordId}`)
      .then(response => {
        this.loadRecord(formId)
      })
      .catch(error => console.error(error))
  }
}

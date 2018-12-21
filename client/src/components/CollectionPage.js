import React, { Component } from 'react'
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

  render() {
    const { collectionName, column, record } = this.state
		const id = window.location.search.slice(4)

    return (
      <div className="record center">
        <div className="row">
        	<h5 className="collection-title">/ {collectionName}</h5>
          <span className="button-new">
            <a className="waves-effect waves-light btn" href={`/data-input?id=${id}`}>New</a>
          </span>
        </div>
        <table className="table-collection">
          <thead>
            <tr>
              { !isEmpty(column) && column.map(c => <th>{c}</th>) }
            </tr>
          </thead>

          <tbody>
            { 
              !record && <p> loading .... </p>
            }
            { 
              record && record.map(r => (
                <tr>
                  {
                    Object.keys(r).filter(k => column.indexOf(k) >= 0).map(k => (
                      <td>{r[k]}</td>
                    ))
                  }
                </tr>
              )) 
            }
          </tbody>
        </table>
      </div>
    )
  }
}

export default CollectionPage;

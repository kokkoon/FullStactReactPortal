import React, { Component } from 'react'
import axios from 'axios'
import { isEmpty } from 'lodash'

import './CollectionPage.css'


class CollectionPage extends Component {
	constructor(props) {
    super(props)

    this.state = {
      id: undefined,
      column: [],
    	record: null
    }
  }

	componentWillMount() {
		const id = window.location.search.slice(4)

    axios.get(`http://localhost:5000/form/?id=${id}`)
      .then(res => {
        const rawColumn = res.data.column
        const column = rawColumn.filter(c => c.showInTable).map(c => c.fieldName)
        this.setState({ column })
      })
      .catch(err => console.log(err))

    axios.get(`http://localhost:5000/record/?id=${id}`)
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
      axios.get(`http://localhost:5000/form/?id=${id}`)
      .then(res => {
        const rawColumn = res.data.column
        const column = rawColumn.filter(c => c.showInTable).map(c => c.fieldName)
        this.setState({ column })
      })
      .catch(err => console.log(err))

      axios.get(`http://localhost:5000/record/?id=${id}`)
      .then(res => {
        this.setState({ record: res.data.data })
      })
      .catch(err => console.log(err))

      this.setState({ id })
    }
  }

  render() {
    const { column, record } = this.state
		const id = window.location.search.slice(4)

    console.log('column = ', column)
    console.log('record = ', record)

    return (
      <div className="record center">
      	<h5 className="collection-title">/ Collection {id}</h5>
        <div className="button-new">
          <a className="waves-effect waves-light btn" href={`/data-input?id=${id}`}>New</a>
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

                  {/*<td>{r.name}</td>
                                    <td>{d.date}</td>
                                    <td>{d.assignedTo}</td>
                                    <td>{d.done ? <i className="done material-icons">check_circle</i> : <i className="not-done material-icons">do_not_disturb_on</i>}</td>*/}
                </tr>
              )) 
            }
          </tbody>
        </table>
      </div>
    );
  }
};

// this is config data to configure column table
CollectionPage.defaultProps = {
  column: [
    {
      label: 'Name',
      display: true,
    },
    {
      label: 'Date',
      display: true,
    },
    {
      label: 'Due',
      display: false,
    },
    {
      label: 'Assigned to',
      display: true,
    },
    {
      label: 'Done',
      display: true,
    },
  ]
}

export default CollectionPage;

import React, { Component } from 'react';
import axios from 'axios';
import './CollectionPage.css';

class CollectionPage extends Component {
	constructor(props) {
    super(props)

    this.state = {
    	record: null
    }
  }

	componentWillMount() {
		const id = window.location.search.slice(4)
    axios.get(`http://localhost:5000/record/?id=${id}`)
      .then(res => {
        this.setState({ record: res.data.data })
      })
      .catch(err => console.log(err))
  }

  componentDidUpdate() {
		const id = window.location.search.slice(4)
    axios.get(`http://localhost:5000/record/?id=${id}`)
      .then(res => {
        this.setState({ record: res.data.data })
      })
      .catch(err => console.log(err))
  }

  render() {
    const { column, data } = this.props
    const { record } = this.state
		const id = window.location.search.slice(4)


    return (
      <div className="record center">
      	<h3 className="center">Collection {id}</h3>
        <table>
          <thead>
            <tr>
              { column.filter(c => c.display).map(c => <th>{c.label}</th>) }
            </tr>
          </thead>

          <tbody>
            { 
              !record && <p> loading .... </p>
            }
            { 
              record && record.map(d => (
                <tr>
                  <td>{d.name}</td>
                  <td>{d.date}</td>
                  <td>{d.assignedTo}</td>
                  <td>{d.done ? <i className="done material-icons">check_circle</i> : <i className="not-done material-icons">do_not_disturb_on</i>}</td>
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

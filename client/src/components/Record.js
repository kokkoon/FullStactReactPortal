import React, { Component } from 'react';
import axios from 'axios';
import './Record.css';

class Record extends Component {
  constructor(props) {
    super(props)

    this.state = {
      
    }
  }

  componentWillMount() {
    // axios.get('http://localhost:5000/record')
    //   .then(res => {
    //     this.setState({ record: res.data.data })
    //   })
    //   .catch(err => console.log(err))
  }

  render() {
    const { column, data } = this.props

    return (
      <div className="record center">
        <table>
          <thead>
            <tr>
              { column.filter(c => c.display).map(c => <th>{c.label}</th>) }
            </tr>
          </thead>

          <tbody>
            { 
              data.filter(d => d.display).map(d => (
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

// this is fake data to simulate data from DB
Record.defaultProps = {
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
  ],
  data: [
    {
      name: 'create page full screen',
      date: new Date().toString().slice(0,16),
      assignedTo: 'iqbal',
      done: true,
      due: 'today',
      display: false,
    },
    {
      name: 'create sidenav',
      date: new Date().toString().slice(0,16),
      assignedTo: 'iqbal',
      done: true,
      due: 'today',
      display: true,
    },
    {
      name: 'create dynamic collection',
      date: new Date().toString().slice(0,16),
      assignedTo: 'iqbal',
      done: true,
      due: 'today',
      display: true,
    },
    {
      name: 'create form page',
      date: new Date().toString().slice(0,16),
      assignedTo: 'iqbal',
      done: true,
      due: 'today',
      display: true,
    },
    {
      name: 'create record page',
      date: new Date().toString().slice(0,16),
      assignedTo: 'iqbal',
      done: true,
      due: 'today',
      display: true,
    },
    {
      name: 'create form designer page',
      date: new Date().toString().slice(0,16),
      assignedTo: 'iqbal',
      done: false,
      due: 'today',
      display: true,
    }
  ]
}

export default Record;

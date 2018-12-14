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
    const { title, record } = this.props

    return (
      <div className="record center">
        <table>
          <thead>
            <tr>
              { title.filter(t => t.display).map(t => <th>{t.label}</th>) }
            </tr>
          </thead>

          <tbody>
            { 
              record.filter(r => r.display).map(r => (
                <tr>
                  <td>{r.name}</td>
                  <td>{r.date}</td>
                  <td>{r.assignedTo}</td>
                  <td>{r.done ? <i className="done material-icons">check_circle</i> : <i className="not-done material-icons">do_not_disturb_on</i>}</td>
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
  title: [
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
  record: [
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

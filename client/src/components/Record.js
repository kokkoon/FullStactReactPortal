import React, { Component } from 'react';
import axios from 'axios';
import './Record.css';

class Record extends Component {
  constructor(props) {
    super(props)

    this.state = {
      record: null
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
    const { record } = this.state

    return (
      <div className="record center">
        {record && record.map(item => (
          <div>{item.name}</div>
        ))}
      </div>
    );
  }
};

export default Record;

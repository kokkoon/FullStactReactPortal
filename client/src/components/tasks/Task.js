import React, { Component } from 'react';
import './Task.css';

class Task extends Component {

  render() {
    const { task } = this.props.location.state;

    return (
      <div className="task center">
        <h4>Task: {task.title}</h4>
        <p>Description: {task.description}</p>
      </div>
    );
  }
};

export default Task;

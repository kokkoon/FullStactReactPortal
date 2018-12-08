// TaskNew shows TaskForm and TaskFormReview
import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import TaskForm from './TaskForm';
import TaskFormReview from './TaskFormReview';

class TaskNew extends Component {
  //constructor(props) {
  //  super(props);
  //  this.state = { new: true };
  //}

  state = { showFormReview: false };

  renderContent() {
    if (this.state.showFormReview) {
      return <TaskFormReview
        onCancel={() => this.setState({ showFormReview: false })}
      />
    }

    return (
      <TaskForm onTaskSubmit={() => this.setState({ showFormReview: true })} />
    );
  }

  render() {
    return (
      <div>
        {this.renderContent()}
      </div>
    );
  }
}

export default reduxForm({
  form: 'taskForm'
})(TaskNew);

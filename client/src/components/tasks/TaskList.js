import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchTasks } from '../../actions';

class TaskList extends Component {
  componentDidMount() {
    this.props.fetchTasks();
  }

  renderTasks() {
    return this.props.tasks.map(task => {
      return (
        <div className="card darken-1" key={task._id}>
          <div className="card-content">
            <span className="card-title">{task.title}</span>
            <p>
              {task.description}
            </p>
          </div>
        </div>
      );
    });
  }

  render() {
    return (
      <div>
        {this.renderTasks()}
      </div>
    );
  }
}

function mapStateToProps({ tasks }) {
  return { tasks };
}

export default connect(mapStateToProps, { fetchTasks })(TaskList);

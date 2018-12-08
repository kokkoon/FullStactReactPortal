import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchTasks } from '../../actions';

class TaskList extends Component {
  componentDidMount() {
     this.props.fetchTasks();
  }

  renderTasks() {
//    const { tasks } = this.props;

//    return tasks.map(task => {
    return this.props.tasks.map(task => {
      return (
        <div className="card darken-1" key={task._id}>
//          <Link to={{
//            pathname: '/task',
//            state: {task},
//          }}>
            <div className="card-content">
              <span className="card-title">{task.title}</span>
              <p>{task.description}</p>
            </div>
//          </Link>
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

// export default TaskList;

function mapStateToProps({ tasks }) {
  return { tasks };
}

export default connect(mapStateToProps, { fetchTasks })(TaskList);

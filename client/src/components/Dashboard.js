import React from 'react';
import { Link } from 'react-router-dom';
import TaskList from './tasks/TaskList';

const Dashboard = () => {
  return (
		<div>
			<TaskList />
			<div className="fixed-action-btn">
				<Link to="/tasks/new" className="btn-floating btn-large red">
				<i className="material-icons">add</i>
				</Link>
			</div>
		</div>
  );
};

export default Dashboard;

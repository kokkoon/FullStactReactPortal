import React from 'react';
import { Link } from 'react-router-dom';
import TaskList from './tasks/TaskList';

const defaultTask = [
	{	id: 1,
		title: 'first task',
		description: 'first task description',
	},
	{	id: 2,
		title: 'second task',
		description: 'second task description',
	},
	{	id: 3,
		title: 'third task',
		description: 'third task description',
	}
];

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

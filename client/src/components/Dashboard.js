import React from 'react';
//import { Link } from 'react-router-dom';
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
      <TaskList tasks={defaultTask}/>
    </div>
  );
};

export default Dashboard;

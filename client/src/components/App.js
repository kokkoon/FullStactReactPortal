import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../actions';
import './App.css';
import M from 'materialize-css/dist/js/materialize.min.js';

import Header from './Header';
import Landing from './Landing';
import Dashboard from './Dashboard';
import Sidenav from './Sidenav';
import Task from './tasks/Task';
import TaskNew from './tasks/TaskNew';
import Record from './Record';
import User from './User';

class App extends Component {
  componentDidMount(){
    this.props.fetchUser();

    //initialize the materialize script effect
    M.AutoInit();
  }

  render() {
    return (
        <BrowserRouter>
        <div className="container">
          <Header />
          <Route exact path="/" component={Landing} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/task" component={Task} />
          <Route path="/tasks/new" component={TaskNew} />
          <Route exact path="/record" component={Record} />
          <Route exact path="/user" component={User} />
          {/*<Route path="" render={() => <Redirect to='/' />} />*/}

          Landing

        </div>
        </BrowserRouter>
    );
  }
};

export default connect(null, actions)(App);

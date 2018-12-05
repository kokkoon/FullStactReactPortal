import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../actions';
import './App.css';
import M from 'materialize-css/dist/js/materialize.min.js';
import { Button, Icon } from 'react-materialize';

import Header from './Header';
import Landing from './Landing';
import Dashboard from './Dashboard';
import Sidenav from './Sidenav';
import Task from './tasks/Task';
import TaskList from './tasks/TaskList';
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
          <Route exact path="/record" component={Record} />
          <Route exact path="/user" component={User} />
          {/*<Route path="" render={() => <Redirect to='/' />} />*/}

          <div class="carousel">
            <a class="carousel-item" href="#one!"><img src="https://lorempixel.com/250/250/nature/1"/></a>
            <a class="carousel-item" href="#two!"><img src="https://lorempixel.com/250/250/nature/2"/></a>
            <a class="carousel-item" href="#three!"><img src="https://lorempixel.com/250/250/nature/3"/></a>
            <a class="carousel-item" href="#four!"><img src="https://lorempixel.com/250/250/nature/4"/></a>
            <a class="carousel-item" href="#five!"><img src="https://lorempixel.com/250/250/nature/5"/></a>
          </div>
          
          </div>
        </BrowserRouter>
    );
  }
};

export default connect(null, actions)(App);

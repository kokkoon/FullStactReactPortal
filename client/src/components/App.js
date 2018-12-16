import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../actions';
import './App.css';
import M from 'materialize-css/dist/js/materialize.min.js';

import Header from './Header';
import Landing from './Landing';
import Dashboard from './Dashboard';
import Task from './tasks/Task';
import TaskNew from './tasks/TaskNew';
import Record from './Record';
import User from './User';
import DataInput from './DataInput';
import FormDesigner from './FormDesigner';
import DNDFormDesigner from './DNDFormDesigner';
import Collection from './Collection';
import CollectionPage from './CollectionPage';
import SetupPage from './SetupPage';
import FormList from './FormList';

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
          <Route exact path="/data-input" component={DataInput} />
          <Route exact path="/test/collection" component={Collection} />
          <Route exact path="/collection" component={CollectionPage} />
          <Route exact path="/form-designer" component={FormDesigner} />
          <Route exact path="/dnd-form-designer" component={DNDFormDesigner} />
          <Route exact path="/setup" component={SetupPage} />
          <Route exact path="/form" component={FormList} />
        </div>

        </BrowserRouter>
    );
  }
};

export default connect(null, actions)(App);

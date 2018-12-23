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
import User from './Admin/User';
import Settings from './Admin/Settings';
import DataInput from './DataInput';
import FormDesigner from './FormDesigner';
import DNDFormDesigner from './DNDFormDesigner';
import Collection from './Collection';
import CollectionPage from './CollectionPage';
import SetupPage from './SetupPage';
import CollectionList from './CollectionList';

class App extends Component {
  componentWillMount(){
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
          <Route exact path="/user" component={User} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/data-input" component={DataInput} />
          <Route exact path="/test/collection" component={Collection} />
          <Route exact path="/collection" component={CollectionPage} />
          <Route exact path="/form-designer" component={FormDesigner} />
          <Route exact path="/dnd-form-designer" component={DNDFormDesigner} />
          <Route exact path="/setup" component={SetupPage} />
          <Route exact path="/collection-list" component={CollectionList} />
        </div>

        </BrowserRouter>
    );
  }
};

export default connect(null, actions)(App);

import React, { Component } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import * as actions from '../actions'
import './App.css'

import Header from './Header'
import Landing from './Landing'
import Dashboard from './Dashboard'
import Task from './tasks/Task'
import TaskNew from './tasks/TaskNew'
import User from './Admin/User'
import Settings from './Admin/Settings'
import DataInput from './DataInput'
import FormDesigner from './FormDesigner'
import CollectionPage from './CollectionPage'
import CollectionList from './CollectionList'
import ProfilePage from './ProfilePage'
import SidenavSetup from './SidenavSetup'
import SidenavSetupRaw from './SidenavSetupRaw'
import ExternalCollectionPage from './ExternalCollectionPage'
import DesignForm from './DesignForm'

// comment unused components for later probable use
// import Collection from './Collection'
// import DNDFormDesigner from './DNDFormDesigner'

class App extends Component {
  componentWillMount(){
    this.props.fetchUser()
    this.props.setApp('default')
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
          <Route exact path="/collection" component={CollectionPage} />
          <Route exact path="/collection-list" component={CollectionList} />
          <Route exact path="/form-designer" component={FormDesigner} />
          <Route exact path="/profile" component={ProfilePage} />
          <Route exact path="/sidenav-setup" component={SidenavSetup} />
          <Route exact path="/sidenav-setup-raw" component={SidenavSetupRaw} />
          <Route exact path="/external-collection" component={ExternalCollectionPage} />
          <Route exact path="/design-form" component={DesignForm} />
          {/*
                    <Route exact path="/test/collection" component={Collection} />
                    <Route exact path="/dnd-form-designer" component={DNDFormDesigner} />*/}
        </div>

        </BrowserRouter>
    );
  }
};

export default connect(null, actions)(App)

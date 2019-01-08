import React, { Component } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import * as actions from '../actions'
import './App.css'

import Header from './Header'
import Landing from './Landing'
import Dashboard from './Dashboard'
import User from './Admin/User'
import Settings from './Admin/Settings'
import DataInput from './DataInput'
import FormDesigner from './FormDesigner'
import CollectionPage from './CollectionPage'
import CollectionList from './CollectionList'
import ProfilePage from './ProfilePage'
import SidenavSetup from './SidenavSetup'
import ExternalCollectionPage from './ExternalCollectionPage'
import DesignForm from './DesignForm'

class App extends Component {

  render() {
    return (
        <BrowserRouter>
        <div className="container">
          <Header />
          <Route exact path="/" component={Landing} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/user" component={User} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/data-input" component={DataInput} />
          <Route exact path="/collection" component={CollectionPage} />
          <Route exact path="/collection-list" component={CollectionList} />
          <Route exact path="/form-designer" component={FormDesigner} />
          <Route exact path="/profile" component={ProfilePage} />
          <Route exact path="/sidenav-setup" component={SidenavSetup} />
          <Route exact path="/external-collection" component={ExternalCollectionPage} />
          <Route exact path="/design-form" component={DesignForm} />
        </div>

        </BrowserRouter>
    );
  }
  
  componentWillMount() {
    this.props.fetchUser()
    this.props.setApp('default')
  }
};

export default connect(null, actions)(App)

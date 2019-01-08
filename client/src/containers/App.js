import React, { Component } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import * as actions from '../actions'
import './App.css'

import Topnav from './Topnav/Topnav'
import User from './Admin/User'
import Settings from './Admin/Settings'
import DataInput from './Collection/DataInput'
import CollectionPage from './Collection/CollectionPage'
import CollectionList from './Collection/CollectionList'
import ExternalCollectionPage from './Collection/ExternalCollectionPage'
import SidenavSetup from './Sidenav/SidenavSetup'
import FormDesigner from './Form/FormDesigner'
import DesignForm from './Form/DesignForm'
import Dashboard from './Dashboard/Dashboard'
import Landing from './LandingPage/Landing'
import ProfilePage from './ProfilePage/ProfilePage'

class App extends Component {

  render() {
    return (
        <BrowserRouter>
        <div className="container">
          <Topnav />
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
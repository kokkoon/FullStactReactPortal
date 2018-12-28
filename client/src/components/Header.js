import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import M from 'materialize-css/dist/js/materialize.min.js'

import Payments from './Payments'
import Sidenav from './Sidenav'
import UserMenu from './UserMenu'
import * as ACT from '../actions'

import './Header.css'

class Header extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedItem: ''
    }
  }

  handleClickDashboard = () => {
    this.setSidenavUser()
    this.setState({ selectedItem: 'dashboard' })
  }

  handleClickAdmin = () => {
    this.setSidenavAdmin()
    this.setState({ selectedItem: 'admin' })
  }

  setSidenavUser = () => {
    this.props.setCollectionNavItem()
    this.props.setDefaultNavItem()
    this.props.setApp('default')
  }

  setSidenavAdmin = () => {
    this.props.setSidenavAdmin()
    this.props.setApp('admin')
  }

  renderContent() {
    const { selectedItem } = this.state

    switch (this.props.user.isLoggedIn) {
      case false:
        return <li><a href="/auth/google">Login with Google</a></li>
      case true:
        return ( 
          <ul className="right">
            <li>
              <Link 
                className={selectedItem === 'dashboard' ? "selected" : ""} 
                to="/dashboard" 
                onClick={this.handleClickDashboard}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                className={selectedItem === 'admin' ? "selected" : ""} 
                to="/user" 
                onClick={this.handleClickAdmin}>
                Admin
              </Link>
            </li>
          </ul>
        )
      default:
        return <li><a href="/auth/google">Login With Google</a></li>
    }
  }

  render() {
    const { selectedItem } = this.state
    const dropdown_menu_item = [
      <li className="non-hoverable"><Payments /></li>,
      <li className="non-hoverable" style={{padding: '15px'}}>Credits: {this.props.user.credits}</li>,
      <li><Link to="/profile">Profile</Link></li>,
      <li><a href="/api/logout">Logout</a></li>
    ]

    return (
      <nav>
        <Sidenav />
        <div className="nav-wrapper">
          <Link
            to={this.props.user ? '/dashboard' : '/'}
            onClick={this.setSidenavUser}
            className="brand-logo left"
          >
             FLOWNGIN
          </Link>
          <UserMenu
            className="right"
            item={dropdown_menu_item} 
          />
          {this.renderContent()}
        </div>
      </nav>
    );
  }
}

function mapStateToProps({ user }) {
  return { user }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setApp: (appName) => dispatch(ACT.setApp(appName)),
    setDefaultNavItem: () => dispatch(ACT.setDefaultNavItem()),
    setSidenavAdmin: () => dispatch(ACT.setSidenavAdmin()),
    setCollectionNavItem: () => dispatch(ACT.setCollectionNavItem()),
    loadCollectionNavItemLinks: () => dispatch(ACT.loadCollectionNavItemLinks())
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (Header);

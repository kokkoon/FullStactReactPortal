import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import './Header.css'

import Payments from './Payments'
import Sidenav from './Sidenav'
import * as ACT from '../actions'


class Header extends Component {
  constructor(props) {
    super(props)

    this.state = {

    }
  }

  setSidenavUser = () => {
    this.props.setCollectionNavItem()
    this.props.loadCollectionNavItemLinks()
    this.props.unsetSidenavAdmin()
  }

  setSidenavAdmin = () => {
    this.props.setSidenavAdmin()
  }

  renderContent() {
    switch (this.props.user.isLoggedIn) {
      case false:
        return <li><a href="/auth/google">Login with Google</a></li>
      case true:
        return [
          <li key="1"><Link to="/user" onClick={this.setSidenavAdmin}>Admin</Link></li>,
          <li key="2"><Payments /></li>,
          <li key="3" style={{ margin: '0 10px'}}>
            Credits: {this.props.user.credits}
          </li>,
          <li key="4"><a href="/api/logout">Logout</a></li>
        ];
      default:
        return <li><a href="/auth/google">Login With Google</a></li>
    }
  }

  render() {
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
          <ul className="right">
             {this.renderContent()}
          </ul>
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
    setSidenavAdmin: () => dispatch(ACT.setSidenavAdmin()),
    unsetSidenavAdmin: () => dispatch(ACT.unsetSidenavAdmin()),
    setCollectionNavItem: () => dispatch(ACT.setCollectionNavItem()),
    loadCollectionNavItemLinks: () => dispatch(ACT.loadCollectionNavItemLinks())
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (Header);

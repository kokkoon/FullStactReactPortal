import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import './Header.css';

import Payments from './Payments';
import Sidenav from './Sidenav';


class Header extends Component {
  renderContent() {
    switch (this.props.user.isLoggedIn) {
      case false:
        return <li><a href="/auth/google">Login With Google</a></li>
      case true:
        return [
          <li key="1"><Payments /></li>,
          <li key="3" style={{ margin: '0 10px'}}>
            Credits: {this.props.user.credits}
          </li>,
          <li key="2"><a href="/api/logout">Logout</a></li>
        ];
      default:
        return <li><a href="/auth/google">Login With Google</a></li>
    }
  }

  render() {
    console.log(this.props)
    return (
      <nav>
        <Fragment>
          <Sidenav />
        </Fragment>
         <div className="nav-wrapper">
          <Link
            to={this.props.user ? '/dashboard' : '/'}
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
  return { user };
}

export default connect(mapStateToProps) (Header);

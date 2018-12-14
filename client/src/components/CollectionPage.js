import React, { Component } from 'react';
import './CollectionPage.css';

class CollectionPage extends Component {

  render() {
    return (
      <div className="user center">
        <h4>Collection Page {window.location.search.slice(4,5)}</h4>
        <p>This is collection page for form type {window.location.search.slice(4,5)}</p>
      </div>
    );
  }
};

export default CollectionPage;

import 'materialize-css/dist/css/materialize.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';

import App from './components/App';
import reducers from './reducers';

//  Development only axios helpers!
import axios from 'axios';
window.axios = axios;

// alternative setup redux-thunk with redux devtools in case facing error in the future
// const storeEnhancers = (middleware) => 
// 	compose(middleware,  
// 					window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f)

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducers, storeEnhancers(applyMiddleware(reduxThunk)))
window.store = store

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.querySelector('#root')
);

import { combineReducers } from 'redux';
import { reducer as reduxForm } from 'redux-form';
import userReducer from './userReducer';
import tasksReducer from './tasksReducer';

export default combineReducers ({
  user: userReducer,
  form: reduxForm,
  tasks: tasksReducer
});

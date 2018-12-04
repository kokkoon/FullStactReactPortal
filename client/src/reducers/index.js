import { combineReducers } from 'redux';
import { reducer as reduxForm } from 'redux-form';
import authReducer from './authReducer';
import tasksReducer from './tasksReducer';

export default combineReducers ({
  auth: authReducer,
  form: reduxForm,
  tasks: tasksReducer
});

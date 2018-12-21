import axios from 'axios';

import API_URL from '../utils/api_url'
import { 
	FETCH_USER, 
	FETCH_TASKS,
	LOAD_COLLECTION_NAV_ITEM_LINKS
} from './types';

export const fetchUser = () => async dispatch => {
   const res = await axios.get('/api/current_user');

   dispatch({ type: FETCH_USER, payload: res.data });
};

export const handleToken = token => async dispatch => {
  const res = await axios.post('/api/stripe', token);

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const submitTask = (values, history) => async dispatch => {
  const res = await axios.post('/api/tasks', values);

  history.push('/tasks');
  dispatch({ type: FETCH_USER, payload: res.data });
};

export const fetchTasks = () => async dispatch => {
  const res = await axios.get('/api/tasks');

  dispatch({ type: FETCH_TASKS, payload: res.data });
};

export const loadCollectionNavItemLinks = () => {
	return (dispatch) => {
		axios.get(`${API_URL}/sidenav-links`)
			.then(res => {
				dispatch({ type: LOAD_COLLECTION_NAV_ITEM_LINKS, payload: res.data.data })
			})
			.catch(e => console.error(e))
	}
}
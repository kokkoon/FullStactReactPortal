import axios from 'axios';

import API_URL from '../utils/api_url'
import * as TYPES from './types';

export const fetchUser = () => async dispatch => {
   const res = await axios.get('/api/current_user');

   dispatch({ type: TYPES.FETCH_USER, payload: {...res.data, isLoggedIn: res.data.googleId != null} });
};

export const handleToken = token => async dispatch => {
  const res = await axios.post('/api/stripe', token);

  dispatch({ type: TYPES.FETCH_USER, payload: res.data });
};

export const submitTask = (values, history) => async dispatch => {
  const res = await axios.post('/api/tasks', values);

  history.push('/tasks');
  dispatch({ type: TYPES.FETCH_USER, payload: res.data });
};

export const fetchTasks = () => async dispatch => {
  const res = await axios.get('/api/tasks');

  dispatch({ type: TYPES.FETCH_TASKS, payload: res.data });
};

export const setCollectionNavItem = () => {
	return (dispatch) => {
		axios.get(`${API_URL}/sidenav-links`)
			.then(res => {
				const collectionNavItem = {
					header: 'Collections',
					dividerBottom: true,
					links: res.data.data
				}

				dispatch({ type: TYPES.SET_COLLECTION_NAV_ITEM, collectionNavItem })
			})
			.catch(e => console.error(e))
	}
}

export const loadCollectionNavItemLinks = () => {
	return (dispatch) => {
		axios.get(`${API_URL}/sidenav-links`)
			.then(res => {
				dispatch({ type: TYPES.LOAD_COLLECTION_NAV_ITEM_LINKS, payload: res.data.data })
			})
			.catch(e => console.error(e))
	}
}

export const setSidenavAdmin = () => {
	return (dispatch) => {
		const defaultNavItem = {
			header: 'Admin',
			links: [
				{	name: 'user',
					route: '/user',
					icon: 'account_circle',
					text: 'User management',
				},
				{	name: 'settings',
					route: '/settings',
					icon: 'settings',
					text: 'Settings',
				},
			],
			dividerBottom: false,
		}

		dispatch({ type: TYPES.SET_ADMIN_SIDENAV_LINKS, defaultNavItem })
	}
}

export const unsetSidenavAdmin = () => {
	return (dispatch) => {
		dispatch({ type: TYPES.UNSET_ADMIN_SIDENAV_LINKS })
	}
}

export const setSidenavFromConfig = (collections, groupLinks) => {
	return (dispatch) => {
		const collectionNavItem = {
			header: 'Collections',
			dividerBottom: true,
			links: [...collections]
		}

		dispatch({ type: TYPES.SET_COLLECTION_NAV_ITEM, collectionNavItem })
		dispatch({ type: TYPES.SET_SIDENAV_FROM_CONFIG, sidenavGroupLinks: groupLinks })
	}
}

export const unsetSidenavFromConfig = () => {
	return (dispatch) => {
		dispatch({ type: TYPES.SET_SIDENAV_FROM_CONFIG, sidenav: undefined })
	}
}
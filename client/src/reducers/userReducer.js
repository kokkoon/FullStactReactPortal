import * as TYPES from '../actions/types';

const initialState = {
	isLoggedIn: false,
}

export default function(state = initialState, action) {
  switch (action.type) {
    case TYPES.FETCH_USER:
      return { ...state, ...action.payload }
    case TYPES.LOAD_COLLECTION_NAV_ITEM_LINKS:
    	return { ...state, collectionNavItemLinks: action.payload }
    case TYPES.LOAD_ADMIN_SIDENAV_LINKS:
    	const { defaultNavItem } = action
    	return { ...state, defaultNavItem }
    case TYPES.SET_COLLECTION_NAV_ITEM:
    	const { collectionNavItem } = action
    	return { ...state, collectionNavItem }
    default:
      return state;
  }
}

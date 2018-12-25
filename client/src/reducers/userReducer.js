import * as TYPES from '../actions/types';

const initialState = {
	isLoggedIn: false,
}

export default function(state = initialState, action) {
  switch (action.type) {
    case TYPES.FETCH_USER:
      return { ...state, ...action.payload }

    case TYPES.LOAD_COLLECTION_NAV_ITEM_LINKS:
      const newCollectionNavItem = { 
        ...state.collectionNavItem, 
        links: action.payload 
      }
      return { 
        ...state, 
        collectionNavItem: newCollectionNavItem
      }

    case TYPES.SET_ADMIN_SIDENAV_LINKS:
    	const { defaultNavItem } = action
    	return { 
        ...state, 
        collectionNavItem: undefined, 
        defaultNavItem 
      }

    case TYPES.UNSET_ADMIN_SIDENAV_LINKS:
      return { ...state, defaultNavItem: undefined }

    case TYPES.SET_COLLECTION_NAV_ITEM:
    	const { collectionNavItem } = action
    	return { ...state, collectionNavItem }

    case TYPES.SET_SIDENAV_FROM_CONFIG:
      const { sidenavGroupLinks } = action
      return { ...state, sidenavGroupLinks }

    default:
      return state;
  }
}

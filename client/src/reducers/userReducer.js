import * as ACT from '../actions/types';

const initialState = {
	isLoggedIn: false,
}

export default function(state = initialState, action) {
  switch (action.type) {
    case ACT.FETCH_USER:
      return action.payload;
    case ACT.LOAD_COLLECTION_NAV_ITEM_LINKS:
    	return { ...state, collectionNavItemLinks: action.payload }
    default:
      return state;
  }
}

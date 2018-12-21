import * as ACT from '../actions/types';

export default function(state = null, action) {
  switch (action.type) {
    case ACT.FETCH_USER:
      return action.payload || false;
    case ACT.LOAD_COLLECTION_NAV_ITEM_LINKS:
    	return { ...state, collectionNavItemLinks: action.payload }
    default:
      return state;
  }
}

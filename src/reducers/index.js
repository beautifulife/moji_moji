import * as Types from '../actions/actionTypes';

export const initialState = {
};

const rootReducer = (state = initialState, action) => {
  const newState = JSON.parse(JSON.stringify(state));

  switch (action.type) {
  case Types.BASE:
    return newState;
  default:
    return newState;
  }
};

export default rootReducer;

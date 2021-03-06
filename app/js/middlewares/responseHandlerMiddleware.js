import {
  GET_DATE_SUCCESS,
  GET_DATE_FAILURE,
  FETCH_ENCOUNTER_ROLE_SUCCESS,
  FETCH_ENCOUNTER_ROLE_FAILURE,
  FETCH_ENCOUNTER_TYPE_SUCCESS,
  FETCH_ENCOUNTER_TYPE_FAILURE,
  LOAD_PAST_ORDERS_SUCCESS,
} from '../actions/actionTypes';

export default function responseHandlerMiddleware() {
  return next => (action) => {
    if (action.type === GET_DATE_SUCCESS) {
      const { results } = action.payload.data;
      try {
        if (!results.length) {
          const DATE_FORMAT = 'DD-MMM-YYYY HH:mm';
          return next({ ...action, dateFormat: DATE_FORMAT });
        } else if (results.length && results[0].value === null) {
          throw Error('incomplete config');
        } else {
          return next({ ...action, dateFormat: results[0].value });
        }
      } catch (error) {
        console.warn(`${GET_DATE_FAILURE}-${error}`); /*eslint-disable-line*/
        return next({ type: GET_DATE_FAILURE, payload: error });
      }
    }

    if (
      action.type === FETCH_ENCOUNTER_ROLE_SUCCESS
      || action.type === FETCH_ENCOUNTER_TYPE_SUCCESS
    ) {
      const { results } = action.payload.data;
      try {
        if (results.length === 0) {
          throw Error('incomplete config');
        } else {
          return next({ ...action, data: results[0] });
        }
      } catch (error) {
        const actionType = action.type.replace('SUCCESS', 'FAILURE');
        console.warn(`${actionType}-${error}`); /*eslint-disable-line*/
        return next({ type: actionType, payload: error });
      }
    }

    if (action.type === LOAD_PAST_ORDERS_SUCCESS) {
      const { results, totalCount } = action.payload.data;
      const { limit, startIndex } = action.meta;
      const pageCount = Math.ceil(totalCount / limit);
      const startIndexLimit = startIndex + limit;
      const from = startIndex + 1;
      const to = startIndexLimit > totalCount ? totalCount : startIndexLimit;
      const pastOrdersResultCount = `Showing ${from} to ${to} of ${totalCount} entries`;
      next({ type: 'PAST_ORDERS_RESULT_COUNT', pastOrdersResultCount });
      next({ type: 'PAST_ORDERS_PAGE_COUNT', pageCount });
      return next({ ...action, pastOrders: results });
    }
    if (action.payload) {
      return next({
        ...action,
        type: action.type,
        data: action.payload.data,
        meta: action.meta || {},
      });
    }
    return next(action);
  };
}

// import { useEffect, useRef } from 'react';

//
// Return a new reducer which calls each provided reducer in turn.
//
// export function reduceReducers(...reducers) {
//   return (state, action) => (
//     reducers.reduceRight(
//       (newState, nextReducer) => nextReducer(newState, action),
//       state,
//     )
//   );
// }

// Return the first error code from a parsed response body.
export function errorCode(responseBody) {
  if (!isObject(responseBody)) { return null; }
  if (!Array.isArray(responseBody.errors)) { return null; }
  if (!isObject(responseBody.errors[0])) { return null; }
  return responseBody.errors[0].code;
}


export function isObject(object) {
  return (typeof object === 'function' || typeof object === 'object') && !!object;
};

// export function useInterval(fn, interval, { immediate=false }={}) {
//   const savedFn = useRef();
//   savedFn.current = fn;

//   useEffect(() => {
//     savedFn.current = fn;
//   }, [fn]);

//   useEffect(() => {
//     function tick() { savedFn.current(); }
//     if (immediate) {
//       tick();
//     }
//     if (interval !== null) {
//       let id = setInterval(tick, interval);
//       return () => clearInterval(id);
//     }
//   }, [immediate, interval]);
// }

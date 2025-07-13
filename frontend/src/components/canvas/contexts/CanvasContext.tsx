/* eslint-disable */
// @ts-nocheck

import { createContext, useContext, useEffect, useReducer } from "react";
import {
  type AppState,
  initialState as InitialStateClass,
  reducer,
} from "../reducers/CanvasReducer";

const CanvasContext = createContext(null);
export const useCanvas: () => {
  state: AppState;
  dispatch: (action: { type: string; payload?: any; setSelectedIds?: any }) => void;
} = () => useContext(CanvasContext);

// Modified CanvasProvider to accept initialState prop and sync on change
export const CanvasProvider = ({
  children,
  initialState,
}: {
  children;
  initialState?: AppState;
}) => {
  // If initialState is provided, use it; otherwise use default
  const [state, dispatch] = useReducer(
    reducer,
    initialState ? initialState : new InitialStateClass()
  );

  // Sync context state if initialState prop changes (for seat allocation page)
  useEffect(() => {
    if (initialState) {
      dispatch({ type: "SET_STATE", payload: initialState });
    }
  }, [JSON.stringify(initialState)]);

  return (
    // @ts-ignore
    <CanvasContext.Provider value={{ state, dispatch }}>{children}</CanvasContext.Provider>
  );
};

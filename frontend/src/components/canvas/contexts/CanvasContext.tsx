/* eslint-disable */
// @ts-nocheck

import {createContext, useContext, useReducer} from "react";
import {type AppState, initialState, reducer} from "../reducers/CanvasReducer";

const CanvasContext = createContext(null);
export const useCanvas: () => {
    state: AppState,
    dispatch: (action: { type: string; payload: any, setSelectedIds?: any }) => void
} = () => useContext(CanvasContext);


export const CanvasProvider = ({children}) => {
    const [state, dispatch] = useReducer(reducer, new initialState());

    return (
        // @ts-ignore
        <CanvasContext.Provider value={{state, dispatch}}>
            {children}
        </CanvasContext.Provider>
    );
};

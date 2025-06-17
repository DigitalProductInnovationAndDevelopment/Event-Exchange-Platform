import type {Dispatch, SetStateAction} from "react";
import type {AppState} from "components/canvas/reducers/CanvasReducer.tsx";
import {Chair} from "../elements/Chair.tsx";
import {Wall} from "../elements/Wall.tsx";
import {Room} from "../elements/Room.tsx";
import type {Table} from "../elements/Table.tsx";

export interface Action {
    type: string;
    payload: any | number | string | string[];
    setSelectedIds?: Dispatch<SetStateAction<string[]>>;
}

export const SET_STATE = 'SET_STATE';
export const ADD_ELEMENT = 'ADD_ELEMENT';
export const REMOVE_ELEMENT = 'REMOVE_ELEMENT';
export const UPDATE_ELEMENT = 'UPDATE_ELEMENT';
export const UPDATE_ELEMENT_SPECIFIC_FIELD = 'UPDATE_ELEMENT_SPECIFIC_FIELD';
export const UPDATE_MULTIPLE_ELEMENTS = 'UPDATE_MULTIPLE_ELEMENTS';
export const DUPLICATE_MULTIPLE_ELEMENTS = 'DUPLICATE_MULTIPLE_ELEMENTS';
export const CREATE_GROUP = 'CREATE_GROUP';
export const UPDATE_GROUP = 'UPDATE_GROUP';
export const REMOVE_GROUP = 'REMOVE_GROUP';
export const CHANGE_BUILD_MODE = 'CHANGE_BUILD_MODE';


export const setState = (payload: AppState): Action => ({
    type: SET_STATE,
    payload,
});


export const addElement = (payload: Chair | Table | Wall | Room | null): Action => ({
    type: ADD_ELEMENT,
    payload,
});

export const removeElement = (payload: string): Action => ({
    type: REMOVE_ELEMENT,
    payload,
});

export const updateElement = (payload: {
    id?: string;
    x?: number;
    y?: number;
    attachedTo?: string | null;
    attachedChairs?: string[],
    offset?: { dx: number; dy: number; angle: number } | null
}): Action => ({
    type: UPDATE_ELEMENT,
    payload,
});

export const updateElementSpecificField = (payload: { id: string; key: string; value: string }): Action => ({
    type: UPDATE_ELEMENT_SPECIFIC_FIELD,
    payload,
});

export const updateMultipleElements = (payload: ({ id: string; x: number; y: number } | null)[]): Action => ({
    type: UPDATE_MULTIPLE_ELEMENTS,
    payload,
});

export const duplicateMultipleElements = (payload: string[], setSelectedIds: Dispatch<SetStateAction<string[]>>): Action => ({
    type: DUPLICATE_MULTIPLE_ELEMENTS,
    payload,
    setSelectedIds
});

export const createGroup = (payload: never): Action => ({
    type: CREATE_GROUP,
    payload,
});

export const updateGroup = (payload: never): Action => ({
    type: UPDATE_GROUP,
    payload,
});

export const removeGroup = (payload: never): Action => ({
    type: REMOVE_GROUP,
    payload,
});

export const changeBuildMode = (payload: number): Action => ({
    type: CHANGE_BUILD_MODE,
    payload,
});


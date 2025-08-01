import type { Dispatch, SetStateAction } from "react";
import type { AppState } from "components/canvas/reducers/CanvasReducer.tsx";
import { Chair } from "../elements/Chair.tsx";
import { Wall } from "../elements/Wall.tsx";
import type { Table } from "../elements/Table.tsx";
import type { UUID } from "components/canvas/utils/constants.tsx";
import type { Arrow } from "components/canvas/elements/Arrow.tsx";
import type { Text } from "components/canvas/elements/Text.tsx";

export interface Action {
  type: string;
  payload: any | number | string | string[];
  setSelectedIds?: Dispatch<SetStateAction<string[]>>;
}

export const SET_STATE = "SET_STATE";
export const SET_CANVAS_POSITION = "SET_CANVAS_POSITION";
export const ADD_ELEMENT = "ADD_ELEMENT";
export const REMOVE_ELEMENTS = "REMOVE_ELEMENTS";
export const UPDATE_ELEMENT = "UPDATE_ELEMENT";
export const UPDATE_ELEMENT_SPECIFIC_FIELD = "UPDATE_ELEMENT_SPECIFIC_FIELD";
export const UPDATE_MULTIPLE_ELEMENTS = "UPDATE_MULTIPLE_ELEMENTS";
export const SET_CHAIR_ID_FOR_MANUAL_ASSIGNMENT = "SET_CHAIR_ID_FOR_MANUAL_ASSIGNMENT";
export const UPDATE_MULTIPLE_ELEMENTS_WITHOUT_UNDO_REDO = "UPDATE_MULTIPLE_ELEMENTS_WITHOUT_UNDO_REDO";
export const DUPLICATE_MULTIPLE_ELEMENTS = "DUPLICATE_MULTIPLE_ELEMENTS";
export const CHANGE_BUILD_MODE = "CHANGE_BUILD_MODE";
export const CLEAR_UNSAVED_CHAIRS_STATE = "CLEAR_UNSAVED_CHAIRS_STATE";
export const UNDO = "UNDO";
export const REDO = "REDO";
export const COMMIT_UNDO_REDO_HISTORY = "COMMIT_UNDO_REDO_HISTORY";

export const setState = (payload: AppState): Action => ({
  type: SET_STATE,
  payload,
});

export const setCanvasPosition = (payload: { canvasPosition: { x: number; y: number }, scale: number }): Action => ({
  type: SET_CANVAS_POSITION,
  payload,
});

export const addElement = (payload: Chair | Table | Wall | Arrow | Text | null): Action => ({
  type: ADD_ELEMENT,
  payload,
});

export const removeElements = (payload: string[]): Action => ({
  type: REMOVE_ELEMENTS,
  payload,
});

export const updateElement = (payload: {
  id?: string;
  x?: number;
  y?: number;
  attachedTo?: string | null;
  attachedChairs?: string[];
  offset?: { dx: number; dy: number; angle: number } | null;
}): Action => ({
  type: UPDATE_ELEMENT,
  payload,
});

export const updateElementSpecificField = (payload: {
  id: string;
  key: string;
  value: string | number;
}): Action => ({
  type: UPDATE_ELEMENT_SPECIFIC_FIELD,
  payload,
});

export const updateMultipleElements = (
  payload: ({ id: string; x: number; y: number } | null)[],
): Action => ({
  type: UPDATE_MULTIPLE_ELEMENTS,
  payload,
});

export const updateMultipleWithoutUndoRedo = (
  payload: ({
    id: string;
    x?: number;
    y?: number;
    attachedTo?: string | null;
    attachedChairs?: string[];
    offset?: { dx: number, dy: number, angle: number, } | null;
  } | null)[],
): Action => ({
  type: UPDATE_MULTIPLE_ELEMENTS_WITHOUT_UNDO_REDO,
  payload,
});

export const setChairIdForManualAssignment = (payload: UUID | null): Action => ({
  type: SET_CHAIR_ID_FOR_MANUAL_ASSIGNMENT,
  payload,
});

export const commitUndoRedoHistory = (): Action => ({
  type: COMMIT_UNDO_REDO_HISTORY,
  payload: null,
});

export const duplicateMultipleElements = (
  payload: string[],
  setSelectedIds: Dispatch<SetStateAction<string[]>>,
): Action => ({
  type: DUPLICATE_MULTIPLE_ELEMENTS,
  payload,
  setSelectedIds,
});

export const changeBuildMode = (payload: number): Action => ({
  type: CHANGE_BUILD_MODE,
  payload,
});

export const clearUnsavedChairsState = (): Action => ({
  type: CLEAR_UNSAVED_CHAIRS_STATE,
  payload: null,
});

export const undo = (bypassRedo: boolean = false): Action => ({
  type: UNDO,
  payload: bypassRedo,
});

export const redo = (): Action => ({
  type: REDO,
  payload: null,
});
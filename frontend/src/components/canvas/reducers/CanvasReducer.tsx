import { v4 as uuidv4 } from "uuid";
import type { Chair } from "../elements/Chair.tsx";
import type { Wall } from "../elements/Wall.tsx";
import type { ElementProperties } from "components/canvas/utils/constants.tsx";
import {
  type Action,
  ADD_ELEMENT,
  CHANGE_BUILD_MODE,
  CREATE_GROUP,
  DUPLICATE_MULTIPLE_ELEMENTS,
  REMOVE_ELEMENT,
  REMOVE_GROUP,
  SET_STATE,
  UPDATE_ELEMENT,
  UPDATE_ELEMENT_SPECIFIC_FIELD,
  UPDATE_GROUP,
  UPDATE_MULTIPLE_ELEMENTS,
} from "../actions/actions.tsx";

export interface AppState {
  buildMode: number;
  elements: ElementProperties[];
  groups: { id: string }[];
  canvasPosition: { x: number; y: number };
  scale: number;
}

export class initialState implements AppState {
  buildMode: number;
  elements: ElementProperties[];
  groups: { id: string }[];
  canvasPosition: { x: number; y: number };
  scale: number;

  constructor() {
    this.buildMode = 0;
    this.elements = [];
    this.groups = [];
    this.canvasPosition = { x: 0, y: 0 };
    this.scale = 1;
  }
}

export function reducer(state: AppState, action: Action) {
  switch (action.type) {
    case SET_STATE:
      if (action.payload) {
        // If payload is a string, parse it; if it's already an object, use it directly
        if (typeof action.payload === "string") {
          return { ...JSON.parse(action.payload) };
        } else {
          return { ...action.payload };
        }
      } else return { ...state };
    case ADD_ELEMENT:
      return { ...state, elements: [...state.elements, action.payload] };
    case REMOVE_ELEMENT:
      return {
        ...state,
        elements: state.elements.filter(el => el.id !== action.payload),
      };
    case UPDATE_ELEMENT:
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.payload.id ? { ...el, ...action.payload } : el
        ),
      };
    case UPDATE_ELEMENT_SPECIFIC_FIELD:
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.payload.id ? { ...el, [action.payload.key]: action.payload.value } : el
        ),
      };
    case UPDATE_MULTIPLE_ELEMENTS:
      return {
        ...state,
        elements: state.elements.map(el => {
          const update = action.payload.find((update: { id: string }) => update.id === el.id);
          return update ? { ...el, ...update } : el;
        }),
      };
    case DUPLICATE_MULTIPLE_ELEMENTS: {
      const idMap: { [key: string]: string } = {};
      const newElements = [];

      for (const id of action.payload) {
        const original = state.elements.find(e => e.id === id);
        if (original) {
          const newId = uuidv4();
          idMap[original.id] = newId;
          if (
            original.type === "chair" ||
            original.type === "room" ||
            original.type === "rectTable" ||
            original.type === "circleTable"
          ) {
            newElements.push({
              ...original,
              id: newId,
              x: (original as Chair).x + 50,
              y: (original as Chair).y + 50,
            });
          } else if (original.type === "wall") {
            newElements.push({
              ...original,
              id: newId,
              x1: (original as Wall).x1 + 50,
              y1: (original as Wall).y1 + 50,
              x2: (original as Wall).x2 + 50,
              y2: (original as Wall).y2 + 50,
            });
          }
        }
      }

      const updatedElements = newElements.map(element => {
        const updated: { [key: string]: unknown } = { ...element };

        // Replace references if they were among the duplicated ones
        for (const key in updated) {
          const value = updated[key];

          // Case 1: Single string reference
          if (typeof value === "string" && idMap[value]) {
            updated[key] = idMap[value];
          }

          // Case 2: Array of string references
          if (Array.isArray(value)) {
            updated[key] = value.map(item => (idMap[item] ? idMap[item] : item));
          }
        }

        return updated;
      });

      // eslint-disable-next-line
      // @ts-ignore
      action.setSelectedIds(Object.values(idMap));

      return {
        ...state,
        elements: [...state.elements, ...updatedElements],
      };
    }
    case CREATE_GROUP:
      return { ...state, groups: [...state.groups, action.payload] };
    case UPDATE_GROUP:
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.id ? { ...group, ...action.payload } : group
        ),
      };
    case REMOVE_GROUP:
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload),
      };
    case CHANGE_BUILD_MODE:
      return { ...state, buildMode: action.payload };
    default:
      return state;
  }
}

import { Table, TABLE_TYPES, TableRender } from "../elements/Table.tsx";
import { Room, RoomRender } from "../elements/Room.tsx";
import { Wall, WallRender } from "../elements/Wall.tsx";
import { Chair, ChairRender } from "../elements/Chair.tsx";

export interface ElementProperties {
  id: string;
  type: string;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  radius?: number;
  color: string;
  name?: string;
  width?: number;
  height?: number;
  stroke?: string;
  attachedChairs?: string[];
  attachedTo?: string;
  rotation?: number;
  draggable?: boolean;
  offset?: { dx?: number; dy?: number };
}

export const TOOLBOX_ITEMS = [
  { type: "chair", label: "Chair" },
  { type: "rectTable", label: "Rect Table" },
  { type: "circleTable", label: "Circle Table" },
  { type: "wall", label: "Wall", name: "" },
  { type: "quickWall", label: "Quick Wall" },
  { type: "room", label: "Room" },
];

export const TOOLBOX_X = 20;
export const TOOLBOX_Y = 20;

export const renderElement = (el: ElementProperties, areTextsEnabled: boolean) => {
  switch (el.type) {
    case "chair":
      return ChairRender(el as Chair);
    case "rectTable":
    case "circleTable":
      return TableRender(el as Table, areTextsEnabled);
    case "wall":
      return WallRender(el as Wall);
    case "room":
      return RoomRender(el as Room);
    default:
      return null;
  }
};

export const getEditableParameters = (
  el: ElementProperties
): { [key: string]: string | string[] } => {
  switch (el.type) {
    case "chair":
      return {
        x: "number",
        y: "number",
        radius: "number",
        color: "string",
      };
    case "rectTable":
      return {
        name: "string",
        type: ["rectTable", "circleTable"],
        x: "number",
        y: "number",
        width: "number",
        height: "number",
        rotation: "number",
        color: "string",
      };
    case "circleTable":
      return {
        name: "string",
        type: ["rectTable", "circleTable"],
        x: "number",
        y: "number",
        radius: "number",
        rotation: "number",
        color: "string",
      };
    case "wall":
      return {
        x1: "number",
        y1: "number",
        x2: "number",
        y2: "number",
        color: "string",
      };
    case "room":
      return {
        name: "string",
        x: "number",
        y: "number",
        width: "number",
        height: "number",
        rotation: "number",
        color: "string",
      };
    default:
      return {};
  }
};

export const shapeFactory = (type: string) => {
  switch (type) {
    case "chair":
      return new Chair();
    case "rectTable":
      return new Table(TABLE_TYPES.RECT);
    case "circleTable":
      return new Table(TABLE_TYPES.CIRCLE);
    case "wall":
      return new Wall();
    case "room":
      return new Room();
    default:
      return null;
  }
};

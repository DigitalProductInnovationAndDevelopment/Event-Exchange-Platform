import { Table, TableRender } from "../elements/Table.tsx";
import { Room, RoomRender } from "../elements/Room.tsx";
import { Wall, WallRender } from "../elements/Wall.tsx";
import { Chair, ChairRender } from "../elements/Chair.tsx";

export type UUID = string;
export type ShapeType = "chair" | "room" | "rectTable" | "circleTable" | "wall" | "quickWall";

export const DIET_TYPE_COLORS: Record<string, string> = {
  VEGETARIAN: "green",
  PESCATARIAN: "blue",
  HALAL: "orange",
  KOSHER: "purple",
  VEGAN: "magenta",
  LACTOSE_FREE: "cyan",
  GLUTEN_FREE: "lime",
  KETO: "gold",
};

export const EMPLOYMENT_TYPE_COLORS: Record<string, string> = {
  FULLTIME: "green",
  PARTTIME: "blue",
  WORKING_STUDENT: "orange",
  THESIS: "purple",
};

export interface ElementProperties {
  id: UUID;
  type: ShapeType;
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
  attachedChairs?: UUID[];
  attachedTo?: UUID;
  rotation?: number;
  draggable?: boolean;
  offset?: { dx?: number; dy?: number };
}

export const TABLE_TYPES = {
  RECT: {
    id: "" as UUID,
    name: "",
    x: 0,
    y: 0,
    radius: undefined,
    stroke: "",
    attachedChairs: [],
    rotation: 0,
    type: "rectTable" as ShapeType,
    label: "Rect Table",
    color: "#8B4513",
    width: 80,
    height: 50,
  },
  CIRCLE: {
    id: "" as UUID,
    name: "",
    x: 0,
    y: 0,
    width: undefined,
    height: undefined,
    stroke: "",
    attachedChairs: [],
    rotation: 0,
    type: "circleTable" as ShapeType,
    label: "Circle Table",
    color: "#A0522D",
    radius: 40,
  },
};

export const TOOLBOX_ITEMS: { type: ShapeType; label: string }[] = [
  { type: "chair", label: "Chair" },
  { type: "rectTable", label: "Rect Table" },
  { type: "circleTable", label: "Circle Table" },
  { type: "wall", label: "Wall" },
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
  el: ElementProperties,
): { [key: string]: string | string[] } => {
  switch (el.type) {
    case "chair":
      return {
        x: "number",
        y: "number",
        radius: "number",
        color: "string",
        employeeId: "string",
        employeeName: "string",
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

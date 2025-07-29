import { Table, TableRender } from "../elements/Table.tsx";
import { Wall, WallRender } from "../elements/Wall.tsx";
import { Chair, ChairRender } from "../elements/Chair.tsx";
import { Arrow, ArrowRender } from "components/canvas/elements/Arrow.tsx";
import { Text, TextRender } from "components/canvas/elements/Text.tsx";

export type UUID = string;
export type ShapeType = "chair" | "rectTable" | "circleTable" | "wall" | "quickWall" | "arrow" | "text";

export const DIET_TYPE_COLORS: Record<string, string> = {
  VEGETARIAN: "green",
  VEGAN: "lime",
  LACTOSE_FREE: "blue",
  GLUTEN_FREE: "magenta",
  FRUCTOSE_FREE: "orange"
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
  size?: number;
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
    color: "#294d69",
    width: 140,
    height: 80,
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
    color: "#294d69",
    radius: 60,
  },
};

export const TOOLBOX_ITEMS: { type: ShapeType; label: string }[] = [
  { type: "chair", label: "Chair" },
  { type: "rectTable", label: "Rect Table" },
  { type: "circleTable", label: "Circle Table" },
  { type: "wall", label: "Wall" },
  { type: "quickWall", label: "Quick Wall" },
  { type: "arrow", label: "Arrow" },
  { type: "text", label: "Text" },
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
    case "arrow":
      return ArrowRender(el as Arrow);
    case "text":
      return TextRender(el as Text);
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
    case "arrow":
      return {
        name: "string",
        x1: "number",
        y1: "number",
        x2: "number",
        y2: "number",
        color: "string",
      };
    case "text":
      return {
        name: "string",
        x: "number",
        y: "number",
        size: "number",
        rotation: "number",
        color: "string",
      };
    default:
      return {};
  }
};

export const shapeFactory = (type: ShapeType, stageCenter: { x: number, y: number }) => {
  switch (type) {
    case "chair":
      return new Chair(stageCenter);
    case "rectTable":
      return new Table(TABLE_TYPES.RECT, stageCenter);
    case "circleTable":
      return new Table(TABLE_TYPES.CIRCLE, stageCenter);
    case "wall":
      return new Wall(stageCenter);
    case "arrow":
      return new Arrow(stageCenter);
    case "text":
      return new Text(stageCenter);
    default:
      throw new Error("Unsupported shape type! Check code for this error");
  }
};

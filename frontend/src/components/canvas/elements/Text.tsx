import { Text as TextKonva } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import type { ElementProperties, ShapeType, UUID } from "components/canvas/utils/constants.tsx";
import { handleMouseOut, handleMouseOver } from "components/canvas/utils/functions.tsx";

export class Text implements ElementProperties {
  id: UUID;
  name: string;
  type: ShapeType;
  x: number;
  y: number;
  size: number;
  rotation: number;
  stroke: string;
  color: string;
  draggable: boolean;

  constructor(stageCenter: { x: number, y: number }) {
    this.id = uuidv4();
    this.type = "text";
    this.name = "text";
    this.x = stageCenter.x;
    this.y = stageCenter.y;
    this.size = 20;
    this.color = "#000000";
    this.stroke = "#333";
    this.rotation = 0;
    this.draggable = true;
  }
}

export function TextRender(text: Text) {
  return (
    <TextKonva
      text={text.name}
      fontSize={text.size}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      perfectDrawEnabled={false}
      fill={text.color || "#EEE"}
    />
  );
}

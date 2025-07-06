import { Rect } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import type { ElementProperties, ShapeType, UUID } from "components/canvas/utils/constants.tsx";
import { handleMouseOut, handleMouseOver } from "components/canvas/utils/functions.tsx";

export class Room implements ElementProperties {
  id: UUID;
  name: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  stroke: string;
  color: string;
  draggable: boolean;

  constructor() {
    this.id = uuidv4();
    this.type = "room";
    this.name = "Room";
    this.x = 200;
    this.y = 100;
    this.width = 200;
    this.height = 200;
    this.color = "#EEE";
    this.stroke = "#333";
    this.rotation = 0;
    this.draggable = true;
  }
}

export function RoomRender(room: Room) {
  return (
    <Rect
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      perfectDrawEnabled={false}
      width={room.width}
      height={room.height}
      fill={room.color || "#EEE"}
      stroke={room.stroke || "#333"}
      strokeWidth={2}
      cornerRadius={0}
    />
  );
}

import { Group, Line, Rect } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import type { ElementProperties, ShapeType, UUID } from "components/canvas/utils/constants.tsx";
import { handleMouseOut, handleMouseOver } from "components/canvas/utils/functions.tsx";

export class Wall implements ElementProperties {
  id: UUID;
  type: ShapeType;
  x?: number;
  y?: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  color: string;
  draggable: boolean;

  constructor(stageCenter?: { x: number, y: number }) {
    this.id = uuidv4();
    this.type = "wall";
    this.x1 = stageCenter?.x ?? 200;
    this.y1 = stageCenter?.y ?? 100;
    this.x2 = (stageCenter?.x ?? 200) + 150;
    this.y2 = stageCenter?.y ?? 100;
    this.color = "#444444";
    this.thickness = 3;
    this.draggable = true;
  }
}

export const WallRender = (wall: Wall) => {
  // Calculate the selection area around the wall
  const selectionPadding = 8; // pixels around the line for easier selection

  // Calculate the bounding box for the selection area
  const minX = Math.min(wall.x1, wall.x2) - selectionPadding;
  const maxX = Math.max(wall.x1, wall.x2) + selectionPadding;
  const minY = Math.min(wall.y1, wall.y2) - selectionPadding;
  const maxY = Math.max(wall.y1, wall.y2) + selectionPadding;

  return (
    <Group onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      {/* Invisible selection area */}
      <Rect
        x={minX}
        y={minY}
        width={maxX - minX}
        height={maxY - minY}
        fill="transparent"
        stroke="transparent"
        strokeWidth={0}
        perfectDrawEnabled={false}
      />
      {/* Visible wall line */}
      <Line
        points={[wall.x1, wall.y1, wall.x2, wall.y2]}
        stroke={wall.color}
        strokeWidth={Math.max(wall.thickness ?? 3, 1)}
        lineJoin="round"
        perfectDrawEnabled={false}
      />
    </Group>
  );
};

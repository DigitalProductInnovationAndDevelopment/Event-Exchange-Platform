import { Line, Rect } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import type { ElementProperties } from "components/canvas/utils/constants.tsx";

export class Wall implements ElementProperties {
  id: string;
  type: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  draggable: boolean;

  constructor() {
    this.id = uuidv4();
    this.type = "wall";
    this.x1 = 200;
    this.y1 = 100;
    this.x2 = 350;
    this.y2 = 100;
    this.color = "#444";
    this.draggable = true;
  }
}

export const WallRender = (wall: Wall) => {
    // Calculate the selection area around the wall
    const selectionPadding = 8; // pixels around the line for easier selection
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    const length = Math.sqrt(dx * dx + dy * dy);

  // Calculate the bounding box for the selection area
    const minX = Math.min(wall.x1, wall.x2) - selectionPadding;
    const maxX = Math.max(wall.x1, wall.x2) + selectionPadding;
    const minY = Math.min(wall.y1, wall.y2) - selectionPadding;
    const maxY = Math.max(wall.y1, wall.y2) + selectionPadding;

  return (
        <>
            {/* Invisible selection area */}
            <Rect
                x={minX}
                y={minY}
                width={maxX - minX}
                height={maxY - minY}
                fill="transparent"
                stroke="transparent"
                strokeWidth={0}
            />
            {/* Visible wall line */}
            <Line
                points={[wall.x1, wall.y1, wall.x2, wall.y2]}
                stroke="green"
                strokeWidth={2}
                lineJoin="round"
            />
        </>
    );
};

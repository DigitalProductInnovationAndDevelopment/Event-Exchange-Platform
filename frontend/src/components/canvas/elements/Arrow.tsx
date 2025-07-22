import { Arrow as KonvaArrow, Group, Rect } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import type { ElementProperties, ShapeType, UUID } from "components/canvas/utils/constants.tsx";
import { handleMouseOut, handleMouseOver } from "components/canvas/utils/functions.tsx";

export class Arrow implements ElementProperties {
  id: UUID;
  type: ShapeType;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  draggable: boolean;

  constructor() {
    this.id = uuidv4();
    this.type = "arrow";
    this.x1 = 200;
    this.y1 = 100;
    this.x2 = 350;
    this.y2 = 100;
    this.color = "#444";
    this.draggable = true;
  }
}

export const ArrowRender = (arrow: Arrow) => {
  // Calculate the selection area around the arrow
  const selectionPadding = 8; // pixels around the line for easier selection

  // Calculate the bounding box for the selection area
  const minX = Math.min(arrow.x1, arrow.x2) - selectionPadding;
  const maxX = Math.max(arrow.x1, arrow.x2) + selectionPadding;
  const minY = Math.min(arrow.y1, arrow.y2) - selectionPadding;
  const maxY = Math.max(arrow.y1, arrow.y2) + selectionPadding;

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
      {/* Visible arrow line */}
      <KonvaArrow
        points={[arrow.x1, arrow.y1, arrow.x2, arrow.y2]}
        stroke={arrow.color ?? "red"}
        strokeWidth={3}
        lineJoin="round"
        perfectDrawEnabled={false}
      />
    </Group>
  );
};

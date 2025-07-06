import { v4 as uuidv4 } from "uuid";
import { Circle, Group, Text } from "react-konva";
import type { ElementProperties, ShapeType, UUID } from "components/canvas/utils/constants.tsx";
import { handleMouseOut, handleMouseOver } from "components/canvas/utils/functions.tsx";

export class Chair implements ElementProperties {
  id: UUID;
  type: ShapeType;
  x: number;
  y: number;
  radius: number;
  color: string;
  attachedTo: string | undefined;
  draggable: boolean;
  offset: { dx: number; dy: number };
  employeeId?: string;
  employeeName?: string;

  constructor() {
    this.id = uuidv4();
    this.type = "chair";
    this.x = 200;
    this.y = 100;
    this.color = "#888";
    this.radius = 10;
    this.attachedTo = undefined;
    this.draggable = true;
    this.offset = { dx: 0, dy: 0 };
    this.employeeId = undefined;
    this.employeeName = undefined;
  }
}

export function ChairRender(chair: Chair) {
  return (
    <Group
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}>
      <Circle
        radius={chair.radius || 10}
        fill={chair.color || "#888"}
        perfectDrawEnabled={false}
      />
      {chair.employeeName && (
        <Text
          text={chair.employeeName}
          x={-chair.radius - 5}
          y={-chair.radius - 15}
          fontSize={10}
          fill="black"
          align="center"
          width={chair.radius * 2 + 10}
          // globalCompositeOperation="xor"
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  );
}


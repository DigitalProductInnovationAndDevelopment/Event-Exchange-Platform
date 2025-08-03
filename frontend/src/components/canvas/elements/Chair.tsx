import { v4 as uuidv4 } from "uuid";
import { Circle, Group, Text } from "react-konva";
import type { ElementProperties, ShapeType, UUID } from "components/canvas/utils/constants.tsx";
import { handleMouseOut, handleMouseOver } from "components/canvas/utils/functions.tsx";
import { getFullName, type Profile } from "types/employee.ts";

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
  assigneeProfile?: Profile;
  belongsToVisitor?: boolean;

  constructor(stageCenter: { x: number, y: number }) {
    this.id = uuidv4();
    this.type = "chair";
    this.x = stageCenter.x;
    this.y = stageCenter.y;
    this.color = "#cccccc";
    this.radius = 16;
    this.attachedTo = undefined;
    this.draggable = true;
    this.offset = { dx: 0, dy: 0 };
    this.assigneeProfile = undefined;
    this.belongsToVisitor = false;
  }
}

export function ChairRender(chair: Chair) {
  return (
    <Group
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}>
      <Circle
        radius={chair.radius || 10}
        fill={chair.color || "#cccccc"}
        perfectDrawEnabled={false}
      />
      {chair.assigneeProfile && (
        <Text
          text={getFullName(chair.assigneeProfile)}
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


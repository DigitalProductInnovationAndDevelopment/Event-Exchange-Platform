import { Circle, Group, Rect, Text } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import type { ElementProperties, ShapeType, UUID } from "components/canvas/utils/constants.tsx";
import { handleMouseOut, handleMouseOver } from "components/canvas/utils/functions.tsx";

export class Table implements ElementProperties {
  id: UUID;
  name: string;
  type: ShapeType;
  x: number;
  y: number;
  radius: number | undefined;
  width: number | undefined;
  height: number | undefined;
  rotation: number;
  stroke: string;
  color: string;
  draggable: boolean;
  attachedChairs: UUID[];

  constructor(tableType: ElementProperties) {
    this.id = uuidv4();
    this.type = tableType.type;
    this.name = "Table";
    this.x = 200;
    this.y = 100;

    this.width = tableType.width || undefined;
    this.height = tableType.height || undefined;
    this.radius = tableType.radius || undefined;

    this.color = tableType.color || "#90b4d0ff";
    this.stroke = "#333";
    this.draggable = true;
    this.attachedChairs = [];
    this.rotation = 0;
  }
}

function handleTableTitle(table: Table) {
  let chairLabel = table.attachedChairs.length > 0 ? `${table.attachedChairs.length} chair` : "";
  if (table.attachedChairs.length > 1) {
    chairLabel += "s";
  }
  return `${table.name}\n${chairLabel}`;
}

export function TableRender(table: Table, areTextsEnabled: boolean) {
  return table.type === "circleTable" ? (
    <Group onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <Circle radius={table.radius} fill={table.color || "#90b4d0ff"} />
      {areTextsEnabled && (
        <Text
          text={`${handleTableTitle(table)}`}
          fill="white"
          fontSize={12}
          align="center"
          x={-(table.radius ?? 0) + 1}
          y={-(table.radius ?? 0) / 4}
          width={table.radius ? table.radius * 2 : 0}
          verticalAlign="middle"
        />
      )}
    </Group>
  ) : (
    <Group onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <Rect
        width={table.width}
        height={table.height}
        fill={table.color || "#90b4d0ff"}
        perfectDrawEnabled={false}
      />
      {areTextsEnabled && (
        <Text
          text={`${handleTableTitle(table)}`}
          fill="white"
          fontSize={12}
          align="center"
          width={table.width}
          verticalAlign="middle"
          height={table.height}
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  );
}

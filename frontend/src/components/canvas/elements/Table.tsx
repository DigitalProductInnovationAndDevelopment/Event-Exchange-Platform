import {Circle, Group, Rect, Text} from "react-konva";
import {v4 as uuidv4} from "uuid";
import type {ElementProperties} from "components/canvas/utils/constants.tsx";

export const TABLE_TYPES = {
    RECT: {
        id: "",
        name: "",
        x: 0,
        y: 0,
        radius: undefined,
        stroke: "",
        attachedChairs: [],
        rotation: 0,
        type: "rectTable",
        label: "Rect Table",
        color: "#8B4513",
        width: 80,
        height: 50,
    },
    CIRCLE: {
        id: "",
        name: "",
        x: 0,
        y: 0,
        width: undefined,
        height: undefined,
        stroke: "",
        attachedChairs: [],
        rotation: 0,
        type: "circleTable",
        label: "Circle Table",
        color: "#A0522D",
        radius: 40,
    },
};

export class Table implements ElementProperties {
    id: string;
    name: string;
    type: string;
    x: number;
    y: number;
    radius: number | undefined;
    width: number | undefined;
    height: number | undefined;
    rotation: number;
    stroke: string;
    color: string;
    draggable: boolean;
    attachedChairs: string[];

    constructor(tableType: ElementProperties) {
        this.id = uuidv4();
        this.type = tableType.type;
        this.name = "Table";
        this.x = 200;
        this.y = 100;

        this.width = tableType.width || undefined;
        this.height = tableType.height || undefined;
        this.radius = tableType.radius || undefined;

        this.color = tableType.color || "#a57272";
        this.stroke = "#333";
        this.draggable = true;
        this.attachedChairs = [];
        this.rotation = 0;
    }
}

export function TableRender(table: Table, areTextsEnabled: boolean) {
    return table.type === "circleTable" ? (
        <Group>
            <Circle radius={table.radius} fill={table.color || "#8B4513"}/>
            {areTextsEnabled && (
                <Text
                    text={`name: ${table.name}\nr: ${table.radius?.toFixed(2)}\nChairs: ${table.attachedChairs.length}`}
                    fill="white"
                    fontSize={12}
                    x={-(table.radius ?? 0) / 2}
                    y={-(table.radius ?? 0) / 2}
                />
            )}
        </Group>
    ) : (
        <Group>
            <Rect width={table.width} height={table.height} fill={table.color || "#8B4513"}/>
            {areTextsEnabled && (
                <Text
                    text={`name: ${table.name}\nw: ${table.width?.toFixed(2)}\nh: ${table.height?.toFixed(2)}\nChairs: ${table.attachedChairs.length}`}
                    fill="white"
                    fontSize={12}
                    align="center"
                    width={table.width}
                    padding={4}
                />
            )}
        </Group>
    );
}

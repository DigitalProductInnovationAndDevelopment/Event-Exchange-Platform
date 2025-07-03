import {Line} from "react-konva";
import {v4 as uuidv4} from "uuid";
import type {ElementProperties} from "components/canvas/utils/constants.tsx";

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
    return (
        <Line
            points={[wall.x1, wall.y1, wall.x2, wall.y2]}
            stroke="green"
            strokeWidth={2}
            lineJoin="round"
        />
    );
};

import {Group, Layer, Rect, Stage, Text} from "react-konva";
import {shapeFactory, TOOLBOX_ITEMS, TOOLBOX_X, TOOLBOX_Y} from "../utils/constants";
import type {Chair} from "./Chair";
import type {Room} from "./Room";
import type {Wall} from "./Wall";
import type {AppState} from "../reducers/CanvasReducer.tsx";
import type {Table} from "./Table.tsx";
import Konva from "konva";
import React from "react";
import useApiService from "../../../services/apiService.ts";
import {useParams} from "react-router-dom";
import {addElement, changeBuildMode} from "../actions/actions.tsx";


function downloadURI(uri: string, name: string) {
    const link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const handleExport = (stageRef: React.RefObject<Konva.Stage | null>) => {
    const uri = stageRef.current!.toDataURL({pixelRatio: 2});
    downloadURI(uri, 'stage.png');
};

const handleToolboxClick =
    (type: string, dispatch: (arg0: {
        type: string;
        payload: number | Chair | Table | Wall | Room | null;
    }) => void) => {
        const toolItem = TOOLBOX_ITEMS.find(item => item.type === type);
        if (!toolItem) return;

        if (type === "quickWall") {
            dispatch(changeBuildMode(1));
        } else {
            dispatch(addElement(shapeFactory(type)));
        }

    };


function Toolbox({dispatch, stageRef, state}: {
    dispatch: (action: { type: string; payload: any }) => void,
    stageRef: React.RefObject<Konva.Stage | null>,
    state: AppState
}) {
    const {updateSchematics} = useApiService();
    const {schematicsId} = useParams();

    return (
        <Stage
            scaleX={1}
            scaleY={1}
            width={150}
            height={window.innerHeight}
        >
            <Layer>
                <Group x={TOOLBOX_X} y={TOOLBOX_Y}>

                    <Rect
                        width={100}
                        height={TOOLBOX_ITEMS.length * 65}
                        fill="#f0f0f0"
                        stroke="#aaa"
                        strokeWidth={1}
                        cornerRadius={8}
                        shadowColor="black"
                        shadowBlur={5}
                        shadowOffset={{x: 2, y: 2}}
                        shadowOpacity={0.3}
                    />
                    <Text text={state.buildMode === 0 ? "Toolbox" : "Quick Wall"} x={10} y={10} fontSize={16}
                          fontStyle="bold" fill="black"/>

                    {TOOLBOX_ITEMS.map((item, i) => (
                        <Group
                            key={item.type}
                            x={10}
                            y={i * 60 + 40}
                            onClick={() => handleToolboxClick(item.type, dispatch)}
                            cursor="pointer"
                        >
                            <Rect width={80} height={40} fill="#ddd" stroke="#999" cornerRadius={6}/>
                            <Text text={item.label} fontSize={12} x={10} y={13} fill="black"/>
                        </Group>
                    ))}

                    <Group y={400} onClick={() => handleExport(stageRef)}>
                        <Rect
                            width={80}
                            height={50}
                            fill="#f66"
                            cornerRadius={8}
                            x={10}
                            stroke="#900"
                            strokeWidth={1}
                        />
                        <Text text="Export PDF" x={25} y={15} fill="white" fontSize={10} fontStyle="bold"/>
                    </Group>

                    <Group y={460} onClick={() =>
                        updateSchematics(
                            schematicsId!,
                            {
                                ...state,
                                canvasPosition: stageRef!.current!.getPosition(),
                                scale: stageRef!.current!.scaleX()
                            })
                    }>
                        <Rect
                            width={80}
                            height={50}
                            fill="#66f"
                            cornerRadius={8}
                            x={10}
                            stroke="#009"
                            strokeWidth={1}
                        />
                        <Text text="Save" x={25} y={15} fill="white" fontSize={10} fontStyle="bold"/>
                    </Group>
                </Group>


            </Layer>
        </Stage>
    );
}

export default Toolbox;



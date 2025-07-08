import { Group, Layer, Rect, Stage, Text } from "react-konva";
import { shapeFactory, TOOLBOX_ITEMS, TOOLBOX_X, TOOLBOX_Y } from "../utils/constants";
import type { Chair } from "./Chair";
import type { Room } from "./Room";
import type { Wall } from "./Wall";
import type { AppState } from "../reducers/CanvasReducer.tsx";
import type { Table } from "./Table.tsx";
import Konva from "konva";
import React, { useRef } from "react";
import useApiService from "services/apiService.ts";
import { useParams } from "react-router-dom";
import { addElement, changeBuildMode } from "../actions/actions.tsx";
import { downloadURI, handleExport } from "components/canvas/utils/functions.tsx";


const handleToolboxClick =
  (type: string, dispatch: (arg0: {
    type: string;
    payload: number | Chair | Table | Wall | Room | null;
  }) => void, currentBuildMode: number) => {
    const toolItem = TOOLBOX_ITEMS.find(item => item.type === type);
    if (!toolItem) return;

    if (type === "quickWall") {
      // Toggle quickwall mode: if already in build mode 1, switch back to 0
      const newBuildMode = currentBuildMode === 1 ? 0 : 1;
      dispatch(changeBuildMode(newBuildMode));
    } else {
      dispatch(addElement(shapeFactory(type)));
    }

  };

function Toolbox({
                   dispatch,
                   stageRef,
                   state,
                 }: {
  dispatch: (action: { type: string; payload: any }) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  state: AppState;
}) {
  const { updateSchematics } = useApiService();
  const { schematicsId } = useParams();
  const toolboxLayer = useRef<Konva.Layer | null>(null);

  return (
    <Stage scaleX={1} scaleY={1} width={150} height={window.innerHeight}>
      <Layer ref={toolboxLayer}>
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
            shadowOffset={{ x: 2, y: 2 }}
            shadowOpacity={0.3}
          />
          <Text
            text={state.buildMode === 0 ? "Toolbox" : "Quick Wall"}
            x={10}
            y={10}
            fontSize={16}
            fontStyle="bold"
            fill="black"
          />

          {TOOLBOX_ITEMS.map((item, i) => (
            <Group
              key={item.type}
              x={10}
              y={i * 60 + 40}
              onClick={() => handleToolboxClick(item.type, dispatch, state.buildMode)}
              cursor="pointer"
            >
              <Rect width={80} height={40} fill="#ddd" stroke="#999" cornerRadius={6} />
              <Text text={item.label} fontSize={12} x={10} y={13} fill="black" />
            </Group>
          ))}

          <Group y={400} onClick={async () => {
            const uri = await handleExport(stageRef);
            downloadURI(uri!, "stage.jpeg");
          }}>
            <Rect
              width={80}
              height={50}
              fill="#f66"
              cornerRadius={8}
              x={10}
              stroke="#900"
              strokeWidth={1}
            />
            <Text text="Export" x={25} y={15} fill="white" fontSize={10} fontStyle="bold" />
          </Group>

          <Group
            y={460}
            onClick={() =>
              updateSchematics(
                schematicsId!,
                {
                  ...state,
                  canvasPosition: stageRef!.current!.getPosition(),
                  scale: stageRef!.current!.scaleX(),
                },
                stageRef,
              )
            }
          >
            <Rect
              width={80}
              height={50}
              fill="#66f"
              cornerRadius={8}
              x={10}
              stroke="#009"
              strokeWidth={1}
            />
            <Text text="Save" x={25} y={15} fill="white" fontSize={10} fontStyle="bold" />
          </Group>

          {/*<Group
            y={510}>
            <Text text={"#undo: " + state.history?.past?.length + "\n#redo: " + state.history?.future?.length} x={25}
                  y={15} fill="black" fontSize={10} fontStyle="bold" />
          </Group>
          <Group x={15} y={560}>
            <FPSText layer={toolboxLayer}></FPSText>
          </Group>*/}

        </Group>
      </Layer>
    </Stage>
  );
}

export default Toolbox;

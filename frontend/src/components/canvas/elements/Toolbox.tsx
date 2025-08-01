import { Group, Layer, Rect, Stage, Text } from "react-konva";
import { shapeFactory, type ShapeType, TOOLBOX_ITEMS, TOOLBOX_X, TOOLBOX_Y, type UUID } from "../utils/constants";
import type { AppState } from "../reducers/CanvasReducer.tsx";
import Konva from "konva";
import React, { useRef } from "react";
import useApiService from "services/apiService.ts";
import { useParams } from "react-router-dom";
import { type Action, addElement, changeBuildMode, clearUnsavedChairsState } from "../actions/actions.tsx";
import { ElementInspector } from "components/canvas/elements/ElementInspector.tsx";
import { findStageCenterCoordinates } from "components/canvas/utils/functions.tsx";


const handleToolboxClick =
  (type: ShapeType, dispatch: (action: Action) => void, currentBuildMode: number, setSelectedIds: React.Dispatch<React.SetStateAction<UUID[]>>, stageCenter: {
    x: number,
    y: number
  }) => {
    const toolItem = TOOLBOX_ITEMS.find(item => item.type === type);
    if (!toolItem) return;

    if (type === "quickWall") {
      // Toggle quickwall mode: if already in build mode 1, switch back to 0
      const newBuildMode = currentBuildMode === 1 ? 0 : 1;
      dispatch(changeBuildMode(newBuildMode));
    } else {
      const newShape = shapeFactory(type, stageCenter);
      setSelectedIds([newShape.id]);
      dispatch(addElement(newShape));
    }

  };

function Toolbox({
  dispatch,
  stageRef,
  state,
  selectedIds,
                   setSelectedIds,
}: {
  dispatch: (action: Action) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  state: AppState;
  selectedIds: UUID[];
  setSelectedIds: React.Dispatch<React.SetStateAction<UUID[]>>
}) {
  const { updateSchematics } = useApiService();
  const { schematicsId } = useParams();
  const toolboxLayer = useRef<Konva.Layer | null>(null);
  const toolboxHeight = TOOLBOX_ITEMS.length * 65;

  return (
    <div>
      <Stage scaleX={1} scaleY={1} width={150} height={window.innerHeight}>
        <Layer ref={toolboxLayer}>
          <Group x={TOOLBOX_X} y={TOOLBOX_Y}>
            <Rect
              width={100}
              height={toolboxHeight}
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
                onClick={() => {
                  const stageCenter = findStageCenterCoordinates(stageRef);
                  handleToolboxClick(item.type, dispatch, state.buildMode, setSelectedIds, stageCenter);
                }}
                cursor="pointer"
              >
                <Rect width={80} height={40} fill="#ddd" stroke="#999" cornerRadius={6} />
                <Text text={item.label} fontSize={12} x={10} y={13} fill="black" />
              </Group>
            ))}

            <Group
              y={toolboxHeight + 10}
              onClick={() =>
                updateSchematics(
                  schematicsId!,
                  {
                    ...state,
                    canvasPosition: stageRef!.current!.getPosition(),
                    scale: stageRef!.current!.scaleX(),
                  },
                ).then((response) => {
                  if (response) dispatch(clearUnsavedChairsState());
                })
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

            {/* <Group
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
      {selectedIds.length === 1 && (
        <ElementInspector
          dispatch={dispatch}
          state={state}
          selectedId={selectedIds[0]}
        ></ElementInspector>
      )}
    </div>

  );
}

export default Toolbox;

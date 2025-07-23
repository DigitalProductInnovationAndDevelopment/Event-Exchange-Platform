import { useCanvas } from "./contexts/CanvasContext.tsx";
import React, { useEffect, useRef, useState } from "react";
import { Group, Layer, Stage, Transformer } from "react-konva";
import { type ElementProperties, renderElement, type UUID } from "./utils/constants";
import Toolbox from "./elements/Toolbox";
import Konva from "konva";
import type { Table } from "./elements/Table.tsx";

import { setState } from "./actions/actions.tsx";
import useApiService from "services/apiService.ts";
import { useParams } from "react-router-dom";
import StagePreview from "components/canvas/elements/StagePreview.tsx";
import NeighbourArrows from "components/canvas/elements/NeighbourArrows.tsx";
import SelectionRectangle from "components/canvas/elements/SelectionRectangle.tsx";
import {
  handleDoubleClickOnElement,
  handleDragEnd,
  handleDragMove,
  handleDragStart,
  handleGroupDragEnd,
  handleGroupDragStart,
  handleKeyDown,
  handleKeyUp,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTransformEnd,
  handleWheel,
} from "components/canvas/EventListeners.tsx";

export interface KonvaCanvasProps {
  stageReference?: React.RefObject<Konva.Stage | null>,
  schematicsUUID?: UUID,
  eventName?: string,
}

function KonvaCanvas({ stageReference, schematicsUUID }: KonvaCanvasProps) {
  const { state, dispatch } = useCanvas();
  let stageRef = useRef<Konva.Stage | null>(null);
  let { schematicsId } = useParams();

  if (stageReference) {
    stageRef = stageReference;
  }
  if (schematicsUUID) {
    schematicsId = schematicsUUID;
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [quickWallCoordinates, setQuickWallCoordinates] = useState<{
    x1?: number;
    y1?: number;
  }>({ x1: undefined, y1: undefined });
  const { getSchematics } = useApiService();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [initiated, setInitiated] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const dragLayer = useRef<Konva.Layer | null>(null);
  const mainLayer = useRef<Konva.Layer | null>(null);

  const [selectionRectangle, setSelectionRectangle] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (schematicsId && !initiated) {
        const fetchedAppState = await getSchematics(schematicsId);
        setInitiated(true);
        dispatch(setState({ ...fetchedAppState!, buildMode: 0 }));
        setScale(fetchedAppState!.scale);
        stageRef.current?.setPosition(fetchedAppState!.canvasPosition ? fetchedAppState!.canvasPosition : {
          x: 0,
          y: 0,
        });
        const container = stageRef!.current?.container();
        if (container) {
          container.style.cursor = "grab";
        }
      }
    };
    fetchData();
  }, [dispatch, getSchematics, initiated, schematicsId, state.canvasPosition, state.scale]);

  useEffect(() => {
    window.scrollTo(0, 0); // we have to scroll to top-left corner of the page, otherwise it looks bad
  }, []);

  // Measure container size
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef?.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  const isSelecting = useRef(false);
  const transformerRef = useRef<Konva.Transformer>(null);
  const rectRefs = useRef(new Map());

  useEffect(() => {
    if (selectedIds.length && transformerRef.current) {
      const nodes = selectedIds.map(id => rectRefs.current.get(id)).filter(node => node);

      transformerRef.current.nodes(nodes);
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedIds]);

  useEffect(() => {
    const handleKeyDownWrapper = (e) => {
      handleKeyDown(e, dispatch, setSelectedIds, setIsShiftPressed, selectedIds, setQuickWallCoordinates);
    };

    const handleKeyUpWrapper = (e) => {
      handleKeyUp(e, setIsShiftPressed, stageRef);
    };

    window.addEventListener("keydown", handleKeyDownWrapper);
    window.addEventListener("keyup", handleKeyUpWrapper);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener("keydown", handleKeyDownWrapper);
      window.removeEventListener("keyup", handleKeyUpWrapper);
    };
  }, [dispatch, setSelectedIds, setIsShiftPressed, selectedIds, setQuickWallCoordinates, stageRef]);

  function getConnectedChairIdsOfTable(tableId: UUID): UUID[] {
    const table: ElementProperties | undefined = state.elements?.find(el => (el.type === "rectTable" || el.type === "circleTable") && el.id === tableId);
    if (table) {
      const chairIds: UUID[] = (table as unknown as Table).attachedChairs ?? [];
      return [...chairIds];
    } else {
      return [];
    }
  }

  const selectedIdsProxy = [...selectedIds, ...(selectedIds.length === 1 ? getConnectedChairIdsOfTable(selectedIds[0]) : [])];

  return (
    <div className="space-y-6">
      <div className="App overflow-hidden bg-white"
           style={{ display: "flex", border: "1px solid #e0e0e0", flexDirection: "row" }}>

        <Toolbox dispatch={dispatch} stageRef={stageRef} state={state} selectedIds={selectedIds} />

        {/* main Canvas */}
        <div ref={containerRef} style={{ flex: 1, position: "relative" }}>
          <Stage
            scaleX={scale}
            scaleY={scale}
            onWheel={(e) => handleWheel(e, stageRef, scale, setScale)}
            draggable={!isSelecting.current}
            ref={stageRef}
            width={containerSize.width}
            height={containerSize.height}
            onMouseDown={(e) => handleMouseDown(e, stageRef, isSelecting, dispatch, setSelectedIds, setSelectionRectangle, scale, state, quickWallCoordinates, setQuickWallCoordinates)}
            onMousemove={(e: {
              evt: MouseEvent;
              target: Konva.Stage;
            }) => handleMouseMove(e, isShiftPressed, state, scale, stageRef, isSelecting, selectionRectangle, setSelectionRectangle)}
            onMouseup={() => handleMouseUp(isSelecting, selectionRectangle, state, stageRef, rectRefs, dispatch, setSelectionRectangle, setSelectedIds)}
          >

            <Layer ref={mainLayer}>
              {/* this is where we display elements */}
              {state.elements?.filter(el => !selectedIdsProxy.includes(el.id)).map((el) => {
                return (
                  <Group
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    draggable={el.draggable}
                    rotation={el.rotation}
                    onDblClick={(e) => handleDoubleClickOnElement(e, el, setSelectedIds)}
                    onDragMove={(e) => handleDragMove(e, el, state, dispatch)}
                    onDragEnd={(e) => handleDragEnd(e, el, dispatch, state, rectRefs, stageRef)}
                    onDragStart={() => handleDragStart(dispatch)}
                    ref={node => {
                      if (node) {
                        rectRefs.current.set(el.id, node);
                      }
                    }}
                  >
                    {renderElement(el, true)}
                  </Group>
                );
              })}

              {/* transformer for all selected shapes. this is what we use to scale up or shrink the shapes */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(_oldBox, newBox) => {
                  return newBox;
                }}
                onTransformEnd={() => handleTransformEnd(transformerRef, state, dispatch, setSelectedIds)}
              />

              {/* Selection rectangle */}
              {selectionRectangle.visible && <SelectionRectangle selectionRectangle={selectionRectangle} />}

              {selectedIds.length === 1 &&
                state.elements.find((el) => el.type === "chair") && (
                  <NeighbourArrows
                    state={state}
                    dispatch={dispatch}
                    table={(state.elements.find(
                      (a) =>
                        a.id ===
                        state.elements.find((el) => el.id === selectedIds[0])?.attachedTo,
                    ) as Table)}
                    selectedChairId={selectedIds[0]}
                  />
                )}
            </Layer>

            <Layer ref={dragLayer}>
              {selectedIds.length > 0 && (
                <Group
                  draggable={true}
                  onDragEnd={(e) => {
                    // Handle group drag end
                    const deltaX = e.target.x();
                    const deltaY = e.target.y();
                    handleGroupDragEnd(deltaX, deltaY, dispatch, state, selectedIdsProxy);
                    // Reset group position to remove glitch
                    e.target.position({ x: 0, y: 0 });
                  }}
                  onDragStart={() => handleGroupDragStart(dispatch)}
                >
                  {state.elements?.filter(el => selectedIdsProxy.includes(el.id)).map((el) => {
                    return (
                      <Group
                        key={el.id}
                        id={el.id}
                        x={el.x}
                        y={el.y}
                        draggable={false} // we disable individual dragging since parent handles it
                        rotation={el.rotation}
                        ref={node => {
                          if (node) {
                            rectRefs.current.set(el.id, node);
                          }
                        }}
                      >
                        {renderElement(el, true)}
                      </Group>
                    );
                  })}
                </Group>)
              }
            </Layer>

          </Stage>
        </div>


        <StagePreview state={state} mainStage={stageRef.current!}></StagePreview>

      </div>
    </div>
  );
}

export default KonvaCanvas;

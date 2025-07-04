import { useCanvas } from "./contexts/CanvasContext.tsx";
import { useEffect, useRef, useState } from "react";
import { Group, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import { type ElementProperties, renderElement, shapeFactory } from "./utils/constants";
import Toolbox from "./elements/Toolbox";
import { ElementInspector } from "./elements/ElementInspector.tsx";
import Konva from "konva";
import type { Table } from "./elements/Table.tsx";
import type { Chair } from "./elements/Chair.tsx";
import type { Wall } from "./elements/Wall.tsx";
import type { KonvaEventObject } from "konva/lib/Node";
import {
  addElement,
  changeBuildMode,
  duplicateMultipleElements,
  removeElement,
  setState,
  updateElement,
  updateMultipleElements,
} from "./actions/actions.tsx";
import useApiService from "../../services/apiService.ts";
import { useParams } from "react-router-dom";
import { Typography } from "antd";

const { Title } = Typography;

function KonvaCanvas() {
  const { state, dispatch } = useCanvas();
  const stageRef = useRef<Konva.Stage | null>(null);
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
  const { schematicsId } = useParams();
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const [selectionRectangle, setSelectionRectangle] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!initiated && schematicsId) {
        const fetchedAppState = await getSchematics(schematicsId);
        if (fetchedAppState && !initiated) {
          dispatch(setState({ ...fetchedAppState, buildMode: 0 }));
        }
      }
    };
    fetchData().then(() => {
      stageRef.current?.setPosition(state.canvasPosition ? state.canvasPosition : { x: 0, y: 0 });
      setScale(state.scale);
      setInitiated(true);
    });
  }, [dispatch, getSchematics, initiated, schematicsId, state.canvasPosition, state.scale]);

  useEffect(() => {
    window.scrollTo(0, 0); // we have to scroll to top-left corner of the page, otherwise it looks bad
  }, []);

  // Measure container size
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
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
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // we have to skip key handling if user is typing in an input or textarea
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "Escape") {
        setSelectedIds([]);

        setQuickWallCoordinates({ x1: undefined, y1: undefined });

        dispatch(changeBuildMode(0));
      }

      if (e.key === "Shift") {
        setIsShiftPressed(true);
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        for (const id of selectedIds) {
          dispatch(removeElement(id));
        }
        setSelectedIds([]);
      }

      if (e.key === "D" || e.key === "d") {
        dispatch(duplicateMultipleElements(selectedIds, setSelectedIds));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, selectedIds]);

  const handleWheel = (e: { evt: WheelEvent }) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    const oldScale = scale;

    if (stage) {
      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      setScale(newScale);
    }
  };

  // for drag movement for elements
  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>, el: ElementProperties) => {
    // If it's a table with attached chairs, update the chairs position during dragging
    if ((el.type === "rectTable" || el.type === "circleTable") && el.attachedChairs!.length > 0) {
      const shape: Konva.Stage | Konva.Shape = e.target;
      const newX = shape.x();
      const newY = shape.y();

      // Get all attached chairs and their offsets
      const updates = el
        .attachedChairs!.map((chairId: string) => {
        const chair = state.elements.find(e => e.id === chairId) as Chair;
        if (chair && chair.offset) {
          return {
            id: chairId,
            x: newX + chair.offset.dx,
            y: newY + chair.offset.dy,
          };
        }
        return null;
      })
        .filter(Boolean);

      // Update all chair positions
      if (updates.length > 0) {
        dispatch(updateMultipleElements(updates));
      }
    }
  };

  // handle drag end for elements
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, el: ElementProperties) => {
    const shape = e.target;
    const x = shape.x();
    const y = shape.y();
    const id = el.id;

    if (el.type === "chair") {
      // Find the closest table
      const tables = state.elements.filter(
        (t): t is Table => t.type === "circleTable" || t.type === "rectTable",
      );

      const table = tables.find(t => {
        return (
          (t.type === "circleTable" && Math.hypot(t.x - x, t.y - y) < t.radius! + el.radius!) ||
          (t.type === "rectTable" &&
            x >= t.x - el.radius! &&
            x <= t.x + t.width! + el.radius! &&
            y >= t.y - el.radius! &&
            y <= t.y + t.height! + el.radius!)
        );
      }) as Table;

      if (table) {
        // Calculate optimal position for the chair around the table
        let attachPosition: { x: number; y: number; angle: number };

        if (table.type === "circleTable") {
          // Calculate angle from table center to chair
          const angle = Math.atan2(y - table.y, x - table.x);
          // Position the chair at the edge of the table
          attachPosition = {
            x: table.x + (table.radius! + el.radius!) * Math.cos(angle),
            y: table.y + (table.radius! + el.radius!) * Math.sin(angle),
            angle: angle,
          };
        } else {
          const padding = el.radius!;
          const width = table.width!;
          const height = table.height!;

          const centerX = table.x + width / 2;
          const centerY = table.y + height / 2;

          const dx = x - centerX;
          const dy = y - centerY;

          let snappedX, snappedY;

          if (Math.abs(dx) * height <= Math.abs(dy) * width) {
            // Snapped to top or bottom
            snappedX = centerX + ((height / 2) * dx) / Math.abs(dy);
            if (dy < 0) {
              // Top
              snappedY = centerY - height / 2 - padding;
            } else {
              // Bottom
              snappedY = centerY + height / 2 + padding;
            }
          } else {
            // Snapped to left or right
            if (dx < 0) {
              // Left
              snappedX = centerX - width / 2 - padding;
            } else {
              // Right
              snappedX = centerX + width / 2 + padding;
            }
            snappedY = centerY + ((width / 2) * dy) / Math.abs(dx);
          }

          attachPosition = {
            x: snappedX,
            y: snappedY,
            angle: 0,
          };
        }

        // Update chair with attachment info
        dispatch(
          updateElement({
            id: el.id,
            x: attachPosition.x,
            y: attachPosition.y,
            attachedTo: table.id,
            offset: {
              dx: attachPosition.x - table.x,
              dy: attachPosition.y - table.y,
              angle: attachPosition.angle,
            },
          }),
        );

        // Update table with attached chair
        if (!table.attachedChairs.includes(el.id)) {
          dispatch(
            updateElement({
              id: table.id,
              attachedChairs: [...table.attachedChairs, el.id],
            }),
          );
        }
        return;
      } else if (el.attachedTo) {
        // Detach chair from table
        const parent = state.elements.find(t => t.id === el.attachedTo) as Table;
        if (parent) {
          dispatch(
            updateElement({
              id: parent.id,
              attachedChairs: parent.attachedChairs.filter(cid => cid !== el.id),
            }),
          );
        }
        dispatch(
          updateElement({
            id: el.id,
            x,
            y,
            attachedTo: null,
            offset: null,
          }),
        );
        return;
      }
    }

    // Default handling for position updates
    dispatch(updateElement({ id, x, y }));
  };

  function handleDoubleClickOnElement(_e: KonvaEventObject<MouseEvent>, el: ElementProperties) {
    setSelectedIds([...selectedIds, el.id]);
  }

  const handleTransformEnd = () => {
    const nodes = transformerRef.current!.nodes();

    const selectedIds = [];

    for (const node of nodes) {
      const id = node.attrs.id;
      selectedIds.push(id);
      const el = state.elements.find(e => e.id === id)!;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      node.scaleX(1);
      node.scaleY(1);

      const updates =
        el.type === "circleTable" || el.type === "chair"
          ? {
            id,
            radius: el.radius ? Math.max(10, el.radius * scaleX) : undefined,
          }
          : el.type !== "wall"
            ? {
              id,
              width: el.width ? Math.max(10, el.width * scaleX) : undefined,
              height: el.height ? Math.max(10, el.height * scaleY) : undefined,
              rotation: node.rotation(),
            }
            : {
              id,
              x1: el.x1! * scaleX,
              y1: el.y1! * scaleY,
              x2: el.x2! * scaleX,
              y2: el.y2! * scaleY,
            };

      dispatch(updateElement(updates));
    }

    setSelectedIds(selectedIds);
  };

  const handleMouseDown = (e: { evt: MouseEvent; target: Konva.Node }) => {
    const stage = e.target.getStage()!;
    const pointer = stageRef.current!.getPointerPosition()!;
    isSelecting.current = e.evt.shiftKey;

    if (e.target === stage) {
      setSelectedIds([]);
    }

    if (state.buildMode === 0) {
      // Start selection rectangle
      isSelecting.current = e.evt.shiftKey;

      setSelectionRectangle({
        visible: true,
        x1: (pointer.x - stage.x()) / scale,
        y1: (pointer.y - stage.y()) / scale,
        x2: (pointer.x - stage.x()) / scale,
        y2: (pointer.y - stage.y()) / scale,
      });
    } else if (state.buildMode === 1) {
      if (quickWallCoordinates.x1 === undefined) {
        setQuickWallCoordinates({
          x1: (pointer.x - stage.x()) / scale,
          y1: (pointer.y - stage.y()) / scale,
        });
      } else {
        const x2 = (pointer.x - stage.x()) / scale;
        const y2 = (pointer.y - stage.y()) / scale;
        const { x1, y1 } = quickWallCoordinates;

        let element = shapeFactory("wall") as Wall;
        element = { ...element, x1, y1, x2, y2 } as Wall;

        dispatch(addElement(element));

        setQuickWallCoordinates({ x1: x2, y1: y2 });
      }
    }
  };

  const handleMouseMove = (e: { evt: MouseEvent, target: Konva.Stage }) => {

    const container = stageRef!.current!.container();
    if (isShiftPressed || state.buildMode === 1) {
      container.style.cursor = "default";
    } else {
      container.style.cursor = "grab";
    }

    if (!isSelecting.current) {
      return;
    }

    const stage = e.target.getStage();
    const pos = e.target.getStage().getPointerPosition()!;
    setSelectionRectangle({
      ...selectionRectangle,
      x2: (pos.x - stage.x()) / scale,
      y2: (pos.y - stage.y()) / scale,
    });
  };

  const handleMouseUp = () => {
    // Do nothing if we didn't start selection
    if (!isSelecting.current) {
      return;
    }
    isSelecting.current = false;

    setSelectionRectangle({
      ...selectionRectangle,
      visible: false,
    });

    const selBox = {
      x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
      y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
      width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
      height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
    };

    const selected = state.elements.filter(rect => {
      // we are checking if rectangle intersects with selection box
      return Konva.Util.haveIntersection(
        selBox,
        rectRefs.current.get(rect.id).getClientRect({ relativeTo: stageRef.current }),
      );
    });

    setSelectedIds(selected.map(rect => rect.id));
  };

  return (

    <div className="space-y-6">
      <div className="App overflow-hidden bg-white"
           style={{ display: "flex", border: "1px solid #e0e0e0", flexDirection: "row" }}>

        <Toolbox dispatch={dispatch} stageRef={stageRef} state={state} />

        {/* main Canvas */}
        <div ref={containerRef} style={{ flex: 1, position: "relative" }}>
          <Stage
            scaleX={scale}
            scaleY={scale}
            onWheel={handleWheel}
            draggable={!isSelecting.current}
            ref={stageRef}
            width={containerSize.width}
            height={containerSize.height}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
          >

            <Layer>

              {/* this is where we display elements */}
              {state.elements?.map((el) => {
                return (
                  <Group
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    draggable={el.draggable}
                    rotation={el.rotation}
                    onDblClick={(e) => handleDoubleClickOnElement(e, el)}
                    onDragMove={(e) => handleDragMove(e, el)}
                    onDragEnd={(e) => handleDragEnd(e, el)}
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
                onTransformEnd={handleTransformEnd}
              />

              {/* Selection rectangle */}
              {selectionRectangle.visible && (
                <Group>
                  <Rect
                    x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
                    y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
                    width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
                    height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
                    fill="rgba(0,0,255,0.5)"
                  />
                  <Text
                    text={`start: ${selectionRectangle.x1.toFixed(2)}:${selectionRectangle.y1.toFixed(2)}\nend: ${selectionRectangle.x2.toFixed(2)}:${selectionRectangle.y2.toFixed(2)}`}
                    x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
                    y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
                    width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
                    height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
                    fill="white"
                    fontSize={12}
                    align="center"
                    verticalAlign="middle"
                  />
                </Group>
              )}

            </Layer>
          </Stage>
        </div>

        {/*<StagePreview state={state} mainStage={stageRef.current!}></StagePreview>*/}

        {selectedIds.length === 1 && (
          <ElementInspector
            dispatch={dispatch}
            state={state}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          ></ElementInspector>
        )}
      </div>
    </div>
  );
}

export default KonvaCanvas;

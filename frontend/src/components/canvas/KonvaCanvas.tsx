import { useCanvas } from "./contexts/CanvasContext.tsx";
import { useEffect, useRef, useState } from "react";
import { Group, Layer, Stage, Transformer } from "react-konva";
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
  commitUndoRedoHistory,
  duplicateMultipleElements,
  redo,
  removeElements,
  setState,
  undo,
  updateMultipleElements,
  updateMultipleWithoutUndoRedo,
} from "./actions/actions.tsx";
import useApiService from "../../services/apiService.ts";
import { useParams } from "react-router-dom";
import StagePreview from "../../components/canvas/elements/StagePreview.tsx";
import NeighbourArrows from "../../components/canvas/elements/NeighbourArrows.tsx";
import SelectionRectangle from "../../components/canvas/elements/SelectionRectangle.tsx";

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

      const isUndo = (e.key === "z" || e.key === "Z") && (e.ctrlKey || e.metaKey) && !e.shiftKey;
      const isRedoX = (e.key === "x" || e.key === "X") && (e.ctrlKey || e.metaKey);
      const isRedoShiftZ = (e.key === "z" || e.key === "Z") && (e.ctrlKey || e.metaKey) && e.shiftKey;

      if (isUndo) {
        e.preventDefault();
        dispatch(undo());
        return;
      }

      if (isRedoX || isRedoShiftZ) {
        e.preventDefault();
        dispatch(redo());
        return;
      }

      if (e.key === "Escape") {
        setSelectedIds([]);

        setQuickWallCoordinates({ x1: undefined, y1: undefined });

        dispatch(changeBuildMode(0));
        return;
      }

      if (e.key === "Shift") {
        setIsShiftPressed(true);
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        dispatch(removeElements(selectedIds));
        setSelectedIds([]);
        return;
      }

      if (e.key === "D" || e.key === "d") {
        dispatch(duplicateMultipleElements(selectedIds, setSelectedIds));
        return;
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
        dispatch(updateMultipleWithoutUndoRedo(updates));
      }
    }
  };

  const handleDragStart = () => {
    dispatch(commitUndoRedoHistory());
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
        if (t.type === "circleTable") {
          const distance = Math.hypot(t.x - x, t.y - y);
          // Check if chair is within attachment zone (table radius + chair radius + small buffer)
          return distance < t.radius! + el.radius! + 20; // Added buffer for better UX
        } else {
          // For rectangle tables, use Konva's intersection method
          const chairRadius = el.radius!;

          // Treat circular chair as a rectangular bounding box with buffer
          const chairBox = {
            x: x - chairRadius,
            y: y - chairRadius,
            width: 2 * (chairRadius),
            height: 2 * (chairRadius),
          };

          // Get the table's client rect (handles rotation automatically)
          // Note: You'll need to pass rectRefs and stageRef to this function or access them from context
          const tableRect = rectRefs.current.get(t.id)?.getClientRect({ relativeTo: stageRef.current });

          if (!tableRect) return false;

          return Konva.Util.haveIntersection(chairBox, tableRect);
        }
      }) as Table;

      for (let i = 0; i < tables.length; i++) {
        tables[i].attachedChairs = tables[i].attachedChairs.filter(cid => cid !== el.id);
      }

      if (table) {
        // Calculate optimal position for the chair around the table
        let attachPosition: { x: number; y: number; angle: number };

        if (table.type === "circleTable") {
          // Calculate angle from table center to chair
          const angle = Math.atan2(y - table.y, x - table.x);
          // Position the chair at the edge of the table
          const distance = table.radius! + el.radius!;
          attachPosition = {
            x: table.x + distance * Math.cos(angle),
            y: table.y + distance * Math.sin(angle),
            angle: angle,
          };
        } else {
          if (Math.abs(table.rotation) < 0.01) {
            const { radius: padding } = el;
            const { width, height, x: tableX, y: tableY } = table;

            const centerX = tableX + width! / 2;
            const centerY = tableY + height! / 2;

            // Coordinates relative to table center
            const dx = x - centerX;
            const dy = y - centerY;

            const localX = dx;
            const localY = dy;

            let snappedX, snappedY;

            // Decide which edge to snap to
            const ratioX = Math.abs(localX) / (width! / 2);
            const ratioY = Math.abs(localY) / (height! / 2);

            if (ratioX > ratioY) {
              // Snap to left or right
              snappedX = (localX < 0 ? -1 : 1) * (width! / 2 + padding!);
              snappedY = Math.max(-height! / 2, Math.min(height! / 2, localY));
            } else {
              // Snap to top or bottom
              snappedY = (localY < 0 ? -1 : 1) * (height! / 2 + padding!);
              snappedX = Math.max(-width! / 2, Math.min(width! / 2, localX));
            }

            const globalX = centerX + snappedX;
            const globalY = centerY + snappedY;

            const angleToCenter = Math.atan2(centerY - globalY, centerX - globalX);

            attachPosition = {
              x: globalX,
              y: globalY,
              angle: angleToCenter,
            };
          } else {
            attachPosition = {
              x: x,
              y: y,
              angle: 0,
            };
          }
        }

        // Update chair with attachment info
        dispatch(
          updateMultipleWithoutUndoRedo([{
            id: el.id,
            x: attachPosition.x,
            y: attachPosition.y,
            attachedTo: table.id,
            offset: {
              dx: attachPosition.x - table.x,
              dy: attachPosition.y - table.y,
              angle: attachPosition.angle,
            },
          }]),
        );

        // Update table with attached chair
        if (!table.attachedChairs.includes(el.id)) {
          dispatch(
            updateMultipleWithoutUndoRedo([{
              id: table.id,
              attachedChairs: [...table.attachedChairs, el.id],
            }]),
          );
        }
        return;
      } else if (el.attachedTo) {
        const updates = [];

        // Detach chair from table
        const parents = state.elements.filter(t => t.id === el.attachedTo) as Table[];
        if (parents) {
          parents.forEach((parent) => {
            updates.push(
              {
                id: parent.id,
                attachedChairs: parent.attachedChairs.filter(cid => cid !== el.id),
              },
            );
          });
        }
        updates.push({ id: el.id, x, y, attachedTo: null, offset: null });
        dispatch(
          updateMultipleWithoutUndoRedo(updates),
        );
        return;
      }
    }
    // Default handling for position updates
    dispatch(updateMultipleWithoutUndoRedo([{ id, x, y }]));

  };

  function handleDoubleClickOnElement(_e: KonvaEventObject<MouseEvent>, el: ElementProperties) {
    // setSelectedIds([...selectedIds, el.id]);
    setSelectedIds([el.id]);
  }

  const handleTransformEnd = () => {
    const nodes = transformerRef.current!.nodes();

    const selectedIds = [];
    const updates = [];
    for (const node of nodes) {
      const id = node.attrs.id;
      selectedIds.push(id);
      const el = state.elements.find(e => e.id === id)!;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      node.scaleX(1);
      node.scaleY(1);

      const update =
        el.type === "circleTable" || el.type === "chair"
          ? {
            id,
            radius: el.radius ? Math.max(10, el.radius * scaleX) : undefined,
            rotation: node.rotation(),
            x: el.x!,
            y: el.y!,
          }
          : el.type !== "wall"
            ? {
              id,
              x: node.x()! / scaleX,
              y: node.y()! / scaleY,
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
              rotation: node.rotation(),
            };
      updates.push(update);
    }
    // @ts-ignore
    dispatch(updateMultipleElements(updates));
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
                    onDragStart={() => handleDragStart()}
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
              {selectionRectangle.visible && <SelectionRectangle selectionRectangle={selectionRectangle} />}
              {selectedIds.length === 1 &&
                state.elements.find((el) => el.type === "chair") && (
                  <NeighbourArrows
                    state={state}
                    table={(state.elements.find(
                      (a) =>
                        a.id ===
                        state.elements.find((el) => el.id === selectedIds[0])?.attachedTo,
                    ) as Table)}
                    selectedChairId={selectedIds[0]}
                  />
                )}
            </Layer>
          </Stage>
        </div>

        <StagePreview state={state} mainStage={stageRef.current!}></StagePreview>

        {selectedIds.length === 1 && (
          <ElementInspector
            dispatch={dispatch}
            state={state}
            selectedId={selectedIds[0]}
          ></ElementInspector>
        )}
      </div>
    </div>
  );
}

export default KonvaCanvas;

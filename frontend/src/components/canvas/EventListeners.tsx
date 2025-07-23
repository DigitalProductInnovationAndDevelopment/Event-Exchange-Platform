import {
  type Action,
  addElement,
  changeBuildMode,
  commitUndoRedoHistory,
  duplicateMultipleElements,
  redo,
  removeElements,
  setChairIdForManualAssignment,
  undo,
  updateMultipleElements,
  updateMultipleWithoutUndoRedo,
} from "components/canvas/actions/actions.tsx";
import Konva from "konva";
import { type ElementProperties, shapeFactory, type UUID } from "components/canvas/utils/constants.tsx";
import type { Chair } from "components/canvas/elements/Chair.tsx";
import type { AppState } from "components/canvas/reducers/CanvasReducer.tsx";
import React from "react";
import type { Table } from "components/canvas/elements/Table.tsx";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Wall } from "components/canvas/elements/Wall.tsx";


export type SelectionRectangleType = { x1: number; x2: number; y1: number; y2: number; }


export const handleKeyUp = (e: KeyboardEvent,
                            setIsShiftPressed: any,
                            stageRef: React.RefObject<Konva.Stage | null>) => {
  if (e.key === "Shift") {
    setIsShiftPressed(false);
    const container = stageRef!.current?.container();
    if (container) {
      container.style.cursor = "grab";
    }
  }
};

export const handleKeyDown =
  (e: KeyboardEvent, dispatch: (action: Action) => void, setSelectedIds: any, setIsShiftPressed: any, selectedIds: UUID[], setQuickWallCoordinates: any) => {
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
      dispatch(setChairIdForManualAssignment(null));
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
      dispatch(setChairIdForManualAssignment(null));
      return;
    }

    if (e.key === "D" || e.key === "d") {
      dispatch(duplicateMultipleElements(selectedIds, setSelectedIds));
      return;
    }
  };


export const handleWheel = (e: {
  evt: WheelEvent
}, stageRef: React.RefObject<Konva.Stage | null>, scale: number, setScale: any) => {
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
export const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>, el: ElementProperties, state: AppState, dispatch: (action: Action) => void) => {
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


export function handleDoubleClickOnElement(_e: KonvaEventObject<MouseEvent>, el: ElementProperties, setSelectedIds: any) {
  // setSelectedIds([...selectedIds, el.id]);
  setSelectedIds([el.id]);
}

export function handleMouseUp(isSelecting: React.RefObject<boolean>, selectionRectangle: SelectionRectangleType,
                              state: AppState,
                              stageRef: React.RefObject<Konva.Stage | null>,
                              rectRefs: any,
                              dispatch: (action: Action) => void,
                              setSelectionRectangle: any,
                              setSelectedIds: any) {
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
  dispatch(setChairIdForManualAssignment(null));
  setSelectedIds(selected.map(rect => rect.id));
}

export const handleMouseMove = (e: {
  evt: MouseEvent,
  target: Konva.Stage
}, isShiftPressed: boolean, state: AppState, scale: number, stageRef: React.RefObject<Konva.Stage | null>, isSelecting: React.RefObject<boolean>, selectionRectangle: SelectionRectangleType, setSelectionRectangle) => {

  const container = stageRef!.current?.container();
  if (container && (isShiftPressed || state.buildMode === 1)) {
    container.style.cursor = "default";
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

export const handleMouseDown = (e: {
  evt: MouseEvent;
  target: Konva.Node
}, stageRef: React.RefObject<Konva.Stage | null>, isSelecting: React.RefObject<boolean>, dispatch: (action: Action) => void, setSelectedIds, setSelectionRectangle, scale: number, state: AppState, quickWallCoordinates, setQuickWallCoordinates) => {
  const stage = e.target.getStage()!;
  const pointer = stageRef.current!.getPointerPosition()!;
  isSelecting.current = e.evt.shiftKey;

  if (e.target === stage) {
    dispatch(setChairIdForManualAssignment(null));
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

export const handleGroupDragStart = (dispatch: (action: Action) => void) => {
  dispatch(commitUndoRedoHistory());
};

export const handleGroupDragEnd = (deltaX: number, deltaY: number, dispatch: (action: Action) => void, state: AppState, selectedIds: UUID[]) => {

  const updatedElements = state.elements.filter(el => selectedIds.includes(el.id)).map(el => {
    return {
      ...el,
      x: el.x! + deltaX,
      y: el.y! + deltaY,
    };
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  dispatch(updateMultipleWithoutUndoRedo(updatedElements));
};

export const handleDragStart = (dispatch: (action: Action) => void) => {
  dispatch(commitUndoRedoHistory());
};

// handle drag end for elements
export const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, el: ElementProperties, dispatch: (action: Action) => void, state: AppState, rectRefs, stageRef: React.RefObject<Konva.Stage | null>) => {
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

export const handleTransformEnd = (transformerRef, state: AppState, dispatch: (action: Action) => void, setSelectedIds) => {
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
        : el.type !== "wall" && el.type !== "arrow"
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
  dispatch(setChairIdForManualAssignment(null));
  setSelectedIds(selectedIds);
};
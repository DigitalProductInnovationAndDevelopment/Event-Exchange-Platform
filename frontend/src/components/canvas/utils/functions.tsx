import type { Chair } from "components/canvas/elements/Chair.tsx";
import React from "react";
import Konva from "konva";
import type { AlgorithmType, UUID } from "components/canvas/utils/constants.tsx";
import type { AppState } from "components/canvas/reducers/CanvasReducer.tsx";
import toast from "react-hot-toast";
import type { Table } from "components/canvas/elements/Table.tsx";

export function areNeighbours(sourceChair: Chair, targetChair: Chair): boolean {
  const dx = sourceChair.x - targetChair.x;
  const dy = sourceChair.y - targetChair.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const threshold = 7 * (sourceChair.radius + targetChair.radius);
  return distance <= threshold;
}

export function makeBackgroundWhite(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      console.log("Image loaded", img.width, img.height);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Failed to get canvas context"));
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);

      try {
        const jpegUri = canvas.toDataURL("image/jpeg", 2);
        console.log("Generated JPEG length:", jpegUri.length);
        resolve(jpegUri);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = function (err) {
      console.error("Image failed to load", err);
      reject(new Error("Failed to load image"));
    };

    img.src = uri;
  });
}

export function sanitizeDimensions(value: number, fallback = 0) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return value;
}

export const handleExport = async (stageRef: React.RefObject<Konva.Stage | null>) => {
  if (!stageRef.current) return;

  const stage = stageRef.current;
  const layers = stage.getLayers();

  // Check if there are any layers with content
  if (layers.length === 0) {
    console.warn("No layers found");
    return;
  }

  // Get valid layer rectangles
  const layerRects = layers
    .map(layer => layer.getClientRect({ skipTransform: false }))
    .filter(rect => rect.width > 0 && rect.height > 0);

  // Calculate bounding box
  const minX = Math.min(...layerRects.map(rect => rect.x));
  const minY = Math.min(...layerRects.map(rect => rect.y));
  const maxX = Math.max(...layerRects.map(rect => rect.x + rect.width));
  const maxY = Math.max(...layerRects.map(rect => rect.y + rect.height));

  const contentRect = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };

  const padding = 50;
  const exportRect = {
    x: contentRect.x - padding,
    y: contentRect.y - padding,
    width: contentRect.width + padding * 2,
    height: contentRect.height + padding * 2,
  };

  try {
    return await makeBackgroundWhite(
      stage.toDataURL({
        x: sanitizeDimensions(exportRect.x),
        y: sanitizeDimensions(exportRect.y),
        width: sanitizeDimensions(exportRect.width),
        height: sanitizeDimensions(exportRect.height),
        pixelRatio: 2,
      })
    )
      .then(jpegUri => {
        return jpegUri;
      })
      .catch(err => {
        console.error("Error processing image:", err);
      });
  } catch (error) {
    console.error("Export failed:", error);
  }
};


export function findStageCenterCoordinates(stageRef: React.RefObject<Konva.Stage | null>) {
  const stage = stageRef.current?.getStage();

  const scaleX = stage?.scale()?.x ?? 1;
  const scaleY = stage?.scale()?.y ?? 1;
  const width = (stage?.width() ?? 0) / scaleX;
  const height = (stage?.height() ?? 0) / scaleY;
  const stageX = (stageRef.current?.x() ?? 0) / scaleX;
  const stageY = (stageRef.current?.y() ?? 0) / scaleY;
  const centerX = (width * 0.5 - stageX);
  const centerY = (height * 0.5 - stageY);
  return { x: centerX, y: centerY };
}

export const validateCanvasElementDeletion = (state: AppState, selectedIds: UUID[]) => {

  const selectedIdSet = new Set(selectedIds);

  const chairsToBeDeleted: Chair[] = [];
  const tablesToBeDeleted: Table[] = [];
  const allChairMap = new Map<UUID, Chair>();
  const allTablesMap = new Map<UUID, Table>();

  for (const el of state.elements) {

    if (el.type === "chair") {
      if (selectedIdSet.has(el.id)) {
        chairsToBeDeleted.push(el as Chair);
      }
      allChairMap.set(el.id, el as Chair);
    } else if ((el.type === "rectTable" || el.type === "circleTable")) {
      if (selectedIdSet.has(el.id)) {
        tablesToBeDeleted.push(el as Table);
      }
      allTablesMap.set(el.id, el as Table);
    }
  }

  // Check directly selected assigned chairs
  const hasAssignedChairs = chairsToBeDeleted.some(chair => chair.assigneeProfileId);
  if (hasAssignedChairs) {
    toast.error("Cannot delete chair(s) that have assigned participants. Please unassign first.");
    return false;
  }

  // Check tables with assigned attached chairs
  if (tablesToBeDeleted.length > 0) {

    for (const table of tablesToBeDeleted) {
      if (!table.attachedChairs?.length) continue;

      const hasAssignedAttachedChairs = table.attachedChairs.some(chairId => {
        const chair = allChairMap.get(chairId);
        return chair?.assigneeProfileId;
      });

      if (hasAssignedAttachedChairs) {
        toast.error("Cannot delete table(s) that have chairs with assigned guests. Please unassign first.");
        return false;
      }
    }
  }

  chairsToBeDeleted.forEach((chair) => {
    if (chair.attachedTo) {
      const table = allTablesMap.get(chair.attachedTo);
      if (table?.attachedChairs) {
        table.attachedChairs = table.attachedChairs.filter(c => c !== chair.id);
      }
    }
  });
  return true;
};

export function extractedNeighboringEmployeeProfileIds(
  chairId: string | null, state: AppState, generateChairNeighborMap: (algorithmType: AlgorithmType) => Record<string, Record<string, string[]>>, algorithmType: AlgorithmType) {

  let neighbourProfileIds: UUID[] = [];
  if (chairId) {
    const chair = state.elements.find(el => el.type === "chair" && el.id === chairId);
    if (!chair!.attachedTo) {
      toast.error("Chair is not attached to a table!");
    }
    const neighborChairIds = new Set(generateChairNeighborMap(algorithmType)[chair!.attachedTo!][chairId]);

    neighbourProfileIds = state.elements.reduce<string[]>((acc, el) => {
      if (el.type === "chair" &&
        neighborChairIds.has(el.id) &&
        (el as Chair).assigneeProfileId &&
        !(el as Chair).belongsToVisitor) {
        acc.push((el as Chair).assigneeProfileId!);
      }
      return acc;
    }, []);
  }
  return neighbourProfileIds;
}

export const handleMouseOver = (e: Konva.KonvaEventObject<PointerEvent>) => {
  e.target.getStage()!.container().style.cursor = "default";
};

export const handleMouseOut = (e: Konva.KonvaEventObject<PointerEvent>) => {
  e.target.getStage()!.container().style.cursor = "grab";
};

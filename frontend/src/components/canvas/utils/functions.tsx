import type { Chair } from "components/canvas/elements/Chair.tsx";
import React from "react";
import Konva from "konva";

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

    img.onload = function() {
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

    img.onerror = function(err) {
      console.error("Image failed to load", err);
      reject(new Error("Failed to load image"));
    };

    img.src = uri;
  });
}

export function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
    return await makeBackgroundWhite(stage.toDataURL({
      x: sanitizeDimensions(exportRect.x),
      y: sanitizeDimensions(exportRect.y),
      width: sanitizeDimensions(exportRect.width),
      height: sanitizeDimensions(exportRect.height),
      pixelRatio: 2,
    }))
      .then((jpegUri) => {
        console.log("Converted image URI:", jpegUri);
        return jpegUri;
      })
      .catch((err) => {
        console.error("Error processing image:", err);
      });

  } catch (error) {
    console.error("Export failed:", error);
  }
};

export const handleMouseOver = (e: Konva.KonvaEventObject<PointerEvent>) => {
  e.target.getStage()!.container().style.cursor = "default";
};

export const handleMouseOut = (e: Konva.KonvaEventObject<PointerEvent>) => {
  e.target.getStage()!.container().style.cursor = "grab";
};


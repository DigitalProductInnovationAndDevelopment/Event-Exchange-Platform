import { Group, Layer, Rect, Stage, Text } from "react-konva";
import { shapeFactory, TOOLBOX_ITEMS, TOOLBOX_X, TOOLBOX_Y } from "../utils/constants";
import type { Chair } from "./Chair";
import type { Room } from "./Room";
import type { Wall } from "./Wall";
import type { AppState } from "../reducers/CanvasReducer.tsx";
import type { Table } from "./Table.tsx";
import Konva from "konva";
import React from "react";
import useApiService from "../../../services/apiService.ts";
import { useParams } from "react-router-dom";
import { addElement, changeBuildMode } from "../actions/actions.tsx";


function makeBackgroundWhite(uri: string): Promise<string> {
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


function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function sanitize(value: number, fallback = 0) {
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
      x: sanitize(exportRect.x),
      y: sanitize(exportRect.y),
      width: sanitize(exportRect.width),
      height: sanitize(exportRect.height),
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

  return (
    <Stage scaleX={1} scaleY={1} width={150} height={window.innerHeight}>
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
        </Group>
      </Layer>
    </Stage>
  );
}

export default Toolbox;

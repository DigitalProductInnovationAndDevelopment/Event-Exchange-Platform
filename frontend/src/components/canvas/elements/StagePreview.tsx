import { Group, Layer, Stage } from "react-konva";
import { renderElement } from "../utils/constants";
import { useState } from "react";
import type { AppState } from "../reducers/CanvasReducer.tsx";
import Konva from "konva";

function StagePreview({ state, mainStage }: { state: AppState; mainStage: Konva.Stage }) {
  const [isVisible, setIsVisible] = useState(false);

  const togglePreview = () => {
    setIsVisible(prev => !prev);
  };

  return (
    <div
      style={{
        position: "sticky",
        top: "0",
        right: isVisible ? "0" : "70px",
        border: isVisible ? "1px solid grey" : "none",
        height: (window.innerHeight / 4),
        backgroundColor: isVisible ? "lightgrey" : "transparent",
        zIndex: 999,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          zIndex: 1000,
        }}
      >
        <button
          onClick={togglePreview}
          style={{
            width: "70px",
            height: "40px",
            backgroundColor: "#ccc",
            border: "1px solid #999",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          {isVisible ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {isVisible && (
        <Stage
          width={(window.innerWidth - 150) / 4}
          height={window.innerHeight / 4}
          scaleX={mainStage === null ? 0.25 : mainStage.scaleX() * 0.0625}
          scaleY={mainStage === null ? 0.25 : mainStage.scaleY() * 0.0625}
          x={mainStage === null ? 0 : ((window.innerWidth - 250) / 8) + mainStage.x() * 0.0625}
          y={mainStage === null ? 0 : (window.innerHeight / 8) + mainStage.y() * 0.0625}
        >
          <Layer>
            {state.elements.map(el => (
              <Group key={el.id} id={el.id} x={el.x ?? 0} y={el.y ?? 0}>
                {renderElement(el, false)}
              </Group>
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
}

export default StagePreview;

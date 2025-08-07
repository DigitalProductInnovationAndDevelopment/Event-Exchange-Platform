import type { AppState } from "../reducers/CanvasReducer.tsx";
import { getEditableParameters, type UUID } from "../utils/constants.tsx";
import { type Action, updateElementSpecificField } from "components/canvas/actions/actions.tsx";
import "./ElementInspector.css";

function renderArrayTypeInput(
  key: string,
  value: string,
  paramType: string[],
  dispatch: (action: Action) => void,
  selectedId: UUID
) {
  return (
    <select
      className="selectStyle"
      value={value}
      onChange={e =>
        dispatch(
          updateElementSpecificField({
            id: selectedId,
            key,
            value: e.target.value,
          })
        )
      }
    >
      {paramType.map((option: string) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function renderColorTypeInput(
  key: string,
  value: string,
  dispatch: (action: Action) => void,
  selectedId: UUID
) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <input
        className="inputStyle"
        type="text"
        value={value}
        onChange={e =>
          dispatch(
            updateElementSpecificField({
              id: selectedId,
              key,
              value: e.target.value,
            })
          )
        }
        placeholder="#000000"
        pattern="^#[0-9A-Fa-f]{6}$"
        style={{ flex: 1 }}
      />
      <input
        type="color"
        value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#000000"}
        onChange={e =>
          dispatch(
            updateElementSpecificField({
              id: selectedId,
              key,
              value: e.target.value,
            })
          )
        }
        style={{
          width: "40px",
          height: "32px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
          padding: "0",
        }}
        title="Color Picker"
      />
    </div>
  );
}

function renderStringOrNumberInput(
  key: string,
  paramType: string,
  value: string | number,
  dispatch: (action: Action) => void,
  selectedId: UUID
) {
  return (
    <input
      className="inputStyle"
      type={paramType}
      value={value}
      onChange={e =>
        dispatch(
          updateElementSpecificField({
            id: selectedId,
            key,
            value: paramType === "number" ? parseFloat(e.target.value) : e.target.value,
          })
        )
      }
    />
  );
}

export function ElementInspector({
  dispatch,
  state,
  selectedId,
}: {
  dispatch: (action: Action) => void;
  state: AppState;
  selectedId: string;
}) {
  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Edit Element</h4>
      {(() => {
        const el = state.elements.find(el => el.id === selectedId);
        const editableParameters = el ? getEditableParameters(el) : {};

        return (
          <div className="panelStyle">
            <h4 style={{ marginTop: 0 }}>Edit Element</h4>
            {el ? (
              Object.entries(el)
                .filter(([key]) => Object.prototype.hasOwnProperty.call(editableParameters, key))
                .map(([key, value]) => {
                  const paramType = editableParameters[key];

                  return (
                    <div key={key} className="fieldStyle">
                      <label className="labelStyle">{key}:</label>
                      {Array.isArray(paramType)
                        ? renderArrayTypeInput(key, value, paramType, dispatch, selectedId)
                        : paramType === "color"
                          ? renderColorTypeInput(key, value, dispatch, selectedId)
                          : renderStringOrNumberInput(key, paramType, value, dispatch, selectedId)}
                    </div>
                  );
                })
            ) : (
              <div />
            )}
          </div>
        );
      })()}
    </div>
  );
}

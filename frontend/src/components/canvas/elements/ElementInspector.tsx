import type { AppState } from "../reducers/CanvasReducer.tsx";
import { getEditableParameters } from "../utils/constants.tsx";
import { updateElementSpecificField } from "components/canvas/actions/actions.tsx";
import "./ElementInspector.css";

export function ElementInspector({
                                   dispatch,
                                   state,
                                   selectedId,
                                 }: {
  dispatch: (action: { type: string; payload: object }) => void;
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

                  if (Array.isArray(paramType)) {
                    return (
                      <div key={key} className="fieldStyle">
                        <label className="labelStyle">{key}:</label>
                        <select
                          className="selectStyle"
                          value={value as string}
                          onChange={e =>
                            dispatch(
                              updateElementSpecificField({
                                id: selectedId,
                                key,
                                value: e.target.value,
                              }),
                            )
                          }
                        >
                          {paramType.map((option: string) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="fieldStyle">
                      <label className="labelStyle">{key}:</label>
                      <input
                        className="inputStyle"
                        type={paramType}
                        value={value}
                        onChange={e =>
                          dispatch(
                            updateElementSpecificField({
                              id: selectedId,
                              key,
                              value:
                                paramType === "number"
                                  ? parseFloat(e.target.value)
                                  : e.target.value,
                            }),
                          )
                        }
                      />
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

import type {AppState} from "../reducers/CanvasReducer.tsx";
import React from "react";
import {getEditableParameters} from "../utils/constants.tsx";
import {updateElementSpecificField} from "../../../components/canvas/actions/actions.tsx";
import "./ElementInspector.css"


export function ElementInspector({dispatch, state, selectedIds}:
                                 {
                                     dispatch: (action: { type: string; payload: object }) => void,
                                     state: AppState,
                                     selectedIds: string[],
                                     setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
                                 }) {

    return (
        <div
            style={{
                position: "fixed",
                bottom: "10%",
                right: 20,
                width: "300px",
                height: "350px",
                overflowY: "auto",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px",
                zIndex: 1000,
                boxShadow: "0px 0px 10px rgba(0,0,0,0.1)"
            }}
        >
            <h4 style={{marginTop: 0}}>Edit Element</h4>

            {(() => {
                const el = state.elements.find(el => el.id === selectedIds[0]);
                const editableParameters = el ? getEditableParameters(el) : {};

                return (
                    <div className="panelStyle">
                        <h4 style={{marginTop: 0}}>Edit Element</h4>
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
                                                    onChange={(e) =>
                                                        dispatch(
                                                            updateElementSpecificField({
                                                                id: selectedIds[0],
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
                                                onChange={(e) =>
                                                    dispatch(
                                                        updateElementSpecificField({
                                                            id: selectedIds[0],
                                                            key,
                                                            value: paramType === "number" ? parseFloat(e.target.value) : e.target.value,
                                                        })
                                                    )
                                                }
                                            />
                                        </div>
                                    );
                                })
                        ) : (
                            <div/>
                        )}
                    </div>
                );
            })()}

        </div>
    );
}
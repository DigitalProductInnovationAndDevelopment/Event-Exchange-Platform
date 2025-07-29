import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Card, Col, Input, InputNumber, List, Row, Space, Spin, Typography } from "utils/antd.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "components/Breadcrumb";
import useApiService from "services/apiService";
import { CanvasProvider, useCanvas } from "components/canvas/contexts/CanvasContext";
import KonvaCanvas, { type KonvaCanvasProps } from "components/canvas/KonvaCanvas";
import { getFullName, type Profile } from "types/employee";
import { type ElementProperties } from "components/canvas/utils/constants.tsx";
import type { Chair } from "components/canvas/elements/Chair.tsx";
import type { Table } from "components/canvas/elements/Table.tsx";

import { CanvasTooltip } from "components/CanvasTooltip.tsx";
import { areNeighbours } from "components/canvas/utils/functions.tsx";
import { setChairIdForManualAssignment } from "components/canvas/actions/actions.tsx";
import type { SeatAllocationResult } from "types/event.ts";
import { ExportOutlined, ImportOutlined } from "@ant-design/icons";
import Konva from "konva";
import { useAuth } from "../../contexts/AuthContext.tsx";
import toast from "react-hot-toast";

const { Title } = Typography;


// Main content component for seat allocation
const SeatAllocationContent = ({
                                 eventId,
                                 eventName,
                                 schematicsId,
                                 stageRefs,
                               }: {
  eventId: string,
  eventName: string,
  schematicsId: string,
  stageRefs?: React.RefObject<Konva.Stage | null>,
}) => {
  const navigate = useNavigate();
  const { state, dispatch } = useCanvas();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<SeatAllocationResult[]>([]);
  const [unallocated, setUnallocated] = useState<SeatAllocationResult[]>([]);
  const [allocated, setAllocated] = useState<SeatAllocationResult[]>([]);
  const [unallocatedSearch, setUnallocatedSearch] = useState("");
  const [allocatedSearch, setAllocatedSearch] = useState("");
  const { getSeatAllocations, updateSeatAllocation, generateSeatAllocations } = useApiService();
  const [constraintInputValues, setConstraintInputValues] = useState({
    "last neighborhood": 0,
    "Standort": 0,
    "Anstellung": 0,
    "Geschlecht": 0,
  });

  // Calculate unallocated employees based on current seat assignment
  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!user?.isVisitor()) {
        await getSeatAllocations(eventId!).then((results: SeatAllocationResult[] | undefined) => {
          if (results) {
            setParticipants(results);
          }
          setLoading(false);
        });
      }
    })();

  }, [eventId, getSeatAllocations]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      updateChairLabels(participants);
      setLoading(false);
    })();

  }, [participants, state.elements.length]);

  const generateChairNeighborMap = (isTableBased: boolean) => {
    const tables: Table[] = (state.elements.filter((el: ElementProperties) => el.type === "circleTable" || el.type === "rectTable") as Table[]);
    const chairs: Chair[] = (state.elements.filter((el: ElementProperties) => el.type === "chair") as Chair[]);

    const chairMap = new Map<string, Chair>();
    chairs.forEach((chair: Chair) => {
      chairMap.set(chair.id, chair);
    });

    const neighborMap: Record<string, Record<string, string[]>> = {};

    tables.forEach((table: Table) => {
      const attachedChairIds = table.attachedChairs || [];

      const neighbors: Record<string, string[]> = {};

      for (let i = 0; i < attachedChairIds.length; i++) {
        const chairA = chairMap.get(attachedChairIds[i]);
        if (!chairA) continue;

        neighbors[chairA.id] = [];

        for (let j = 0; j < attachedChairIds.length; j++) {
          if (i === j) continue;

          const chairB = chairMap.get(attachedChairIds[j]);
          if (!chairB) continue;
          if (!isTableBased && areNeighbours(chairA, chairB)) {
            neighbors[chairA.id].push(chairB.id);
          } else if (isTableBased && chairA.attachedTo === chairB.attachedTo) {
            neighbors[chairA.id].push(chairB.id);
          }
        }
      }

      neighborMap[table.id] = neighbors;
    });

    console.log("Chair Neighbors:", neighborMap);
    return neighborMap;
  };


  const updateChairLabels = (participants: SeatAllocationResult[]) => {
    const assigned: SeatAllocationResult[] = [];
    const unassigned: SeatAllocationResult[] = [];
    const chairProfileMap: Map<string, Profile> = new Map();

    for (let i = 0; i < participants.length; i++) {
      if (participants[i].chairId) {
        assigned.push(participants[i]);
        chairProfileMap.set(participants[i].chairId!, participants[i].profile);
      } else {
        unassigned.push(participants[i]);
      }
    }

    state.elements
      ?.forEach((e: ElementProperties) => {
        if (e.type === "chair" && chairProfileMap.has(e.id)) {
          (e as Chair).assigneeProfileId = chairProfileMap.get(e.id)!.id;
          (e as Chair).assigneeName = getFullName(chairProfileMap.get(e.id)!);
        } else if (e.type === "chair") {
          (e as Chair).assigneeProfileId = undefined;
          (e as Chair).assigneeName = undefined;
        }
      });

    setAllocated(assigned);
    setUnallocated(unassigned);
  };

  // Generate initial seat allocation: assign unallocated employees to empty chairs
  const handleGenerate = async () => {
    //console.log(generateChairNeighborMap());
    try {
      setLoading(true);
      const results: SeatAllocationResult[] | null = await generateSeatAllocations(eventId!, generateChairNeighborMap(true), constraintInputValues);
      if (results) {
        toast.success("Seats are allocated successfully!");
        setParticipants(results);
      }
    } finally {
      setLoading(false);
    }

  };

  // Save the current seat allocation to the backend
  const handleSave = async () => {

  };

  const handleConstraintInputChange = (key, value) => {
    setConstraintInputValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };


  return (
    <div className="space-y-2">
      {/* Breadcrumb navigation */}
      <Breadcrumb
        items={[
          { path: "/events", label: "Events" },
          { path: `/events/${eventId}`, label: eventName || "Event" },
          { path: `/events/${eventId}/seat-allocation/${schematicsId}`, label: "Manage Seat Allocation" },
        ]}
      />
      {/* Page title and action buttons */}
      <div className="flex justify-between items-center">
        <div className="flex flex-row">
          <Title level={2}>Seat Allocation</Title>
          <CanvasTooltip />
        </div>

        <Space>
          {/* Generate button on the left */}
          <Button type="primary" onClick={handleGenerate} disabled={loading}>
            Generate
          </Button>
          {/* Save button in the middle */}
          <Button type="primary" onClick={handleSave} loading={loading}>
            Save
          </Button>
          {/* Back to Event button on the right */}
          <Button onClick={() => navigate(`/events/${eventId}`)}>Back to Event</Button>
        </Space>
      </div>
      {/* Main content: seat map and unallocated employees list */}
      <Row gutter={16}>
        <Col span={18}>
          <Card className="mb-6">
            <div style={{ height: "600px", overflow: "hidden" }}>
              <KonvaCanvas schematicsUUID={schematicsId} stageReference={stageRefs} />
            </div>
          </Card>
          <Card className="mb-6" title="Seat Allocation Settings">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 font-semibold mb-2">
                <span className="w-1/3 text-left">Constraints</span>
                <span className="w-1/3 text-left">Weighting</span>
                <span className="w-1/3 text-left">Explanation</span>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col w-1/3">
                  {[
                    { label: "Guests seated with employee", key: "guestsWithEmployee" },
                    { label: "Past Matches", key: "last neighborhood" },
                    { label: "Location", key: "Standort" },
                    { label: "Seniority", key: "Anstellung" },
                    { label: "Gender", key: "Geschlecht" },
                  ].map(({ label, key }) => (
                    <div key={key} className="flex items-center min-h-[40px] h-full">
                      <span className="text-left">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col w-1/3">
                  {[
                    { label: "Guests seated with employee", key: "guestsWithEmployee" },
                    { label: "Past Matches", key: "last neighborhood" },
                    { label: "Location", key: "Standort" },
                    { label: "Seniority", key: "Anstellung" },
                    { label: "Gender", key: "Geschlecht" },
                  ].map(({ label, key }, idx) => (
                    <div key={key} className="flex items-center min-h-[40px] h-full">
                      {idx === 0 ? (
                        <span className="text-left text-gray-500">always considered</span>
                      ) : (
                        <InputNumber
                          min={0}
                          max={3}
                          value={constraintInputValues[key]}
                          onChange={(value) => handleConstraintInputChange(key, value)}
                          step={1}
                          style={{ width: 80, marginLeft: 0 }}
                          className="text-left"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col w-1/3">
                  <span className="text-left text-black" style={{ minHeight: '200px', display: 'flex', alignItems: 'flex-start' }}>
                    Set the weighting for each constraint to guide how the seat allocation algorithm prioritizes them. Higher values mean greater importance. "Guests seated with employee" is always considered; for the others, choose a value from 0 (not considered at all) to 3 (very important).
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Unallocated Employees" className="mb-6">
            <Input.Search
              placeholder="Search"
              value={unallocatedSearch}
              onChange={e => setUnallocatedSearch(e.target.value)}
              className="mb-2"
            />
            {/* List of employees who are not yet assigned to any seat */}
            <List
              dataSource={useMemo(() =>
                unallocated.filter(item =>
                  (getFullName(item.profile).toLowerCase() || "").includes(unallocatedSearch.toLowerCase()) ||
                  (item.profile.email?.toLowerCase() || "").includes(unallocatedSearch.toLowerCase())
                ), [unallocated, unallocatedSearch])}
              pagination={{ pageSize: 5 }}
              renderItem={item => (
                <List.Item
                  actions={[
                    state.chairIdForManualAssignment && (
                      <Button
                        key="assign"
                        icon={<ImportOutlined style={{ fontSize: 16, color: "darkgreen" }} />}
                        onClick={() => {
                          updateSeatAllocation(eventId, {
                            participationId: item.participationId,
                            chairId: state.chairIdForManualAssignment,
                          }).then(
                            (assignmentResponse) => {
                              if (assignmentResponse) {
                                participants.find(p => p.participationId === item.participationId)!.chairId = state.chairIdForManualAssignment;
                                setParticipants([...participants]);
                                dispatch(setChairIdForManualAssignment(null));
                              }
                            },
                          );
                        }}
                      >
                      </Button>
                    ),
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{getFullName(item.profile)?.[0]}</Avatar>}
                    title={getFullName(item.profile)}
                    description={item.profile.email}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title="Allocated Employees" className="mb-6">
            <Input.Search
              placeholder="Search"
              value={allocatedSearch}
              onChange={e => setAllocatedSearch(e.target.value)}
              className="mb-2"
            />
            {/* List of employees who are assigned to any seat */}
            <List
              pagination={{ pageSize: 5 }}
              dataSource={useMemo(() =>
                allocated.filter(item =>
                  (getFullName(item.profile).toLowerCase() || "").includes(allocatedSearch.toLowerCase()) ||
                  (item.profile.email?.toLowerCase() || "").includes(allocatedSearch.toLowerCase())
                ), [allocated, allocatedSearch])}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button icon={<ExportOutlined key="delete" style={{ fontSize: 16, color: "#ff4d4f" }} />}
                            onClick={() => {
                              updateSeatAllocation(eventId, {
                                participationId: item.participationId,
                                chairId: null,
                              }).then(
                                (assignmentResponse) => {
                                  if (assignmentResponse) {
                                    participants.find(p => p.participationId === item.participationId)!.chairId = null;
                                    setParticipants([...participants]);
                                  }
                                },
                              );
                            }}>
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={getFullName(item.profile)}
                    description={item.profile.email}
                  />
                </List.Item>

              )}>
            </List>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Main page component: fetches data and provides context
export const EventSeatAllocation = ({ stageReference, schematicsUUID, eventName }: KonvaCanvasProps) => {
  const { eventId } = useParams();
  const [eventNameState] = useState<string>(eventName!);
  const [schematicsId, setSchematicsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Fetch event info, participants, and seat map on mount
  useEffect(() => {
    (async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        setSchematicsId(schematicsUUID || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, eventName, schematicsUUID]);

  if (loading || !eventId) {
    return (<div className="flex justify-center items-center h-screen">
      <Spin size="large" tip="Loading event details..." />
    </div>);
  }

  return (
    <CanvasProvider>
      <SeatAllocationContent
        eventId={eventId}
        eventName={eventNameState}
        schematicsId={schematicsId!}
        stageRefs={stageReference}
      />
    </CanvasProvider>
  );
};

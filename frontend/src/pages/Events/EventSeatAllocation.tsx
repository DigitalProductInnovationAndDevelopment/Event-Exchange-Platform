import { useEffect, useState } from "react";
import { Avatar, Button, Card, Col, List, message, Row, Space, Spin, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "components/Breadcrumb";
import useApiService from "services/apiService";
import { CanvasProvider, useCanvas } from "components/canvas/contexts/CanvasContext";
import KonvaCanvas from "components/canvas/KonvaCanvas";
import { getFullName, type ParticipationDetails, type Profile } from "types/employee";
import type { AppState } from "components/canvas/reducers/CanvasReducer";
import { type ElementProperties } from "components/canvas/utils/constants.tsx";
import type { Chair } from "components/canvas/elements/Chair.tsx";
import type { Table } from "components/canvas/elements/Table.tsx";

import { CanvasTooltip } from "components/CanvasTooltip.tsx";
import { areNeighbours } from "components/canvas/utils/functions.tsx";
import { setChairIdForManualAssignment } from "components/canvas/actions/actions.tsx";
import toast from "react-hot-toast";
import type { SeatAllocationResult } from "types/event.ts";
import { ExportOutlined, ImportOutlined } from "@ant-design/icons";

const { Title } = Typography;


// Main content component for seat allocation
const SeatAllocationContent = ({
                                 eventId,
                                 eventName,
                                 schematicsState,
                                 schematicsId,
                               }: {
  eventId: string,
  eventName: string,
  schematicsState: AppState,
  schematicsId: string
}) => {
  const navigate = useNavigate();
  const { state, dispatch } = useCanvas();
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<SeatAllocationResult[]>([]);
  const [unallocated, setUnallocated] = useState<SeatAllocationResult[]>([]);
  const [allocated, setAllocated] = useState<SeatAllocationResult[]>([]);
  const { updateSchematics, getSeatAllocations, updateSeatAllocations, generateSeatAllocations } = useApiService();

  // Calculate unallocated employees based on current seat assignment
  useEffect(() => {
    (async () => {
      setLoading(true);
      await getSeatAllocations(eventId!).then((results: SeatAllocationResult[] | undefined) => {
        if (results) {
          setParticipants(results);
        }
        setLoading(false);
      });
    })();

  }, [eventId, getSeatAllocations]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      updateChairLabels(participants);
      setLoading(false);
    })();

  }, [participants]);

  const generateChairNeighborMap = () => {
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
          if (areNeighbours(chairA, chairB)) {
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
    setLoading(true);
    const results: SeatAllocationResult[] | undefined = await generateSeatAllocations(eventId!, generateChairNeighborMap());
    if (results) {
      setParticipants(results);
    }
    setLoading(false);
    toast.success("Initial allocation generated!");
  };

  // Save the current seat allocation to the backend
  const handleSave = async () => {
    if (!schematicsState || !state) return;
    setLoading(true);
    await updateSchematics(schematicsId, state, null);
    setLoading(false);
    message.success("Allocation saved!");
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
              <KonvaCanvas />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Unallocated Employees" className="mb-6">
            {/* List of employees who are not yet assigned to any seat */}
            <List
              dataSource={unallocated}
              pagination={{ pageSize: 10 }}
              renderItem={item => (
                <List.Item
                  actions={[
                    state.chairIdForManualAssignment && (
                      <Button
                        key="assign"
                        icon={<ImportOutlined style={{ fontSize: 16, color: "darkgreen" }} />}
                        onClick={() => {
                          updateSeatAllocations(eventId, {
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
            {/* List of employees who are assigned to any seat */}
            <List
              pagination={{ pageSize: 10 }}
              dataSource={allocated}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button icon={<ExportOutlined key="delete" style={{ fontSize: 16, color: "#ff4d4f" }} />}
                            onClick={() => {
                              updateSeatAllocations(eventId, {
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
export const EventSeatAllocation = () => {
  const { eventId } = useParams();
  const { getEventById, getEventParticipants, getSchematics } = useApiService();
  const [eventName, setEventName] = useState("");
  const [, setParticipants] = useState<ParticipationDetails[]>([]);
  const [schematics, setSchematics] = useState<AppState | null>(null);
  const [schematicsId, setSchematicsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch event info, participants, and seat map on mount
  useEffect(() => {
    (async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const event = await getEventById(eventId);
        if (event) setEventName(event.name);
        const parts = await getEventParticipants(eventId);
        setParticipants(parts || []);
        if (event?.schematics?.id) {
          const sch = await getSchematics(event.schematics.id);
          setSchematics(sch || null);
          setSchematicsId(event.schematics.id || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, getEventById, getEventParticipants, getSchematics]);

  if (loading || !eventId || !schematics) {
    return (<div className="flex justify-center items-center h-screen">
      <Spin size="large" tip="Loading event details..." />
    </div>);
  }

  return (
    <CanvasProvider>
      <SeatAllocationContent
        eventId={eventId}
        eventName={eventName}
        schematicsId={schematicsId!}
        schematicsState={schematics}
      />
    </CanvasProvider>
  );
};

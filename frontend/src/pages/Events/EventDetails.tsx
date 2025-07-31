import { Button, Card, Col, Descriptions, Image, Modal, Row, Space, Spin, Statistic, Typography } from "utils/antd.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "components/Breadcrumb.tsx";
import {
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  LeftOutlined,
  RightOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import type { Event, FileEntity } from "types/event.ts";
import useApiService, { BASE_URL } from "../../services/apiService.ts";
import FileUploadButton from "./components/FileUploadButton.tsx";
import FileListDisplay from "./components/FileListComponent.tsx";
import toast from "react-hot-toast";
import { EventStatusTag } from "components/EventStatusTag.tsx";
import { EventTypeTag } from "components/EventTypeTag.tsx";
import { type Profile } from "types/employee.ts";
import { aggregateDietaryCombinations, exportDietaryPreferencesToCSV, exportParticipationToCSV } from "utils/utils.ts";
import { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { handleExport } from "components/canvas/utils/functions.tsx";
import { EventSeatAllocation } from "pages/Events/EventSeatAllocation.tsx";
import { useAuth } from "../../contexts/AuthContext.tsx";

const { Title } = Typography;

export const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const {
    getEventById,
    deleteEvent,
    deleteFile,
    fileDownload,
    initiateSchematics,
    getEventParticipants,
  } = useApiService();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dietaryStatsEmployee, setDietaryStatsEmployee] = useState<Record<string, number>>({});
  const [dietaryStatsGuest, setDietaryStatsGuest] = useState<Record<string, number>>({});
  const [, setEventParticipantProfiles] = useState<Profile[]>([]);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.isAdmin();

  // here, we try to render the schematics preview. we repeat until the render is ready.
  const stageWidth = stageRef.current?.size()?.width;
  useEffect(() => {
    const interval = setInterval(async () => {
      let url = null;
      const stage = stageRef.current?.getStage();
      if (stage && stage.getLayers().length > 1) {
        url = await handleExport(stageRef);
        if (url) {
          clearInterval(interval);
          setImageUrl(url);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [stageWidth, stageRef.current?.getLayers()]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const eventDetailsData = await getEventById(eventId!);
        setEvent(eventDetailsData);
        setEventParticipantProfiles(eventDetailsData?.participantDetails ?? []);
        if (eventDetailsData?.participantDetails) {
          const {
            dietaryCombinationsEmployees,
            dietaryCombinationsGuests,
          } = aggregateDietaryCombinations(eventDetailsData!.participantDetails);
          setDietaryStatsEmployee(dietaryCombinationsEmployees);
          setDietaryStatsGuest(dietaryCombinationsGuests);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setLoading(false);
      }
    })();
  }, [eventId]);

  async function onDelete() {
    try {
      const result = await deleteEvent(eventId!);
      if (result) {
        navigate(`/events`);
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  }

  const showDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  const handleFileDelete = async (fileId: string) => {
    const result = await deleteFile(fileId!);
    if (result) {
      setEvent({
        ...event!,
        fileEntities: event!.fileEntities.filter(file => file.fileId !== fileId) ?? [],
      });
    }
  };

  const handleFileUpload = async (file: FileEntity | undefined) => {
    if (file) {
      event!.fileEntities.push(file);
      setEvent({
        ...event!,
      });
    }
  };

  const handleCreate = async (basePath: string) => {
    try {
      event!.schematics = await initiateSchematics(eventId!);
      if (event!.schematics) {
        setEvent({
          ...event!,
        });
        navigate(`${basePath}/${event!.schematics.id}`);
      }
    } catch (error) {
      toast.error("Failed to create schematics.");
    }
  };

  const handleDownload = async (file: FileEntity) => {
    await fileDownload(file);
  };

  if (loading) {
    return (<div className="flex justify-center items-center h-screen">
      <Spin size="large" tip="Loading event..." />
    </div>);
  } else if (!event) {
    return <div className="flex justify-center items-center h-screen">
      <div>Event not found.</div>
    </div>;
  }

  const imageFiles = event.fileEntities?.filter(
    file => file.contentType === "image/png" || file.contentType === "image/jpeg",
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { path: "/events", label: "Events" },
          { path: `/events/${eventId}`, label: event.name },
        ]}
      />

      {/* this is important because this allows the component to fully render (including Konva or canvas) and doesn't interfere with event details layout */}
      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          zIndex: -9999,
          width: "1px",
          height: "1px",
          visibility: "hidden",
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <EventSeatAllocation
          stageReference={stageRef}
          eventName={event.name}
          schematicsUUID={event.schematics?.id}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Title level={2} className="!my-2 max-w-xl">{event.name}</Title>
          <div className="px-4 py-2">
            <EventStatusTag status={event.status} size="big" />
          </div>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/events/${eventId}/edit`)}
          >
            Edit Event
          </Button>

          <Button danger icon={<DeleteOutlined />} onClick={showDeleteModal}>
            Delete Event
          </Button>

          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                Confirm Delete
              </div>
            }
            centered
            open={deleteModalOpen}
            onOk={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            width={400}
          >
            <p>Are you sure you want to delete this event?</p>
            <p style={{ color: "#8c8c8c", fontSize: "14px" }}>This action cannot be undone, and it will delete "Employee
              Matchings" belonging to this event, as well.</p>
          </Modal>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Card className="mb-6">
            <Descriptions title="Event Information" bordered>
              <Descriptions.Item label="Date" span={3}>
                {new Date(event.date).toLocaleString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={3}>
                <Space>
                  <EnvironmentOutlined />
                  {event.address}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Type" span={3}>
                <EventTypeTag type={event.eventType} />
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>
                {event.description}
              </Descriptions.Item>
              {isAdmin && event.notes ?
                (<Descriptions.Item label="Notes" span={3}>
                  {event.notes}
                </Descriptions.Item>) : null
              }
            </Descriptions>
          </Card>

          {/* Seat Layout Tile */}
          <Card title="Seat Layout" className="mb-6">
            <Row gutter={16}>
              <Col span={16}>
                {event.schematics?.id ? (
                  <div
                    className="flex justify-center items-center"
                    style={{
                      background: "#ffffff",
                      borderRadius: 4,
                      width: "100%",
                      height: "200px",
                      overflow: "hidden",
                    }}
                  >
                    {
                      imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt="Event Seat Plan Image"
                          style={{
                            width: "100%",
                            height: "200px",
                            objectFit: "fill",
                          }}
                        />
                      ) : (
                        <p>Loading schematics...</p>
                      )
                    }
                  </div>
                ) : (
                  <div
                    className="flex justify-center items-center"
                    style={{
                      background: "#f5f5f5",
                      borderRadius: 4,
                      width: "100%",
                      height: "200px",
                      color: "#8c8c8c",
                    }}
                  >
                    No seat layout available
                  </div>
                )}
              </Col>
              <Col span={8} style={{ height: "100%"}}>
                <Space direction="vertical" className="w-full">
                  <Button block icon={<UserAddOutlined />}
                    onClick={() => navigate(`/events/${eventId}/manage-participants`)}>
                    Manage Participants
                  </Button>
                  <Button block icon={<EditOutlined />}
                    onClick={() => {
                      if (event?.schematics) {
                        navigate(`/events/${eventId}/seat-allocation/${event.schematics?.id}`);
                      } else {
                        handleCreate(`/events/${eventId}/seat-allocation`);
                      }
                    }}>
                    Manage Seat Allocation
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Participation Section */}
          <Card title="Participation" className="mb-6">
            <div className="flex flex-col">
              <div className="flex md:flex-row justify-around items-stretch gap-4 w-full">
                <Statistic title="Capacity" value={event.capacity} prefix={<TeamOutlined />} />
                <Statistic title="Total Participants"
                           value={event.employeeParticipantCount + event.visitorParticipantCount}
                           prefix={<TeamOutlined />} />
                <Statistic title="Employees" value={event.employeeParticipantCount} prefix={<TeamOutlined />} />
                <Statistic title="Guests" value={event.visitorParticipantCount} prefix={<TeamOutlined />} />
              </div>
            </div>
          </Card>

          {/* Dietary Preferences Section */}
          {Object.entries(dietaryStatsEmployee).length > 0 && (
            <Card title="Employee Dietary Preferences" className="mb-6">
              <div className="flex flex-col">
                <div
                  className="grid gap-4 w-full"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
                >
                  {Object.entries(dietaryStatsEmployee)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([dietCombo, count]) => (
                    <div key={dietCombo} className="flex flex-col items-center justify-center">
                      <Statistic
                        title={<span className="text-center w-full block">{dietCombo}</span>}
                        value={count}
                        valueStyle={{ display: "block", textAlign: "center", width: "100%" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Guest Dietary Preferences Section */}
          {Object.entries(dietaryStatsGuest).length > 0 && (
            <Card title="Guest Dietary Preferences" className="mb-6">
              <div className="flex flex-col">
                <div
                  className="grid gap-4 w-full"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
                >
                  {Object.entries(dietaryStatsGuest)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([dietCombo, count]) => (
                      <div key={dietCombo} className="flex flex-col items-center justify-center">
                        <Statistic
                          title={<span className="text-center w-full block">{dietCombo}</span>}
                          value={count}
                          valueStyle={{ display: "block", textAlign: "center", width: "100%" }}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          )}

        </Col>

        <Col span={8}>
          {/* Participants Tile */}
      <Card title="Export Information" className="mb-6">
        <Space direction="vertical" className="w-full">
          <Button
            block
            icon={<FileTextOutlined />}
            onClick={() => {
              const combinedStats = { ...dietaryStatsEmployee };
              Object.entries(dietaryStatsGuest).forEach(([combo, count]) => {
                combinedStats[combo] = (combinedStats[combo] || 0) + count;
              });
              exportDietaryPreferencesToCSV(combinedStats, event?.name || "Event");
            }}
          >
            Export Dietary Preferences
          </Button>
          <Button
            block
            icon={<FileTextOutlined />}
            onClick={async () => {
              const participants = await getEventParticipants(eventId!);
              if (participants) exportParticipationToCSV(participants, event?.name || "Event");
            }}
          >
            Export Participant List
          </Button>
          <Button
            block
            icon={<FileTextOutlined />}
            disabled={!imageUrl}
            onClick={() => {
              if (imageUrl) {
                const link = document.createElement("a");
                link.href = imageUrl;
                link.download = `${event?.name?.replace(/\s+/g, "_")}_Seat_Layout.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
          >
            Export Seat Layout
          </Button>
        </Space>
          </Card>

          {imageFiles?.length > 0 && (
            <Card title="Event Images" className="mb-6">
              <Space direction="vertical" className="w-full">
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "#f5f5f5",
                      borderRadius: 4,
                      width: "100%",
                      height: "200px",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={`${BASE_URL}/files/${imageFiles[currentImageIndex].fileId}`}
                      alt="Event Image"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  {imageFiles.length > 1 && (
                    <>
                      <Button
                        type="text"
                        icon={<LeftOutlined />}
                        style={{
                          position: "absolute",
                          left: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 1,
                          color: "white",
                          fontSize: "18px",
                          background: "rgba(0, 0, 0, 0.5)",
                          border: "none",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => {
                          console.log("Left button clicked, current index:", currentImageIndex);
                          setCurrentImageIndex((currentImageIndex - 1 + imageFiles.length) % imageFiles.length);
                        }}
                      />
                      <Button
                        type="text"
                        icon={<RightOutlined />}
                        style={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 1,
                          color: "white",
                          fontSize: "18px",
                          background: "rgba(0, 0, 0, 0.5)",
                          border: "none",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => {
                          console.log("Right button clicked, current index:", currentImageIndex);
                          setCurrentImageIndex((currentImageIndex + 1) % imageFiles.length);
                        }}
                      />
                    </>
                  )}
                </div>
              </Space>
            </Card>
          )}

          {/* Existing Management Actions Tile */}
          <Card title="File Management">
            <Space direction="vertical" className="w-full">
              <div className="space-y-4">
                <FileListDisplay
                  files={event.fileEntities}
                  onDelete={handleFileDelete}
                  onDownload={handleDownload}
                />
                <FileUploadButton eventId={eventId!} onUpload={handleFileUpload} />
              </div>
            </Space>
          </Card>

        </Col>
      </Row>
    </div>
  );
};

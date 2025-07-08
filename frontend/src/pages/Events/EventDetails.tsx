import { Button, Card, Col, Descriptions, Image, Modal, Row, Space, Spin, Statistic, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "components/Breadcrumb.tsx";
import {
  BarChartOutlined,
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
import { useEffect, useState } from "react";
import type { Event, FileEntity } from "types/event.ts";
import useApiService, { BASE_URL } from "../../services/apiService.ts";
import FileUploadButton from "./components/FileUploadButton.tsx";
import FileListDisplay from "./components/FileListComponent.tsx";
import toast from "react-hot-toast";
import { EventStatusTag } from "components/EventStatusTag.tsx";
import { EventTypeTag } from "components/EventTypeTag.tsx";

const { Title } = Typography;

export const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { getEventById, deleteEvent, deleteFile, fileDownload, initiateSchematics } = useApiService();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getEventById(eventId!);
        setEvent(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setLoading(false);
      }
    })();
  }, [eventId, getEventById]);

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

  const handleCreate = async () => {
    try {
      event!.schematics = await initiateSchematics(eventId!);
      if (event!.schematics) {
        setEvent({
          ...event!,
        });
        navigate(`/canvas/${event!.schematics.id}`);
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

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Title level={2} className="mb-0 max-w-xl">{event.name}</Title>
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
            <p style={{ color: "#8c8c8c", fontSize: "14px" }}>This action cannot be undone.</p>
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
            </Descriptions>
          </Card>

          {/* Seat Layout Tile */}
          <Card title="Seat Layout" className="mb-6">
            <Row gutter={16}>
              <Col span={12}>
                {event.schematics?.overviewFileId ? (
                  <div
                    className="flex justify-center items-center"
                    style={{
                      background: "#f5f5f5",
                      borderRadius: 4,
                      width: "100%",
                      height: "200px",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={`${BASE_URL}/files/${event.schematics?.overviewFileId}?t=${Date.now()}`}
                      alt="Event Seat Plan Image"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
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
              <Col span={12}>
                <Space direction="vertical" className="w-full">
                  <Button block icon={<UserAddOutlined />}
                          onClick={() => navigate(`/events/${eventId}/manage-participants`)}>
                    Manage Participants
                  </Button>
                  <Button block icon={<EditOutlined />} onClick={() => {
                    if (event?.schematics) {
                      navigate(`/events/${eventId}/seat-plan/${event.schematics.id}`);
                    } else {
                      handleCreate();
                    }
                  }}>
                    Manage Seat Layout
                  </Button>
                  <Button block icon={<EditOutlined />}
                          onClick={() => navigate(`/events/${eventId}/seat-allocation/${event.schematics?.id}`)}>
                    Manage Seat Allocation
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card title="Event Statistics" className="mb-6">
            <Row gutter={16} justify="center">
              <Col span={6}>
                <Statistic
                  title="Participants"
                  value={event.participantCount}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic title="Capacity" value={event.capacity} prefix={<TeamOutlined />} />
              </Col>

              <Col span={8}>
                <Statistic
                  title="Engagement"
                  value={((event.participantCount / event.capacity) * 100).toFixed(2)}
                  prefix={<BarChartOutlined />}
                  suffix="%"
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={8}>
          {/* Participants Tile */}
          <Card title="Export Information" className="mb-6">
            <Space direction="vertical" className="w-full">
              <Button block icon={<FileTextOutlined />}>Export Event Data</Button>
              <Button block icon={<FileTextOutlined />}>Export Participants List</Button>
              <Button block icon={<FileTextOutlined />}>Export Seat Allocation</Button>
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

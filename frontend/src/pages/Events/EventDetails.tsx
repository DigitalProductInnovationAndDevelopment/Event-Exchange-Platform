import {
  Button,
  Card,
  Col,
  Descriptions,
  Image,
  Modal,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import {
  BarChartOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import type { Event, FileEntity } from "../../types/event";
import { EVENT_STATUS_COLORS, EVENT_TYPE_COLORS } from "../../types/event";
import useApiService from "../../services/apiService.ts";
import FileUploadButton from "./components/FileUploadButton.tsx";
import FileListDisplay from "./components/FileListComponent.tsx";
import toast from "react-hot-toast";

const { Title } = Typography;

export const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const { getEventById, deleteEvent, deleteFile, fileDownload, initiateSchematics } =
    useApiService();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEventById(eventId!);
        setEvent(data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
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

  const handleFileUpload = async (file: FileEntity) => {
    event!.fileEntities.push(file);
    if (file) {
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

  if (!event) {
    return <div>Event not found</div>;
  }

  const imageFiles = event.fileEntities?.filter(
    file => file.contentType === "image/png" || file.contentType === "image/jpeg"
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
          <Title level={2} className="mb-0 max-w-xl">
            {event.name}
          </Title>
          <Tag color={EVENT_STATUS_COLORS[event.status]} className="text-lg px-4 py-2">
            {event.status.toUpperCase()}
          </Tag>
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
        <Col span={14}>
          <Card className="mb-6">
            <Descriptions title="Event Information" bordered>
              <Descriptions.Item label="Event Name" span={3}>
                {event.name}
              </Descriptions.Item>
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
                <Tag color={EVENT_TYPE_COLORS[event.eventType]}>
                  {event.eventType
                    .split("_")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>
                {event.description}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {imageFiles?.length > 0 && (
            <Card title="Event Images">
              <Image.PreviewGroup>
                <Row gutter={[16, 16]}>
                  {imageFiles.map(file => (
                    <Col key={file.fileId} xs={24} sm={12} md={8} lg={6} xl={4}>
                      <Image
                        src={`http://localhost:8000/files/${file.fileId}`}
                        alt="Event Image"
                        style={{ maxWidth: "200", maxHeight: "100", objectFit: "cover" }}
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </Card>
          )}
          <Card title="Event Statistics" className="mb-6 mt-6">
            <Row gutter={16}>
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

        <Col span={10}>
          {/* Participants Tile */}
          <Card title="Participants" className="mb-6">
            <Space direction="vertical" className="w-full">
              <Button
                block
                icon={<UserAddOutlined />}
                onClick={() => navigate(`/events/${eventId}/manage-participants`)}
              >
                Manage Participants
              </Button>
              <Button block icon={<FileTextOutlined />}>
                Export Participants List
              </Button>
            </Space>
          </Card>

          {/* Seat Plan Tile */}
          <Card title="Seat Plan" className="mb-6">
            <Space direction="vertical" className="w-full">
              <Button
                block
                icon={<EditOutlined />}
                onClick={() => {
                  if (event?.schematics) {
                    navigate(`/events/${eventId}/seat-plan/${event.schematics.id}`);
                  } else {
                    handleCreate();
                  }
                }}
              >
                Manage Seat Plan
              </Button>
              {event.schematics?.overviewFileId && (
                <div className="flex flex-row w-full">
                  <div
                    className="flex justify-center items-center mt-2"
                    style={{
                      background: "#f5f5f5",
                      borderRadius: 4,
                      width: 200,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={`http://localhost:8000/files/${event.schematics?.overviewFileId}?t=${Date.now()}`}
                      alt="Event Seat Plan Image"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              )}
            </Space>
          </Card>

          {/* Seat Allocation Tile */}
          <Card title="Seat Allocation" className="mb-6">
            <Space direction="vertical" className="w-full">
              <Button
                block
                icon={<EditOutlined />}
                onClick={() => navigate(`/events/${eventId}/seat-allocation`)}
              >
                Manage Seat Allocation
              </Button>
              <Button block icon={<FileTextOutlined />}>
                Export Seat Allocation
              </Button>
            </Space>
          </Card>

          {/* Existing Management Actions Tile */}
          <Card title="Management Actions">
            <Space direction="vertical" className="w-full">
              <Button block>Export Event Data</Button>
              <div className="space-y-4">
                <FileListDisplay
                  files={event.fileEntities}
                  onDelete={handleFileDelete}
                  onDownload={handleDownload}
                />
                <FileUploadButton eventId={eventId} onUpload={handleFileUpload} />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

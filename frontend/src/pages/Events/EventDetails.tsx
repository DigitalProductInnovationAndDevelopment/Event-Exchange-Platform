import {Button, Card, Col, Descriptions, Modal, Row, Space, Statistic, Tag, Typography} from 'antd';
import {useNavigate, useParams} from 'react-router-dom';
import {Breadcrumb} from '../../components/Breadcrumb';
import {
  BarChartOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import {useEffect, useState} from 'react';
import type {Event, FileEntity} from '../../types/event';
import {EVENT_TYPE_COLORS} from '../../types/event';
import useApiService from "../../services/apiService.ts";
import FileUploadButton from "../../components/FileUploadButton.tsx";
import FileListDisplay from "../../components/FileListComponent.tsx";

const {Title} = Typography;

export const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const {getEventById, deleteEvent, deleteFile, fileDownload} = useApiService();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEventById(eventId!);
        setEvent(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
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
      console.error('Failed to delete event:', err);
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
      console.error('Delete failed:', error);
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
        fileEntities: event!.fileEntities.filter((file) => file.fileId !== fileId) ?? [],
      });
    }

  };

  const handleDownload = async (file: FileEntity) => {
    await fileDownload(file);
  };

  if (!event) {
    return <div>Event not found</div>;
  }


  return (
    <div className="space-y-6">
      <Breadcrumb 
        items={[
          { path: '/events', label: 'Events' },
          { path: `/events/${eventId}`, label: event.name }
        ]} 
      />

      <div className="flex justify-between items-center">
        <Title level={2}>{event.name}</Title>
        <Space>
          <Button
              type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/events/${eventId}/edit`)}
          >
            Edit Event
          </Button>


          <Button danger icon={<DeleteOutlined/>} onClick={showDeleteModal}>
            Delete Event
          </Button>

          <Modal
              title={
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <ExclamationCircleOutlined style={{color: '#faad14'}}/>
                  Confirm Delete
                </div>
              }
              centered
              open={deleteModalOpen}
              onOk={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{danger: true}}
              width={400}
          >
            <p>Are you sure you want to delete this event?</p>
            <p style={{color: '#8c8c8c', fontSize: '14px'}}>
              This action cannot be undone.
            </p>
          </Modal>

        </Space>
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Card className="mb-6">
            <Descriptions title="Event Information" bordered>
              <Descriptions.Item label="Event Name" span={3}>
                {event.name}
              </Descriptions.Item>
              <Descriptions.Item label="Date" span={3}>
                {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Descriptions.Item>
              <Descriptions.Item label="Location" span={3}>
                <Space>
                  <EnvironmentOutlined />
                  {event.location}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Type" span={3}>
                <Tag color={EVENT_TYPE_COLORS[event.eventType]}>
                  {event.eventType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>
                {event.description}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Event Statistics" className="mb-6">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Participants"
                  value={event.participants}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Capacity"
                  value={event.capacity}
                  prefix={<TeamOutlined />}
                />
              </Col>

              <Col span={8}>
                <Statistic
                  title="Engagement"
                  value={event.engagement}
                  prefix={<BarChartOutlined />}
                  suffix="%"
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Event Status" className="mb-6">
            {/*<div className="flex flex-col items-center space-y-4">
              <Tag color={EVENT_STATUS_COLORS[event.status]} className="text-lg px-4 py-2">
                {event.status.toUpperCase()}
              </Tag>
              <Text type="secondary">
                {event.status === 'upcoming' && 'This event is scheduled for the future'}
                {event.status === 'ongoing' && 'This event is currently in progress'}
                {event.status === 'completed' && 'This event has been completed'}
              </Text>
            </div>*/}
          </Card>

          <Card title="Management Actions">
            <Space direction="vertical" className="w-full">
              <Button block icon={<UserAddOutlined />}>
                Manage Participants
              </Button>
              <Button block icon={<FileTextOutlined />}>
                Generate Reports
              </Button>
              <Button block>
                Export Event Data
              </Button>
              <div className="space-y-4">
                <FileListDisplay files={event.fileEntities} onDelete={handleFileDelete} onDownload={handleDownload}/>
                <FileUploadButton eventId={eventId}/>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 
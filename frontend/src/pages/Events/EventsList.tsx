import {
  Button,
  Card,
  Carousel,
  Col,
  DatePicker,
  Image,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Typography,
} from "antd";
import { AppstoreOutlined, EyeOutlined, PlusOutlined, SearchOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "../../components/Breadcrumb";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { Event, EventStatus, EventType, FileEntity } from "../../types/event";
import { EVENT_STATUS_COLORS, EVENT_TYPE_COLORS } from "../../types/event";
import useApiService, { BASE_URL } from "../../services/apiService.ts";
import "./carousel_arrows.css";
import { EventTypeTag } from "../../components/EventTypeTag.tsx";
import { EventStatusTag } from "../../components/EventStatusTag.tsx";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export const EventsList = () => {
  const navigate = useNavigate();
  const [isTableView, setIsTableView] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<EventType | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [fetchedEvents, setEvents] = useState<Event[]>([]);
  const { getEvents } = useApiService();

  useEffect(() => {
    (async () => {
      try {
        const data = await getEvents();
        setEvents(data ?? []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    })();
  }, [getEvents]);

  const events = useMemo(() => fetchedEvents.map(e => ({ ...e, key: e.id })), [fetchedEvents]);

  // Filter events based on all criteria
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search text filter
      const matchesSearch =
        searchText === "" ||
        event.name.toLowerCase().includes(searchText.toLowerCase()) ||
        event.address.toLowerCase().includes(searchText.toLowerCase());

      // Event type filter
      const matchesType = !selectedType || event.eventType === selectedType;

      // Date range filter
      const matchesDateRange =
        !dateRange ||
        !dateRange[0] ||
        !dateRange[1] ||
        (new Date(event.date) >= dateRange[0].toDate() &&
          new Date(event.date) <= dateRange[1].toDate());

      return matchesSearch && matchesType && matchesDateRange;
    });
  }, [events, searchText, selectedType, dateRange]);

  const columns: ColumnsType<Event> = [
    {
      title: "Event Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: "14%",
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: 'Type',
      dataIndex: 'eventType',
      key: 'eventType',
      width: '14%',
      render: (type: EventType) => <EventTypeTag type={type}/>,
      filters: Object.entries(EVENT_TYPE_COLORS).map(([type, _]) => ({
        text: type.replace(/_/g, " "),
        value: type,
      })),
      onFilter: (value, record) => record.eventType === value,
    },
    {
      title: "Participants",
      dataIndex: "participantCount",
      key: "participantCount",
      width: "14%",
      sorter: (a, b) => a.participantCount - b.participantCount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '14%',
      render: (status: EventStatus) => <EventStatusTag status={status}/>,
      filters: Object.entries(EVENT_STATUS_COLORS).map(([status, _]) => ({
        text: status?.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: "14%",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/events/${record.id}`)}>
            View
          </Button>
        </Space>
      ),
    },
  ];

  // Split events into upcoming/ongoing and past events
  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.date).getTime() > new Date().getTime())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = filteredEvents
    .filter(event => new Date(event.date).getTime() < new Date().getTime())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <Breadcrumb items={[{ path: "/events", label: "Events" }]} />

      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="m-0">
          Events
        </Title>
        <div className="flex items-center gap-4">
          <Space>
            <UnorderedListOutlined className={isTableView ? "text-blue-500" : "text-gray-400"} />
            <Switch
              checked={!isTableView}
              onChange={checked => setIsTableView(!checked)}
              className="bg-gray-200"
            />
            <AppstoreOutlined className={!isTableView ? "text-blue-500" : "text-gray-400"} />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/events/create")}>
            Create Event
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="Search events..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Event Type"
              style={{ width: "100%" }}
              allowClear
              value={selectedType}
              onChange={setSelectedType}
              options={Object.entries(EVENT_TYPE_COLORS).map(([value]) => ({
                value,
                label: value
                  .split("_")
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" "),
              }))}
            />
          </Col>
          <Col span={8}>
            <RangePicker
              style={{ width: "100%" }}
              value={dateRange}
              onChange={dates => setDateRange(dates)}
            />
          </Col>
        </Row>
      </Card>

      {/* Upcoming Events Section */}
      <div className="mb-8">
        <Title level={3} className="mb-4">
          Upcoming Events
        </Title>
        {isTableView ? (
          <Table rowKey="id" columns={columns} dataSource={upcomingEvents} pagination={false} />
        ) : (
          <Row gutter={[16, 16]}>
            {upcomingEvents.map(event => (
              <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                <Card
                  hoverable
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      View Details
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={event.name}
                    description={
                      <div className="space-y-2">
                        <div className="text-gray-600">
                          <div>Date: {dayjs(event.date).format("MMMM D, YYYY, HH:mm")}</div>
                          <div>Location: {event.address}</div>
                          <div>Participants: {event.participantCount}</div>
                          <div>
                            {(() => {
                              const filteredImages = event.fileEntities?.filter(
                                (file: FileEntity) =>
                                  file.contentType === "image/png" ||
                                  file.contentType === "image/jpeg"
                              );
                              if (filteredImages && filteredImages.length > 0) {
                                return (
                                  <Carousel dots={false} arrows={filteredImages.length > 1}>
                                    {filteredImages.map((file: FileEntity) => (
                                        <div key={file.fileId} className="px-8">
                                          <div
                                              style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderRadius: 4,
                                                width: '100%',
                                                height: '200px',
                                                overflow: 'hidden',
                                              }}
                                          >
                                            <Image
                                                src={`${BASE_URL}/files/${file.fileId}`}
                                                alt="Event Image"
                                                style={{
                                                  width: '100%',
                                                  height: '100%',
                                                  objectFit: 'contain',
                                                }}
                                          />
                                          </div>
                                      </div>
                                    ))}
                                  </Carousel>
                                );
                              }
                              return <div />;
                            })()}
                          </div>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Past Events Section */}
      <div>
        <Title level={3} className="mb-4">
          Past Events
        </Title>
        {isTableView ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={pastEvents}
            pagination={{ pageSize: 15 }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {pastEvents.map(event => (
              <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                <Card
                  hoverable
                  className="h-full"
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      View Details
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={event.name}
                    description={
                      <div className="space-y-2">
                        <div className="text-gray-600">
                          <div>Date: {dayjs(event.date).format("MMMM D, YYYY, HH:mm")}</div>
                          <div>Location: {event.address}</div>
                          <div>Participants: {event.participantCount}</div>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

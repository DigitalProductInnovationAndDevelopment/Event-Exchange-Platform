import { Button, Card, Col, Divider, List, Row, Space, Statistic, Typography } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FireOutlined,
  PlusOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { type Event, type EventStatus } from "../types/event";
import useApiService from "../services/apiService.ts";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const { getEvents } = useApiService();

  useEffect(() => {
    // TODO: Replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        // Mock API calls - replace with actual API endpoints
        // const eventsResponse = await fetch('/api/events');
        // const statsResponse = await fetch('/api/dashboard/stats');
        // const eventsData = await eventsResponse.json();
        // const statsData = await statsResponse.json();
        const data = await getEvents();
        setEvents(data ?? []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // TODO: Handle error appropriately
      }
    };

    fetchDashboardData();
  }, [getEvents]);

  const getStatusIcon = (status: EventStatus) => {
    return status === "completed" ? <CheckCircleOutlined /> : <ClockCircleOutlined />;
  };

  return (
    <div className="space-y-4">
      <div>
        <Title level={2}>Event Management Dashboard</Title>
        <Text type="secondary">Comprehensive analytics and insights for your events</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Row gutter={[16, 16]} className="mb-4">
            <Col span={8}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                block
                onClick={() => navigate("/events/create")}
              >
                Create New Event
              </Button>
            </Col>
            <Col span={8}>
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                size="large"
                block
                onClick={() => navigate("/events")}
              >
                Events
              </Button>
            </Col>
            <Col span={8}>
              <Button
                type="primary"
                icon={<TeamOutlined />}
                size="large"
                block
                onClick={() => navigate("/employees")}
              >
                Employees
              </Button>
            </Col>
          </Row>

          <Card title="Upcoming Events" className="shadow-sm" bodyStyle={{ padding: "12px" }}>
            <List
              dataSource={events
                .filter(event => new Date(event.date).getTime() > new Date().getTime())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
              renderItem={event => (
                <List.Item
                  actions={[
                    <Button icon={<EyeOutlined />} onClick={() => navigate(`/events/${event.id}`)}>
                      View
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Link to={`/events/${event.id}`}>{event.name}</Link>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Space>
                          <CalendarOutlined /> {dayjs(event.date).format("MMMM D, YYYY, HH:mm")}
                          <span style={{ marginLeft: 24 }} />
                          <TeamOutlined /> {event.participantCount}/{event.capacity} participants
                        </Space>
                        <Space>
                          <FireOutlined />{" "}
                          {Number(((event.participantCount / event.capacity) * 100).toFixed(2))} %
                          engagement
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            className="shadow-sm h-full"
            title={
              <Title level={4} className="mb-0">
                Event Statistics
              </Title>
            }
          >
            <div className="space-y-2">
              <Statistic title="Total Events" value={events.length} prefix={<CalendarOutlined />} />
              <Divider className="my-4" />

              <Statistic
                title="Total Participants"
                value={events.reduce((sum, event) => sum + event.participantCount, 0)}
                prefix={<TeamOutlined />}
              />
              <Divider className="my-4" />

              <Statistic
                title="Average Engagement"
                value={
                  // TODO: Fix this calculation
                  Number(
                    (
                      events.reduce(
                        (sum, event) =>
                          sum +
                          (event.capacity > 0
                            ? (event.participantCount / event.capacity) * 100
                            : 0),
                          0,
                      ) / (events.length || 1)
                    ).toFixed(2),
                  )
                }
                suffix="%"
                prefix={<FireOutlined />}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

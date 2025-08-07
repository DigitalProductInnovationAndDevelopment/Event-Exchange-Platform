import { Button, Card, Col, List, Row, Space, Spin, Typography } from "utils/antd.tsx";
import {
  CalendarOutlined,
  EyeOutlined,
  PlusOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { type Event } from "../types/event";
import useApiService from "../services/apiService.ts";
import dayjs from "dayjs";
import { EventStatusTag } from "components/EventStatusTag.tsx";
import { useAuth } from "../contexts/AuthContext.tsx";
import { aggregateDietaryCombinations, prettifyDiet } from "utils/utils.ts";

const { Title, Text } = Typography;

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const { getEvents } = useApiService();
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.isAdmin();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getEvents(dayjs().startOf("day").toISOString());
        setUpcomingEvents(
          data?.filter(event => new Date(event.date).getTime() > new Date().getTime()) ?? []
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [getEvents]);

  return (
    <div className="space-y-4">
      <div>
        <Title level={2}>Event Management Dashboard</Title>
        <Text type="secondary">Comprehensive analytics and insights for your events</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Row gutter={[16, 16]} className="mb-4">
            {isAdmin && (
              <Col span={8}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  block
                  onClick={() => navigate("/events/create")}
                >
                  {" "}
                  Create New Event
                </Button>
              </Col>
            )}
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
            {isAdmin && (
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
            )}
          </Row>
        </Col>
      </Row>

      <Card title="Upcoming Events" className="shadow-sm w-full" bodyStyle={{ padding: "12px" }}>
        <List
          loading={loading}
          dataSource={upcomingEvents
            .filter(event => new Date(event.date).getTime() > new Date().getTime())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
          renderItem={event => {
            const participants = event.participantDetails || [];
            const employeeCount = event.employeeParticipantCount;
            const guestCount = event.visitorParticipantCount;
            const { dietaryCombinationsEmployees, dietaryCombinationsGuests } =
              aggregateDietaryCombinations(participants);

            return (
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
                      <Link className="text-xl" to={`/events/${event.id}`}>
                        {event.name}
                      </Link>
                      <EventStatusTag status={event.status} />
                    </Space>
                  }
                  description={
                    <div>
                      {loading ? (
                        <Spin size="small" />
                      ) : (
                        <Space direction="vertical" size="small">
                          <Space className="flex flex-wrap items-center gap-x-8 gap-y-2">
                            <Space className="items-center">
                              <CalendarOutlined />
                              <span>{dayjs(event.date).format("MMMM D, YYYY, HH:mm")}</span>
                            </Space>
                            <Space className="items-center">
                              <TeamOutlined />
                              <span>
                                {event.employeeParticipantCount + event.visitorParticipantCount}/
                                {event.capacity} participants
                              </span>
                            </Space>
                            <Space className="items-center">
                              <UserOutlined />
                              <span>
                                <b>Employees:</b> {employeeCount}
                              </span>
                            </Space>
                            <Space className="items-center">
                              <UsergroupAddOutlined />
                              <span>
                                <b>Guests:</b> {guestCount}
                              </span>
                            </Space>
                          </Space>
                          <Space direction="vertical" size="small">
                            <b>Dietary Preference Combinations</b>

                            {/* Employees */}
                            <div>
                              <Text strong style={{ fontSize: "14px" }}>
                                Employees:
                              </Text>
                              <Space wrap style={{ marginTop: 4 }}>
                                {Object.keys(dietaryCombinationsEmployees).length === 0 && (
                                  <span style={{ color: "#aaa" }}>No data</span>
                                )}
                                {Object.entries(dietaryCombinationsEmployees).map(
                                  ([combo, count]) => {
                                    const diets = combo === "None" ? [] : combo.split(", ");
                                    const prettyCombo = prettifyDiet(diets);
                                    return (
                                      <span key={`emp-${combo}`} style={{ marginLeft: 4 }}>
                                        {prettyCombo} x {count}
                                      </span>
                                    );
                                  }
                                )}
                              </Space>
                            </div>

                            {/* Guests */}
                            <div>
                              <Text strong style={{ fontSize: "14px" }}>
                                Guests:
                              </Text>
                              <Space wrap style={{ marginTop: 4 }}>
                                {Object.keys(dietaryCombinationsGuests).length === 0 && (
                                  <span style={{ color: "#aaa" }}>No data</span>
                                )}
                                {Object.entries(dietaryCombinationsGuests).map(([combo, count]) => {
                                  const diets = combo === "None" ? [] : combo.split(", ");
                                  const prettyCombo = prettifyDiet(diets);
                                  return (
                                    <span key={`guest-${combo}`} style={{ marginLeft: 4 }}>
                                      {prettyCombo} x {count}
                                    </span>
                                  );
                                })}
                              </Space>
                            </div>
                          </Space>
                        </Space>
                      )}
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>
    </div>
  );
};

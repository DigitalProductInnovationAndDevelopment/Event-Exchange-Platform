import { Button, Card, List, Row, Space, Typography, Tag, Spin } from "antd";
import {
  CalendarOutlined,
  EyeOutlined,
  FireOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  AppleOutlined,
  ForkOutlined,
  CoffeeOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { type Event } from "../types/event";
import { type ParticipationDetails } from "../types/employee";
import useApiService from "../services/apiService.ts";
import dayjs from "dayjs";
import { EventStatusTag } from "components/EventStatusTag.tsx";
import { DietTypeTag } from "components/DietTypeTag";

const { Title, Text } = Typography;

function aggregateDietaryCounts(participants: ParticipationDetails[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of participants) {
    for (const diet of p.dietTypes || []) {
      counts[diet] = (counts[diet] || 0) + 1;
    }
  }
  return counts;
}

// Helper to aggregate dietary combinations
function aggregateDietaryCombinations(participants: ParticipationDetails[]): Record<string, number> {
  const comboCounts: Record<string, number> = {};
  for (const p of participants) {
    if (p.dietTypes && p.dietTypes.length > 0) {
      // Sort to ensure consistent key for same combinations
      const comboKey = p.dietTypes.slice().sort().join(", ");
      comboCounts[comboKey] = (comboCounts[comboKey] || 0) + 1;
    } else {
      comboCounts["None"] = (comboCounts["None"] || 0) + 1;
    }
  }
  return comboCounts;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const { getEvents, getEventParticipants } = useApiService();
  const [loading, setLoading] = useState(true);
  const [participantsMap, setParticipantsMap] = useState<Record<string, ParticipationDetails[]>>({});
  const [participantsLoading, setParticipantsLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getEvents();
        setEvents(data ?? []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [getEvents]);

  useEffect(() => {
    // Fetch participants for each event using getEventParticipants
    const fetchParticipants = async (eventId: string) => {
      setParticipantsLoading(prev => ({ ...prev, [eventId]: true }));
      try {
        const data = await getEventParticipants(eventId);
        setParticipantsMap(prev => ({ ...prev, [eventId]: (data ?? []) as ParticipationDetails[] }));
      } catch (e) {
        setParticipantsMap(prev => ({ ...prev, [eventId]: [] }));
      } finally {
        setParticipantsLoading(prev => ({ ...prev, [eventId]: false }));
      }
    };
    events.forEach(event => {
      if (event.id && !participantsMap[event.id]) {
        fetchParticipants(event.id);
      }
    });
  }, [events, getEventParticipants]);

  return (
    <div className="space-y-4">
      <div>
        <Title level={2}>Event Management Dashboard</Title>
        <Text type="secondary">Comprehensive analytics and insights for your events</Text>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate("/events/create")}
        >
          Create New Event
        </Button>
      </div>

      <Card title="Upcoming Events" className="shadow-sm w-full" bodyStyle={{ padding: "12px" }}>
        <List
          loading={loading}
          dataSource={events
            .filter(event => new Date(event.date).getTime() > new Date().getTime())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
          renderItem={event => {
            const participants = participantsMap[event.id] || [];
            const isLoading = participantsLoading[event.id];
            const employeeCount = participants.length;
            const guestCount = participants.reduce((sum, p) => sum + (p.guestCount || 0), 0);
            const dietarySummary = aggregateDietaryCounts(participants);
            const dietaryCombinations = aggregateDietaryCombinations(participants);
            const engagement = event.capacity > 0 ? Number(((event.participantCount / event.capacity) * 100).toFixed(2)) : 0;
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
                      {isLoading ? (
                        <Spin size="small" />
                      ) : (
                        <Space direction="vertical" size="small">
                          <Space>
                            <CalendarOutlined /> {dayjs(event.date).format("MMMM D, YYYY, HH:mm")}
                            <span style={{ marginLeft: 24 }} />
                            <TeamOutlined /> {event.participantCount}/{event.capacity} participants
                            <span style={{ marginLeft: 24 }} />
                            <FireOutlined /> {engagement} % engagement
                          </Space>
                          <Space>
                            <UserOutlined /> <b>Employees:</b> {employeeCount}
                            <UsergroupAddOutlined style={{ marginLeft: 16 }} /> <b>Guests:</b> {guestCount}
                          </Space>
                          <Space direction="vertical" size="small">
                            <b>Dietary Preference Combinations:</b>
                            <Space wrap>
                              {Object.keys(dietaryCombinations).length === 0 && <span style={{ color: '#aaa' }}>No data</span>}
                              {Object.entries(dietaryCombinations).map(([combo, count]) => {
                                const diets = combo === "None" ? [] : combo.split(", ");
                                const prettyCombo = diets.length === 0
                                  ? 'Regular'
                                  : diets.map(diet =>
                                      diet
                                        .replace(/_/g, ' ')
                                        .toLowerCase()
                                        .replace(/(^|\s)\S/g, l => l.toUpperCase())
                                    ).join(', ');
                                return (
                                  <span key={combo} style={{ marginLeft: 4 }}>
                                    {prettyCombo} x {count}
                                  </span>
                                );
                              })}
                            </Space>
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

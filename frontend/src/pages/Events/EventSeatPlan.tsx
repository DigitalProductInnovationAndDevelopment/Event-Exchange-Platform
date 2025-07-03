import {Button, Card, Col, Row, Space, Typography} from "antd";
import {useNavigate, useParams} from "react-router-dom";
import {Breadcrumb} from "../../components/Breadcrumb";
import {useEffect, useState} from "react";
import useApiService from "../../services/apiService";
import KonvaCanvas from "../../components/canvas/KonvaCanvas";
import {CanvasProvider} from "../../components/canvas/contexts/CanvasContext";

const { Title } = Typography;

export const EventSeatPlan = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
    const [eventName, setEventName] = useState("");
  const { getEventById } = useApiService();

  useEffect(() => {
    (async () => {
      if (eventId) {
        const event = await getEventById(eventId);
        if (event) {
          setEventName(event.name);
        }
      }
    })();
  }, [eventId, getEventById]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
            {path: "/events", label: "Events"},
            {path: `/events/${eventId}`, label: eventName || "Event"},
            {path: `/events/${eventId}/seat-plan`, label: "Manage Seat Plan"},
        ]}
      />

      <div className="flex justify-between items-center">
        <Title level={2}>Manage Seat Plan</Title>
        <Space>
          <Button onClick={() => navigate(`/events/${eventId}`)}>Back to Event</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={24}>
          <Card className="mb-6">
            <CanvasProvider>
                <KonvaCanvas/>
            </CanvasProvider>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

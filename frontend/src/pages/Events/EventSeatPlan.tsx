import { Button, Card, Col, Row, Space, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "components/Breadcrumb";
import KonvaCanvas from "components/canvas/KonvaCanvas";
import { CanvasProvider } from "components/canvas/contexts/CanvasContext";
import { CanvasTooltip } from "components/CanvasTooltip.tsx";

const { Title } = Typography;

export const EventSeatPlan = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      <Breadcrumb
        items={[
          { path: "/events", label: "Events" },
          { path: `/events/${eventId}/seat-plan`, label: "Manage Seat Plan" },
        ]}
      />

      <div className="flex justify-between items-center">
        <div className="flex flex-row">
          <Title level={2}>Manage Seat Layout</Title>
          <CanvasTooltip />
        </div>

        <Space>
          <Button onClick={() => navigate(`/events/${eventId}`)}>Back to Event</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={24}>
          <Card className="mb-6">
            <div style={{ height: "600px", overflow: "hidden" }}>
              <CanvasProvider>
                <KonvaCanvas />
              </CanvasProvider>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

import { Button, Card, Col, Row, Space, Tooltip, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { useEffect, useState } from "react";
import useApiService from "../../services/apiService";
import KonvaCanvas from "../../components/canvas/KonvaCanvas";
import { CanvasProvider } from "../../components/canvas/contexts/CanvasContext";
import type { AppState } from "../../components/canvas/reducers/CanvasReducer";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

export const EventSeatPlan = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState("");
  const { getEventById, getSchematics } = useApiService();
  const [initialState, setInitialState] = useState<AppState | null>(null);

  useEffect(() => {
    (async () => {
      if (eventId) {
        const event = await getEventById(eventId);
        if (event) {
          setEventName(event.name);
          if (event.schematics?.id) {
            const schematics = await getSchematics(event.schematics.id);
            if (schematics) {
              setInitialState(schematics.state);
            }
          }
        }
      }
    })();
  }, [eventId, getEventById, getSchematics]);

  return (
    <div className="space-y-2">
      <Breadcrumb
        items={[
          { path: "/events", label: "Events" },
          { path: `/events/${eventId}`, label: eventName || "Event" },
          { path: `/events/${eventId}/seat-plan`, label: "Manage Seat Plan" },
        ]}
      />

      <div className="flex justify-between items-center">
        <div className="flex flex-row">
          <Title level={2}>Manage Seat Layout</Title>
          <Tooltip
            className="ms-3 mt-2"
            title={
              <div className="whitespace-pre-line">
                1. In order to select multiple items, click on "SHIFT" and drag your mouse over the desired items.{"\n"}
                2. In order to delete selected items press "BACKSPACE".{"\n"}
                3. You can duplicate selected items by pressing "D".{"\n"}
                4. You can redo and undo your actions by pressing CTRL + Z / CTRL + SHIFT + Z.
              </div>
            }
            placement="rightBottom"
          >
            <InfoCircleOutlined style={{ fontSize: 24, cursor: "pointer", color: "#1890ff" }} />
          </Tooltip>
        </div>

        <Space>
          <Button onClick={() => navigate(`/events/${eventId}`)}>Back to Event</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={24}>
          <Card className="mb-6">
            <div style={{ height: "600px", overflow: "hidden" }}>
              <CanvasProvider initialState={initialState}>
                <KonvaCanvas />
              </CanvasProvider>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

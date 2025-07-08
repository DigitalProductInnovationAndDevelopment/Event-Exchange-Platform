import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "components/Breadcrumb";
import { useEffect, useState } from "react";
import type { Event, EventType } from "types/event";
import { EVENT_TYPE_COLORS } from "types/event";
import dayjs from "dayjs";
import useApiService from "services/apiService.ts";
import { EventTypeTag } from "components/EventTypeTag.tsx";

const { Title } = Typography;
const { TextArea } = Input;

export const EventEdit = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState("");
  const { getEventById, updateEvent } = useApiService();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const event = await getEventById(eventId!);
      if (event) {
        setEventName(event.name);
        form.setFieldsValue({
          ...event,
          date: dayjs(event.date),
        });
      }
      setLoading(false);
    })();
  }, [eventId, form, getEventById]);

  const onFinish = async (values: Event) => {
    setLoading(true);
    try {
      const result = await updateEvent(eventId!, values);
      if (result) {
        navigate(`/events/${eventId}`, { replace: true });
      }
    } catch (error) {
      console.error("Error updating event:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (<div className="flex justify-center items-center h-screen">
      <Spin size="large" tip="Loading event details..." />
    </div>);
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { path: "/events", label: "Events" },
          { path: `/events/${eventId}`, label: eventName },
          { path: `/events/${eventId}/edit`, label: "Edit Event" },
        ]}
      />

      <div className="flex justify-between items-center">
        <Title level={2}>Edit Event</Title>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading} onClick={() => form.submit()}>
            Save Changes
          </Button>
          <Button onClick={() => navigate(`/events/${eventId}`)}>Cancel</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={24}>
          <Card className="mb-6">
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Descriptions title="Event Information" bordered>
                <Descriptions.Item label="Event Name" span={3}>
                  <Form.Item
                    name="name"
                    rules={[{ required: true, message: "Please enter event name" }]}
                    noStyle
                  >
                    <Input />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="Date" span={3}>
                  <Form.Item
                    name="date"
                    rules={[{ required: true, message: "Please select event date" }]}
                    noStyle
                  >
                    <DatePicker
                      className="w-full"
                      format="DD/MM/YYYY hh:mm A"
                      onChange={(date, dateString) => console.log(date, dateString)}
                      showTime={{ use12Hours: true }}
                    />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="Address" span={3}>
                  <Form.Item
                    name="address"
                    rules={[{ required: true, message: "Please enter event address" }]}
                    noStyle
                  >
                    <Input />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="Type" span={3}>
                  <Form.Item
                    name="eventType"
                    rules={[{ required: true, message: "Please select event type" }]}
                    noStyle
                  >
                    <Select
                      options={Object.entries(EVENT_TYPE_COLORS).map(([key]) => ({
                        label: <EventTypeTag type={key as EventType} />,
                        value: key,
                      }))}
                    />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="Capacity" span={3}>
                  <Form.Item
                    name="capacity"
                    label=""
                    rules={[{ required: true, message: "Please enter event capacity" }]}
                    initialValue={1}
                    noStyle
                  >
                    <InputNumber min={1} className="w-full" />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="Description" span={3}>
                  <Form.Item
                    name="description"
                    rules={[{ required: true, message: "Please enter event description" }]}
                    noStyle
                  >
                    <TextArea rows={4} />
                  </Form.Item>
                </Descriptions.Item>
              </Descriptions>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

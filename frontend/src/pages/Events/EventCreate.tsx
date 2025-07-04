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
  Typography,
} from 'antd';
import {useNavigate} from 'react-router-dom';
import {Breadcrumb} from '../../components/Breadcrumb';
import React, {useState} from 'react';
import type {Event, EventType} from '../../types/event';
import {EVENT_TYPE_COLORS} from '../../types/event';
import useApiService from '../../services/apiService';
import {EventTypeTag} from "../../components/EventTypeTag.tsx";

const { Title } = Typography;
const { TextArea } = Input;

export const EventCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { createEvent } = useApiService();

  const onFinish = async (values: Event) => {
    setLoading(true);
    try {
      // @ts-ignore
      console.log('Form values:', { ...values, date: values.date.toISOString() });

      const result = await createEvent(values);
      if (result) {
        navigate(`/events`, { replace: true });
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { path: '/events', label: 'Events' },
          { path: '/events/create', label: 'Create Event' },
        ]}
      />

      <div className="flex justify-between items-center">
        <Title level={2}>Create New Event</Title>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading} onClick={() => form.submit()}>
            Create Event
          </Button>
          <Button onClick={() => navigate('/events')}>Cancel</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={24}>
          <Card className="mb-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                participants: 0,
                capacity: 1,
                eventType: Object.keys(EVENT_TYPE_COLORS)[0] as EventType,
              }}
            >
              <Descriptions title="Event Information" bordered>
                <Descriptions.Item label="Event Name" span={3}>
                  <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Please enter event name' }]}
                    noStyle
                  >
                    <Input />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="Date" span={3}>
                  <Form.Item
                    name="date"
                    rules={[{ required: true, message: 'Please select event date' }]}
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
                    rules={[{ required: true, message: 'Please enter event address' }]}
                    noStyle
                  >
                    <Input />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="Type" span={3}>
                  <Form.Item
                    name="eventType"
                    rules={[{ required: true, message: 'Please select event type' }]}
                    noStyle
                  >
                    <Select
                        options={Object.entries(EVENT_TYPE_COLORS).map(([key, value]) => ({
                          label: <EventTypeTag type={key as EventType}/>,
                          value: key,
                        }))}
                    />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="Capacity" span={3}>
                  <Form.Item
                    name="capacity"
                    label=""
                    rules={[{ required: true, message: 'Please enter event capacity' }]}
                    initialValue={1}
                    noStyle
                  >
                    <InputNumber min={1} className="w-full" />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="Description" span={3}>
                  <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Please enter event description' }]}
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

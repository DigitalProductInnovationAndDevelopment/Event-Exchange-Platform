import { Typography, Form, Input, DatePicker, InputNumber, Button, Card, Space, Row, Col, Descriptions } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/Breadcrumb';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  participants: number;
  description: string;
  organizer: string;
  capacity: number;
}

export const EventEdit = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockEvent = {
      id: eventId || '',
      name: 'Tech Conference 2024',
      date: '2024-03-15',
      location: 'San Francisco Convention Center',
      participants: 150,
      description: 'Join us for the biggest tech conference of the year. Network with industry leaders, attend workshops, and discover the latest innovations in technology.',
      organizer: 'Tech Events Inc.',
      capacity: 200,
    };

    setEventName(mockEvent.name);
    form.setFieldsValue({
      ...mockEvent,
      date: dayjs(mockEvent.date),
      capacity: mockEvent.capacity,
      participants: mockEvent.participants
    });
  }, [eventId, form]);

  const onFinish = async (values: Event) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Form values:', values);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate(`/events/${eventId}`);
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb 
        items={[
          { path: '/events', label: 'Events' },
          { path: `/events/${eventId}`, label: eventName },
          { path: `/events/${eventId}/edit`, label: 'Edit Event' }
        ]} 
      />

      <div className="flex justify-between items-center">
        <Title level={2}>Edit Event</Title>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading} onClick={() => form.submit()}>
            Save Changes
          </Button>
          <Button onClick={() => navigate(`/events/${eventId}`)}>
            Cancel
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={24}>
          <Card className="mb-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
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
                    <DatePicker className="w-full" />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="Location" span={3}>
                  <Form.Item
                    name="location"
                    rules={[{ required: true, message: 'Please enter event location' }]}
                    noStyle
                  >
                    <Input />
                  </Form.Item>
                </Descriptions.Item>

                <Descriptions.Item label="Organizer" span={3}>
                  <Form.Item
                    name="organizer"
                    rules={[{ required: true, message: 'Please enter organizer name' }]}
                    noStyle
                  >
                    <Input />
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

          <Card title="Participant Management" className="mb-6">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="participants"
                  label="Current Participants"
                  rules={[{ required: true, message: 'Please enter number of participants' }]}
                  initialValue={0}
                >
                  <InputNumber min={0} className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="capacity"
                  label="Capacity"
                  rules={[{ required: true, message: 'Please enter event capacity' }]}
                  initialValue={1}
                >
                  <InputNumber min={1} className="w-full" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 
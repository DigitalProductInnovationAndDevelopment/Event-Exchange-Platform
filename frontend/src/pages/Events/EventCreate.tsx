import { Typography, Form, Input, DatePicker, InputNumber, Button, Card, Space, Row, Col, Descriptions } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/Breadcrumb';
import { useState } from 'react';

const { Title } = Typography;
const { TextArea } = Input;

interface Event {
  name: string;
  date: string;
  location: string;
  participants: number;
  description: string;
  organizer: string;
  capacity: number;
}

export const EventCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: Event) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Form values:', values);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/events');
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
          { path: '/events/create', label: 'Create Event' }
        ]} 
      />

      <div className="flex justify-between items-center">
        <Title level={2}>Create New Event</Title>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading} onClick={() => form.submit()}>
            Create Event
          </Button>
          <Button onClick={() => navigate('/events')}>
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
              initialValues={{ 
                participants: 0,
                capacity: 1
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
                >
                  <InputNumber min={0} className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="capacity"
                  label="Capacity"
                  rules={[{ required: true, message: 'Please enter event capacity' }]}
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
import { Typography } from 'antd';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

export const EventDetails = () => {
  const { eventId } = useParams();

  return (
    <div>
      <Title level={2}>Event Details</Title>
      <p>Event ID: {eventId}</p>
      {/* Add your event details content here */}
    </div>
  );
}; 
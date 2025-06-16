import { Typography } from 'antd';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

export const EmployeeDetails = () => {
  const { employeeId } = useParams();

  return (
    <div>
      <Title level={2}>Employee Details</Title>
      <p>Employee ID: {employeeId}</p>
      {/* Add your employee details content here */}
    </div>
  );
};

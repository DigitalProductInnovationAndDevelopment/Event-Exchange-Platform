import React from 'react';
import { Form, Input, Select, Button, Space } from 'antd';

const { Option } = Select;

type EmployeeFormProps = {
  initialValues: any;
  onSave: (values: any) => void;
};

const EmployeeForm = ({ initialValues, onSave }: EmployeeFormProps) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    onSave(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleFinish}
    >
      <Form.Item label="Employee ID" name="employeeId" required>
        <Input placeholder="Enter employee ID" />
      </Form.Item>
      <Form.Item label="First Name" name="firstName" required>
        <Input placeholder="Enter first name" />
      </Form.Item>
      <Form.Item label="Last Name" name="lastName" required>
        <Input placeholder="Enter last name" />
      </Form.Item>
      <Form.Item label="Gender" name="gender" required>
        <Select placeholder="Select gender">
          <Option value="Male">Male</Option>
          <Option value="Female">Female</Option>
          <Option value="Diverse">Diverse</Option>
        </Select>
      </Form.Item>
      <Form.Item label="Project" name="project">
        <Input placeholder="Enter project" />
      </Form.Item>
      <Form.Item label="Role" name="role">
        <Input placeholder="Enter role" />
      </Form.Item>
      <Form.Item label="Department" name="department">
        <Input placeholder="Enter department" />
      </Form.Item>
      <Form.Item label="Location" name="location">
        <Input placeholder="Enter location" />
      </Form.Item>
      <Form.Item label="Date Joined" name="dateJoined">
        <Input placeholder="Enter date joined" />
      </Form.Item>
      <Form.Item label="Email" name="email">
        <Input placeholder="Enter email" />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">Save</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default EmployeeForm;

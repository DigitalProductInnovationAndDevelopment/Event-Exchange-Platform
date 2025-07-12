import { DatePicker, Form, Input, Select } from "antd";
import { DietaryPreference, EmploymentType, Role } from "types/employee";
import { EmployeeTypeTag } from "components/EmployeeTypeTag.tsx";
import { DietTypeTag } from "components/DietTypeTag.tsx";
import dayjs from "dayjs";

const { Option } = Select;

const dateFormat = "YYYY-MM-DD";

type EmployeeFormProps = {
  initialValues: any;
  onSave: (values: any) => void;
  form: any;
};

export const DIET_TYPES = Object.entries(DietaryPreference).map(([key]) => ({
  label: <DietTypeTag type={key} />,
  value: key,
}));

export const EMPLOYMENT_TYPES = Object.entries(EmploymentType).map(([key]) => ({
  label: <EmployeeTypeTag type={key} />,
  value: key,
}));

const ROLE_OPTIONS = Object.entries(Role).map(([, value]) => ({
  label: value.charAt(0) + value.slice(1).toLowerCase(),
  value: value,
}));

const EmployeeForm = ({ initialValues, onSave, form }: EmployeeFormProps) => {
  const handleFinish = (values: any) => {
    values.employmentStartDate = values.employmentStartDate.format("YYYY-MM-DD");
    onSave(values);
  };

  initialValues.employmentStartDate = initialValues.employmentStartDate
    ? dayjs(initialValues.employmentStartDate, dateFormat)
    : dayjs().startOf("day");

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleFinish}>
      <Form.Item
        label="GitLab Username"
        name={["profile", "gitlabUsername"]}
        rules={[{ required: true, message: "Please enter GitLab Username" }]}
      >
        <Input placeholder="Enter GitLab Username" maxLength={500} />
      </Form.Item>
      <Form.Item
        label="Full Name"
        name={["profile", "fullName"]}
        rules={[{ required: true, message: "Please enter full name" }]}
      >
        <Input placeholder="Enter full name" maxLength={250} />
      </Form.Item>
      <Form.Item
        label="Gender"
        name={["profile", "gender"]}
        rules={[{ required: true, message: "Please select gender" }]}
      >
        <Select placeholder="Select gender" maxLength={255}>
          <Option value="Male">Male</Option>
          <Option value="Female">Female</Option>
          <Option value="Diverse">Diverse</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="Email"
        name={["profile", "email"]}
        rules={[{ required: true, message: "Please enter email" }]}
      >
        <Input placeholder="Enter email" />
      </Form.Item>
      <Form.Item label="Dietary Preference" name={["profile", "dietTypes"]}>
        <Select placeholder="Select dietary preference" options={DIET_TYPES} mode="multiple" />
      </Form.Item>
      <Form.Item
        label="Employment Type"
        name="employmentType"
        rules={[{ required: true, message: "Please select employment type" }]}
      >
        <Select placeholder="Select employment type" options={EMPLOYMENT_TYPES} />
      </Form.Item>
      <Form.Item
        label="Date Joined"
        name="employmentStartDate"
        rules={[{ required: true, message: "Please enter employment start date" }]}
      >
        <DatePicker
          className="w-full"
          placeholder="Enter date joined"
          format={dateFormat}
          showTime={false}
          disabledDate={current => {
            return current && current > dayjs().endOf("day");
          }}
        />
      </Form.Item>
      <Form.Item
        label="Location"
        name="location"
        rules={[{ required: true, message: "Please enter location" }]}
      >
        <Input placeholder="Enter location" />
      </Form.Item>
      <Form.Item
        label="Employee Role"
        name={["profile", "authorities"]}
        rules={[{ required: true, message: "Please select a role" }]}
        normalize={value => (Array.isArray(value) ? value : value ? [value] : [])}
      >
        <Select placeholder="Select role" options={ROLE_OPTIONS} />
      </Form.Item>
    </Form>
  );
};

export default EmployeeForm;

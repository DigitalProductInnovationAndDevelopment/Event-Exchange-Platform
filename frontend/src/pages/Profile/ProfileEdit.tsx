import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeForm from "../Employees/EmployeeForm.tsx";
import { Button, Card, Form, Spin, Typography } from "utils/antd.tsx";
import useApiService from "services/apiService.ts";
import { type Employee, getFullName, type Profile } from "types/employee.ts";
import { useAuth } from "../../contexts/AuthContext.tsx";
import toast from "react-hot-toast";
import type { UserType } from "types/auth.ts";

const { Title } = Typography;

export const ProfileEdit = () => {

  const navigate = useNavigate();
  const { getOwnProfile, updateOwnProfile } = useApiService();
  const { login } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = (await getOwnProfile()) ?? null;
        setProfile(data);
      } catch (err) {
        toast.error("Failed to fetch profile");
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [getOwnProfile]);

  const handleFinish = async (employee: Employee) => {
    setSaving(true);
    try {
      // No gender normalization
      const ownProfile = await updateOwnProfile(employee.profile);
      const values: UserType = {
        name: getFullName(ownProfile!) || "",
        email: ownProfile!.email || "",
        roles: ownProfile!.authorities || [],
      };
      await login(values);

    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading employee details..." />
      </div>
    );
  }

  // Normalize gender to uppercase for initialValues
  const normalizedInitialValues = profile
    ? {
      profile: {
        ...profile,
        gender: profile.gender || undefined,
      },
    }
    : { profile: { gender: undefined } };

  return (
    <div style={{ padding: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Edit Profile
        </Title>
        <div style={{ display: "flex" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            onClick={() => form.submit()}
            style={{ marginRight: 8 }}
          >
            Save
          </Button>
          <Button onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </div>
      <Card>
        <EmployeeForm initialValues={normalizedInitialValues} onSave={handleFinish} form={form}
                      isOwnProfileEdit={true} />
      </Card>
    </div>
  );
};

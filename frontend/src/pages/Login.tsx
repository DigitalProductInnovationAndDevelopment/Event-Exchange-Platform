import { type SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input } from "utils/antd.tsx";
import logo from "../assets/itestra_logo.png";
import useApiService, { BASE_URL } from "../services/apiService.ts";
import { DownOutlined, UpOutlined, UserOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isVisitorExpanded, setVisitorExpanded] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const { visitorLogin } = useApiService();

  const handleVisitorLogin = async () => {
    if (!accessCode || accessCode.length < 3) {
      setError("Please enter a valid access code (at least 3 characters)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = await visitorLogin(accessCode);
      if (success) {
        navigate("/login_success", { replace: true });
      }
    } catch {
      setError("Invalid access code. Please try again.");
      toast.error("Invalid access code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisitorLogin = () => {
    setVisitorExpanded(!isVisitorExpanded);
    if (!isVisitorExpanded) {
      setAccessCode("");
      setError("");
    }
  };

  const handleInputChange = (e: { target: { value: SetStateAction<string> } }) => {
    setAccessCode(e.target.value);
    setError("");
  };

  const handleKeyPress = (e: { key: string }) => {
    if (e.key === "Enter") {
      handleVisitorLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-500/50 px-4">
      <Card className="w-full max-w-md p-6 shadow-xl rounded-2xl bg-white">
        <div className="flex flex-col items-center space-y-5">
          <img src={logo} alt="Company Logo" className="w-48 h-48 object-contain" />

          <h1 className="text-xl font-semibold text-gray-800">Welcome to itestra</h1>
          <h3 className="font-semibold text-gray-800">Event Exchange Platform</h3>
          <p className="text-sm text-gray-500">Please choose how you'd like to sign in.</p>

          <Button
            type="primary"
            className="w-full transition duration-200 ease-in-out hover:scale-[1.01]"
            onClick={() => (window.location.href = `${BASE_URL}/oauth2/authorization/gitlab`)}
          >
            Employee Login via GitLab
          </Button>

          <div className="w-full space-y-3">
            <Button
              type="default"
              className="w-full flex items-center justify-center transition duration-200 ease-in-out hover:scale-[1.01]"
              icon={isVisitorExpanded ? <UpOutlined /> : <DownOutlined />}
              onClick={toggleVisitorLogin}
            >
              Visitor Login
            </Button>

            {isVisitorExpanded && (
              <div className="bg-white p-4 rounded-lg border space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Access Code
                  </label>
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter access code"
                    size="large"
                    value={accessCode}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    status={error ? "error" : ""}
                  />
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="primary"
                    loading={loading}
                    onClick={handleVisitorLogin}
                    className="flex-1"
                    disabled={!accessCode}
                  >
                    Continue
                  </Button>
                  <Button
                    type="text"
                    onClick={toggleVisitorLogin}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

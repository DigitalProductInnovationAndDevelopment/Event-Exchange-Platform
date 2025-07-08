import { Avatar, ConfigProvider, Dropdown, Layout, Menu, theme as antdTheme } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CalendarOutlined, DashboardOutlined, LogoutOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import useApiService from "../services/apiService.ts";
import { useState } from "react";
import itestraEventLogo from "../assets/itestra_event_logo.png";

const { Sider, Content, Footer } = Layout;

export const AppContainer = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutRequest } = useApiService();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode] = useState(false);

  const mainMenuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/events",
      icon: <CalendarOutlined />,
      label: "Events",
    },
    {
      key: "/employees",
      icon: <TeamOutlined />,
      label: "Employees",
    },
  ];

  const handleMenuClick = (key: string) => {
    if (key === "logout") {
      logoutRequest().then(() => logout());
    } else {
      navigate(key);
    }
  };

  const userMenuItems = [
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: "Profile Settings",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  // Get the base path for menu selection
  const getBasePath = (path: string) => {
    const segments = path.split("/");
    return `/${segments[1]}`;
  };

  const primaryColor = "#00aeff";
  const bgLight = "#F8F9FA";
  const bgDark = "#1f1f1f";

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,

        token: {
          colorPrimary: primaryColor,
          colorBgContainer: darkMode ? bgDark : bgLight,
          colorText: darkMode ? "#ffffff" : "#000000",
          colorTextBase: darkMode ? "#ffffff" : "#000000",
          colorBgLayout: darkMode ? "#000000" : "#ffffff",
          fontFamily: "Inter, sans-serif",
          borderRadius: 16,
        },

        components: {
          Layout: {
            siderBg: darkMode ? "#003366" : bgLight,
            headerBg: darkMode ? "#001529" : "#ffffff",
            bodyBg: darkMode ? "#0a0a0a" : bgLight,
          },

            Menu: {
              itemBg: "transparent",
              itemColor: darkMode ? "#e0e0e0" : "#2d2d2d",
              itemHoverColor: "#00aeff",
              itemSelectedColor: "#ffffff",
              itemSelectedBg: "#00aeff",
              itemActiveBg: "#00aeff",
              popupBg: darkMode ? "#0e1a26" : "#ffffff",
              horizontalItemHoverColor: "#00aeff",
              itemMarginInline: 16,
              itemBorderRadius: 16
            },
            Button: {
              colorPrimary: primaryColor,
              colorText: darkMode ? "#fff" : "#000",
            },

          Input: {
            colorBgContainer: darkMode ? "#333" : "#fff",
            colorTextPlaceholder: darkMode ? "#aaa" : "#888",
          },

          Card: {
            colorBgContainer: darkMode ? "#1c1c1c" : "#fff",
          },

          Table: {
            headerBg: darkMode ? "#1a1a1a" : "#fafafa",
            headerColor: darkMode ? "#ddd" : "#000",
            rowHoverBg: darkMode ? "#333" : "#f5f5f5",
          },

          Tabs: {
            itemSelectedColor: primaryColor,
            itemHoverColor: primaryColor,
          },

          Modal: {
            contentBg: darkMode ? "#1a1a1a" : "#fff",
            headerBg: darkMode ? "#111" : "#fff",
          },
        },
      }}
    >
      <Layout className="min-h-screen">
        <Sider
          style={{ backgroundColor: "rgba(210,230,248,0.55)" }}
          className="fixed top-1/2 -translate-y-1/2 h-[95%] z-10 rounded-2xl ml-4 shadow-lg "
          breakpoint="lg"
          collapsedWidth="0"
          onCollapse={(value) => setCollapsed(value)} onBreakpoint={(broken) => setCollapsed(broken)}>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              padding: "16px 0",
            }}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 100,
              marginTop: 16,
              marginBottom: 4,
            }}>
              <img
                src={itestraEventLogo}
                alt="itestra event planning logo"
                style={{ height: "64px" }}
              />
            </div>

            <Menu
              mode="inline"
              selectedKeys={[getBasePath(location.pathname)]}
              items={mainMenuItems}
              onClick={({ key }) => handleMenuClick(key)}
            />

            <div style={{ flexGrow: 1 }} />
            <div style={{ bottom: 0, width: "100%", padding: "24px 0" }} className="flex flex-col items-center">
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: ({ key }) => handleMenuClick(key),
                }}
                placement="topLeft"
            >
              <div style={{backgroundColor: "#00aeff", borderRadius: "50%"}}
                   className="w-36 h-36 shadow-md flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-all">
                <Avatar icon={<UserOutlined/>} className="bg-blue-200" size={48}/>
                <span
                    className="mt-3 text-white text-sm font-medium text-center"> {user?.name || user?.email || "User"} </span>
              </div>
            </Dropdown>
            </div>
          </div>
        </Sider>

        <Layout className="flex flex-col min-h-screen pl-5"
                style={{
                  marginLeft: collapsed ? 0 : 200,
                }}>
          <Content className="bg-gray-50 flex-1 overflow-auto">
            <div className="p-6">
              <Outlet />
            </div>
          </Content>
          <Footer className="text-center border-t border-white-200" style={{background: "transparent"}}>
            Event Exchange Platform ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>

  );
};
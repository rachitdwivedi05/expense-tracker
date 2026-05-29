import {
  AppstoreAddOutlined,
  BarChartOutlined,
  DollarOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Button, Image, Layout, Menu, theme } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import http, { apiUrl } from "../../../utils/http";

const { Sider, Content, Header } = Layout;

const items = [
  { key: "/app/user/dashboard", label: "Dashboard", icon: <AppstoreAddOutlined /> },
  { key: "/app/user/report", label: "Reports", icon: <BarChartOutlined /> },
  { key: "/app/user/transactions", label: "Transactions", icon: <DollarOutlined /> },
];

const Userlayout = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    theme: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const logout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      setLoading(true);
      await http.get(apiUrl("/api/user/logout"));
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      sessionStorage.removeItem("userInfo");
      navigate("/");
    } catch (err) {
      toast.error(err.response ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen!">
      <Sider
        breakpoint="lg"
        collapsedWidth="72"
        collapsible
        collapsed={open}
        onCollapse={setOpen}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
          bottom: 0,
          scrollbarWidth: "thin",
        }}
      >
        <div className="flex items-center justify-center my-4">
          <Image
            src="/exp-img.jpg"
            width={open ? 42 : 62}
            height={open ? 42 : 62}
            alt="Logo"
            preview={false}
            className="rounded-full object-cover!"
          />
        </div>

        <Menu selectedKeys={[pathname]} theme="dark" items={items} onClick={({ key }) => navigate(key)} />
      </Sider>

      <Layout>
        <Header className="sticky top-0 z-10 flex items-center justify-between bg-white! px-4! shadow-sm">
          <Button type="text" icon={<MenuOutlined />} onClick={() => setOpen(!open)} className="text-lg!" />
          <Button type="text" icon={<LogoutOutlined />} className="text-lg!" onClick={logout} loading={loading} />
        </Header>

        <Content
          className="p-3 md:p-6"
          style={{
            margin: "4px 8px",
            padding: 16,
            minHeight: 280,
            backgroundColor: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Userlayout;

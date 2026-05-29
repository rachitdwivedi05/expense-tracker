import { Card, Input, Form, Button } from "antd";

const { Item } = Form;
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import http, { apiUrl } from "../../../utils/http";


const Login = () => {

  const navigate = useNavigate();

  const [loginform] = Form.useForm();

  const [loading, setLoading] = useState(false);


  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await http.post(apiUrl("/api/user/login"), values);
      const {role, token} = data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      if (role=== "admin")
        return navigate("/app/admin/dashboard");
      if(role === "user")
         return navigate("/app/user/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <div className="w-1/2 hidden md:flex items-center justify-center">
        <img src="/exp-img.jpg" alt="Bank" className="w-4/5 object-contain" />
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-2 md:p-6 bg-w">
        <Card className="w-full max-w-sm shadow-xl">
          <h2 className="font-bold text-[#FF735C] text-2xl text-center mb-6">
            Track Your Expense
          </h2>

          <Form name="login-form" layout="vertical" onFinish={onFinish} form={loginform}>


            <Item name="email" label="Username" rules={[{ required: true }]}>
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your username"
              />
            </Item>

            <Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
              />
            </Item>

            <Item>
              <Button
                type="text"
                htmlType="submit"
                block
                className="bg-[#FF735C]! text-white! font-bold!"
                loading={loading}
              >
                Login
              </Button>
            </Item>
          </Form>
          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              style={{ textDecoration: "underline" }}
              className="text-[#FF735C]! font-bold!"
            >
              Forgot Password
            </Link>

            <Link
              to="/signup"
              style={{ textDecoration: "underline" }}
              className="text-[#FF735C]! font-bold!"
            >
              Don't have an account? Register
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;

import { Card, Input, Form, Button } from "antd";
const { Item } = Form;
import { LockOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Homelayout from "../../../layout/Homelayout";
import { useState } from "react";
// 1. Toast import karein
import { toast } from "react-toastify";
import http from "../../../utils/http";


const Signup = () => {
  const [formData, setFormData] = useState(null);
  const [otp, setOtp] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await http.post("/api/user/send-mail", values);
      setOtp(data.otp);
      setFormData(values);
      if (data.emailSent === false) {
        toast.info(`Email service unavailable. Use OTP: ${data.otp}`, {
          autoClose: 15000,
        });
      } else {
        toast.success("OTP sent to your email!"); // Default alert ki jagah toast
      }
    } catch (error) {
      setOtp(null);
      setFormData(null);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

const onSignup = async (values) => {
    try {
        if(Number(values.otp) !== Number(otp))
            return toast.error("OTP not match");
        setLoading(true);
        await http.post("/api/user/signup", formData);
        toast.success("Signup success");
        setOtp(null);
        setFormData(null);
        // signup k bad sb khali krne k liye
        // signupForm.resetFields();
    } catch (err) {
        toast.error(err.response ? err.response.data.message : err.message);
    } finally {
        setLoading(false);
    }
}
  // ... baaki ka return JSX same rahega

  return (
    <Homelayout>
      <div className="flex">
        <div className="w-1/2 hidden md:flex items-center justify-center">
          <img src="/exp-img.jpg" alt="Bank" className="w-4/5 object-contain" />
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-2 md:p-6 bg-w">
          <Card className="w-full max-w-sm shadow-xl">
            <h2 className="font-bold text-[#FF735C] text-2xl text-center mb-6">
              Track Your Expense
            </h2>

            {otp ? (
              <Form name="login-form" layout="vertical" onFinish={onSignup}>
                <Item name="otp" label="OTP" rules={[{ required: true }]}>
                  <Input.OTP
                    prefix={<UserOutlined />}
                    placeholder="Enter your OTP"
                  />
                </Item>

                <Item>
                  <Button
                    loading={loading}
                    type="text"
                    htmlType="submit"
                    block
                    className="bg-[#FF735C]! text-white! font-bold!"
                  >
                    Verify Now
                  </Button>
                </Item>
              </Form>
            ) : (
              <Form name="login-form" layout="vertical" onFinish={onFinish}>
                <Item
                  name="fullname"
                  label="Fullname"
                  rules={[{ required: true }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter your mobile no."
                  />
                </Item>

                <Item name="mobile" label="Mobile" rules={[{ required: true }]}>
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Enter your fullname"
                  />
                </Item>

                <Item
                  name="email"
                  label="Username"
                  rules={[{ required: true }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter your username"
                  />
                </Item>

                <Item
                  name="password"
                  label="Password"
                  rules={[{ required: true }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter your password"
                  />
                </Item>

                <Item>
                  <Button
                    loading={loading}
                    type="text"
                    htmlType="submit"
                    block
                    className="bg-[#FF735C]! text-white! font-bold!"
                  >
                    Signup
                  </Button>
                </Item>
              </Form>
            )}

            <div className="flex items-center justify-between">
              <div></div>
              <Link
                to="/"
                style={{ textDecoration: "underline" }}
                className="text-[#FF735C]! font-bold!"
              >
                Already have an account?
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Homelayout>
  );
};

export default Signup;

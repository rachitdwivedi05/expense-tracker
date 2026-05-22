import { Card, Input, Form, Button } from "antd";

const { Item } = Form;
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Homelayout from "../../../layout/Homelayout";
import http from "../../../utils/http";


const ForgotPassword = () => {
    const [params] = useSearchParams();
    
  const navigate = useNavigate();

  const [forgotForm] = Form.useForm();
  const [rePasswordForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

 useEffect(() => {
  const tok = new URLSearchParams(window.location.search).get("token");

  // console.log("TOKEN:", tok); // 👈 debug

  if (tok) {
    checkToken(tok);
  }
}, []);

 const checkToken = async (tok) =>{
  // console.log("verify api called");
  
    try{
        await http.post("/api/user/verify-token",{},{
            headers : {
                Authorization : `Bearer ${tok}`
            }
        });
        setToken(tok);
    }catch{
        setToken(null);
    }
}
  

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await http.post("/api/user/forgot-password", values);
      forgotForm.resetFields();
      if (data?.resetLink) {
        const resetUrl = new URL(data.resetLink);
        setToken(resetUrl.searchParams.get("token"));
        navigate(`${resetUrl.pathname}${resetUrl.search}`);
        toast.info(data?.message || "Email unavailable. Reset password below.");
      } else {
        toast.success(data?.message || "Please check your email for reset link");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  
  const onChangePassword = async (values) => {
    try {
      if(values.password !== values.rePassword)
        return toast.error("Password and Re-Password should be same !");
      
      setLoading(true);
      await http.put("/api/user/change-password", values,
       {
            headers : {
                Authorization : `Bearer ${params.get("token")}`
            }
        } 
      );
      toast.success("Password changed successfully, please wait.....");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Homelayout>
      <div className="flex">
        <div className="w-1/2 hidden md:flex items-center justify-center">
          <img src="/exp-img.jpg" alt="Bank" className="w-4/5 object-contain" />
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-2 md:p-6 bg-w">
          <Card className="w-full max-w-sm shadow-xl">
            <h2 className="font-bold text-[#FF735C] text-2xl text-center mb-6">
              {
                token ?
                "Change Password" 
                :
                "Forgot Password"
              }
            </h2>

            {token ? (
              <Form
                name="login-form"
                layout="vertical"
                onFinish={onChangePassword}
                form={rePasswordForm}
              >
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

                <Item
                  name="rePassword"
                  label="Re Enter Password"
                  rules={[{ required: true }]}
                >
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
                    Change Password
                  </Button>
                </Item>
              </Form>
            ) : (
              <Form
                name="login-form"
                layout="vertical"
                onFinish={onFinish}
                form={forgotForm}
              >
                <Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter email"
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
                    Submit
                  </Button>
                </Item>
              </Form>
            )}

            <div className="flex items-center justify-between">
              <Link
                to="/"
                style={{ textDecoration: "underline" }}
                className="text-[#FF735C]! font-bold!"
              >
                Sign in
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
    </Homelayout>
  );
};

export default ForgotPassword;

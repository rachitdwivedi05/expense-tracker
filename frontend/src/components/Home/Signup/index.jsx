import { Card, Input, Form, Button } from "antd";

const { Item } = Form;
import { LockOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Homelayout from "../../../layout/Homelayout";
import axios from "axios";
import { useState } from "react";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Signup = () => {

  const [formData, setFormData] = useState(null);
  const [otp, setOtp] = useState(null);
  const [loading, setLoading] = useState(false);

const onFinish = async (values) => {
  try {
    setLoading(true);
    const { data } = await axios.post("/api/user/send-mail", values);
    setOtp(data.otp);
    setFormData(values);
  } catch(error) {
   setOtp(null);
    setFormData(null);
  }finally{
    setLoading(false);
  }
};

const onSignup = async (values) => {
 
    if(String(values.otp)  !== String(otp)){
      alert("Invalid OTP");
      return;
    }

 try {
    setLoading(true);
    await axios.post("/api/user/signup", formData);
    // setOtp(data.otp);
    alert("Signup Successful");
    // setFormData(values);

    // 3. Success ke baad clear karein
    setOtp(null);
    setFormData(null);

  } catch (error) {
    // Agar server error 500 ya 400 hai toh ye error dikhayega
    console.error(error);
    alert(error.response?.data?.message || "Signup failed");
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
            Track Your Expense
          </h2>

            {
               otp ?
               <Form
          name ="login-form"
          layout="vertical"
          onFinish={onSignup}
          >
          
          <Item
            name="otp"
            label="OTP"
            rules={[{ required: true}]}>
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
               :
               <Form
          name ="login-form"
          layout="vertical"
          onFinish={onFinish}
          >
          
          <Item
            name="fullname"
            label="Fullname"
            rules={[{ required: true}]}>
                <Input
                prefix={<UserOutlined />}
                placeholder="Enter your mobile no."
                />
            </Item>

             <Item
            name="mobile"
            label="Mobile"
            rules={[{ required: true}]}>
                <Input
                prefix={<PhoneOutlined />}
                placeholder="Enter your fullname"
                />
            </Item>

            <Item
            name="email"
            label="Username"
            rules={[{ required: true}]}>
                <Input
                prefix={<UserOutlined />}
                placeholder="Enter your username"
                />
            </Item>

              <Item
            name="password"
            label="Password"
            rules={[{ required: true}]}>
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
            }


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

import React, { Component } from "react";
import { Form, Button, Input, message } from "antd";
import axios from "axios";
import "./index.css";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
export default class Login extends Component {
  formRef = React.createRef();
  formRules = {
    username: [{ required: true, message: "请输入用户名" }],
    password: [{ required: true, message: "请输入密码" }],
  };
  reset = () => {
    this.formRef.current.resetFields();
  };
  onFinish = async (value) => {
    try {
      const { data: res } = await axios.post("/login", value);
      if (res.meta.status !== 200) {
        return message.error("用户名或密码错误");
      }
      message.success("登录成功");
      window.sessionStorage.setItem("token", res.data.token);
      this.props.history.push("/");
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };

  render() {
    return (
      <div className="loginBody">
        <div className="loginContainer">
          <div className="avatar">
            <img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" alt="" />
          </div>
          <Form
            className="loginForm"
            validateMessages="登录成功"
            ref={this.formRef}
            onFinish={this.onFinish}
            initialValues={{ username: "admin", password: "123456" }}
          >
            <Form.Item name="username" rules={this.formRules.username}>
              <Input placeholder="用户名" prefix={<UserOutlined />} size="large"></Input>
            </Form.Item>
            <Form.Item name="password" rules={this.formRules.password}>
              <Input.Password
                placeholder="密码"
                prefix={<LockOutlined />}
                size="large"
              ></Input.Password>
            </Form.Item>
            <div className="btns">
              <Button type="primary" htmlType="submit">
                登录
              </Button>
              <Button onClick={this.reset}>重置</Button>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}

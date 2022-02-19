import React, { Component } from "react";
import axios from 'axios'
import {
  Space,
  Button,
  Table,
  message,
  Tag,
  Row,
  Col,
  Modal,
  Input,
  Form,
  Tree,
} from "antd";
export default class Rights extends Component {
  columns = [
    {
      title: "#",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "权限名称",
      dataIndex: "authName",
      key: "authName",
    },
    {
      title: "路径",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "权限等级",
      key: "level",
      render: (text, record) => {
        if (record.level === "0") return <Tag color="blue">一级</Tag>;
        else if (record.level === "1") return <Tag color="green">二级</Tag>;
        else if (record.level === "2") return <Tag color="orange">三级</Tag>;
      },
    },
  ];
  state = {
    rightList: [],
  };

  getRightList = async () => {
    try {
      const { data: res } = await axios.get("rights/list");
      if(res.meta.status !==200){
        message.error("获取权限列表失败！")
      }
      this.setState({rightList: res.data})
      message.success("获取权限成功！")
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };

  componentDidMount(){
    this.getRightList();
  }
  render() {
    return (
      <>
        <Table columns={this.columns} dataSource={this.state.rightList} bordered/>
      </>
    );
  }
}

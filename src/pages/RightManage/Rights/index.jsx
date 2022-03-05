import React, { Component } from "react";
import axios from "axios";
import { Table, message, Tag } from "antd";
export default class Rights extends Component {
  columns = [
    {
      title: "#",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      width: "40%",
      title: "权限名称",
      dataIndex: "authName",
      key: "authName",
    },
    {
      width: "30%",
      title: "路径",
      dataIndex: "path",
      key: "path",
    },
    {
      width: "20%",
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
    loading: false,
  };

  getRightList = async () => {
    this.setState({ loading: true });
    try {
      const { data: res } = await axios.get("rights/list");
      if (res.meta.status !== 200) {
        message.error("获取权限列表失败！");
      }
      this.setState({ rightList: res.data, loading: false });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };

  componentDidMount() {
    this.getRightList();
  }
  render() {
    return (
      <>
        <Table
          loading={this.state.loading}
          columns={this.columns}
          dataSource={this.state.rightList}
          bordered
          rowKey={(record) => record.id}
        />
      </>
    );
  }
}

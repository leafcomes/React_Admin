import React, { Component } from "react";
import { Space, Button, Table, message, Tooltip, Modal, Input, Pagination } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import axios from "axios";
const { Search } = Input;
const { confirm } = Modal;
export default class GoodList extends Component {
  columns = [
    {
      title: "#",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      width: "45%",
      title: "商品名称",
      dataIndex: "goods_name",
      key: "goods_name",
    },
    {
      width: "10%",
      title: "商品价格（元）",
      dataIndex: "goods_price",
      key: "goods_price",
    },
    {
      width: "10%",
      title: "商品重量（克）",
      dataIndex: "goods_weight",
      key: "goods_weight",
    },
    {
      width: "15%",
      title: "创建事件",
      key: "add_time",
      render: (text, record) => new Date(record.add_time).toLocaleDateString(),
    },
    {
      width: "10%",
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      render: (text, record) => (
        <Space>
          <Tooltip title="修改商品" color="blue">
            <Button
              icon={<EditOutlined />}
              className="primaryStyle"
              onClick={() => {
                this.props.history.push(`/goods/edit/${record.goods_id}`);
              }}
            />
          </Tooltip>
          <Tooltip title="删除商品" color="red">
            <Button
              icon={<DeleteOutlined />}
              className="dangerStyle"
              onClick={() => {
                this.showRemoveGoodConfirm(record.goods_id);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  state = {
    queryInfo: {
      query: "",
      pagenum: 1,
      pagesize: 10,
    },
    goodList: [],
    goodTotal: 0,
    // 控制删除商品的对话框的显示与隐藏
    removeGoodConfirmVisible: false,
    loading: false,
  };
  // 获取商品列表
  getGoodList = async () => {
    this.setState({ loading: true });
    try {
      const { data: res } = await axios.get("goods", {
        params: this.state.queryInfo,
      });
      if (res.meta.status !== 200) {
        return message.error("获取商品失败！");
      }
      this.setState({ goodList: res.data.goods, goodTotal: res.data.total, loading: false });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  // 重置商品搜索框
  resetSearch = (event) => {
    if (event.target.value === "") {
      this.state.queryInfo.query = "";
      this.getGoodList();
    }
  };
  // 搜索商品
  searchGood = (goodName) => {
    this.state.queryInfo.query = goodName;
    this.getGoodList();
  };
  removeGoodById = async (goodId) => {
    try {
      const { data: res } = await axios.delete(`goods/${goodId}`);
      if (res.meta.status !== 200) {
        return message.error("删除商品失败！");
      }
      message.success("删除商品成功！");
      this.getGoodList();
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  // 页码或pagesize改变时的回调函数
  onPageChange = (page, pagesize) => {
    this.state.queryInfo.pagenum = page;
    this.state.queryInfo.pagesize = pagesize;
    this.getGoodList();
  };
  showRemoveGoodConfirm = (goodId) => {
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "该操作会删除该商品，是否继续?",
      onOk: () => {
        this.removeGoodById(goodId);
      },
      onCancel: () => {
        message.info("已取消删除！");
      },
    });
  };

  componentDidMount() {
    this.getGoodList();
  }
  render() {
    return (
      <>
        <Space direction="vertical">
          <Space>
            <Search
              placeholder="请输入商品名"
              size="large"
              allowClear
              onChange={this.resetSearch}
              onSearch={this.searchGood}
            />
            <Button
              type="primary"
              size="large"
              onClick={() => {
                this.props.history.push("/goods/add");
              }}
            >
              添加商品
            </Button>
          </Space>
          <Table
            loading={this.state.loading}
            pagination={{ position: ["none"] }}
            bordered
            columns={this.columns}
            dataSource={this.state.goodList}
            rowKey={(record) => record.goods_id}
          ></Table>
          <Pagination
            total={this.state.goodTotal}
            current={this.state.queryInfo.pagenum}
            size="large"
            pageSizeOptions={[1, 2, 5, 10]}
            defaultPageSize={this.state.queryInfo.pagesize}
            showSizeChanger
            onChange={this.onPageChange}
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
          />
        </Space>
      </>
    );
  }
}

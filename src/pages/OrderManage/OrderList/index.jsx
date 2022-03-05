import React, { Component } from "react";
import {
  Space,
  Button,
  Table,
  Timeline,
  message,
  Tag,
  Pagination,
  Modal,
  Input,
  Form,
  Cascader,
  Tooltip,
} from "antd";
import { CarOutlined, GlobalOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";
import CityData from "./CityData";
const { Search } = Input;
export default class OrderList extends Component {
  editShippingAddressFormRef = React.createRef();
  editShippingAddressFormRules = {
    areaAddress: [{ required: true, message: "请选择一个区域地址！" }],
    detailAddress: [{ required: true, message: "请填写一个详细地址！" }],
  };
  columns = [
    {
      title: "#",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      width:"20%",
      title: "订单编号",
      dataIndex: "order_number",
      key: "order_number",
    },
    {
      width:"10%",
      title: "订单价格",
      dataIndex: "order_price",
      key: "order_price",
    },
    {
      width:"10%",
      title: "是否付款",
      key: "pay_status",
      render: (text, record) =>
        record.status === 1 ? <Tag color="green">已付款</Tag> : <Tag color="red">未付款</Tag>,
    },
    {
      width:"10%",
      title: "是否发货",
      key: "is_send",
      render: (text, record) => (
        <Tag color={record.is_send === "是" ? "green" : "red"}>{record.is_send}</Tag>
      ),
    },
    {
      width:"20%",
      title: "收货地址",
      key: "consignee_addr",
      dataIndex: "consignee_addr",
    },
    {
      width:"15%",
      title: "下单时间",
      key: "mg_state",
      render: (text, record) => moment(record.create_time).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      width:"10%",
      title: "操作",
      key: "operation",
      render: (text, record) => (
        <Space>
          <Tooltip title="收货地址" color="blue">
            <Button
              icon={<GlobalOutlined />}
              className="primaryStyle"
              onClick={this.showShippingAddressModal.bind(this, record)}
            />
          </Tooltip>
          <Tooltip title="物流进度" color="orange">
            <Button icon={<CarOutlined />} className="warningStyle" onClick={this.showExpressProgressModal} />
          </Tooltip>
        </Space>
      ),
    },
  ];
  state = {
    orderList: [],
    orderTotal: 0,
    // 订单查询相关参数
    queryInfo: {
      query: "",
      pagenum: 1,
      pagesize: 10,
    },
    shippingAddressModalVisible: false,
    expressProgressModalVisible:false,
    // 当前编辑订单的ID
    order_id: "",
    order_price: "",
    editShippingAddressForm: {
      areaAddress: [],
      detailAddress: "",
    },
    expressProgressInfo: [
      {
        "time": "2018-05-10 09:39:00",
        "ftime": "2018-05-10 09:39:00",
        "context": "已签收,感谢使用顺丰,期待再次为您服务",
        "location": ""
      },
      {
        "time": "2018-05-10 08:23:00",
        "ftime": "2018-05-10 08:23:00",
        "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
        "location": ""
      },
      {
        "time": "2018-05-10 07:32:00",
        "ftime": "2018-05-10 07:32:00",
        "context": "快件到达 [北京海淀育新小区营业点]",
        "location": ""
      },
      {
        "time": "2018-05-10 02:03:00",
        "ftime": "2018-05-10 02:03:00",
        "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
        "location": ""
      },
      {
        "time": "2018-05-09 23:05:00",
        "ftime": "2018-05-09 23:05:00",
        "context": "快件到达 [北京顺义集散中心]",
        "location": ""
      },
      {
        "time": "2018-05-09 21:21:00",
        "ftime": "2018-05-09 21:21:00",
        "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
        "location": ""
      },
      {
        "time": "2018-05-09 13:07:00",
        "ftime": "2018-05-09 13:07:00",
        "context": "顺丰速运 已收取快件",
        "location": ""
      },
      {
        "time": "2018-05-09 12:25:03",
        "ftime": "2018-05-09 12:25:03",
        "context": "卖家发货",
        "location": ""
      },
      {
        "time": "2018-05-09 12:22:24",
        "ftime": "2018-05-09 12:22:24",
        "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
        "location": ""
      },
      {
        "time": "2018-05-08 21:36:04",
        "ftime": "2018-05-08 21:36:04",
        "context": "商品已经下单",
        "location": ""
      }
    ]
  };
  showShippingAddressModal = async ({ order_id, order_price }) => {
    try {
      const { data: res } = await axios.get(`/orders/${order_id}`);
      if (res.meta.status !== 200) {
        return message.error("获取订单信息失败！");
      }
      const shippingAddress = res.data.consignee_addr.split(" ");
      const areaAddress = shippingAddress[0].match(/.+?(省|市|自治区|自治州|县|区)/g);
      const detailAddress = shippingAddress[1];
      this.setState({
        shippingAddressModalVisible: true,
        editShippingAddressForm: { areaAddress, detailAddress },
        order_id,
        order_price
      });
    } catch (error) {}
  };
  showExpressProgressModal = async () => {
    try {
      // const {data:res} = await axios.get('kuaidi/1106975712662');
      // if(res.meta.status !==200){
      //   return message.error("获取物流进度失败！");
      // }
      // this.setState({expressProgressModalVisible:true,expressProgressInfo:res.data})
      this.setState({expressProgressModalVisible:true})
    } catch (error) {
      
    }
  }
  // 页码或pagesize改变时的回调函数
  onPageChange = (page, pagesize) => {
    this.state.queryInfo.pagenum = page;
    this.state.queryInfo.pagesize = pagesize;
    this.getOrderList();
  };
  resetSearch = (event) => {
    if (event.target.value === "") {
      this.state.queryInfo.query = "";
      this.getOrderList();
    }
  };
  searchOrder = (order_number) => {
    this.state.queryInfo.query = order_number;
    this.getOrderList();
  };
  getOrderList = async () => {
    try {
      const { data: res } = await axios.get("orders", { params: this.state.queryInfo });
      
      if (res.meta.status !== 200) {
        return message.error("获取订单列表失败！");
      }
      this.setState({ orderTotal: res.data.total, orderList: res.data.goods });
    } catch (error) {}
  };
  editShippingAddress = async () => {
    try {
      this.editShippingAddressFormRef.current
        .validateFields()
        .then(async ({ areaAddress, detailAddress }) => {
          const consignee_addr = areaAddress.join("") + " " + detailAddress;
          const { data: res } = await axios.put(`orders/${this.state.order_id}`, {
            consignee_addr,
            order_price: this.state.order_price,
          });
          if (res.meta.status !== 201) {
            
            return message.error("编辑收货地址失败！");
          }
          message.success("编辑收货地址成功！");
          this.setState({ shippingAddressModalVisible: false });
          this.getOrderList();
        });
    } catch (error) {
      
    }
  };
  componentDidMount() {
    this.getOrderList();
  }
  render() {
    return (
      <>
        <Space direction="vertical" size="middle">
          <Search
            style={{ width: "300px" }}
            size="large"
            allowClear
            placeholder="请输入订单编号"
            onChange={this.resetSearch}
            onSearch={this.searchOrder}
          />
          <Table
            pagination={{ position: ["none"] }}
            columns={this.columns}
            dataSource={this.state.orderList}
            bordered
            rowKey={(record) => record.order_id}
          />
          <Pagination
            total={this.state.orderTotal}
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
        <Modal
          title="收货地址"
          visible={this.state.shippingAddressModalVisible}
          onCancel={() => {
            this.setState({ shippingAddressModalVisible: false });
          }}
          onOk={this.editShippingAddress}
          destroyOnClose
        >
          <Form ref={this.editShippingAddressFormRef} initialValues={this.state.editShippingAddressForm}>
            <Form.Item
              label="省市区/县"
              labelCol={{ span: 5 }}
              rules={this.editShippingAddressFormRules.areaAddress}
              name="areaAddress"
            >
              <Cascader options={CityData} expandTrigger="hover" placeholder="请选择" />
            </Form.Item>
            <Form.Item
              label="详细地址"
              labelCol={{ span: 5 }}
              rules={this.editShippingAddressFormRules.detailAddress}
              name="detailAddress"
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        <Modal visible={this.state.expressProgressModalVisible} onCancel={() => {
          this.setState({expressProgressModalVisible:false})
        }} footer={null}>
          <Timeline>
            {this.state.expressProgressInfo.map((item,index) => {
              return <Timeline.Item key={index}>{item.context} {item.time}</Timeline.Item>
            })}
          </Timeline>
        </Modal>
      </>
    );
  }
}

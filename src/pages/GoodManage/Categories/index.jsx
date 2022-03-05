import React, { Component } from "react";
import { Space, Button, Table, message, Tag, Pagination, Modal, Input, Form, Cascader } from "antd";
import {
  CheckCircleTwoTone,
  MinusOutlined,
  StopTwoTone,
  RightOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
const { confirm } = Modal;
export default class Categories extends Component {
  columns = [
    {
      width: "20%",
      title: "#",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      width: "30%",
      title: "分类名称",
      key: "cat_name",
      dataIndex: "cat_name",
    },
    {
      width: "15%",
      title: "是否有效",
      key: "cat_deleted",
      render: (text, record) =>
        record.cat_deleted ? (
          <StopTwoTone twoToneColor="red" />
        ) : (
          <CheckCircleTwoTone twoToneColor="#11dc0d" />
        ),
    },
    {
      width: "10%",
      title: "排序",
      key: "order",
      render: (text, record) => {
        if (record.cat_level === 0) return <Tag color="blue">一级</Tag>;
        else if (record.cat_level === 1) return <Tag color="green">二级</Tag>;
        else if (record.cat_level === 2) return <Tag color="orange">三级</Tag>;
      },
    },
    {
      title: "操作",
      key: "operation",
      render: (text, record) => (
        <Space>
          <Button
            className="primaryStyle"
            onClick={() => {
              this.showEditCateModal(record);
            }}
          >
            编辑
          </Button>
          <Button
            className="dangerStyle"
            onClick={() => {
              this.showRemoveCateConfirm(record.cat_id);
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  addCateFormRef = React.createRef();
  editCateFormRef = React.createRef();
  // 添加商品的表单数据限制规则
  addCateFormRules = {
    cat_name: [{ required: true, message: "请输入商品名称" }],
  };
  state = {
    cateList: [],
    // 父级分类列表，不包含三级分类
    parentCateList: [],
    //查询分类列表的参数对象
    queryInfo: {
      type: 3,
      pagenum: 1, //当前的页数
      pagesize: 5, //当前每页显示多少条数据
    },
    // 商品类别的总数,包含一二三级分类
    cateTotal: 0,
    addCateModalVisible: false,
    editCateModalVisible: false,
    editCateForm: {
      cat_name: "",
      cat_id: "",
    },
    loading: false,
  };
  // 页码或pagesize改变时的回调函数
  onPageChange = (page, pagesize) => {
    this.state.queryInfo.pagenum = page;
    this.state.queryInfo.pagesize = pagesize;
    this.getCateList();
  };
  showAddCateModal = () => {
    this.getParentCateList();
    this.setState({ addCateModalVisible: true });
  };
  showEditCateModal = (record) => {
    this.setState({
      editCateForm: { cat_name: record.cat_name, cat_id: record.cat_id },
      editCateModalVisible: true,
    });
  };
  // 删除商品分类的对话框
  showRemoveCateConfirm = (cat_id) => {
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "该操作会删除该分类及其子级分类，是否继续?",
      onOk: () => {
        this.removeCateById(cat_id);
      },
      onCancel: () => {
        message.info("已取消删除！");
      },
    });
  };

  getCateList = async () => {
    this.setState({ loading: true });
    try {
      const { data: res } = await axios.get("categories", { params: this.state.queryInfo });
      if (res.meta.status !== 200) {
        return message.error("获取商品分类列表失败！");
      }
      this.setState({ cateList: res.data.result, cateTotal: res.data.total, loading: false });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  getParentCateList = async () => {
    try {
      const { data: res } = await axios.get("categories", { params: { type: 2 } });
      if (res.meta.status !== 200) {
        return message.error("获取父级分类列表失败！");
      }
      this.setState({ parentCateList: res.data });
    } catch (error) {}
  };
  addCate = async () => {
    this.addCateFormRef.current.validateFields().then(async ({ cat_name, cat_list }) => {
      // 分类父 ID
      const cat_pid = cat_list ? cat_list[cat_list.length - 1] : 0;
      // 分类层级
      const cat_level = cat_list ? cat_list.length : 0;
      const { data: res } = await axios.post("categories", { cat_name, cat_pid, cat_level });
      if (res.meta.status !== 201) {
        return message.error("添加失败！");
      }
      message.success("添加成功！");
      this.setState({ addCateModalVisible: false }, () => {
        this.addCateFormRef.current.resetFields();
      });
      this.getCateList();
    });
  };
  editCate = async () => {
    this.editCateFormRef.current.validateFields().then(async ({ cat_name }) => {
      const { data: res } = await axios.put(`categories/${this.state.editCateForm.cat_id}`, {
        cat_name,
      });
      if (res.meta.status !== 200) {
        return message.error("编辑失败！");
      }
      message.success("编辑成功！");
      this.setState({ editCateModalVisible: false });
      this.getCateList();
    });
  };

  removeCateById = async (cat_id) => {
    try {
      const { data: res } = await axios.delete(`categories/${cat_id}`);
      if (res.meta.status !== 200) {
        return message.error("删除失败！");
      }
      message.success("删除成功！");
      this.getCateList();
    } catch (error) {}
  };
  componentDidMount() {
    this.getCateList();
  }
  render() {
    return (
      <>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Button type="primary" onClick={this.showAddCateModal}>
            添加分类
          </Button>
          <Table
            loading={this.state.loading}
            pagination={{ position: ["none"] }}
            columns={this.columns}
            rowKey={(record) => record.cat_id}
            dataSource={this.state.cateList}
            bordered
            rowClassName={(record, index, indent) => {
              if (record.cat_level === 0) {
                return "levelOneRow";
              } else if (record.cat_level === 1) {
                return "levelTwoRow";
              } else if (record.cat_level === 2) {
                return "levelThreeRow";
              }
            }}
            expandable={{
              expandIcon: ({ expanded, onExpand, record }) => {
                if (!record.children) return <MinusOutlined className="expandIcon" />;
                return expanded ? (
                  <DownOutlined onClick={(e) => onExpand(record, e)} className="expandIcon" />
                ) : (
                  <RightOutlined onClick={(e) => onExpand(record, e)} className="expandIcon" />
                );
              },
            }}
          ></Table>
          <Pagination
            total={this.state.cateTotal}
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
          title="添加分类"
          visible={this.state.addCateModalVisible}
          onOk={this.addCate}
          onCancel={() => {
            this.addCateFormRef.current.resetFields();
            this.setState({ addCateModalVisible: false });
          }}
        >
          <Form ref={this.addCateFormRef}>
            <Form.Item
              name="cat_name"
              label="分类名称"
              rules={this.addCateFormRules.cat_name}
              labelCol={{ span: 4 }}
            >
              <Input />
            </Form.Item>
            <Form.Item name="cat_list" label="父级分类" labelCol={{ span: 4 }}>
              <Cascader
                placeholder="请选择"
                changeOnSelect
                expandTrigger="hover"
                fieldNames={{
                  label: "cat_name",
                  value: "cat_id",
                  children: "children",
                }}
                options={this.state.parentCateList}
              />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="编辑分类"
          visible={this.state.editCateModalVisible}
          onOk={this.editCate}
          destroyOnClose
          onCancel={() => {
            this.setState({ editCateModalVisible: false });
          }}
        >
          <Form ref={this.editCateFormRef} initialValues={this.state.editCateForm}>
            <Form.Item
              name="cat_name"
              label="分类名称"
              rules={this.addCateFormRules.cat_name}
              labelCol={{ span: 4 }}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }
}

import React, { Component } from "react";
import {
  Alert,
  Space,
  Form,
  Button,
  Tabs,
  Table,
  message,
  Modal,
  Input,
  Cascader,
  Tag,
} from "antd";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import axios from "axios";
const { TabPane } = Tabs;
const { confirm } = Modal;
export default class Params extends Component {
  tagInputRef = React.createRef();
  addFormRef = React.createRef();
  editFormRef = React.createRef();
  columns = [
    {
      title: "#",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      width: "50%",
      title: "名称",
      dataIndex: "attr_name",
      key: "goods_name",
    },
    {
      width: "30%",
      title: "操作",
      key: "operation",
      render: (text, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              this.showEditModal(record);
            }}
          >
            编辑
          </Button>
          <Button
            danger
            className="dangerStyle"
            onClick={() => {
              this.showRemoveConfirm(record.attr_id);
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  state = {
    cateList: [],
    // 商品所属分类的三级ID
    goods_cat_threeId: "",
    // 单一类别下的商品默认的所有动态参数列表数据
    defaultDynamicParams: [],
    // 单一类别下的商品默认的所有静态属性列表数据
    defaultStaticAttributes: [],
    addForm: {
      attr_name: "",
    },
    editForm: {
      attr_id: "",
      attr_name: "",
    },
    // 添加动态参数与静态属性的对话框
    addModalVisible: false,
    // 编辑动态参数与静态属性的对话框
    editModalVisible: false,
    // 被激活的tab标签名称,默认为动态参数所在标签栏
    activeTabName: "many",
  };
  showAddModal = () => {
    this.setState({ addModalVisible: true });
  };
  showEditModal = (record) => {
    const editForm = { attr_id: record.attr_id, attr_name: record.attr_name };

    this.setState({ editModalVisible: true, editForm });
  };
  // 删除动态参数和静态属性的对话框
  showRemoveConfirm = (attr_id) => {
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content:
        this.state.activeTabName === "many"
          ? "该操作会删除参数及其参数值，是否继续?"
          : "该操作会删除属性及其属性值，是否继续?",
      onOk: () => {
        this.removeParamAndAttribute(attr_id);
      },
      onCancel: () => {
        message.info("已取消删除！");
      },
    });
  };

  // 更新级联选择器选择的商品分类三级ID
  updateCheckedCateId = (checkedValue) => {
    this.state.goods_cat_threeId = checkedValue[2];
    this.getDefaultDynamicParams();
    this.getDefaultStaticAttributes();
    //
  };
  getCateList = async () => {
    try {
      const { data: res } = await axios.get("categories");
      if (res.meta.status !== 200) {
        return message.error("获取商品分类列表失败！");
      }
      this.setState({ cateList: res.data });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  // listType用来标记获取的是动态参数列表还是静态属性列表
  getParamsAndAttributes = async (listType) => {
    try {
      // 只能通过商品所属的第三级分类ID查询
      const { data: res } = await axios.get(
        `categories/${this.state.goods_cat_threeId}/attributes`,
        {
          params: { sel: listType },
        }
      );
      if (res.meta.status !== 200) {
        return listType === "many"
          ? message.error("获取动态参数列表失败！")
          : message.error("获取静态属性列表失败！");
      }
      // 响应数据列表的attr_vals值为以逗号分隔的字符串
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
        // 控制标签输入框的显示,false时显示添加标签
        item.tagInputVisible = false;
        item.tagInputValue = "";
      });

      return res.data;
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  // 获取该商品所属类别下的所有默认的动态参表对象
  getDefaultDynamicParams = async () => {
    const defaultDynamicParams = await this.getParamsAndAttributes("many");
    this.setState({ defaultDynamicParams });
  };
  // 获取该商品所属类别下的所有默认的静态属性对象
  getDefaultStaticAttributes = async () => {
    const defaultStaticAttributes = await this.getParamsAndAttributes("only");
    this.setState({ defaultStaticAttributes });
  };
  updateParamAndAttribute = async (attr) => {
    try {
      const { data: res } = await axios.put(
        `categories/${this.state.goods_cat_threeId}/attributes/${attr.attr_id}`,
        {
          attr_name: attr.attr_name,
          attr_sel: attr.attr_sel,
          attr_vals: attr.attr_vals.join(","),
        }
      );
      if (res.meta.status !== 200) {
        return message.error("添加失败！");
      }
      if (this.state.activeTabName === "many") {
        this.getDefaultDynamicParams();
      } else {
        this.getDefaultStaticAttributes();
      }
    } catch (error) {
      return message.error(error.message);
    }
  };
  addParamAndAttribute = async () => {
    this.addFormRef.current.validateFields().then(async (form) => {
      const { data: res } = await axios.post(
        `categories/${this.state.goods_cat_threeId}/attributes`,
        {
          attr_name: form.attr_name,
          attr_sel: this.state.activeTabName,
        }
      );
      if (res.meta.status !== 201) {
        return message.error("添加失败！");
      }
      this.setState({ addModalVisible: false }, () => {
        message.success("添加成功！");
        this.getDefaultDynamicParams();
        this.getDefaultStaticAttributes();
      });
    });
  };
  editParamAndAttribute = async () => {
    this.editFormRef.current.validateFields().then(async (form) => {
      const { data: res } = await axios.put(
        `categories/${this.state.goods_cat_threeId}/attributes/${this.state.editForm.attr_id}`,
        {
          attr_name: form.attr_name,
          attr_sel: this.state.activeTabName,
        }
      );

      if (res.meta.status !== 200) {
        return message.error("编辑失败！");
      }
      this.setState({ editModalVisible: false }, () => {
        message.success("编辑成功！");
        this.getDefaultDynamicParams();
        this.getDefaultStaticAttributes();
      });
    });
  };
  removeParamAndAttribute = async (attr_id) => {
    try {
      const { data: res } = await axios.delete(
        `categories/${this.state.goods_cat_threeId}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) {
        return message.error("删除失败！");
      }
      if (this.state.activeTabName === "many") {
        this.getDefaultDynamicParams();
      } else {
        this.getDefaultStaticAttributes();
      }
      message.success("删除成功！");
    } catch (error) {}
  };
  handleTagInputChange = (event, attr) => {
    attr.tagInputValue = event.target.value.trim();
  };
  handleTagInputBlur = (attr) => {
    if (attr.tagInputValue === "") {
      attr.tagInputVisible = false;
      this.forceUpdate();
      return;
    }
    attr.attr_vals.push(attr.tagInputValue);
    this.updateParamAndAttribute(attr);
  };
  handleTagInputEnter = (attr) => {
    if (attr.tagInputValue === "") {
      attr.tagInputVisible = false;
      this.forceUpdate();
      return;
    }
    attr.attr_vals.push(attr.tagInputValue);
    this.updateParamAndAttribute(attr);
  };
  // 当标签关闭时的回调
  handleTagClose = (attr, index) => {
    attr.attr_vals.splice(index, 1);
    this.updateParamAndAttribute(attr);
  };
  componentDidMount() {
    this.getCateList();
  }
  componentDidCatch(error) {}
  render() {
    return (
      <>
        <Space direction="vertical" size="middle">
          <Alert message="注意：只允许为第三级分类设置相关参数！" />
          <Form>
            <Form.Item
              label="选择商品分类"
              normalize={(value) => {
                return value.length === 3 ? value : [];
              }}
            >
              <Cascader
                placeholder="请选择"
                expandTrigger="hover"
                fieldNames={{
                  label: "cat_name",
                  value: "cat_id",
                  children: "children",
                }}
                options={this.state.cateList}
                onChange={this.updateCheckedCateId}
              />
            </Form.Item>
          </Form>
        </Space>
        <Tabs
          activeKey={this.state.activeTabName}
          onChange={(activeKey) => {
            this.setState({ activeTabName: activeKey });
          }}
        >
          <TabPane key="many" tab="动态参数">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                onClick={this.showAddModal}
                disabled={!this.state.goods_cat_threeId}
              >
                添加参数
              </Button>
              <Table
                bordered
                columns={this.columns}
                dataSource={this.state.defaultDynamicParams}
                rowKey={(record) => record.attr_id}
                expandable={{
                  defaultExpandAllRows: true,
                  expandedRowRender: (record) => (
                    <>
                      {record.attr_vals.map((value, index) => {
                        return (
                          <Tag
                            key={index}
                            color="blue"
                            visible={true}
                            closable
                            onClose={() => {
                              this.handleTagClose(record, index);
                            }}
                          >
                            {value}
                          </Tag>
                        );
                      })}
                      {record.tagInputVisible ? (
                        <Input
                          ref={this.tagInputRef}
                          className="tag-input"
                          onChange={(event) => {
                            this.handleTagInputChange(event, record);
                          }}
                          onBlur={this.handleTagInputBlur.bind(this, record)}
                          onPressEnter={this.handleTagInputEnter.bind(this, record)}
                        />
                      ) : (
                        <Tag
                          className="site-tag-plus"
                          onClick={(event) => {
                            record.tagInputVisible = true;
                            this.forceUpdate(() => {
                              this.tagInputRef.current.focus();
                            });
                          }}
                        >
                          <PlusOutlined /> newTag
                        </Tag>
                      )}
                    </>
                  ),
                }}
              />
            </Space>
          </TabPane>
          <TabPane key="only" tab="静态属性">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                onClick={this.showAddModal}
                disabled={!this.state.goods_cat_threeId}
              >
                添加属性
              </Button>
              <Table
                bordered
                columns={this.columns}
                dataSource={this.state.defaultStaticAttributes}
                rowKey={(record) => record.attr_id}
                expandable={{
                  defaultExpandAllRows: true,
                  expandedRowRender: (record) => (
                    <>
                      {record.attr_vals.map((value, index) => {
                        return (
                          <Tag
                            key={index}
                            color="blue"
                            visible={true}
                            closable
                            onClose={() => {
                              this.handleTagClose(record, index);
                            }}
                          >
                            {value}
                          </Tag>
                        );
                      })}
                      {record.tagInputVisible ? (
                        <Input
                          ref={this.tagInputRef}
                          className="tag-input"
                          onChange={(event) => {
                            this.handleTagInputChange(event, record);
                          }}
                          onBlur={this.handleTagInputBlur.bind(this, record)}
                          onPressEnter={this.handleTagInputEnter.bind(this, record)}
                        />
                      ) : (
                        <Tag
                          className="site-tag-plus"
                          onClick={(event) => {
                            record.tagInputVisible = true;
                            this.forceUpdate(() => {
                              this.tagInputRef.current.focus();
                            });
                          }}
                        >
                          <PlusOutlined /> newTag
                        </Tag>
                      )}
                    </>
                  ),
                }}
              />
            </Space>
            <Table />
          </TabPane>
        </Tabs>
        <Modal
          destroyOnClose
          title={this.state.activeTabName === "many" ? "添加动态参数" : "添加静态属性"}
          visible={this.state.addModalVisible}
          onOk={this.addParamAndAttribute}
          onCancel={() => {
            this.setState({ addModalVisible: false });
          }}
        >
          <Form ref={this.addFormRef}>
            <Form.Item
              name="attr_name"
              label={this.state.activeTabName === "many" ? "参数名称" : "属性名称"}
              rules={[{ required: true, message: "请输入参数名称" }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={this.state.activeTabName === "many" ? "编辑动态参数" : "编辑静态属性"}
          visible={this.state.editModalVisible}
          destroyOnClose
          onOk={this.editParamAndAttribute}
          onCancel={() => {
            this.setState({ editModalVisible: false });
          }}
        >
          <Form ref={this.editFormRef} initialValues={this.state.editForm}>
            <Form.Item
              name="attr_name"
              label={this.state.activeTabName === "many" ? "参数名称" : "属性名称"}
              rules={[{ required: true, message: "请输入参数名称" }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }
}

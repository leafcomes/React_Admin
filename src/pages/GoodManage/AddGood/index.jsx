import React, { Component } from "react";
import {
  Space,
  Button,
  Alert,
  message,
  Row,
  Col,
  Modal,
  Checkbox,
  Input,
  InputNumber,
  Steps,
  Tabs,
  Form,
  Cascader,
  Upload,
  Empty,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import Editor from "../../../components/Editor";
import { Link } from "react-router-dom";
const { Step } = Steps;
const { TabPane } = Tabs;

export default class AddGood extends Component {
  addGoodFormRef = React.createRef();
  // 添加商品的表单数据限制规则
  addGoodFormRules = {
    goods_name: [{ required: true, message: "请输入商品名称" }],
    goods_price: [{ required: true, message: "请输入一组数字" }],
    goods_weight: [{ required: true, message: "请输一组数字" }],
    goods_number: [{ required: true, message: "请输入一组数字" }],
    goods_cat: [{ required: true, message: "请选择商品分类，目前仅只支持三级分类" }],
  };
  state = {
    // 当前步骤条和标签页所处位置
    currentStepAndTab: 0,
    // 上传图片的URL地址
    uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
    // 图片上传组件的headers请求头对象
    headerObj: {
      Authorization: window.sessionStorage.getItem("token"),
    },
    // 添加商品的初始化表单数据对象
    addGoodForm: {
      goods_name: "",
      goods_price: 1,
      goods_weight: 1,
      goods_number: 1,
      // 商品所属的分类数组,包括一级分类，二级分类，三级分类
      goods_cat: [],
      // 商品图片的数组
      pics: [],
      // 商品的详情描述
      goods_introduce: "",
      // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
      attrs: [],
    },
    // 单一类别下商品的所有默认动态参数列表数据
    defaultDynamicParams: [],
    // 单一类别下商品的所有默认静态属性列表数据
    defaultStaticAttributes: [],
    // 复选框选中的动态参数
    checkedDynamicParams: [],
    // 输入框中的静态属性
    inputStaticAttributes: [],
    // 商品分类列表
    cateList: [],
    imgPreviewModalVisible: false,
    imgPreviewModalTitle: "图片预览",
    imgPreviewUrl: "",
  };
  // tab被点击时的回调
  onTabClick = (activeKey) => {
    // 跳转至其他标签页时必须通过商品基本信息表单的验证通过
    this.addGoodFormRef.current
      .validateFields()
      .then(() => {
        // 如果激活的tab标签页为基本参数，则请求获得参数的函数
        if (+activeKey === 1) {
          this.getDefaultDynamicParams();
        } else if (+activeKey === 2) {
          this.getDefaultStaticAttributes();
        }
        this.setState({ currentStepAndTab: +activeKey });
      })
      .catch(() => {
        return message.error("请先完成基本信息的填写");
      });
  };
  // 图片上传时的状态改变回调,上传中、完成、失败都会调用这个函数。
  handleChange = (changer) => {
    const { file } = changer;
    if (file.status === "done") {
      this.handleSuccess(file.response);
      return message.success("图片上传成功");
    }
  };
  // 监听图片上传成功的事件;
  handleSuccess = (response) => {
    // 1. 拼接得到一个图片信息对象
    const picInfo = { pic: response.data.tmp_path };
    // 2. 将图片信息对象，push 到pics数组中
    this.state.addGoodForm.pics.push(picInfo);
  };
  handleRemove = (file) => {
    // 1. 获取将要删除的图片的临时路径
    const filePath = file.response.data.tmp_path;
    // 2. 从 pics 数组中，找到这个图片对应的索引值
    const i = this.state.addGoodForm.pics.findIndex((x) => x.pic === filePath);
    // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
    const result = this.state.addGoodForm.pics.splice(i, 1);
    return result.length === 0 ? message.error("删除失败！") : true;
    // 亦可采用以下方法
    // this.state.addGoodForm.pics = this.state.addGoodForm.pics.filter((picObj) => {
    //  return  picObj.pic !== filePath;
    // })
  };
  handlePreview = (file) => {
    this.setState({
      imgPreviewModalVisible: true,
      imgPreviewModalTitle: file.name,
      imgPreviewUrl: file.response.data.url,
    });
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
  // 获取单一类别下的商品默认所有动态参数数据
  getDefaultDynamicParams = async () => {
    try {
      // 只能通过商品所属的第三级分类ID查询
      const goods_cat = this.addGoodFormRef.current.getFieldValue("goods_cat");
      const cateId = goods_cat.length === 3 ? goods_cat[2] + 0 : null;
      // 通过 only 或 many 来获取分类静态属性还是动态参数
      const { data: res } = await axios.get(`categories/${cateId}/attributes`, {
        params: { sel: "many" },
      });
      if (res.meta.status !== 200) {
        return message.error("获取动态参数列表失败！");
      }
      // 响应数据的动态参数列表为以逗号分隔的字符串
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
      });
      this.setState({ defaultDynamicParams: res.data });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  // 当复选框内容发生变化时更新checked状态的动态参数,由于attr_vals字段名的值是默认值，在这使用attr_value字段名代表以后更新的值
  updateCheckedDynamicParams = (checkedValues, index, attr_id) => {
    this.state.checkedDynamicParams[index] = {
      attr_id,
      attr_value: checkedValues.join(","),
    };
  };
  // 获取单一类别下的商品默认所有静态属性数据
  getDefaultStaticAttributes = async () => {
    try {
      // 只能通过商品所属的第三级分类ID查询
      const goods_cat = this.addGoodFormRef.current.getFieldValue("goods_cat");
      const cateId = goods_cat.length === 3 ? goods_cat[2] + 0 : null;
      // 通过 only 或 many 来获取分类静态属性还是动态参数
      const { data: res } = await axios.get(`categories/${cateId}/attributes`, {
        params: { sel: "only" },
      });
      if (res.meta.status !== 200) {
        return message.error("获取静态属性列表失败！");
      }
      // 初始化输入框内的静态属性值,由于attr_vals字段名的值是默认值，在这使用attr_value字段名代表以后更新的值
      res.data.forEach((item, index) => {
        this.state.inputStaticAttributes[index] = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals,
        };
      });
      this.setState({ defaultStaticAttributes: res.data });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  // 当输入框静态属性内容发生变化时的回调,由于attr_vals字段名的值是默认值，在这使用attr_value字段名代表以后更新的值
  updateInputStaticAttributes = (attr_value, attr_id, index) => {
    this.state.inputStaticAttributes[index] = {
      attr_id,
      attr_value,
    };
  };
  addGood = async (params) => {
    this.addGoodFormRef.current
      .validateFields()
      .then(async (value) => {
        try {
          // 将cateId数组处理为以逗号为分隔的字符串
          value.goods_cat = value.goods_cat.join(",");
          const { data: res } = await axios.post("goods", {
            ...value,
            pics: this.state.addGoodForm.pics,
            attrs: [...this.state.inputStaticAttributes, ...this.state.checkedDynamicParams],
          });
          if (res.meta.status !== 201) {
            return message.error("添加商品失败！");
          }
          message.success("添加商品成功！");
          this.props.history.push("/goods");
        } catch (error) {
          return message.error(error.message);
        }
      })
      .catch(() => {
        return;
      });
  };

  componentDidMount() {
    this.getCateList();
  }
  render() {
    return (
      <>
        <Space direction="vertical" size="large">
          <Alert type="info" message="添加商品信息" className="tc" />
          <Steps current={this.state.currentStepAndTab} status="process">
            <Step title="基本信息"></Step>
            <Step title="商品参数"></Step>
            <Step title="商品属性"></Step>
            <Step title="商品图片"></Step>
            <Step title="商品内容"></Step>
            <Step title="完成"></Step>
          </Steps>
          <Form ref={this.addGoodFormRef} initialValues={this.state.addGoodForm}>
            <Tabs
              tabPosition="left"
              onTabClick={this.onTabClick}
              activeKey={this.state.currentStepAndTab + ""}
            >
              <TabPane tab="基本信息" key={0}>
                <Form.Item
                  label="商品名称"
                  name="goods_name"
                  rules={this.addGoodFormRules.goods_name}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="商品价格"
                  name="goods_price"
                  rules={this.addGoodFormRules.goods_price}
                >
                  <InputNumber
                    min="1"
                    keyboard
                    addonBefore="￥"
                    addonAfter="RMB"
                    className="w100p"
                  />
                </Form.Item>
                <Form.Item
                  label="商品重量"
                  name="goods_weight"
                  rules={this.addGoodFormRules.goods_weight}
                >
                  <InputNumber min="1" keyboard addonAfter="克" className="w100p" />
                </Form.Item>
                <Form.Item
                  label="商品数量"
                  name="goods_number"
                  rules={this.addGoodFormRules.goods_number}
                >
                  <InputNumber min="1" keyboard addonAfter="个" className="w100p" />
                </Form.Item>
                <Form.Item
                  label="商品分类"
                  name="goods_cat"
                  rules={this.addGoodFormRules.goods_cat}
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
                  />
                </Form.Item>
              </TabPane>
              <TabPane tab="商品参数" key={1}>
                {this.state.defaultDynamicParams.length === 0 ? (
                  <Empty description="该商品类别目前暂无动态参数，可去分类参数栏目先创建">
                    <Link to="/params">点我跳转</Link>
                  </Empty>
                ) : (
                  this.state.defaultDynamicParams.map((param, index) => {
                    return (
                      <Form.Item
                        label={param.attr_name}
                        labelCol={{ span: 24 }}
                        key={param.attr_id}
                      >
                        <Checkbox.Group
                          key={param.attr_id}
                          className="w100p"
                          onChange={(checkedValues) => {
                            this.updateCheckedDynamicParams(checkedValues, index, param.attr_id);
                          }}
                        >
                          <Row key={param.attr_id}>
                            {param.attr_vals.map((attr, index) => {
                              return (
                                <Col span={8} key={index}>
                                  <Checkbox value={attr} key={index} className=".m10">
                                    {attr}
                                  </Checkbox>
                                </Col>
                              );
                            })}
                          </Row>
                        </Checkbox.Group>
                      </Form.Item>
                    );
                  })
                )}
              </TabPane>
              <TabPane tab="商品属性" key={2}>
                {this.state.defaultStaticAttributes.length === 0 ? (
                  <Empty description="该商品类别目前暂无静态属性，可去分类参数栏目先创建">
                    <Link to="/params">点我跳转</Link>
                  </Empty>
                ) : (
                  this.state.defaultStaticAttributes.map((attribute, index) => {
                    return (
                      <Form.Item
                        labelCol={{ span: 6 }}
                        label={attribute.attr_name}
                        key={attribute.attr_id}
                      >
                        <Input
                          defaultValue={attribute.attr_vals}
                          onChange={(e) => {
                            this.updateInputStaticAttributes(
                              e.target.value,
                              attribute.attr_id,
                              index
                            );
                          }}
                        />
                      </Form.Item>
                    );
                  })
                )}
              </TabPane>
              <TabPane tab="商品图片" key={3}>
                <Upload
                  multiple
                  headers={this.state.headerObj}
                  action={this.state.uploadURL}
                  className="upload-list-inline"
                  listType="picture"
                  onPreview={this.handlePreview}
                  onChange={this.handleChange}
                  onRemove={this.handleRemove}
                >
                  <Button icon={<UploadOutlined />} type="primary" >
                    上传图片
                  </Button>
                </Upload>
              </TabPane>
              <TabPane tab="商品介绍" key={4}>
                <Form.Item name="goods_introduce">
                  <Editor placeholder="写些介绍吧..." />
                </Form.Item>
                <Button onClick={this.addGood} type="primary" size="large">
                  确认添加
                </Button>
              </TabPane>
            </Tabs>
          </Form>
        </Space>
        <Modal
          title={this.state.imgPreviewModalTitle}
          visible={this.state.imgPreviewModalVisible}
          footer={null}
          onCancel={() => {
            this.setState({ imgPreviewModalVisible: false });
          }}
        >
          <img src={this.state.imgPreviewUrl} width="100%" />
        </Modal>
      </>
    );
  }
}

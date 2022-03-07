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
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import Editor from "../../../components/Editor";
import { Link } from "react-router-dom";
import Marquee from "react-fast-marquee";

const { Step } = Steps;
const { TabPane } = Tabs;

export default class EditGood extends Component {
  editGoodFormRef = React.createRef();
  // 编辑商品的表单数据限制规则
  editGoodFormRules = {
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
    // 商品id
    goods_id: "",
    // 编辑商品的表单数据对象
    editGoodForm: {
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

    // 单一类别下的商品默认的所有动态参数列表数据
    defaultDynamicParams: [],
    // 单一类别下的商品默认的所有静态属性列表数据
    defaultStaticAttributes: [],
    // 复选框选中的动态参数对象数组
    checkedDynamicParams: [],
    // 商品已有的动态参数，为字符串数组
    ownDynamicParams: [],
    // 商品已有的静态属性，为以attr_id值作为键名，attr_value为键值的对象
    onwStaticAttributes: {},
    // 输入框中的静态属性对象数组
    inputStaticAttributes: [],
    // 商品分类列表
    cateList: [],
    // 预览图片的窗口
    imgPreviewModalVisible: false,
    imgPreviewModalTitle: "图片预览",
    imgPreviewUrl: "",
    // 商品所属分类的三级ID
    goods_cat_threeId: "",
    // 已上传的商品图片列表
    uploadedPics: [],
  };

  // tab被点击时的回调
  onTabClick = (activeKey) => {
    // 跳转至其他标签页时必须通过商品基本信息表单的验证通过
    this.editGoodFormRef.current
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
    this.state.editGoodForm.pics.push(picInfo);
  };
  handleRemove = async (file) => {
    try {
      // 1. 获取将要删除的图片的ID
      const { pics_id } = file;
      this.state.editGoodForm.pics = this.state.editGoodForm.pics.filter((pic) => {
        return pic.pics_id !== pics_id;
      });
      const { data: res } = await axios.put(
        `goods/${this.state.goods_id}/pics`,
        this.state.editGoodForm.pics
      );

      if (res.meta.status !== 200) {
        return message.error("删除失败");
      }
    } catch (error) {
      message.error(error.message);
    }
  };
  handlePreview = (file) => {
    // 对新上传的临时图片及已上传的图片，其接受的的file对象不同
    const imgPreviewUrl = file.response ? file.response.data.url : file.url;
    this.setState({
      imgPreviewModalVisible: true,
      imgPreviewModalTitle: "图片预览",
      imgPreviewUrl,
    });
  };
  // 根据url地址上的商品ID获取商品信息
  getGoodInfo = async () => {
    const { goods_id } = this.props.match.params;
    this.setState({ goods_id });
    try {
      const { data: res } = await axios.get(`goods/${goods_id}`);
      if (res.meta.status !== 200) {
        return message.error("获取商品信息失败！");
      }
      this.initEditGoodForm(res.data);
      return message.success("获取商品信息成功！");
    } catch (error) {}
  };
  // 将表单数据处理为editGoodForm的形式
  initEditGoodForm(formData) {
    let {
      goods_cat,
      goods_name,
      goods_number,
      goods_price,
      goods_weight,
      goods_introduce,
      pics,
      attrs,
      cat_three_id,
    } = formData;
    // split 得到的字符数组不能绑定到级联选择器，需要map转数字数组
    goods_cat = goods_cat.split(",").map(Number);
    const editGoodForm = {
      goods_cat,
      goods_name,
      goods_number,
      goods_price,
      goods_weight,
      goods_introduce,
    };
    // 处理attrs得到该商品的静态参数列表和动态参数列表
    const inputStaticAttributes = attrs
      .filter((attr) => attr.attr_sel === "only")
      .map((attr) => {
        this.state.onwStaticAttributes[attr.attr_id] = attr.attr_value;
        return {
          attr_id: attr.attr_id,
          attr_value: attr.attr_value,
        };
      });
    const checkedDynamicParams = attrs
      .filter((attr) => attr.attr_sel === "many")
      .map((param) => ({
        // 商品已选择的动态参数
        attr_value: param.attr_value,
        attr_id: param.attr_id,
      }));
    const ownDynamicParams = attrs
      .filter((attr) => attr.attr_sel === "many")
      .map((attr) => attr.attr_value.split(","));
    const uploadedPics = pics.map((pic) => ({
      thumbUrl: pic.pics_sma_url,
      url: pic.pics_big_url,
      uid: pic.pics_id,
      pics_id: pic.pics_id,
      goods_id: pics.goods_id,
      pic_big: pic.pics_big,
      pic_mid: pic.pic_mid,
      pic_sma: pic.pic_sma,
    }));
    this.state.editGoodForm.pics.push(...uploadedPics);
    this.setState({
      goods_cat_threeId: cat_three_id,
      inputStaticAttributes,
      checkedDynamicParams,
      ownDynamicParams,
      uploadedPics,
    });
    this.editGoodFormRef.current.setFieldsValue(editGoodForm);
  }
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
  // 获取该商品所属类别下的所有默认的动态参表对象
  getDefaultDynamicParams = async () => {
    try {
      // 只能通过商品所属的第三级分类ID查询
      const { data: res } = await axios.get(
        `categories/${this.state.goods_cat_threeId}/attributes`,
        {
          params: { sel: "many" },
        }
      );
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
  // 当复选框内容发生变化时更新checked状态的动态参数
  updateCheckedDynamicParams = (checkedValues, index, attr_id) => {
    this.state.checkedDynamicParams[index] = {
      attr_id,
      attr_value: checkedValues.join(","),
    };
  };
  // 获取该商品所属类别下的所有默认的静态属性对象
  getDefaultStaticAttributes = async () => {
    try {
      // 只能通过商品所属的第三级分类ID查询
      // 通过 only 或 many 来获取分类静态属性还是动态参数
      const { data: res } = await axios.get(
        `categories/${this.state.goods_cat_threeId}/attributes`,
        {
          params: { sel: "only" },
        }
      );
      if (res.meta.status !== 200) {
        return message.error("获取静态属性列表失败！");
      }
      this.setState({ defaultStaticAttributes: res.data });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };

  // 当输入框静态属性内容发生变化时的回调
  updateInputStaticAttributes = (attr_value, attr_id, index) => {
    const { inputStaticAttributes } = this.state;
    // 如果传递的参数包含index，则直接通过index更新attr_value，否则通过遍历更新attr_value
    if (inputStaticAttributes[index].attr_id === attr_id) {
      inputStaticAttributes[index].attr_value = attr_value;
    } else {
      inputStaticAttributes[inputStaticAttributes.length] = {
        attr_id,
        attr_value,
      };
    }
  };
  editGood = async (params) => {
    this.editGoodFormRef.current
      .validateFields()
      .then(async (value) => {
        try {
          // 将cateId数组处理为以逗号为分隔的字符串
          value.goods_cat = value.goods_cat.join(",");
          const test = {
            ...value,
            pics: this.state.editGoodForm.pics,
            attrs: [...this.state.inputStaticAttributes, ...this.state.checkedDynamicParams],
          };
          const { data: res } = await axios.put(`goods/${this.state.goods_id}`, {
            ...value,
            pics: this.state.editGoodForm.pics,
            attrs: [...this.state.inputStaticAttributes, ...this.state.checkedDynamicParams],
          });
          if (res.meta.status !== 200) {
            return message.error("编辑商品失败！");
          }
          message.success("编辑商品成功！");
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
    this.getGoodInfo();
    this.getCateList();
  }
  render() {
    const UploadButton = (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>点击上传</div>
      </div>
    );
    return (
      <>
        <Space direction="vertical" size="large">
          <Alert type="info" message="编辑商品信息" className="tc" />
          <Steps current={this.state.currentStepAndTab} status="process">
            <Step title="基本信息"></Step>
            <Step title="商品参数"></Step>
            <Step title="商品属性"></Step>
            <Step title="商品图片"></Step>
            <Step title="商品内容"></Step>
            <Step title="完成"></Step>
          </Steps>
          <Form ref={this.editGoodFormRef} initialValues={this.state.editGoodForm}>
            <Tabs
              tabPosition="left"
              onTabClick={this.onTabClick}
              activeKey={this.state.currentStepAndTab + ""}
            >
              <TabPane tab="基本信息" key={0}>
                <Form.Item
                  label="商品名称"
                  name="goods_name"
                  rules={this.editGoodFormRules.goods_name}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="商品价格"
                  name="goods_price"
                  rules={this.editGoodFormRules.goods_price}
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
                  rules={this.editGoodFormRules.goods_weight}
                >
                  <InputNumber min="1" keyboard addonAfter="克" className="w100p" />
                </Form.Item>
                <Form.Item
                  label="商品数量"
                  name="goods_number"
                  rules={this.editGoodFormRules.goods_number}
                >
                  <InputNumber min="1" keyboard addonAfter="个" className="w100p" />
                </Form.Item>
                <Form.Item
                  label="商品分类"
                  name="goods_cat"
                  rules={this.editGoodFormRules.goods_cat}
                  normalize={(value) => {
                    return value.length === 3 ? value : [];
                  }}
                >
                  <Cascader
                    disabled
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
                  <Empty description="该商品目前暂无动态参数，可去分类参数栏目先创建">
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
                          defaultValue={this.state.ownDynamicParams[index]}
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
                  <Empty description="该商品目前暂无静态属性，可去分类参数栏目先创建后再编辑">
                    <Link to="params">点我跳转</Link>
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
                          defaultValue={this.state.onwStaticAttributes[attribute.attr_id]}
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
                  defaultFileList={this.state.uploadedPics}
                  headers={this.state.headerObj}
                  action={this.state.uploadURL}
                  className="upload-list-inline"
                  listType="picture-card"
                  accept="image/*"
                  onPreview={this.handlePreview}
                  onChange={this.handleChange}
                  onRemove={this.handleRemove}
                >
                  {/* <Button icon={<UploadOutlined />} type="primary">
                    上传图片
                  </Button> */}
                  {UploadButton}
                </Upload>
              </TabPane>
              <TabPane tab="商品介绍" key={4}>
                <Form.Item name="goods_introduce">
                  <Editor placeholder="写些介绍吧..." />
                </Form.Item>
                <Button onClick={this.editGood} type="primary" size="large">
                  确认编辑
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

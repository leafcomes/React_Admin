import React, { Component } from "react";
import {
  Button,
  Tooltip,
  Table,
  Switch,
  Space,
  message,
  Pagination,
  Input,
  Modal,
  Form,
  Popconfirm,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import axios from "axios";
const { Search } = Input;
const { Option } = Select;
export default class Users extends Component {
  addUserFormRef = React.createRef();
  editUserFormRef = React.createRef();
  columns = [
    {
      title: "#",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "姓名",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "电话",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "角色",
      dataIndex: "role_name",
      key: "role_name",
    },
    {
      title: "状态",
      dataIndex: "mg_status",
      key: "mg_state",
      render: (text, record) => (
        <Switch
          checked={record.mg_state}
          onChange={(checked) => this.onStateChange(record, checked)}
        />
      ),
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      render: (text, record) => (
        <Space>
          <Tooltip title="修改用户" color="blue">
            <Button
              icon={<EditOutlined />}
              className="primaryStyle"
              onClick={() => {
                this.showEditUserModal(record.id);
              }}
            />
          </Tooltip>
          <Tooltip title="分配角色" color="orange">
            <Button
              icon={<SettingOutlined />}
              className="warningStyle"
              onClick={() => {
                this.showSetRoleModal(record);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="此操作将永久删除用户，是否继续?"
            onConfirm={() => {
              this.removeUserById(record.id);
            }}
          >
            <Tooltip title="删除用户" color="red">
              <Button icon={<DeleteOutlined />} className="dangerStyle" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  // 验证邮箱的正则表达式
  regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
  // 验证手机号的正则表达式
  regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
  registerRules = {
    username: [
      { required: true, message: "请输入用户名" },
      {
        min: 3,
        max: 10,
        message: "用户名的长度在3~10个字符之间",
      },
    ],
    password: [
      { required: true, message: "请输入密码" },
      {
        min: 6,
        max: 15,
        message: "密码的长度在6~15个字符之间",
      },
    ],
    email: [
      { required: true, message: "请输入邮箱" },
      { pattern: this.regEmail, message: "请输入合法的邮箱" },
    ],
    mobile: [
      { required: true, message: "请输入手机号" },
      { pattern: this.regMobile, message: "请输入合法的手机号" },
    ],
  };
  state = {
    queryInfo: {
      query: "",
      // 当前的页数
      pagenum: 1,
      // 当前每页显示多少条数据
      pagesize: 2,
    },
    userList: [],
    userTotal: 0,
    addUserModalVisible: false,
    editUserModalVisible: false,
    setRoleModalVisible: false,
    // 需要被编辑用户的表单信息
    editUserForm: {},
    // 需要被分配角色的用户的信息
    userRoleInfo: {},
    // 所有角色的数据列表
    roleList: [],
    selectedRoleId: "",
  };

  getUserList = async () => {
    try {
      const { data: res } = await axios.get("users", {
        params: this.state.queryInfo,
      });
      if (res.meta.status !== 200) {
        return message.error("获取用户列表失败！");
      }
      this.setState({ userList: res.data.users, userTotal: res.data.total });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  resetSearch = (event) => {
    if (event.target.value === "") {
      this.state.queryInfo.query = "";
      this.getUserList();
    }
  };
  searchUser = (username) => {
    this.state.queryInfo.query = username;
    this.getUserList();
  };

  // 监听Switch开关状态的变化
  onStateChange = async (userInfo, checked) => {
    try {
      const { data: res } = await axios.put(
        `users/${userInfo.id}/state/${checked}`
      );
      if (res.meta.status !== 200) {
        return message.error("更新用户状态失败！");
      }
      this.getUserList();
      message.success("更新用户状态成功！");
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  // 页码或pagesize改变时的回调函数
  onPageChange = (page, pagesize) => {
    this.state.queryInfo.pagenum = page;
    this.state.queryInfo.pagesize = pagesize;
    this.getUserList();
  };

  addUserModalClosed = () => {
    this.setState({ addUserModalVisible: false });
    this.addUserFormRef.current.resetFields();
  };
  // 添加用户
  addUser = (params) => {
    this.addUserFormRef.current
      .validateFields()
      .then(async (value) => {
        try {
          const { data: res } = await axios.post("users", value);
          if (res.meta.status !== 201) {
            message.error("添加用户失败！");
          }

          message.success("添加用户成功！");
          // 隐藏添加用户的对话框
          this.setState({ addUserModalVisible: false });
          this.getUserList();
        } catch (error) {
          return message.error("网络出错，请稍后重试！");
        }
      })
      .catch(() => {
        return;
      });
  };
  showEditUserModal = async (id) => {
    try {
      const { data: res } = await axios.get("users/" + id);
      if (res.meta.status !== 200) {
        return message.error("查询用户信息失败！");
      }
      this.setState({ editUserModalVisible: true, editUserForm: res.data });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  editUserModalClosed = () => {
    // this.editUserFormRef.current.resetFields([{
    //   name: "username",
    //   value: this.state.editUserForm.username
    // }]);
    this.setState({ editUserModalVisible: false });
  };
  editUser = () => {
    this.editUserFormRef.current
      .validateFields()
      .then(async (value) => {
        try {
          // 发起修改用户信息的数据请求
          const { data: res } = await axios.put(
            "users/" + this.state.editUserForm.id,
            {
              email: value.email,
              mobile: value.mobile,
            }
          );
          if (res.meta.status !== 200) {
            return message.error("更新用户信息失败！");
          }
          // 隐藏修改用户的对话框
          this.setState({ editUserModalVisible: false });
          this.getUserList();
          message.success("更新用户信息成功");
        } catch (error) {
          return message.error("网络出错，请稍后重试！");
        }
      })
      .catch(() => {
        return;
      });
  };

  removeUserById = async (id) => {
    try {
      const { data: res } = await axios.delete("users/" + id);
      if (res.meta.status !== 200) {
        return message.error("删除用户失败！");
      }
      message.success("删除用户成功！");
      this.getUserList();
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };

  showSetRoleModal = async (userInfo) => {
    try {
      this.state.userRoleInfo = userInfo;
      // 在展示对话框之前，获取所有角色的列表
      const { data: res } = await axios.get("roles");
      if (res.meta.status !== 200) {
        return message.error("获取角色列表失败！");
      }
      this.state.roleList = res.data;
      this.setState({ setRoleModalVisible: true });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };

  setRoleModalClosed = (params) => {
    this.setState({ setRoleModalVisible: false });
  };
  saveUserRoleId = (id) => {
    this.state.selectedRoleId = id;
  };
  setUserRole = async () => {
    if (!this.state.selectedRoleId) {
      return message.error("请选择要分配的角色！");
    }
    try {
      const { data: res } = await axios.put(
        `users/${this.state.userRoleInfo.id}/role`,
        {
          rid: this.state.selectedRoleId,
        }
      );
      if (res.meta.status !== 200) {
        return message.error("更新用户角色失败！");
      }
      message.success("更新用户角色成功！");
      this.getUserList();
      this.setState({ setRoleModalVisible: false });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  componentDidMount() {
    this.getUserList();
  }
  render() {
    return (
      <>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space size="large">
            <Search
              size="large"
              allowClear
              placeholder="请输入用户名"
              onChange={this.resetSearch}
              onSearch={this.searchUser}
            />
            <Button
              type="primary"
              size="large"
              onClick={() => {
                this.setState({ addUserModalVisible: true });
              }}
            >
              添加用户
            </Button>
          </Space>
          <Table
            columns={this.columns}
            dataSource={this.state.userList}
            rowKey={(record) => record.id}
            pagination={{ position: ["none"] }}
            bordered
          />
          <Pagination
            total={this.state.userTotal}
            current={this.state.queryInfo.pagenum}
            size="small"
            pageSizeOptions={[1, 2, 5, 10]}
            defaultPageSize={this.state.queryInfo.pagesize}
            showSizeChanger
            onChange={this.onPageChange}
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
          />
        </Space>
        <Modal
          visible={this.state.addUserModalVisible}
          title="添加用户"
          onOk={this.addUser}
          onCancel={this.addUserModalClosed}
        >
          <Form labelCol={{ span: 3 }} ref={this.addUserFormRef}>
            <Form.Item
              label="用户名"
              name="username"
              rules={this.registerRules.username}
              validateTrigger={["onChange", "onSubmit"]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={this.registerRules.password}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="邮箱"
              name="email"
              rules={this.registerRules.email}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="手机"
              name="mobile"
              rules={this.registerRules.mobile}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="修改用户"
          visible={this.state.editUserModalVisible}
          onCancel={this.editUserModalClosed}
          onOk={this.editUser}
          destroyOnClose
        >
          <Form
            initialValues={this.state.editUserForm}
            labelCol={{ span: 3 }}
            ref={this.editUserFormRef}
          >
            <Form.Item name="username" label="用户名">
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              name="email"
              label="邮箱"
              rules={this.registerRules.email}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="mobile"
              label="手机号"
              rules={this.registerRules.mobile}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="分配角色"
          visible={this.state.setRoleModalVisible}
          onCancel={this.setRoleModalClosed}
          onOk={this.setUserRole}
          destroyOnClose
        >
          <div>
            <p>当前的用户：{this.state.userRoleInfo.username}</p>
            <p>当前的角色：{this.state.userRoleInfo.role_name}</p>
            <span>分配新角色：</span>
            <Select
              style={{ width: 120 }}
              onSelect={this.saveUserRoleId}
              placeholder="请选择"
            >
              {this.state.roleList.map((role) => {
                return <Option key={role.id}>{role.roleName}</Option>;
              })}
            </Select>
          </div>
        </Modal>
      </>
    );
  }
}

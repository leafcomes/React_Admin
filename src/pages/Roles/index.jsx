import React, { Component } from "react";
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
import {
  CaretRightOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { confirm } = Modal;
const { TreeNode } = Tree;
export default class Roles extends Component {
  addRoleFormRef = React.createRef();
  editRoleFormRef = React.createRef();
  // 用于添加角色时的限制规则
  roleRules = {
    roleName: [{ required: true, message: "请输入角色名称" }],
    roleDesc: [{ required: true, message: "请输入角色描述" }],
  };
  columns = [
    {
      title: "#",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "角色名称",
      key: "roleName",
      dataIndex: "roleName",
    },
    {
      title: "角色描述",
      key: "roleDesc",
      dataIndex: "roleDesc",
    },
    {
      title: "操作",
      key: "operation",
      render: (text, record) => {
        return (
          <Space>
            <Button
              className="primaryStyle"
              onClick={() => {
                this.showEditRoleModal(record.id);
              }}
            >
              编辑
            </Button>
            <Button
              className="warningStyle"
              onClick={() => {
                this.showAllotRightModal(record);
              }}
            >
              分配权限
            </Button>
            <Button
              className="dangerStyle"
              onClick={() => {
                this.showRemoveRoleConfirm(record.id);
              }}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];
  state = {
    // 控制tag标签的显示与隐藏
    tagVisible: true,
    // 控制删除权限的对话框的显示与隐藏
    removeRightConfirmVisible: false,
    removeRoleConfirmVisible: false,
    addRoleModalVisible: false,
    editRoleModalVisible: false,
    allotRightModalVisible: false,
    // 所有被选中、叶子节点的key和半选中节点的key
    allCheckedKeys: [],
    // 所有角色列表数据
    roleList: [],
    // 所有权限列表数据
    rightList: [],
    // 修改角色的表单数据
    editRoleForm: {
      roleName: "",
      roleDesc: "",
    },
    // 角色的已分配三级（叶子）权限
    roleLeafRightIds: [],
    // 需要被分配权限的角色Id
    RoleIdOfAllotRight: "",
  };
  getRoleList = async (params) => {
    try {
      const { data: res } = await axios.get("roles");
      if (res.meta.status !== 200) {
        return message.error("获取角色列表失败！");
      }
      this.setState({ roleList: res.data });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  getRightList = async (params) => {
    try {
      const { data: res } = await axios.get("rights/tree");
      if (res.meta.status !== 200) {
        return message.error("获取权限列表失败！");
      }
      this.setState({ roleList: res.data });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  getRoleLeafRightIds = (role, rightIdList = []) => {
    role.children.forEach((right) => {
      if (right.children === undefined) {
        return rightIdList.push(right.id);
      }
      this.getRoleLeafRightIds(right, rightIdList);
    });
    return rightIdList;
  };
  showRemoveRightConfirm = (role, rightId) => {
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "该操作会删除该角色下的当前权限及其子级权限，是否继续?",
      onOk: () => {
        this.removeRightById(role, rightId);
      },
      onCancel: () => {
        message.info("已取消删除！");
      },
    });
  };
  showRemoveRoleConfirm = (roleId) => {
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "该操作会删除该角色，是否继续?",
      onOk: () => {
        this.removeRoleById(roleId);
      },
      onCancel: () => {
        message.info("已取消删除！");
      },
    });
  };
  showEditRoleModal = async (roleId) => {
    try {
      const { data: res } = await axios.get(`roles/${roleId}`);

      if (res.meta.status !== 200) {
        return message.error("获取角色信息失败");
      }

      this.setState({ editRoleModalVisible: true, editRoleForm: res.data });
    } catch (error) {
      message.error("网络出错，请稍后重试！");
    }
  };
  showAllotRightModal = async (role) => {
    try {
      const { data: res } = await axios.get("rights/tree");

      if (res.meta.status !== 200) {
        return message.error("获取权限列表失败");
      }
      const roleLeafRightIds = this.getRoleLeafRightIds(role);
      
      this.setState({
        allotRightModalVisible: true,
        rightList: res.data,
        roleLeafRightIds,
        RoleIdOfAllotRight: role.id,
      });
    } catch (error) {
      message.error(error.message);
      // message.error("网络出错，请稍后重试！");
    }
  };
  removeRightById = async (role, rightId) => {
    // 根据Id删除对应的权限
    try {
      const { data: res } = await axios.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return message.error("删除权限失败！");
      }
      this.getRoleList();
      return message.success("删除权限成功！");
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  removeRoleById = async (roleId) => {
    try {
      const { data: res } = await axios.delete(`roles/${roleId}`);

      if (res.meta.status !== 200) {
        return message.error("删除角色失败!");
      }
      this.getRoleList();
      return message.success("删除角色成功！");
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  addRole = async () => {
    this.addRoleFormRef.current
      .validateFields()
      .then(async (value) => {
        try {
          // 发起添加角色信息的数据请求
          const { data: res } = await axios.post("roles", {
            roleName: value.roleName,
            roleDesc: value.roleDesc,
          });

          if (res.meta.status !== 201) {
            return message.error("添加角色失败！");
          }
          // 隐藏添加角色的对话框
          this.setState({ addRoleModalVisible: false });
          this.getRoleList();
          message.success("添加角色信息成功");
        } catch (error) {
          return message.error("网络出错，请稍后重试！");
        }
      })
      .catch(() => {
        return;
      });
  };
  editRole = async () => {
    this.editRoleFormRef.current
      .validateFields()
      .then(async (value) => {
        try {
          // 发起修改角色信息的数据请求
          const { data: res } = await axios.put(
            `roles/${this.state.editRoleForm.roleId}`,
            {
              roleName: value.roleName,
              roleDesc: value.roleDesc,
            }
          );
          if (res.meta.status !== 200) {
            return message.error("更新角色信息失败！");
          }
          // 隐藏修改角色信息的对话框
          this.setState({ editRoleModalVisible: false });
          this.getRoleList();
          message.success("更新角色信息成功");
        } catch (error) {
          return message.error("网络出错，请稍后重试！");
        }
      })
      .catch(() => {
        return;
      });
  };

  allotRight = async () => {
    try {
      const idStr = this.state.allCheckedKeys.join(",");
      const { data: res } = await axios.post(`roles/${this.state.RoleIdOfAllotRight}/rights`, {
        rids: idStr,
      });
      if(res.meta.status !== 200){
        
        return message.error("分配权限失败！")
      }
      this.getRoleList();
      this.setState({allotRightModalVisible: false})
      message.success("分配权限成功")
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };

  componentDidMount() {
    this.getRoleList();
  }
  render() {
    return (
      <>
        <Space direction="vertical">
          <Button
            type="primary"
            onClick={() => {
              this.setState({ addRoleModalVisible: true });
            }}
          >
            添加角色
          </Button>
          <Table
            columns={this.columns}
            rowKey={(record) => record.id}
            dataSource={this.state.roleList}
            expandable={{
              childrenColumnName: "authName",
              expandedRowRender: (record) => {
                return record.children.map((right) => {
                  return (
                    // 渲染一级权限
                    <Row align="middle" key={right.id}>
                      <Col span={6}>
                        <Tag
                          closable
                          visible={this.state.tagVisible}
                          color="blue"
                          onClose={() => {
                            this.showRemoveRightConfirm(record, right.id);
                          }}
                        >
                          {right.authName}
                        </Tag>
                        <CaretRightOutlined />
                      </Col>
                      <Col span={18}>
                        {right.children.map((subItem) => {
                          return (
                            // 渲染二级权限
                            <Row align="middle" key={subItem.id}>
                              <Col span={6}>
                                <Tag
                                  closable
                                  color="green"
                                  visible={this.state.tagVisible}
                                  onClose={() => {
                                    this.showRemoveRightConfirm(
                                      record,
                                      subItem.id
                                    );
                                  }}
                                >
                                  {subItem.authName}
                                </Tag>
                                <CaretRightOutlined />
                              </Col>
                              <Col span={18}>
                                {/* 渲染三级权限 */}
                                <Row>
                                  {subItem.children.map((item) => {
                                    return (
                                      <Col span={6} key={item.id}>
                                        <Tag
                                          closable
                                          color="orange"
                                          visible={this.state.tagVisible}
                                          onClose={() => {
                                            this.showRemoveRightConfirm(
                                              record,
                                              item.id
                                            );
                                          }}
                                        >
                                          {item.authName}
                                        </Tag>
                                      </Col>
                                    );
                                  })}
                                </Row>
                              </Col>
                            </Row>
                          );
                        })}
                      </Col>
                    </Row>
                  );
                });
              },
            }}
            bordered
          ></Table>
        </Space>
        <Modal
          title="添加角色"
          visible={this.state.addRoleModalVisible}
          destroyOnClose
          onOk={this.addRole}
          onCancel={() => {
            this.setState({ addRoleModalVisible: false });
          }}
        >
          <Form ref={this.addRoleFormRef}>
            <Form.Item
              name="roleName"
              label="角色名称"
              rules={this.roleRules.roleName}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="roleDesc"
              label="角色描述"
              rules={this.roleRules.roleDesc}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="编辑角色"
          visible={this.state.editRoleModalVisible}
          destroyOnClose
          onOk={this.editRole}
          onCancel={() => {
            this.setState({ editRoleModalVisible: false });
          }}
        >
          <Form
            initialValues={this.state.editRoleForm}
            ref={this.editRoleFormRef}
          >
            <Form.Item
              name="roleName"
              label="角色名称"
              rules={this.roleRules.roleName}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="roleDesc"
              label="角色描述"
              rules={this.roleRules.roleDesc}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="分配权限"
          visible={this.state.allotRightModalVisible}
          onCancel={() => {
            this.setState({ allotRightModalVisible: false });
          }}
          onOk={this.allotRight}
        >
          <Tree
            style={{ width: "100%" }}
            defaultExpandAll
            checkedKeys={this.state.roleLeafRightIds}
            checkable
            onCheck={(checkedKeys, event) => {
              const allCheckedKeys = [...checkedKeys, ...event.halfCheckedKeys];
              this.setState({ roleLeafRightIds: checkedKeys, allCheckedKeys });
            }}
            treeData={this.state.rightList}
            fieldNames={{ title: "authName", key: "id", children: "children" }}
          />
          {/* <Tree style={{width: '100%'}} defaultExpandAll checkable>
            {this.state.rightList.map((right) => {
              return (
                <TreeNode title={right.authName} value={right.id}>
                  {right.children.map((subItem) => {
                    return (
                      <TreeNode title={subItem.authName} value={subItem.id}>
                        {subItem.children.map((item) => {
                          return (
                            <TreeNode title={item.authName} value={item.id} />
                          );
                        })}
                      </TreeNode>
                    );
                  })}
                </TreeNode>
              );
            })}
          </Tree > */}
        </Modal>
      </>
    );
  }
}

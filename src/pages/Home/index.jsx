import React, { Component } from "react";
import { Link, Route, Switch, Redirect } from "react-router-dom";
import axios from "axios";
import { Layout, Menu, Breadcrumb, BackTop, message, Popover, Button, Avatar } from "antd";
import {
  UserOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  AccountBookOutlined,
  FundOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import "./index.css";
import PrivateRoute from "../../components/PrivateRoute";
import Welcome from "../Welcome";
import Users from "../UserManage/Users";
import Roles from "../RightManage/Roles";
import Rights from "../RightManage/Rights";
import GoodList from "../GoodManage/GoodList";
import AddGood from "../GoodManage/AddGood";
import EditGood from "../GoodManage/EditGood";
import Params from "../GoodManage/Params";
import Categories from "../GoodManage/Categories";
import OrderList from "../OrderManage/OrderList";
import Reports from "../DataStatistics/Reports";
const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;
export default class Home extends Component {
  state = {
    collapsed: false,
    menuList: [],
    iconsObj: {
      125: <UserOutlined />,
      103: <SafetyCertificateOutlined />,
      101: <ShoppingOutlined />,
      102: <AccountBookOutlined />,
      145: <FundOutlined />,
    },
    // 展开的一级菜单项列表
    openKeys: [],
    // 选中的菜单项列表,第一项为二级菜单项，第二项为一级菜单项
    selectedKeys: [],
    // 所有菜单项的id和其authName的映射
    menuIdMap: {},
  };

  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  };
  onOpenChange = (key) => {
    const openKeys = key.length < 1 ? [] : [key[key.length - 1]];
    this.setState({ openKeys });
    window.sessionStorage.setItem("openKeys", JSON.stringify(openKeys));
  };
  onSelect = ({ keyPath }) => {
    this.setState({ selectedKeys: keyPath });
    window.sessionStorage.setItem("selectedKeys", JSON.stringify(keyPath));
  };

  logout = () => {
    window.sessionStorage.clear();
    this.props.history.push("/login");
    message.info("退出成功");
  };
  getMenuList = async (params) => {
    try {
      const { data: res } = await axios.get("menus");
      if (res.meta.status !== 200) return message.error(res.meta.msg);
      this.setMenuIdMap([...res.data]);
      this.setState({ menuList: res.data });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };
  setMenuIdMap = (menuList) => {
    if (menuList) {
      menuList.forEach((menu) => {
        this.state.menuIdMap[menu.id] = menu.authName;
        this.setMenuIdMap(menu.children);
      });
    }
    return;
  };
  componentDidMount() {
    const openKeysStr = window.sessionStorage.getItem("openKeys");
    const selectedKeysStr = window.sessionStorage.getItem("selectedKeys");
    const openKeys = openKeysStr ? JSON.parse(openKeysStr) : [];
    const selectedKeys = selectedKeysStr ? JSON.parse(selectedKeysStr) : [];
    this.setState({ openKeys, selectedKeys });
    this.getMenuList();
  }
  render() {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <div
          style={{
            width: this.state.collapsed ? "48px" : "208px",
            overflow: "hidden",
            transition: "all linear 0.1s",
          }}
        />
        <Sider
          className="site-sider"
          collapsible
          collapsed={this.state.collapsed}
          theme="light"
          onCollapse={this.onCollapse}
          collapsedWidth="48px"
          width="208px"
        >
          <Menu
            selectedKeys={this.state.selectedKeys}
            mode="inline"
            openKeys={this.state.openKeys}
            onOpenChange={this.onOpenChange}
            onSelect={this.onSelect}
          >
            {this.state.menuList.map((subMenu) => {
              return (
                <SubMenu
                  key={subMenu.id}
                  title={subMenu.authName}
                  icon={this.state.iconsObj[subMenu.id]}
                  onTitleClick={(params) => {}}
                >
                  {subMenu.children.map((menuItem) => {
                    return (
                      <Menu.Item key={menuItem.id} icon={<AppstoreOutlined />}>
                        <Link to={"/" + menuItem.path}>{menuItem.authName}</Link>
                      </Menu.Item>
                    );
                  })}
                </SubMenu>
              );
            })}
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-header">
            <div className="logo">
              <img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" />
              <span>电商后台管理系统</span>
            </div>
            <div className="avatar">
              <Popover
                content={
                  <Button type="text" onClick={this.logout}>
                    退出登录
                  </Button>
                }
              >
                <Avatar src="https://pic1.zhimg.com/v2-b50fda96df5bf460a630091dfaed7e84_b.jpg" />
              </Popover>
            </div>
          </Header>
          <Content className="site-content">
            {this.props.location.pathname !== "/welcome" && (
              <Breadcrumb style={{ marginBottom: "12px" }}>
                <Breadcrumb.Item>
                  <Link to="/">首页</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  {this.state.menuIdMap[this.state.selectedKeys[1]]}
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  {this.state.menuIdMap[this.state.selectedKeys[0]]}
                </Breadcrumb.Item>
              </Breadcrumb>
            )}
            <div className="site-layout-background" style={{ padding: 12, minHeight: 360 }}>
              <Switch>
                <Switch>
                  <PrivateRoute path="/welcome" component={Welcome}></PrivateRoute>
                  <Redirect path="/" to="/welcome" exact />
                  <PrivateRoute path="/users" component={Users}></PrivateRoute>
                  <PrivateRoute path="/roles" component={Roles}></PrivateRoute>
                  <PrivateRoute path="/rights" component={Rights}></PrivateRoute>
                  <PrivateRoute path="/goods" component={GoodList} exact></PrivateRoute>
                  <PrivateRoute path="/params" component={Params} exact></PrivateRoute>
                  <PrivateRoute path="/categories" component={Categories} exact></PrivateRoute>
                  <PrivateRoute path="/goods/add" component={AddGood}></PrivateRoute>
                  <PrivateRoute path="/goods/edit/:goods_id" component={EditGood}></PrivateRoute>
                  <PrivateRoute path="/orders" component={OrderList}></PrivateRoute>
                  <PrivateRoute path="/reports" component={Reports}></PrivateRoute>
                </Switch>
                <Route path="/users" component={Users}></Route>
              </Switch>
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>Ant Design ©2018 Created by Ant UED</Footer>
          <BackTop style={{right:"10px"}}/>
        </Layout>
      </Layout>
    );
  }
}

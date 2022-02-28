import React, { Component } from "react";
import { Link, Route, Switch } from "react-router-dom";
import axios from "axios";
import { Layout, Menu, Breadcrumb, message, Button } from "antd";
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
import Logo from "../../images/logo.png";
import Users from "../UserManage/Users";
import Roles from "../RightManage/Roles";
import Rights from "../RightManage/Rights";
import GoodList from "../GoodManage/GoodList";
import AddGood from "../GoodManage/AddGood";
import EditGood from "../GoodManage/EditGood";
import Params from "../GoodManage/Params";
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
    openKeys: [],
  };

  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  };
  onOpenChange = (key) => {
    const openKeys = key.length < 1 ? [] : [key[key.length - 1]];
    this.setState({ openKeys });
  };
  onClick = (params) => {
    console.log(params);
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
      this.setState({ menuList: res.data });
    } catch (error) {
      return message.error("网络出错，请稍后重试！");
    }
  };

  componentDidMount() {
    this.getMenuList();
  }
  render() {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
        >
          <div className="logo">
            <img src={Logo} alt="" />
          </div>
          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="inline"
            openKeys={this.state.openKeys}
            onOpenChange={this.onOpenChange}
            onClick={this.onClick}
          >
            {this.state.menuList.map((subMenu) => {
              return (
                <SubMenu
                  key={subMenu.id}
                  title={subMenu.authName}
                  icon={this.state.iconsObj[subMenu.id]}
                >
                  {subMenu.children.map((menuItem) => {
                    return (
                      <Menu.Item key={menuItem.id} icon={<AppstoreOutlined />}>
                        <Link to={"/" + menuItem.path}>
                          {menuItem.authName}
                        </Link>
                      </Menu.Item>
                    );
                  })}
                </SubMenu>
              );
            })}
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-header" style={{ padding: 0 }}>
            <span>电商后台管理系统</span>
            <Button onClick={this.logout}>退出登录</Button>
          </Header>
          <Content style={{ margin: "0 16px" }}>
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>
                <Link to="/">首页</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>用户管理</Breadcrumb.Item>
              <Breadcrumb.Item>用户列表</Breadcrumb.Item>
            </Breadcrumb>
            <div
              className="site-layout-background"
              style={{ padding: 12, minHeight: 360 }}
            >
              <Switch>
                <Switch>
                  <PrivateRoute path="/users" component={Users}></PrivateRoute>
                  <PrivateRoute path="/roles" component={Roles}></PrivateRoute>
                  <PrivateRoute
                    path="/rights"
                    component={Rights}
                  ></PrivateRoute>
                  <PrivateRoute
                    path="/goods"
                    component={GoodList}
                    exact
                  ></PrivateRoute>
                  <PrivateRoute
                    path="/params"
                    component={Params}
                    exact
                  ></PrivateRoute><PrivateRoute
                    path="/goods/add"
                    component={AddGood}
                  ></PrivateRoute>
                  <PrivateRoute
                    path="/goods/edit/:goods_id"
                    component={EditGood}
                  ></PrivateRoute>
                </Switch>
                <Route path="/users" component={Users}></Route>
              </Switch>
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Ant Design ©2018 Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    );
  }
}

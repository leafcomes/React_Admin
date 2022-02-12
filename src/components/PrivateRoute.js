import React, { Component } from 'react';
import { Route,Redirect } from 'react-router-dom';
/* 
  路由导卫，用token值做权限访问认证
*/
export default class PrivateRoute extends Component {
  render() {
    const token = window.sessionStorage.getItem('token');
    return (
      token? <Route {...this.props}/> : <Redirect to = '/login'/>
    )
  }
}

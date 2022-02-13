import React, { Component } from 'react';
import {Route,Switch,Redirect} from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Users from './pages/Users';
import 'antd/dist/antd.min.css';
export default class App extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route path="/login" component={Login}/>
          <PrivateRoute path="/home" component={Home}/>
          <PrivateRoute path="/users" component={Users}/>
          <Redirect path="/" to="/home"></Redirect>
        </Switch>
      </div>
    )
  }
}

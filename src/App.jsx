import React, { Component } from 'react';
import {Route,Switch} from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import './App.css'
export default class App extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route path="/login" component={Login}/>
          {/* <PrivateRoute path="/home" component={Home}>
            <Route path="/users" component={Users}/>
          </PrivateRoute> */}
          <PrivateRoute path="/" component={Home}/>
          {/* <Redirect path="/" to="/home"></Redirect> */}
        </Switch>
      </div>
    )
  }
}

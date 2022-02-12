import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import axios from 'axios';
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
// 每次请求带上token
axios.interceptors.request.use((config)=>{
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})
ReactDOM.render((
  <BrowserRouter>
    <App/>
  </BrowserRouter>),
  document.getElementById('root')
)

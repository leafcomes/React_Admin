import React, { Component } from "react";
import * as echarts from "echarts";
import { message } from "antd";
import axios from "axios";
import { merge } from "lodash";
export default class Reports extends Component {
  myChart = {};
  state = {
    //需要合并的数据
    options: {
      title: {
        text: "用户来源",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#E9EEF3",
          },
        },
      },
      grid: {
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          boundaryGap: false,
        },
      ],
      yAxis: [
        {
          type: "value",
        },
      ],
    },
  };
  getReportData = async () => {
    const { data: res } = await axios.get("reports/type/1");
    if (res.meta.status !== 200) {
      return message.error("获取报表数据失败！");
    }
    const options = merge(this.state.options, res.data);
    this.setState({ options }, this.drawReport);
  };
  drawReport = (params) => {
    // 基于准备好的dom，初始化echarts实例
    this.myChart = echarts.init(document.getElementById("main"));
    // 指定图表的配置项和数据
    this.myChart.setOption(this.state.options);
  };
  componentDidMount() {
    this.getReportData();
    window.onresize = () => {
      this.myChart.resize();
    };
  }
  render() {
    return <div id="main" style={{ width: "100%", height: "400px" }}></div>;
  }
}

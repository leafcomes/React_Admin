import React, { Component } from "react";
import { Calendar, Card } from "antd";
import { Axios } from "axios";
import axios from "axios";

export default class Welcome extends Component {
  state = {
    dailySentence: {
      hitokoto: "生活就像一盒巧克力，你永远不知道下一颗是什么味道。",
      from: "阿甘正传",
      from_who: null,
    },
  };
  getDailySentence = async () => {
    try {
      const {
        data: { hitokoto, from, from_who },
      } = await axios.get("https://v1.hitokoto.cn", {
        c: "d",
      });

      this.setState({ dailySentence: { hitokoto, from, from_who } });
    } catch (error) {}
  };
  componentDidMount() {
    this.getDailySentence();
  }
  render() {
    return (
      <>
        <Card style={{ background: "linear-gradient(135deg,#005aa7,#fffde4)", height: "136px" }}>
          <h2>每日一句</h2>
          <p>{this.state.dailySentence.hitokoto}</p>
          <p style={{ textAlign: "right" }}>
            {this.state.dailySentence.from_who || ""} 【{this.state.dailySentence.from}】
          </p>
        </Card>
        <Calendar fullscreen={false} />
      </>
    );
  }
}

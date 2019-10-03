import React, { Component } from 'react';
import './Chatview.css';
import ls from 'local-storage'
import socketIOClient from "socket.io-client";

class Chatview extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      data: {},
      tweets: []
    }
    this.selectedUser = this.selectedUser.bind(this);
    this.getLatestTweete = this.getLatestTweete.bind(this);
    this.tweetTounify = this.tweetTounify.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (ls.get('screen_name')) {
      this.setState({ 'screen_name': ls.get('screen_name') });
      this.getLatestTweete(ls.get('token'), ls.get('secret'), ls.get('screen_name'));

      const socket = socketIOClient('/');
      let cState = this;
      socket.on('connect', () => {
        console.log("Socket Connected");
        socket.on(cState.state.screen_name, data => {
          data = cState.tweetTounify([data]);
          cState.setState({ data: data });
        });
      });
      socket.on('disconnect', () => {
        socket.off(cState.state.screen_name)
        socket.removeAllListeners(cState.state.screen_name);
        console.log("Socket Disconnected");
      });
    }
  }

  selectedUser(screen_name) {
    let data = this.state.data;
    for (const scn in data) {
      if (data.hasOwnProperty(scn)) {
        const d = data[scn];
        d.isActive = false;
      }
    }
    data[screen_name].isActive = true;
    this.setState({ tweets: data[screen_name].tweets })
    this.setState({ data: data })
    this.setState({ status: `@${screen_name} ` })
  }

  getLatestTweete(token, secret, screen_name) {
    let cState = this;
    fetch(`/apis/${screen_name}/mentions`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "token": token,
        "secret": secret
      })
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        data = cState.tweetTounify(data.data);
        cState.setState({ data: data });
        cState.getDirectTweete(token, secret, screen_name);
      })
  }
  getDirectTweete(token, secret, screen_name) {
    let cState = this;
    fetch(`/apis/${screen_name}/dm`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "token": token,
        "secret": secret
      })
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        data = cState.tweetTounify(data.events);
        cState.setState({ data: data });
        cState.getMeTweete(token, secret, screen_name);
      })
  }
  getMeTweete(token, secret, screen_name) {
    let cState = this;
    fetch(`/apis/${screen_name}/me`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "token": token,
        "secret": secret
      })
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        data = cState.tweetTounifyMe(data.data);
        cState.setState({ data: data });
      })
  }

  tweetTounifyMe(tweets) {
    let allTweets = this.state.data;
    for (const sc_name in allTweets) {
      if (allTweets.hasOwnProperty(sc_name)) {
        const t = allTweets[sc_name];
        tweets.forEach((tweet, i) => {
          allTweets[sc_name].tweets.forEach((tt, index) => {
            if (tt.id_str === tweet.in_reply_to_status_id_str) {
              allTweets[sc_name].tweets.splice(index, 0, tweet);
            }
          });
        });
      }
    }
    return allTweets;
  }

  tweetTounify(tweets) {
    try {
      const unifry = this.state.data;
      tweets.forEach((tweet, i) => {
        if (!unifry[tweet.user.screen_name]) {
          unifry[tweet.user.screen_name] = {};
          unifry[tweet.user.screen_name].tweets = [];
        }
        unifry[tweet.user.screen_name].screen_name = tweet.user.screen_name
        unifry[tweet.user.screen_name].name = tweet.user.name
        unifry[tweet.user.screen_name].profile_image_url_https = tweet.user.profile_image_url_https
        unifry[tweet.user.screen_name].isActive = false
        // if (tweet.in_reply_to_screen_name) {

        // }else{
        if (unifry[tweet.user.screen_name].tweets.length > 0) {
          unifry[tweet.user.screen_name].tweets.push(tweet);
        } else {
          unifry[tweet.user.screen_name].tweets = [];
          unifry[tweet.user.screen_name].tweets.push(tweet);
        }
        // }
        if (i === 0) {
          unifry[tweet.user.screen_name].isActive = true;
          this.setState({ tweets: unifry[tweet.user.screen_name].tweets })
          this.setState({ status: `@${tweet.user.screen_name} ` })
        }
      });
      return unifry;
    } catch (error) {
      return this.state.data;
    }
  }
  handleChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    const token = ls.get('token');
    const secret = ls.get('secret');
    let statusId = ''
    if (this.state.tweets.length > 0) {
      statusId = this.state.tweets[this.state.tweets.length - 1].id_str;
      this.setState({ statusId })
    }
    let cState = this;
    fetch(`/apis/${this.state.screen_name}/send`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "token": token,
        "secret": secret,
        "status": cState.state.status,
        "statusId": statusId
      })
    })
      .then(function (res) {
        cState.setState({ 'status': '' });
        return res.json();
      })
      .then(function (data) {
        console.log(data);
        cState.getLatestTweete(ls.get('token'), ls.get('secret'), ls.get('screen_name'));
        cState.setState({ 'status': '' });
      })
  }
  render() {
    const chats = [];
    for (const user in this.state.data) {
      if (this.state.data.hasOwnProperty(user)) {
        const ut = this.state.data[user];
        const uelement = <div onClick={() => this.selectedUser(ut.screen_name)} key={ut.screen_name} id={ut.screen_name} className={ut.isActive ? 'chat_list active_chat' : 'chat_list'}>
          <div className="chat_people">
            <div className="chat_img"> <img src={ut.profile_image_url_https} alt={ut.screen_name} /> </div>
            <div className="chat_ib">
              <h5>{ut.name} <span className="chat_date"></span></h5>
              <p>{ut.screen_name}</p>
            </div>
          </div>
        </div>;
        chats.push(uelement);
      }
    }
    return (
      <div className="Chatview" >
        {/* <pre>{JSON.stringify(this.state)}</pre> */}
        <div className="mdl-layout-spacer"></div>
        <div className="messaging" >
          <div className="inbox_msg">
            <div className="inbox_people">
              <div className="headind_srch">
                <div className="recent_heading">
                  <h4>Recent</h4>
                </div>
                {/* <div className="srch_bar">
                  <div className="stylish-input-group">
                    <input type="text" className="search-bar" placeholder="Search" />
                    <span className="input-group-addon">
                      <button type="button"> <i className="fa fa-search" aria-hidden="true"></i> </button>
                    </span> </div>
                </div> */}
              </div>
              <div className="inbox_chat">
                {chats}
              </div>
            </div>
            <div className="mesgs">
              <div className="msg_history">
                {this.state.tweets.map((tweet, i) => <div className={(tweet.user.screen_name === this.state.screen_name) ? "outgoing_msg" : "incoming_msg"} key={i}>
                  {(tweet.user.screen_name === this.state.screen_name) ? null : (<div className="incoming_msg_img"> <img src={tweet.user.profile_image_url_https} alt={tweet.user.name} /> </div>)}
                  <div className={(tweet.user.screen_name === this.state.screen_name) ? "sent_msg" : "received_msg"}>
                    <div className="received_withd_msg">
                      <p>{tweet.text}</p>
                      <span className="time_date">{tweet.created_at}</span></div>
                  </div>
                </div>)}

                {/* <div className="outgoing_msg">
                  <div className="sent_msg">
                    <p>Test which is a new approach to have all
                  solutions</p>
                    <span className="time_date"> 11:01 AM    |    June 9</span> </div>
                </div>
                <div className="incoming_msg">
                  <div className="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil" /> </div>
                  <div className="received_msg">
                    <div className="received_withd_msg">
                      <p>Test, which is a new approach to have</p>
                      <span className="time_date"> 11:01 AM    |    Yesterday</span></div>
                  </div>
                </div>
                <div className="outgoing_msg">
                  <div className="sent_msg">
                    <p>Apollo University, Delhi, India Test</p>
                    <span className="time_date"> 11:01 AM    |    Today</span> </div>
                </div>
                <div className="incoming_msg">
                  <div className="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil" /> </div>
                  <div className="received_msg">
                    <div className="received_withd_msg">
                      <p>We work directly with our designers and suppliers,
                        and sell direct to you, which means quality, exclusive
                    products, at a price anyone can afford.</p>
                      <span className="time_date"> 11:01 AM    |    Today</span></div>
                  </div>
                </div> */}
              </div>
              <div className="type_msg">
                <div className="input_msg_write">
                  <input id='status' type="text" className="write_msg" placeholder="Type a message" value={this.state.status} onChange={this.handleChange} />
                  <button onClick={this.handleSubmit} className="msg_send_btn" type="button"><i className="material-icons md-light" aria-hidden="true">send</i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    );
  }
}

export default Chatview;
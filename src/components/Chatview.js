import React, { Component } from 'react';
import './Chatview.css';
import ls from 'local-storage'

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
  }

  componentDidMount() {
    this.getLatestTweete(ls.get('token'), ls.get('secret'));
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
  }

  getLatestTweete(token, secret) {
    let cState = this;
    fetch('/apis/6IJiBbLkBcc8HsIpNYINhruTCQF2/status', {
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
      })
  }

  tweetTounify(tweets) {
    const unifry = {};
    tweets.forEach((tweet, i) => {
      if (!unifry[tweet.user.screen_name]) {
        unifry[tweet.user.screen_name] = {};
        unifry[tweet.user.screen_name].tweets = [];
      }
      unifry[tweet.user.screen_name].screen_name = tweet.user.screen_name
      unifry[tweet.user.screen_name].name = tweet.user.name
      unifry[tweet.user.screen_name].profile_image_url_https = tweet.user.profile_image_url_https
      unifry[tweet.user.screen_name].isActive = false
      
      if (unifry[tweet.user.screen_name].tweets.length > 0) {
        unifry[tweet.user.screen_name].tweets.push(tweet);
      } else {
        unifry[tweet.user.screen_name].tweets = [];
        unifry[tweet.user.screen_name].tweets.push(tweet);
      }

      if (i === 0) {
        unifry[tweet.user.screen_name].isActive = true;
        this.setState({ tweets: unifry[tweet.user.screen_name].tweets })
      }

      if (tweet.user.in_reply_to_status_id) {
        if (!unifry[tweet.user.in_reply_to_status_id]) {
          unifry[tweet.user.in_reply_to_status_id] = {};
          unifry[tweet.user.in_reply_to_status_id].tweets = [];
        }

        if (unifry[tweet.user.in_reply_to_status_id].tweets.length > 0) {
          unifry[tweet.user.in_reply_to_status_id].tweets.push(tweet);
        } else {
          unifry[tweet.user.in_reply_to_status_id].tweets = [];
          unifry[tweet.user.in_reply_to_status_id].tweets.push(tweet);
        }
      }
    });
    return unifry;
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
                <div className="srch_bar">
                  <div className="stylish-input-group">
                    <input type="text" className="search-bar" placeholder="Search" />
                    <span className="input-group-addon">
                      <button type="button"> <i className="fa fa-search" aria-hidden="true"></i> </button>
                    </span> </div>
                </div>
              </div>
              <div className="inbox_chat">
                {chats}
              </div>
            </div>
            <div className="mesgs">
              <div className="msg_history">
                {this.state.tweets.map((tweet, i) => <div className={tweet.isFeomMe ? "outgoing_msg" : "incoming_msg"} key={i}>
                  <div className="incoming_msg_img"> <img src={tweet.user.profile_image_url_https} alt={tweet.user.name} /> </div>
                  <div className="received_msg">
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
                  <input type="text" className="write_msg" placeholder="Type a message" />
                  <button className="msg_send_btn" type="button"><i className="fa fa-paper-plane-o" aria-hidden="true"></i></button>
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
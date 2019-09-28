import React, { Component } from 'react';
import './Twitter.css';

class Twitter extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      isAuthenticated: false
    }
  }

  componentDidMount(){
    console.log('Component mounted.');
  }

  render() {
    return (
      <div className="Twitter content-wrapper">
        <Status />
      </div>
    );
  }
}

export default Twitter;
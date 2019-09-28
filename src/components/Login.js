import React, { Component } from 'react';
import './Login.css';

class Login extends Component {
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
      <div className="Login content-wrapper">
        <Status />
      </div>
    );
  }
}

export default Login;
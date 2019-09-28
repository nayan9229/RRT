import React, { Component } from 'react';
import './Chatview.css';
import firebase from "firebase"

class Header extends Component {
    constructor() {
        super();
        this.state = {}
    }

    componentDidMount() {
        console.log('Component mounted.', this.props);
    }
    logOut(e) {
        e.preventDefault();
        firebase.auth().signOut().then(() => {
            console.log("SIGNOUT_SUCCESS");
        });
    }

    render() {
        return (
            <header className="android-header mdl-layout__header">
                <div className="mdl-layout__header-row">
                    <span className="mdl-layout-title">Title</span>
                    <div className="mdl-layout-spacer"></div>
                    <nav className="mdl-navigation mdl-layout--large-screen-only">
                        {this.props ? (<a onClick={this.logOut} className="mdl-navigation__link" href="/">Logout</a>) : null}
                    </nav>
                </div>
            </header>
        );
    }
}

export default Header;
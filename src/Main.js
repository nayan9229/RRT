import React, { Component } from 'react';
import './Main.css';
// import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth"
import firebase from "firebase"
import Header from './components/Header';
import Chatview from './components/Chatview';
import ls from 'local-storage';
var config = {
    apiKey: "AIzaSyAM5--2ZDdVMAyIAGiJgLQOsdRlEpNewe0",
    authDomain: "richpanel-92326.firebaseapp.com",
    databaseURL: "https://richpanel-92326.firebaseio.com",
    projectId: "richpanel-92326",
    storageBucket: "",
    messagingSenderId: "677614933086",
    appId: "1:677614933086:web:32b7af57a907d31ae290cf",
    measurementId: "G-95XWCEQQ5Y"
};
firebase.initializeApp(config);
// firebase.firestore().settings();

class Main extends Component {
    constructor() {
        super();
        this.state = {
            isLoading: true,
            email: '',
            password: '',
            isAuthenticated: false,
            isSignedIn: false,
            isTwitter: false,
            isSignedUp: false,
            authError: ''
        }
        this.loginWithTwitter = this.loginWithTwitter.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.signUp = this.signUp.bind(this);
        this.logOut = this.logOut.bind(this);
        this.signUpform = this.signUpform.bind(this);
    }
    // uiConfig = {
    //     signInFlow: "popup",
    //     signInOptions: [
    //         firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    //         firebase.auth.EmailAuthProvider.PROVIDER_ID
    //     ],
    //     callbacks: {
    //         signInSuccess: () => false
    //     }
    // }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        })
    }
    handleSubmit = (e) => {
        e.preventDefault();
        // this.props.signIn(this.state)
        firebase.auth().signInWithEmailAndPassword(
            this.state.email, this.state.password
        ).then(() => {
            console.log("LOGIN_SUCCESS");
            this.setState({ authError: '' })
        }).catch((err) => {
            console.log("LOGIN_ERROR");
            console.log('======', err.message);
            this.setState({ authError: '' + err.message })
        });
    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // this.setState({ isAuthenticated: !!user })
                this.setState({ user })
                this.setState({ isAuthenticated: true })
                this.setState({ isSignedIn: false })
                this.setState({ isSignedUp: false })
                this.setState({ isTwitter: true })
                this.setState({ uid: user.uid })

                if (ls.get('token')) {
                    this.setState({ isTwitter: false });
                } else {
                    this.setState({ isTwitter: true });
                    this.setState({ isAuthenticated: false })
                }

            } else {
                this.setState({ isSignedIn: true })
            }
        });
    }

    signUp(e) {
        e.preventDefault();
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then(resp => {
            // return firestore.collection('users').doc(resp.user.uid).set({})
            console.log(resp);
            this.setState({ authError: '' })
        }).catch(err => {
            console.log('======', err.message);
            this.setState({ authError: '' + err.message })
        });
    }

    logOut(e) {
        firebase.auth().signOut().then(() => {
            console.log("SIGNOUT_SUCCESS");
        });
        this.setState({ isAuthenticated: false })
        this.setState({ isSignedIn: false })
        this.setState({ isSignedUp: false })
        this.setState({ isTwitter: false })
        this.setState({ data: {} })
        this.setState({ tweets: [] })
        // window.location.reload(false);
        ls.set('token', null);
        ls.set('secret', null);
        ls.remove('token');
        ls.remove('secret');
        ls.remove('screen_name');
        e.preventDefault();
    }

    loginWithTwitter(e) {
        e.preventDefault();

        var provider = new firebase.auth.TwitterAuthProvider();
        let cState = this;
        //firebase.auth().signInWithPopup(provider).
        firebase.auth().signInWithPopup(provider).then(function (result) {
            cState.setState({ accessToken: result.credential.accessToken, secret: result.credential.secret })
            cState.setState({ user: result.user })
            console.log(result.additionalUserInfo.username);
            cState.setState({ result })
            setTimeout(() => {
                cState.setState({ isTwitter: false });
                cState.setState({ isAuthenticated: true });
            }, 1000);
            ls.set('token', result.credential.accessToken);
            ls.set('secret', result.credential.secret);
            ls.set('screen_name', result.additionalUserInfo.username);
            cState.setState({ authError: '' })
        }).catch(function (error) {
            console.log(error);
            console.log('======', error.message);
            cState.setState({ authError: error.message })
            // var errorCode = error.code;
            // var errorMessage = error.message;
            // var email = error.email;
            // var credential = error.credential;
        });
    }

    signUpform(e) {
        e.preventDefault();
        this.setState({ isAuthenticated: false })
        this.setState({ isSignedIn: false })
        this.setState({ isSignedUp: true })
        this.setState({ isTwitter: true })
    }

    render() {
        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-color--blue-grey-50" >
                <header className="android-header mdl-layout__header">
                    <div className="mdl-layout__header-row">
                        <span className="mdl-layout-title">Title</span>
                        <div className="mdl-layout-spacer"></div>
                        <nav className="mdl-navigation mdl-layout--large-screen-only">
                            {this.state.isAuthenticated ? (<a onClick={this.logOut} className="mdl-navigation__link" href="/">Logout</a>) : null}
                        </nav>
                    </div>
                </header>
                <main className="mdl-layout__content">
                    <div className="page-content">
                        {/* <pre>{JSON.stringify(this.state)}</pre> */}
                        {this.state.isAuthenticated ? (
                            <Chatview />
                        ) : this.state.isSignedIn ? (
                            <div className="android-more-section mdl-grid">
                                <div className="mdl-cell mdl-cell--2-col"></div>
                                <div className="android-card-container mdl-card mdl-shadow--2dp mdl-cell--8-col mdl-cell--12-col-phone">
                                    <form className="white" onSubmit={this.handleSubmit}>
                                        <div className="mdl-card__title">
                                            <h2 className="mdl-card__title-text">User Login</h2>
                                        </div>
                                        <div className="mdl-card__supporting-text mdl-grid">
                                            <b className="mdl-color-text--accent">{this.state.authError}</b>
                                            <input type="hidden" name="action" value="login" />
                                            <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-cell mdl-cell--12-col">
                                                <label className="mdl-textfield__label" htmlFor="email">Email</label>
                                                <input className="mdl-textfield__input" type="email" id='email' onChange={this.handleChange} />
                                            </div>
                                            <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-cell mdl-cell--12-col">
                                                <label className="mdl-textfield__label" htmlFor="password">Password</label>
                                                <input className="mdl-textfield__input" type="password" id='password' onChange={this.handleChange} />
                                            </div>
                                            <div className="mdl-cell mdl-cell--12-col" align="center">
                                                <button type="submit" className="mdl-cell--5-col mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"> SignIn </button>

                                                <button onClick={this.signUpform} type="submit" className="mdl-cell--1-offset mdl-cell--5-col mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"> SignUp </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : this.state.isSignedUp ? (
                            <div className="android-more-section mdl-grid">
                                <div className="mdl-cell mdl-cell--2-col"></div>
                                <div className="android-card-container mdl-card mdl-shadow--2dp mdl-cell--8-col mdl-cell--12-col-phone">
                                    <form className="white" onSubmit={this.signUp}>
                                        <div className="mdl-card__title">
                                            <h2 className="mdl-card__title-text">Sign Up</h2>
                                        </div>
                                        <div className="mdl-card__supporting-text mdl-grid">
                                            <b className="mdl-color-text--accent">{this.state.authError}</b>
                                            <input type="hidden" name="action" value="login" />
                                            <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-cell mdl-cell--12-col">
                                                <label className="mdl-textfield__label" htmlFor="email">Email</label>
                                                <input className="mdl-textfield__input" type="email" id='email' onChange={this.handleChange} />
                                            </div>
                                            <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-cell mdl-cell--12-col">
                                                <label className="mdl-textfield__label" htmlFor="password">Password</label>
                                                <input className="mdl-textfield__input" type="password" id='password' onChange={this.handleChange} />
                                            </div>
                                            <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-cell mdl-cell--12-col">
                                                <label className="mdl-textfield__label" htmlFor="firstName">First Name</label>
                                                <input className="mdl-textfield__input" type="text" id='firstName' onChange={this.handleChange} />
                                            </div>
                                            <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-cell mdl-cell--12-col">
                                                <label className="mdl-textfield__label" htmlFor="lastName">Last Name</label>
                                                <input className="mdl-textfield__input" type="text" id='lastName' onChange={this.handleChange} />
                                            </div>

                                            <div className="mdl-cell mdl-cell--12-col" align="center">
                                                <button type="submit" className="mdl-cell--12-col mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Sign Up </button>
                                            </div>
                                        </div>
                                    </form>
                                </div></div>
                        ) : this.state.isTwitter ? (
                            <div className="mdl-cell--12-col mdl-grid">
                                <div className="mdl-cell mdl-cell--2-col"></div>
                                <div className="android-card-container mdl-card mdl-shadow--2dp mdl-cell--8-col mdl-cell--12-col-phone">
                                    <div className="mdl-card__title">
                                        <h2 className="mdl-card__title-text">Connect your twitter to continue</h2>
                                    </div>
                                    <div className="mdl-card__supporting-text mdl-grid">
                                        <b className="mdl-color-text--accent">{this.state.authError}</b>
                                        <div className="mdl-cell mdl-cell--12-col" align="center">
                                            <button onClick={this.loginWithTwitter} className="mdl-cell--6-col mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Connect Twitter</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (<div></div>)}
                    </div>
                </main>
            </div >
        );
    }
}

export default Main;
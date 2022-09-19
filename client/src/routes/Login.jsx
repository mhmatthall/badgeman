import React from "react";
import md5 from "md5";
// import { Navigate } from "react-router-dom";
import "./login.scss";

class Login extends React.Component {
  render() {
    return (
      <div className="Login">
        <Header />
        <LoginForm />
      </div>
    );
  }
}

function Header() {
  return <p>Festival of Ideas 2022</p>;
}

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    // Init state
    this.state = {
      id: "",
      secret: "",
      badgeExists: null,
    };

    // Bind this to functions
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fetchBadge = this.fetchBadge.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    // Stop browser auto nav
    event.preventDefault();

    if (md5(this.state.id).substring(0, 5) !== this.state.secret) {
      alert(
        "Hash check failed! — " +
          md5(this.state.id).substring(0, 5) +
          " != " +
          this.state.secret
      );
    } else {
      this.fetchBadge();
    }
  }

  fetchBadge(event) {
    fetch(`http://localhost:3001/api/badges/id2mac/${this.state.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => this.setState({ badgeExists: res.ok }))
      .catch((err) => err);
  }

  componentDidUpdate() {
    if (this.state.badgeExists !== null) {
      if (this.state.badgeExists) {
        alert("IT EXISTS!");
      } else {
        alert("IT DOES NOT EXIST");
        this.setState({ badgeExists: null });
      }
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Badge ID:
          <input
            name="id"
            type="text"
            required
            pattern="[0-9]+"
            value={this.state.id}
            onChange={this.handleChange}
          />
        </label>
        <label>
          Secret code:
          <input
            name="secret"
            type="text"
            required
            pattern="[0-9a-f]+"
            value={this.state.secret}
            onChange={this.handleChange}
          />
        </label>
        <input type="submit" value="Go!" />
      </form>
    );
  }
}

export default Login;

import React from "react";
import md5 from "md5";
import { Navigate } from "react-router-dom";
import { SERVER_URL } from "..";
import "../css/index.scss";

function Login() {
  return (
    <div className="Login">
      <Header />
      <LoginForm />
    </div>
  );
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
      shouldRedirect: false,
    };

    // Bind this to functions
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fetchBadge = this.fetchBadge.bind(this);
  }

  handleChange(event) {
    // Update state to match form entry
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    // Stop browser auto nav
    event.preventDefault();

    if (!verifySecret(this.state.id, this.state.secret)) {
      alert("That's not the right secret. Try again!");
    } else {
      this.fetchBadge();
    }
  }

  fetchBadge(event) {
    fetch(`http://${SERVER_URL}:3001/api/badges/id2mac/${this.state.id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => this.setState({ badgeExists: res.ok }))
      .catch((err) => err);
  }

  componentDidUpdate() {
    if (this.state.badgeExists !== null) {
      // If we've queried the API
      if (this.state.badgeExists) {
        // If badge exists in DB, then move on
        this.setState({ shouldRedirect: true });
      } else {
        // Badge does not exist; reset state
        alert("That badge hasn't been registered yet. Try again!");
        this.setState({ badgeExists: null });
      }
    }
  }

  render() {
    return (
      <div>
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
        {
          /* If we're ready to move on, navigate to the editor */
          this.state.shouldRedirect && (
            <Navigate
              to="/editor"
              replace={true}
              state={{ id: this.state.id, secret: this.state.secret }}
            />
          )
        }
      </div>
    );
  }
}

export const verifySecret = (id, secret) => {
  return md5(id).substring(0, 5) === secret;
};

export default Login;

import React from "react";
import md5 from "md5";
import { Navigate } from "react-router-dom";
import { config } from "..";
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
  return <h1>{config.customisation.EVENT_NAME}</h1>;
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
    this.doesBadgeExist = this.doesBadgeExist.bind(this);
    // this.fetchBadge = this.fetchBadge.bind(this);
  }

  handleChange(event) {
    // Update state to match form entry
    this.setState({ [event.target.name]: event.target.value.toLowerCase() });
  }

  async handleSubmit(event) {
    // Stop browser auto nav
    event.preventDefault();

    // Verify the 'secret'
    if (!verifySecret(this.state.id, this.state.secret)) {
      alert("That's not the right secret. Try again!");
    } else {
      // Check if the badge exists
      if ((await this.doesBadgeExist()).ok) {
        this.setState({ shouldRedirect: true });
      } else {
        alert(
          "That badge either doesn't exist or isn't connected to the network right now. Try again!"
        );
      }
    }
  }

  doesBadgeExist() {
    return fetch(
      `http://${config.HOST_IP_ADDRESS}:${config.API_PORT}/api/badges/by-id/${this.state.id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
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
              pattern="[0-9a-fA-F]+"
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

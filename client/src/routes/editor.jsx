import React from "react";
import { useLocation } from "react-router-dom";
import { verifySecret } from "./login";

function Editor() {
  // Get passed state from login page
  let [loginDetails, _] = React.useState(useLocation().state);

  // If invalid login creds then boot out
  if (!verifySecret(loginDetails.id, loginDetails.secret)) {
    throw new Response("Unauthorised", { status: 401 });
  }

  return (
    <div>
      <Header id={loginDetails.id} />
      <EditorForm id={loginDetails.id} />
    </div>
  );
}

function updateBadge(id, newDetails) {
  fetch(`http://localhost:3001/api/badges/id2mac/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((res) => {
      return fetch(`http://localhost:3001/api/badges/${res.macAddress}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDetails),
      });
    })
    .then((res) => {
      console.log(res);
      if (res.ok) {
        alert("Badge updated successfully!")
      } else {
        alert("An error occurred whilst updating the badge. Try again!")
      }
    });
}

function Header(props) {
  return <h1>Editing badge {props.id}</h1>;
}

class EditorForm extends React.Component {
  constructor(props) {
    super(props);

    // Init state
    this.state = {
      name: "",
      pronouns: "",
      affiliation: "",
      message: "",
      image: "",
    };

    // Bind this to functions
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    // Update state to match form entry
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    updateBadge(this.props.id, this.state);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input
            name="name"
            type="text"
            required
            value={this.state.name}
            onChange={this.handleChange}
          />
        </label>
        <label>
          Pronouns:
          <input
            name="pronouns"
            type="text"
            required
            value={this.state.pronouns}
            onChange={this.handleChange}
          />
        </label>
        <label>
          Affiliation:
          <input
            name="affiliation"
            type="text"
            required
            value={this.state.affiliation}
            onChange={this.handleChange}
          />
        </label>
        <label>
          Message:
          <input
            name="message"
            type="text"
            required
            value={this.state.message}
            onChange={this.handleChange}
          />
        </label>
        <input type="submit" value="Update badge" />
      </form>
    );
  }
}

export default Editor;

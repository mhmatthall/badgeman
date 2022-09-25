import React from "react";
import { useLocation } from "react-router-dom";
import { verifySecret } from "./login";
import { config } from "..";
import "../css/index.scss";

function Editor() {
  // Push to history stack
  

  // Get passed state from login page
  // eslint-disable-next-line no-unused-vars
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

function Header(props) {
  return <h1>Editing badge #{props.id}</h1>;
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
      // imageRaw: "",
      isFormUnedited: true,
    };

    // Bind this to class functions
    this.fetchBadge = this.fetchBadge.bind(this);
    this.updateBadge = this.updateBadge.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  fetchBadge(id) {
    fetch(
      `http://${config.HOST_IP_ADDRESS}:${config.API_PORT}/api/badges/by-id/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((res) => res.json())
      .then((res) =>
        this.setState({
          name: res.userData.name,
          pronouns: res.userData.pronouns,
          affiliation: res.userData.affiliation,
          message: res.userData.message,
          image: res.userData.image,
        })
      )
      .catch((err) => err);
  }

  updateBadge(id) {
    try {
      const res = fetch(
        `http://${config.HOST_IP_ADDRESS}:${config.API_PORT}/api/badges/by-id/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: this.state.name,
            pronouns: this.state.pronouns,
            affiliation: this.state.affiliation,
            message: this.state.message,
          }),
        }
      );

      if (res == null) {
        // Document failed to update
        throw new Error();
      } else {
        // All went well!
        // Disable the submit button again
        this.setState({ isFormUnedited: true });
      }
    } catch (err) {
      alert("Failed to update badge. Try again!");
    }
  }

  handleChange(event) {
    // Update state to match form entry
    this.setState({ [event.target.name]: event.target.value });

    // Enable the submit button
    this.setState({ isFormUnedited: false });
  }

  handleSubmit(event) {
    // Stop browser auto reload
    event.preventDefault();

    // Try to update badge deets on server
    this.updateBadge(this.props.id, this.state);
  }

  componentDidMount() {
    // Get deets from server once we've initialised the state
    this.fetchBadge(this.props.id);
  }

  render() {
    return (
      <div>
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
          {/* <label>
            Upload a photo:
            <input
              name="image"
              type="file"
              accept=".bmp,.jpg,.jpeg,.png"
              onChange={this.handleImageChange}
            />
          </label> */}
          <input
            type="submit"
            value="Update badge"
            disabled={this.state.isFormUnedited}
          />
        </form>
        <img id="imagelol" alt="What your badge should look like" src={this.state.image} />
      </div>
    );
  }
}

export default Editor;

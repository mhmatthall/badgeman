import React from "react";
// import canvas from "canvas";
import converter from "image_to_epaper_converter";
import { useLocation } from "react-router-dom";
import { verifySecret } from "./login";
import { SERVER_URL } from "..";
import "../css/index.scss";

import bgImg from '../img/foi_badge_bg.jpg';

const { createCanvas, loadImage } = require("canvas");

let cosmosRegular = new FontFace('Cosmos', "/src/fonts/Cosmos-Medium.woff")
let cosmosLight = new FontFace('Cosmos Light', "/Cosmos-Light.woff'")

// try {
//   registerFont('../fonts/Cosmos-Medium.otf', { family: "Cosmos" })
//   registerFont('../fonts/Cosmos-Light.otf', { family: "Cosmos Light" })
// } catch (err) {}

function Editor() {
  // Get passed state from login page
  let [loginDetails, _] = React.useState(useLocation().state);

  // If invalid login creds then boot out
  if (!verifySecret(loginDetails.id, loginDetails.secret)) {
    throw new Response("Unauthorised", { status: 401 });
  }

  cosmosRegular.load()
  cosmosLight.load()

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
      imageRaw: "",
      isFormUnedited: true
    };

    // Bind this to class functions
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fetchBadge = this.fetchBadge.bind(this);
    // this.handleImageChange = this.handleImageChange.bind(this);
    this.renderBadge = this.renderBadge.bind(this);
    this.updateBadge = this.updateBadge.bind(this);
  }
  
  fetchBadge(id) {
    fetch(`http://${SERVER_URL}:3001/api/badges/id2mac/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        fetch(`http://${SERVER_URL}:3001/api/badges/${res.macAddress}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .then((res) => this.setState({
            name: res.userData.name,
            pronouns: res.userData.pronouns,
            affiliation: res.userData.affiliation,
            message: res.userData.message,
            image: res.userData.image,
          }));
        }
      )
      .catch((err) => err)
  }

  updateBadge(id) {
    const newDetails = {
      name: this.state.name,
      pronouns: this.state.pronouns,
      affiliation: this.state.affiliation,
      message: this.state.message,
      image: this.state.image,
    }

    fetch(`http://${SERVER_URL}:3001/api/badges/id2mac/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        return fetch(`http://${SERVER_URL}:3001/api/badges/${res.macAddress}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDetails),
        });
      })
      .then((res) => {
        if (res.ok) {
          alert("Badge updated successfully!")
          
          // Disable the submit button again
          this.setState({ isFormUnedited: true });
        } else {
          alert("An error occurred whilst updating the badge. Try again!")
        }
      });
  }

  // handleImageChange(event) {
  //   // Get uploaded image and draw entire badge image
  //   if (event.target.files && event.target.files[0]) {
  //     let reader = new FileReader();

  //     // Read image from user device
  //     reader.onload = (e) => {
  //       // Save raw image as dataUrl
  //       this.setState({ imageRaw: e.target.result });
  //     }
      
  //     reader.readAsDataURL(event.target.files[0]);
  //   }
    
  //   // Enable the submit button
  //   this.setState({ isFormUnedited: false });
  // }

  renderBadge() {
    // Draw badge image
    const cv = createCanvas(296, 128);
    const ctx = cv.getContext("2d");

    loadImage(bgImg)
      .then((img) => {
        // Draw bg image
        ctx.drawImage(img, 0, 0, 296, 128)

        // Draw profile image
        let profileImg = new Image();
        profileImg.src = this.state.imageRaw

        ctx.drawImage(profileImg, 220, 0, 74, 104)
        
        // Add user data text (origin is bottom left of textbox)
        ctx.font = '24px "Cosmos"'
        let nameString = this.state.name
        let nameWidthPx = ctx.measureText(nameString)

        if (nameWidthPx.width > 190) {
          // If name is too long, split over two lines at first whitespace
          const nameArr = nameString.split(/ (.*)/s)
          ctx.fillText(nameArr[0], 10, 28)
          ctx.fillText(nameArr[1], 10, 54)
        } else {
          // Name fits on one line
          ctx.fillText(nameString, 10, 28)
        }
        
        ctx.font = '16px "Cosmos Light"'
        ctx.fillText(this.state.pronouns, 10, 75)
        
        ctx.font = '16px "Cosmos"'
        ctx.fillText(this.state.affiliation, 10, 95)
        
        ctx.font = '14px "Cosmos Light"'
        ctx.fillStyle = "#FFFFFF"
        ctx.fillText(this.state.message, 10, 120)

        // Export image to state
        this.setState({ image: cv.toDataURL() });
      })
  }

  handleChange(event) {
    this.renderBadge()

    // Update state to match form entry
    this.setState({ [event.target.name]: event.target.value });

    // Enable the submit button
    this.setState({ isFormUnedited: false });
  }

  handleSubmit(event) {
    // Stop browser auto reload
    event.preventDefault();

    this.renderBadge()

    console.log(this.state)

    // Try to update badge deets on server
    this.updateBadge(this.props.id, this.state);
  }

  componentDidMount() {
    // Get deets from server once we've initialised the state
    this.fetchBadge(this.props.id)
    
    this.renderBadge()
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
          <input type="submit" value="Update badge" disabled={this.state.isFormUnedited} />
        </form>
        <img id="imagelol" alt="What your badge should look like" src={this.state.image} />
      </div>
    );
  }
}

export default Editor;

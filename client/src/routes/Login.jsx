import React from 'react'
import './login.scss'

class Login extends React.Component {
  render() {
    return (
      <div className="Login">
        {/* <ApiTest /> */}
        <Header />
        <LoginForm />
      </div>
    )
  }
}

function Header() {
  return (
    <p>Festival of Ideas 2022</p>
  )
}

class LoginForm extends React.Component {
  constructor(props) {
    super(props)

    // Init state
    this.state = {
      id: '',
      secret: ''
    }

    // Bind functions
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState(
      { [event.target.name]: event.target.value }
    )
  }
  
  handleSubmit(event) {
    event.preventDefault()
    this.props.history.push('/editor')
    // alert('Badge ID: ' + this.state.id + ', Secret: ' + this.state.secret)
  }
  
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Badge ID:
          <input
          name="id"
          type="text"
          value={this.state.id}
          onChange={this.handleChange} />
        </label>
        <label>
          Secret code:
          <input
          name="secret"
          type="text"
          value={this.state.secret}
          onChange={this.handleChange} />
        </label>
        <input type="submit" value="Go!" />
      </form>
    )
  }
}

class ApiTest extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      apiResponse: 'loading...'
    }
  }

  componentDidMount() {
    this.callApi()
  }

  callApi() {
    fetch('http://localhost:3001/api/network/badges')
      .then(res => res.text())
      .then(res => this.setState({apiResponse: res}))
      .catch(err => err)
  }

  render() {
    return (
      <div>
        <p>server says: {this.state.apiResponse}</p>
      </div>
    );
  }
}

export default Login;

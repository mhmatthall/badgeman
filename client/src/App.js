import React from 'react'
import './App.css'

class App extends React.Component {
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
    fetch('http://localhost:3001/api')
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

export default App;

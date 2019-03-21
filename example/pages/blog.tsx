import React, { Component } from 'react'

export default class Blog extends Component {
  private static getInitialProps({ query }) {
    console.log(query)
    return {}
  }

  public render() {
    return <div>blog</div>
  }
}

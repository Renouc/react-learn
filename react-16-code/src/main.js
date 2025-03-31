import React from 'lib/react'
import ReactDOM from 'lib/react-dom'

const element = (
  <div>
    这是div
    <h1>
      <span style="color: blue">hello</span>
      <span style="color: red">world</span>
    </h1>
    <p>this is a p</p>
  </div>
)

const container = document.getElementById('root')
ReactDOM.render(element, container)

import React from "lib/react";
import ReactDOM from "lib/react-dom";

const dom = (
  <div className="red">
    <span> Hello</span>
    World
  </div>
);

const container = document.getElementById("root");

ReactDOM.render(dom, container);

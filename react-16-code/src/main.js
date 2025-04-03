import React from "lib/react";
import ReactDOM from "lib/react-dom";
const container = document.getElementById("root");

function updateInputValue(e) {
  console.log(e.target.value);
  renderer(e.target.value);
}

function Input({ value, onChange }) {
  return (
    <div>
      <input value={value} type="text" onInput={onChange} />
      <p>{value}</p>
    </div>
  );
}

function renderer(inputValue) {
  const element = (
    <div>
      <h3 style="color: red">这是测试</h3>
      <Input value={inputValue} onChange={updateInputValue} />
    </div>
  );
  ReactDOM.render(element, container);
}

renderer("Hello");

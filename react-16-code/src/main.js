import React from "lib/react";
import ReactDOM from "lib/react-dom";
const container = document.getElementById("root");

function Counter() {
  const [count, setCount] = ReactDOM.useState(0);
  const [count2, setCount2] = ReactDOM.useState(0);


  function clickHandler(){
    console.log("click 批处理");
    setCount(count => count + 1);
    setCount(count => count + 2);
  }

  return (
    <div style="border: 1px solid red; padding: 10px;">
      <p>
        <b>COUNT: </b>
        {count}
      </p>
      <button onClick={clickHandler}>批处理</button>
      <button onClick={() => setCount(count => count + 1)}>+ 1</button>

      <hr />
      <p>
        <b>COUNT2: </b>
        {count2}
      </p>
      <button onClick={() => setCount2(count => count + 2)}>+ 2</button>
    </div>
  );
}

ReactDOM.render(<Counter />, container);

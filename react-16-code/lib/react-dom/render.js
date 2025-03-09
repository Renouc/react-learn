// 下一个功能单元
let nextUnitOfWork = null;

// 根节点
let wipRoot = null;

function render(element, container) {
  // 根据 root 创建一个fiber
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };

  nextUnitOfWork = wipRoot;
}
function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  Object.keys(fiber.props)
    .filter((key) => key !== "children")
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
}

// 处理提交fiber树
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  console.log("🐯", fiber);
  const domParent = fiber.parent.dom;
  console.log("🌧️:", domParent);

  domParent.appendChild(fiber.dom);

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// 提交任务，将 fiber tree 渲染为真实 DOM
function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

function workLoop(deadline) {
  // 停止标识
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    // 执行工作单元

    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 判断是否要停止
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

export default render;

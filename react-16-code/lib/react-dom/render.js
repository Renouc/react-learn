// 下一个待执行的 fiber
let nextUnitOfWork = null;

function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };

  requestIdleCallback(workLoop);
}

function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  const isProperty = (key) => key !== "children";

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
    console.log("💐:", fiber);
  }

  let index = 0;
  let prevSibling = null;

  // 获取子元素
  const children = fiber.props.children;

  // 遍历子元素
  while (index < children.length) {
    const child = children[index];

    const newFiber = {
      type: child.type,
      props: child.props,
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

  // 如果存在子元素，则返回子元素
  if (fiber.child) {
    return fiber.child;
  }

  // 如果存在兄弟元素，则返回兄弟元素
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 1) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  requestIdleCallback(workLoop);
}

export default render;

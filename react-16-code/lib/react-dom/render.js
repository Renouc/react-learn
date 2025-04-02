// 下一个待执行的 fiber
let nextUnitOfWork = null;

// 内存中的 根节点
let wipRoot = null;

// 当前渲染的 根节点
let currentRoot = null;

// 删除的 fiber
let deletions = null;

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;
  deletions = [];

  requestIdleCallback(workLoop);
}

function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

function reconcileChildren(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  // 旧的 fiber
  let oldFiber = fiber.alternate && fiber.alternate.child;

  while (index < elements.length || oldFiber) {
    const element = elements[index];

    let newFiber = null;

    // 类型是否相同
    const sameType = oldFiber && element && element.type === oldFiber.type;

    // 更新 fiber
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: fiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    // 创建 fiber
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: fiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    // 删除 fiber
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else if (prevSibling) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function performUnitOfWork(fiber) {
  reconcileChildren(fiber);

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

function updateDom(dom, prevProps, nextProps) {
  const isEvent = (key) => key.startsWith("on");
  const isProperty = (key) => key !== "children" && !isEvent(key);
  const isNew = (prev, next) => (key) => prev[key] !== next[key];
  const isGone = (prev, next) => (key) => !(key in next);

  // 删除旧的事件
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // 删除旧的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });

  // 添加新的事件
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });

  // 添加新的属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  console.log("🍎", fiber);

  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  const parentDom = fiber.parent.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
    parentDom.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    parentDom.removeChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitRoot() {
  console.log("💐:", wipRoot);

  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 1) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    if (!nextUnitOfWork && wipRoot) {
      commitRoot();
    }
  }

  requestIdleCallback(workLoop);
}

export default render;

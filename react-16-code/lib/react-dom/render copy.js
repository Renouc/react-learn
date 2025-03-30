// 下一个功能单元
let nextUnitOfWork = null

// 内存中根节点
let wipRoot = null

// 页面上正在展示的根节点
let currentRoot = null

// 需要删除的节点
let deletions = null

function render(element, container) {
  // 根据 root 创建一个fiber
  wipRoot = {
    dom: container,
    alternate: currentRoot,
    props: {
      children: [element],
    },
  }

  deletions = []
  nextUnitOfWork = wipRoot
}

function createDom(fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)

  return dom
}

function reconcileChildren(wipFiber, elements) {
  // 索引
  let index = 0
  // 上一个兄弟节点
  let prevSibling = null
  // 上一次渲染的 fiber
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  console.log('oldFiber:', oldFiber)

  while (index < elements.length || oldFiber) {
    const element = elements[index]

    let newFiber = null

    const sameType = oldFiber && element && element.type === oldFiber.type

    // 更新 fiber
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      }
    }

    // 创建 fiber
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      }
    }

    // 删除 fiber
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }

    // 处理老fiber的兄弟节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    // 将第一个孩子节点设置为 fiber 的子节点
    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  const elements = fiber.props.children
  reconcileChildren(fiber, elements)

  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }

    nextFiber = nextFiber.parent
  }
}

function updateDom(dom, prevProps, nextProps) {
  const isEvent = (key) => key.startsWith('on')
  const isProperty = (key) => key !== 'children' && !isEvent(key)
  // 是否为需要新增的属性
  const isNew = (prev, next) => (key) => prev[key] !== next[key]
  // 是否为需要删除的属性
  const isGone = (prev, next) => (key) => !(key in next)

  // 移除老的事件监听
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(eventType, prevProps[name])
    })

  // 移除老的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = ''
    })

  // 设置新的属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name]
    })

  // 添加新的事件处理
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    })
}

// 处理提交fiber树
function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

// 提交任务，将 fiber tree 渲染为真实 DOM
function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function workLoop(deadline) {
  // 停止标识
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    // 执行工作单元

    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    // 判断是否要停止
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

export default render

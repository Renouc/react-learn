function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type)

  const props = Object.keys(element.props).filter((key) => key !== 'children')
  props.forEach((prop) => {
    dom[prop] = element.props[prop]
  })

  const children = element.props.children
  if (children && children.length > 0) {
    children.forEach((child) => render(child, dom))
  }

  container.appendChild(dom)
}

export default render

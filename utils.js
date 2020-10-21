function ge (selector, root) {
  return ga(selector, root)[0]
}

function _ge(...args) {
  return ge.bind(this, ...args)
}

function ga (selector, root = document) {
  while (typeof root.querySelector !== 'function') {
    root = root.parentNode
  }
  return root.querySelectorAll(selector)
}

function isHidden(el) {
  return el ? el.offsetParent === null : true
}

function ce (tagName, attrs, innerHTML) {
  const el = document.createElement(tagName)
  attrs && Object.assign(el, attrs)
  if (innerHTML) {
    el.innerHTML = innerHTML
  }
  return el
}

function injectStyle (css) {
  const style = ce('style', { type: 'text/css' })
  style.appendChild(document.createTextNode(css))
  document.head.appendChild(style)
}

function guid(length = 22) {
    const buf = []
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        
    for (let i = 0, l = chars.length; i < length; i++) {
        buf[i] = chars.charAt(Math.floor(Math.random() * l))
    }
    
    return buf.join('')
}

function shuffleArray(arr){
  return arr.sort(() => Math.floor(Math.random() * Math.floor(3)) - 1)
}

function randomInteger(min, max) {
  return Math.round(min - 0.5 + Math.random() * (max - min + 1))
}

function randomItem (array) {
    return array ? array[array.length * Math.random() | 0] : null
}

function waitUntil (condition, repeatTimeout = 500, maxRetries = 300) {
  return new Promise((resolve, reject) => {
    const cycle = () => {
      try {
        const result = condition()
        if (result) return resolve(result)
      } catch (e) { console.warn(e) }
      maxRetries-- && setTimeout(cycle, repeatTimeout) || reject()
    }
    return cycle()
  })
}

function wait (timeout=1) {
  return new Promise(resolve => setTimeout(resolve, timeout < 100 ? timeout * 1e3 : timeout))
}

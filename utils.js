function ge (selector, root) {
  return ga(selector, root)[0]
}
function ga (selector, root = document) {
  while (typeof root.querySelector !== 'function') {
    root = root.parentNode
  }
  return root.querySelectorAll(selector)
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

function waitUntil (condition, repeatTimeout = 500, maxRetries = 120) {
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
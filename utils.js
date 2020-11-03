;(function (window){
  const dbg = Debug('utils')
  
  Object.assign(window, { Utils: {
    HTML: {
      ce,
      ge,
      ga,
      isHidden,
      isVisible,
      injectStyle,
      find: findEl,
      findAll: findEls,
      Selector
    },
    Array: {
      shuffle: shuffleArray,
      random: randomItem
    },
    Math: {
      random: randomInteger
    },
    Crypto: {
      guid,
    },
    Promise: {
      sleep,
      until
    },
    CheckInvoke,
    Debug
  }})

  function Debug (namespace = '') {
    const log = console.log.bind(console, namespace)
    log.extend = m => Debug(namespace + ':' + n)
    return log
  }

  function findEl (condition, parent) { return findAll(condition, parent)[0] }
  function findEls (condition, parent) { return condition(parent) }

  function Selector (selector) {
    return root => ga(selector, root)
  }

  function CheckInvoke (name, value = true, validator = null) {
    let result = null
    if (typeof validator === 'function') {
      try {
        result = validator()
        console.info('Using validator function, result is:', result)
        if (result) return result
      } catch (e) { console.warn('Validator error:', e) }
    } else if (sessionStorage[name]) {
      console.info(`Stop execution of "${name}". Result exists:`, sessionStorage[name])
      try {
        result = JSON.parse(sessionStorage[name])
      } catch (e) { console.warn('JSON parse error:', e) }
    }
    sessionStorage[name] = JSON.stringify(value)
    return result
  }

  function ge (selector, root) {
    return ga(selector, root)[0]
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

  function isVisible(el) {
    return !isHidden(el)
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

  function until (condition, repeatTimeout = 250, maxRetries = 100) {
    return new Promise((resolve, reject) => {
      const cycle = () => {
        try {
          const result = condition()
          if (result) return resolve(result)
        } catch (e) {
          dbg.extend('until')(e)
          console.warn(e)
        }
        if (maxRetries--) {
          return setTimeout(cycle, repeatTimeout)
        }
        reject(new Error('Condition fails', condition))
      }
      return cycle()
    })
  }

  function sleep (timeout=1) {
    return new Promise(resolve => setTimeout(resolve, timeout < 100 ? timeout * 1e3 : timeout))
  }

})(unsafeWindow)

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
    Sleep,
    Until,
    CheckInvoke,
    Debug
  }})

  function Debug (namespace = '') {
    const ts = Date.now()
    const log = (...args) => console.log(
      '%c +%s %c %s %c',
      'background:dodgerblue;font-weight:600;color:lightcyan',
      ((Date.now() - ts) / 1000) + 's',
      'background:lightcyan;font-weight:600;color:darkblue',
      namespace,
      '',
      ...args)
    log.extend = m => Debug(namespace + ':' + m)
    return log
  }

  function findEl (condition, parent) { return () => condition(parent) }

  function Selector (selector) {
    return Object.assign(root => ge(selector, root), { __selector: selector })
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

  function Until (condition, repeatTimeout = 300, maxRetries = 100) {
    return new Promise(resolve => {
      const cycle = () => {
        let result = null
        try {
          result = condition()
          if (result) return resolve(result)
        } catch (e) {
          dbg.extend('until')('Condition fail to execute', condition, e)
        }
        if (maxRetries--) {
          return setTimeout(cycle, repeatTimeout)
        }
        return resolve(result)
      }
      return cycle()
    })
  }

  function Sleep (timeout=1) {
    return new Promise(resolve => setTimeout(resolve, timeout < 100 ? timeout * 1e3 : timeout))
  }

})(unsafeWindow)

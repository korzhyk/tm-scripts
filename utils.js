;(function (window){
  class Selector extends Promise {
    get [Symbol.toStringTag]() {
      return 'Selector'
    }

    static get [Symbol.species]() {
      return Promise
    }

    static find(selector = '', parent = document) {
      return Selector.resolve(parent && parent.querySelector(selector))
    }

    static findAll(selector = '', parent = document) {
      return Promise.resolve(parent && parent.querySelectorAll(selector))
    }

    static wait(selector, ...args) {
      return Selector.resolve(until(() => Selector.find(selector), ...args))
    }

    static waitAll(selector, ...args) {
      return until(() => Selector.findAll(selector).then(els => els.length && els), ...args)
    }

    find(selector) {
      return Selector.resolve(this.then(el => Selector.find(selector, el)))
    }

    findAll(selector) {
      return this.then(el => Selector.findAll(selector, el))
    }

    wait (selector, ...args) {
      return Selector.resolve()
      Selector.resolve(this.then(el => until(() => Selector.find(selector, el), ...args)))
    }

    text() {
      return this.then(el => (el ? el.innerText : ''))
    }

    attr(name) {
      return this.then(el => el && el.getAttribute(name))
    }

    on(event, handler) {
      return this.then(el => (
        el &&
        el.addEventListener &&
        el.addEventListener(event, handler),
        el)
      )
    }

    off(event, handler) {
      return this.then(el => (
        el &&
        el.removeEventListener &&
        el.removeEventListener(event, handler),
        el)
      )
    }
  }

  Object.assign(window, { Utils: {
    HTML: {
      isHidden,
      isVisible,
      injectStyle,
      Selector,
      ce
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
    sleep,
    until,
    invoked,
    debug
  }})

  function debug (namespace = '') {
    const ts = window.performance.now()
    const log = (...args) => console.log(
      '%c +%s %c %s %c',
      'background:dodgerblue;font-weight:600;color:lightcyan',
      ((window.performance.now() - ts) / 1000).toFixed(3) + 's',
      'background:lightcyan;font-weight:600;color:darkblue',
      namespace,
      '',
      ...args)
    log.extend = m => debug(namespace + ':' + m)
    return log
  }


  function sleep (timeout=1) {
    return new Promise(resolve => setTimeout(resolve, timeout < 100 ? timeout * 1e3 : timeout))
  }

  function until(fn, until = Infinity, timeout = 333) {
    return new Promise(resolve => {
      const frametime = 1000 / 30
      if (until < frametime) {
        until *= 1000 // if `until` < `frametime` at 30fps convert to seconds
      }
      let _t,
        _a = isFinite(until) ? timeout : 0
      setTimeout(async function _callback() {
        const result = await fn()
        if (result || _t > until) return resolve(result)
        _t += _a
        setTimeout(_callback, timeout)
      }, (_t = frametime))
    })
  }

  function invoked (name, value = true) {
    return sessionStorage[name] ? null : (sessionStorage[name] = JSON.stringify(value))
  }

  function isHidden(el) {
    return !isVisible(el)
  }

  function isVisible(el) {
    return el && (el.offsetParent !== null || el.style.display !== 'none' || el.style.visibility !== 'hidden')
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

  function guid(length = 16) {
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

  function randomItem (items) {
      return items ? items[items.length * Math.random() | 0] : null
  }

})(unsafeWindow);

;(function (){

  class Selector extends Promise {
    static get [Symbol.species]() {
      return Promise
    }

    static find(selector = '', parent) {
      return Selector.resolve((parent || document).querySelector(selector))
    }

    static findAll(selector = '', parent) {
      return SelectorMulti.resolve((parent || document).querySelectorAll(selector))
    }

    static wait(selector, ...args) {
      return Selector.resolve(until(() => Selector.find(selector), ...args))
    }

    static waitAll(selector, ...args) {
      return SelectorMulti.resolve(
        until(() => Selector.findAll(selector).then(els => els.length && els), ...args)
      )
    }

    find(selector) {
      return Selector.resolve(this.then(el => Selector.find(selector, el)))
    }

    findAll(selector) {
      return SelectorMulti.resolve(
        this.then(el => Selector.findAll(selector, el))
      )
    }

    wait (selector, ...args) {
      return Selector.resolve(this.then(el => until(() => Selector.find(selector, el), ...args)))
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

  class SelectorMulti extends Promise {
    static get [Symbol.species]() {
      return Promise
    }

    count () {
      return this.then(els => els.length)
    }

    forEach (callback) {
      return SelectorMulti.resolve(this.then(els => {
        els.forEach(callback)
        return els
      }))
    }

    map (callback) {
      return SelectorMulti.resolve(
        this.then(els => Promise.all(Array.prototype.map.call(els, callback)))
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
    debug,
    parseDate: parseDateFactory(),
    parseMoney: parseMoneyFactory(),
    parseTime: parseTimeFactory()
  }})

  function parseTimeFactory (whiteSpaceRx = /[\s\n\t]/gm) {
    return function parseTime (str = '', delimiter = ':') {
      str = String(str).replace(whiteSpaceRx, '')
      return str.split(delimiter).reverse().reduce(($, n, i) => $ + n * Math.pow(60, i), 0)
    }
  }

  function parseDateFactory (timezoneRx = /\w+$/) {
    const tzReplace = {
      CST: +8,
      EET: 2,
      MSK: 3,
      PT: -8
    }
    return function parseDate (str = '', date = new Date()) {
      str = str.trim()
      if (isNaN(+str)) {
        const match = str.match(timezoneRx)
        const tz = match && match[0]
        if (tzReplace.hasOwnProperty(tz)) {
          const timezone = tzReplace[tz]
          const negative = timezone < 0
          let replace = negative ? '-' : '+'
          replace += String(Math.abs(timezone)).padStart(2, '0')
          replace = String(replace).padEnd(5, '0')
          str = str.replace(timezoneRx, replace)
        }
        if (!~str.indexOf(date.getFullYear())) {
          str += ' ' + date.getFullYear()
        }
      } else {
        str = +str
      }
      const result = new Date(str)
      return result == 'Invalid Date' ? null : result
    }
  }

  function parseMoneyFactory (digitsRx = /[^0-9\.,]/g) {
    return function parseMoney (str = '') {
      return Number(str.replace(digitsRx, '').replace(',', '.'))
    }
  }

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


  function sleep (timeout = 1) {
    return new Promise(resolve => setTimeout(resolve, timeout < 100 ? timeout * 1e3 : timeout))
  }

  function until (fn, until = Infinity, timeout = 333) {
    return new Promise(resolve => {
      const frametime = 1000 / 60

      if (until < frametime) {
        until *= 1000 // if `until` < `frametime` at 60fps convert to seconds
      }

      let _t = 0
      let _a = isFinite(until) ? timeout : 0

      setTimeout(async function _callback () {
        const result = await fn()
        if (result || _t > until) return resolve(result)
        _t += _a
        setTimeout(_callback, timeout)
      }, (_t += frametime))
    })
  }

  const jsonSerialize = (key, value) => {
    if(typeof value === 'object' && value !== null && value.__dataType) {
      switch (value.__dataType) {
        case 'Map':
          return new Map(value.__value)
        case 'Set':
          return new Set(value.__value)
        default:
          return value
      }
    }
    return value
  }

  function jsonDeserialize (key, value) {
    if(this[key] instanceof Map || this[key] instanceof Set) {
      return {
        __dataType: this[key].constructor.name,
        __value: [...this[key]]
      }
    }
    return value
  }

  function invoked (name, value = true) {
    const serialized = JSON.stringify(value, jsonDeserialize)
    const exists = sessionStorage[name]

    if (exists) {
      try {
        if (serialized == exists) return JSON.parse(exists, jsonSerialize)
      } catch (e) {
        return value
      }
    }
    
    sessionStorage[name] = serialized
    return false
  }

  function isHidden (el) {
    return !isVisible(el)
  }

  function isVisible (el) {
    return el && (
        el.offsetParent !== null ||
        el.style.display !== 'none' ||
        el.style.visibility !== 'hidden'
      )
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

  const $hexDict = 'abcdef0123456789'
  const $plainDict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  function guid (length = 16, dict = $plainDict) {
      const l = ++dict.length
      let r = ''
      
      while (length--) {
        r += dict.charAt(l * Math.random() | 0)
      }

      return r
  }

  function shuffleArray (array) {
    return array.sort(() => (Math.random() * 3 | 0) - 1)
  }

  function randomInteger (min, max) {
    return Math.round(min - .5 + Math.random() * (max - min + 1))
  }

  function randomItem (items) {
      return items && items[items.length * Math.random() | 0] || null
  }

})();

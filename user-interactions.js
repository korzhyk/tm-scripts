// @require https://raw.githubusercontent.com/korzhyk/tm-scripts/test/utils.js
;(function (window){
  const dbg = Utils.Debug('user_actions')

  Object.assign(window, {
    UserActions: {
      click,
      delay,
      fill,
      swipe,
      tap,
      touchEvent
    }
  })
  
  dbg('UserActions was exposed!', window.UserActions)

  const calcOffset = (value, offset = 0, base = 0) => {
    if (!isFinite(offset)) {
      offset = 0
    }
    if (offset && offset < 1 && offset > -1) {
      value *= offset
    } else {
      value += offset
    }
    return Math.floor(value + base)
  }

  const randomPos = (radius = 4) => {
    const rand = Math.random()
    return Math.ceil((rand > .5 ? 1 : -1) * rand * radius)
  }

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  const nativeCheckedValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked').set
  const nativeSelectedValueSetter = Object.getOwnPropertyDescriptor(window.HTMLOptionElement.prototype, 'selected').set
  
  const clickEvent = new Event('click', { bubbles: true })
  const changeEvent = new Event('change', { bubbles: true })
  const focusEvent = new Event('focus', { bubbles: true })
  const blurEvent = new Event('blur', { bubbles: true })

  function delay (min = 80, max = 120) { return new Promise(r => setTimeout(r, Utils.Math.random(min, max))) }

  function fill (field, value) {
    if (!field) return
    dbg.extend('fill')('Fill "' + field.type + '" type field with:', value)
    field.dispatchEvent(focusEvent)
    switch (field.type) {
      case 'select-one':
        for (let i = field.options.length - 1; i >= 0; i--) {
          if (field.options[i].value == value) {
            nativeSelectedValueSetter.call(field.options[i], !!value)
            break
          }
        }
        break
      case 'checkbox':
      case 'radio':
        nativeCheckedValueSetter.call(field, !!value)
        break
      default:
        nativeInputValueSetter.call(field, value)
    }
    field.dispatchEvent(changeEvent)
    field.dispatchEvent(blurEvent)
  }

  function click (target) {
    dbg.extend('click')('Click event on target:', target)
    target.dispatchEvent(clickEvent)
  }

  function tap (target, options = [.5, .5]) {
    const { left, top, width, height } = target.getBoundingClientRect()
    const [ offsetX, offsetY ] = options

    const x = calcOffset(width, offsetX, left)
    const y = calcOffset(height, offsetY, top)
    
    dbg.extend('touch')('Touch event at pos:', { x, y }, 'and target:', target)

    touchEvent(x, y, target, 'touchstart')
    touchEvent(x, y, target, 'touchend')
  }

  function touchEvent(x, y, target, eventType) {
    dbg.extend('touch')('Simulate', eventType, 'event at:', {x,y}, 'on target:', target)
    const radius = randomPos()
    const touchObj = new Touch({
      identifier: Date.now(),
      target,
      clientX: x,
      clientY: y,
      radiusX: radius,
      radiusY: radius,
      rotationAngle: 10,
      force: 0.5
    })

    const touchEvent = new TouchEvent(eventType, {
      cancelable: true,
      bubbles: true,
      touches: [ touchObj ],
      targetTouches: [],
      changedTouches: [ touchObj ],
      shiftKey: true
    })

    target.dispatchEvent(touchEvent)
  }

  async function swipe (target, origin = [.5, .5], end = [100, 100]) {
    const [x, y] = end
    const tRect = target.getBoundingClientRect()
    const startX = Math.floor(tRect.x + tRect.width / 2)
    const startY = Math.floor(tRect.y + tRect.height / 2)
    const endX = startX + x
    const endY = startY + y

    dbg.extend('swipe')('Simulate user swipe on target:', target)

    touchEvent(startX, startY, target, 'touchstart')
    await delay()
    touchEvent(startX, startY, target, 'touchmove')
    await delay()
    touchEvent(endX, endY, target, 'touchmove')
    await delay()
    touchEvent(endX, endY, target, 'touchend')
  }

})(unsafeWindow);

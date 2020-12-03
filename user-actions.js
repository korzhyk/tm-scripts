// @require https://raw.githubusercontent.com/korzhyk/tm-scripts/test/utils.js
;(function (){
  const dbg = Utils.debug('user_actions')

  Object.assign(window, {
    UserActions: {
      click,
      delay,
      fill,
      swipe,
      tap,
      multiTap,
      touchEvent
    }
  })
  
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

  function delay (min = 80, max = 120) { return Utils.sleep(Utils.Math.random(min, max)) }

  function fill (field, value) {
    if (!field) return
    dbg.extend('fill')(`Fill "${field.type}":`, value)
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
    dbg.extend('click')('Click on:', target)
    target.dispatchEvent(clickEvent)
  }

  function tap (target, options = [.5, .5]) {
    const { left, top, width, height } = target.getBoundingClientRect()
    const [ offsetX, offsetY ] = options

    const x = calcOffset(width, offsetX, left)
    const y = calcOffset(height, offsetY, top)
    
    dbg.extend('touch')('Touch at:', { x, y }, 'on:', target)

    touchEvent(x, y, target, 'touchstart')
    touchEvent(x, y, target, 'touchend')
  }

  function multiTap (target, options = [.5, .5], count = 1) {

    const { left, top, width, height } = target.getBoundingClientRect()
    const [ offsetX, offsetY ] = options

    const x = calcOffset(width, offsetX, left)
    const y = calcOffset(height, offsetY, top)

    dbg.extend('touch')('Multi touch at:', { x, y }, 'on:', target)

    const touches = []

    while (touches.length <= count) {
      touches.push(
        new Touch({
          identifier: Date.now(),
          target,
          clientX: x + randomPos(),
          clientY: y + randomPos(),
          radiusX: randomPos(),
          radiusY: randomPos(),
          rotationAngle: Utils.Math.random(2, 9),
          force: 0.1 * Utils.Math.random(1, 9)
        })
      )
    }

    target.dispatchEvent(new TouchEvent('touchstart', {
      cancelable: true,
      bubbles: true,
      touches: touches,
      targetTouches: [],
      changedTouches: touches,
      shiftKey: true
    }))

    target.dispatchEvent(new TouchEvent('touchend', {
      cancelable: true,
      bubbles: true,
      touches: touches,
      targetTouches: [],
      changedTouches: touches,
      shiftKey: true
    }))
  }

  function touchEvent(x, y, target, eventType) {
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

  async function swipe (target, start = [.5, .5], end = [100, 100]) {
    const [sx, sy] = start 
    const [ex, ey] = end 
    const { x, y, width, height } = target.getBoundingClientRect()
    const startX = Math.floor(x + width * sx)
    const startY = Math.floor(y + height * sy)
    const endX = startX + ex
    const endY = startY + ey

    dbg.extend('swipe')('Swipe at:', { startX, startY, endX, endY }, 'on:', target)

    touchEvent(startX, startY, target, 'touchstart')
    touchEvent(startX, startY, target, 'touchmove')
    await delay(100, 140)
    touchEvent(endX, endY, target, 'touchmove')
    touchEvent(endX, endY, target, 'touchend')
  }

})();

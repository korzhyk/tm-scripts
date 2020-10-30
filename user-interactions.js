// @grant unsafeWindow
;(function (window){
  Object.assign(window, {
    clickOn,
    fillField
  })

  let marker
  try {
    marker = Object.assign(document.createElement('div'), {
      style: `position: absolute; top: 0; left: 0;
      width: 19px;
      height: 19px;
      border-radius: 50%;
      background: rgba(0,0,0,.4);
      box-shadow: 0 0 0 2px rgba(255,255,255,.5);
      transform: translate(-50%,-50%)`
    })
    document.body.appendChild(marker)
  } catch (e) { console.warn('Unable to create marker.') }

  function clickOn (el, options = [.5, .5]) {
    const randPos = (pos, rand = Math.random()) => pos + (rand > .5 ? 1 : -1) * rand * 10
    const { left, top, width, height } = el.getBoundingClientRect()
    const [ offsetX, offsetY ] = options
    const x = left + randPos(width * offsetX)
    const y = top + randPos(height * offsetY)

    marker && Object.assign(marker.style, { left: `${x}px`, top: `${y}px` })

    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: 1,
      clientX: x,
      clientY: y,
      screenX: x,
      screenY: y,
      view: window,
      sourceCapabilities: new InputDeviceCapabilities({ firesTouchEvents: true })
    })

    el.dispatchEvent(event)
  }

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  const nativeCheckedValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked').set
  const nativeSelectedValueSetter = Object.getOwnPropertyDescriptor(window.HTMLOptionElement.prototype, 'selected').set
  const changeEvent = new Event('change', { bubbles: true })
  const focusEvent = new Event('focus', { bubbles: true })
  const blurEvent = new Event('blur', { bubbles: true })
  const userDelay = (min = 80, max = 120) => new Promise(r => setTimeout(r, randomInteger(min, max)))

  async function fillField (field, value) {
    field.dispatchEvent(focusEvent)
    await userDelay()
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
        const chars = String(value).split('')
        let inputValue = ''
        for (var i = 0, l = chars.length; i < l; i++) {
          inputValue += chars[i]
          await userDelay(50, 80)
          nativeInputValueSetter.call(field, inputValue)
          field.dispatchEvent(changeEvent)
        }
    }
    field.dispatchEvent(changeEvent)
    await userDelay()
    field.dispatchEvent(blurEvent)
  }
})(unsafeWindow);

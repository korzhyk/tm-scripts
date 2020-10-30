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

  const nativeFocus = window.HTMLElement.prototype.focus
  const nativeBlur = window.HTMLElement.prototype.blur
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  const nativeCheckedValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked').set
  const nativeSelectedValueSetter = Object.getOwnPropertyDescriptor(window.HTMLOptionElement.prototype, 'selected').set
  const changeEvent = new Event('change', { bubbles: true })

  function fillField (field, value) {
    nativeFocus.call(field)
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
        String(value).split().reduce(async (acc, c) => {
          await new Promise(r => setTimeout(r, 250))
          acc += c
          nativeInputValueSetter.call(field, acc)
          field.dispatchEvent(changeEvent)
          return acc
        }, '')
    }
    field.dispatchEvent(changeEvent)
    nativeBlur.call(field)
  }
})(unsafeWindow);

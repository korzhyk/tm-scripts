(function (global, doc){
  Object.assign(global, {
    clickOn
  })

  let marker
  try {
    marker = Object.assign(doc.createElement('div'), {
      style: `position: absolute; top: 0; left: 0;
      width: 19px;
      height: 19px;
      border-radius: 50%;
      background: rgba(0,0,0,.4);
      box-shadow: 0 0 0 2px rgba(255,255,255,.5);
      transform: translate(-50%,-50%)`
    })
    doc.body.appendChild(marker)
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
})(this, document)

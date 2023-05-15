// 与谷歌插件的通讯
let cbs = {}
function callChrome(data, cb) {
  const { key = '', params } = data
  if (!key) { return }
  let cbid = ''
  if (cb) {
    cbid = 'wujr' + Date.now() + '' + Math.round(Math.random() * 100000)
    cbs[cbid] = cb
  }
  let message = { cbid: '', key, params }
  if (cbid) { message.cbid = cbid }
  chrome.runtime.sendMessage(
    chrome.runtime.id,
    {...message, type: 'ajaxInterceptor_iframe', to: 'background'}
  )
  // window.parent.postMessage(message, '*')
}
window.addEventListener('message', event => {
  const message = event.data
  switch (message.cmd) {
    case 'chromeJsCallback':
      if (message.cbid) {
        (cbs[message.cbid] || function () { })(message.res)
        delete cbs[message.cbid]
      }
      break
    default: break
  }
}, false)
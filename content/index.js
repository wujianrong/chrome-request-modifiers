
class IFRAME_FUNCTIONS_CLASS {
  constructor() {
    this.SWITCH_KYE = 'AJAX_PLUGIN_VUE_SWITCHON'
    this.API_DATA_KYE = 'AJAX_PLUGIN_VUE_API_DATA'
  }
  /**
   * @description: 设置 SWITCH 缓存数据
   * @param msg { key: 'SET_SWITCH', params: { value: <Boolean> } }
   * @return 
  */
  async SET_SWITCH(msg, cb) {
    const { params } = msg
    const _res = await chrome.storage.local.set({[this.SWITCH_KYE]: params.value}, () => {
      cb && cb()
    })
    postMessage({type: 'ajaxInterceptor_xhr', to: 'xhr.js', key: 'ajaxInterceptor_xhr_switchOn', value: params.value})
    if(_res) {
      return _res[this.SWITCH_KYE]
    }
  }
  async GET_SWITCH(msg, cb) {
    const _res = await chrome.storage.local.get([this.SWITCH_KYE], (_data) => {
      cb(_data[this.SWITCH_KYE])
    })
    if(_res) {
      return _res[this.SWITCH_KYE]
    }
  }
  /**
   * @description: 设置 API_DATA 缓存数据
   * @param msg msg { key: 'SET_API_DATA_ALL', params: { value: <Array> } }
   * @return 
  */
  async SET_API_DATA_ALL({params}, cb) {
    const _res = await chrome.storage.local.set({[this.API_DATA_KYE]: params.value}, () => {
      cb && cb()
    })
    postMessage({type: 'ajaxInterceptor_xhr', to: 'xhr.js', key: 'ajaxInterceptor_xhr_rules', value: params.value})
    if(_res) {
      return _res[this.API_DATA_KYE]
    }
  }
  async GET_API_DATA_ALL(msg, cb) {
    const _res = await chrome.storage.local.get([this.API_DATA_KYE])
    if(_res) {
      let _data = _res[this.API_DATA_KYE]
      if (!_data || JSON.stringify(_data) == "{}") _data = []
      cb && cb(_data)
      return _data
    } else {
      return []
    }
  }
  /**
   * @description: 获取 API_DATA 缓存数据
   * @param msg msg { key: 'GET_API_DATA', params: { id: <string> } }
   * @return 
  */
  async GET_API_DATA(msg, cb) {
    const { params } = msg
    const _data = await this.GET_API_DATA_ALL()
    const _res = _data.find((i) => i.id === params.id)
    cb && cb(_res)
    return _res || []
  }
  /**
   * @description: 设置 API_DATA 缓存数据
   * @param msg msg { key: 'SET_API_DATA', params: { id: <string>, value: object } }
   * @return 
  */
  async SET_API_DATA({params}, cb) {
    const _data = await this.GET_API_DATA_ALL()
    const _index = _data.findIndex((i) => i.id === params.id)
    if (_index !== -1) {
      _data[_index] = params.value
    } else {
      _data.unshift(params.value)
    }
    this.SET_API_DATA_ALL({params: {value: _data}})
    cb && cb(_data)
    return _data || []
  }
  /**
   * @description: 设置 API_DATA 缓存数据
   * @param msg msg { key: 'SET_API_DATA', params: { id: <string> } }
   * @return 
  */
   async REMOVE_API_DATA({params}, cb) {
    const _data = await this.GET_API_DATA_ALL()
    const _index = _data.findIndex((i) => i.id === params.id)
    if (_index !== -1) {
      _data.splice(_index, 1)
    }
    this.SET_API_DATA_ALL({params: {value: _data}})
    cb && cb(_data)
    return _data || []
  }
}


const iframeFunctionObj = new IFRAME_FUNCTIONS_CLASS()



const script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', chrome.runtime.getURL('content/xhr.js'));
document.documentElement.appendChild(script);
// pagescript插入后，获取缓存中的数据状态，发送消息给pagescript
script.addEventListener('load', async () => {
  const _res = await chrome.storage.local.get(['AJAX_PLUGIN_VUE_SWITCHON', 'AJAX_PLUGIN_VUE_API_DATA'])
  let { AJAX_PLUGIN_VUE_SWITCHON, AJAX_PLUGIN_VUE_API_DATA } = _res
  if (AJAX_PLUGIN_VUE_SWITCHON) {
    postMessage({type: 'ajaxInterceptor_xhr', to: 'xhr.js', key: 'ajaxInterceptor_xhr_switchOn', value: AJAX_PLUGIN_VUE_SWITCHON})
  }
  if (AJAX_PLUGIN_VUE_API_DATA) {
    postMessage({type: 'ajaxInterceptor_xhr', to: 'xhr.js', key: 'ajaxInterceptor_xhr_rules', value: AJAX_PLUGIN_VUE_API_DATA})
  }
})


let iframe
let iframeLoaded = false
let show = false
// 只在最顶层页面嵌入iframe
try {
  if (window.self === window.top) {
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        if (!iframe) {
          iframe = document.createElement('iframe')
          iframe.className = "api-interceptor-vue"
          iframe.style.setProperty('height', '80%', 'important')
          iframe.style.setProperty('width', '60%', 'important')
          iframe.style.setProperty('min-width', '1px', 'important')
          iframe.style.setProperty('border-radius', '10px', 'important')
          iframe.style.setProperty('position', 'fixed', 'important')
          iframe.style.setProperty('top', '50%', 'important')
          iframe.style.setProperty('left', '50%', 'important')
          iframe.style.setProperty('z-index', '9999999999999', 'important')
          iframe.style.setProperty('transform', 'translate(-50%, -50%)', 'important')
          iframe.style.setProperty('transition', 'all .4s', 'important')
          iframe.style.setProperty('box-shadow', '0 0 15px 2px rgba(0,0,0,0.12)', 'important')
          iframe.style.setProperty('display', 'none', 'important')
          iframe.frameBorder = "none"
          iframe.src = chrome.runtime.getURL("views/index.html")
          if (document.body) document.body.appendChild(iframe)
        }
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
          if (request.cmd == 'toggle') {
            setDialogShow(!show)
          }
          sendResponse('content收到：' + JSON.stringify(request))
          return true
        })
      }
    }
  }
} catch (error) {}

const setDialogShow = (value) => {
  show = value
  iframe.style.setProperty('display', (show ? 'block' : 'none'), 'important')
}

// 接收background.js传来的信息
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'ajaxInterceptor_xhr' && msg.key === 'ajaxInterceptor_xhr_all_show') {
    setDialogShow(msg.value)
    return
  }
  if (msg.type === 'ajaxInterceptor_xhr' && msg.to === 'content') {
    if (msg.hasOwnProperty('iframeScriptLoaded')) {
      if (msg.iframeScriptLoaded) iframeLoaded = true;
    } else {
      postMessage({type: 'ajaxInterceptor_xhr', to: 'xhr.js', key: msg.key, value: msg.value})
    }
  }
  // 监听iframe(沙盒) 通讯
  if (msg.type === 'ajaxInterceptor_iframe' && msg.to === 'content') {
    iframeFunctionObj[msg.key] && iframeFunctionObj[msg.key](msg, (_res) => {
      // 处理完后，发消息回去给iframe
      iframe && iframe.contentWindow.postMessage({...msg, res: _res, to: 'iframe', cmd: 'chromeJsCallback'}, '*')
    })
  }
})
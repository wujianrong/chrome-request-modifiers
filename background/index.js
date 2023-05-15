const setIconStatus = (value) => {
  if (value === true) {
    chrome.action.setIcon({path: {
      16: '/images/128-active.png',
      48: '/images/128-active.png',
      128: '/images/128-active.png',
    }})
  } else {
    chrome.action.setIcon({path: {
      16: '/images/128.png',
      48: '/images/128.png',
      128: '/images/128.png',
    }})
  }
}


// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (['ajaxInterceptor_xhr', 'ajaxInterceptor_iframe'].includes(request.type) && request.to === 'background'){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      if (tabs.length) {
        const currentView = tabs[0]
        if (currentView.url !== 'chrome://extensions/') {
          chrome.tabs.sendMessage(tabs[0].id, {...request, to: 'content'})
        } else {
          onsole.log('当前页为拓展页，通讯失败，请刷新')
        }
      } else {
        console.log('初次安装，需要刷新后生效')
      }
    })
    // 如果是设置开关，需要修改icon的颜色
    if (request.key === 'SET_SWITCH' && request.params) {
      setIconStatus(request.params.value)
    }
  }
})


// 拓展 icon 点击 触发事件
chrome.action.onClicked.addListener(function(tab, sender, sendResponse) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {...{ cmd: 'toggle' }, to: 'content'})
  })
})

// 初始化icon状态
chrome.storage.local.get(['AJAX_PLUGIN_VUE_SWITCHON'], (res) => {
  if (res.hasOwnProperty('AJAX_PLUGIN_VUE_SWITCHON')) {
    setIconStatus(res.AJAX_PLUGIN_VUE_SWITCHON)
  }
})

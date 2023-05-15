// xhr.js 重写xhr，实现拦截请求，在插件初始化完成后，会通过script标签，将这段脚本插入到页面里
let xhr_class_ajax_interceptor_vue = {
  settings: {
    switchOn: false,
    rules: []
  },
  getApiSelectItem: (responseURL, rules) => {
    const _res = rules.find((i) => {
      const a = i.filterType === 'normal' && responseURL.indexOf(i.api) > -1
      const b = i.filterType === 'regex' && responseURL.match(new RegExp(i.api, 'i'))
      const c = i.filterType === 'exact' && responseURL === i.api
      return (a || b || c) && !!i.status
    })
    return _res
  },
  //  window - xhr
  originalXHR: window.XMLHttpRequest,
  // 插件 - xhr
  pliginXHR: function () {
    const modifyResponse = () => {
      const { rules } = xhr_class_ajax_interceptor_vue.settings
      const apiSelectItem = xhr_class_ajax_interceptor_vue.getApiSelectItem(this.responseURL, rules)
      // 在规则列表找到当前请求内容，并且返回体不相等才需要篡改返回体内容
      if (apiSelectItem && this.responseText !== apiSelectItem.response) {
        this.responseText = apiSelectItem.response
        this.response = apiSelectItem.response
        // 把其他状态的接口处理成200，避免404/502这类状态的请求，无法正常返回
        if (apiSelectItem.httpStatus) {
          this.status = 200
          this.statusText = 'OK'
        }
      }
    }

    const xhr = new xhr_class_ajax_interceptor_vue.originalXHR
    for (let attr in xhr) {
      if (attr === 'onreadystatechange') {
        xhr.onreadystatechange = (...args) => {
          if (this.readyState == 4) {
            // 请求成功
            if (xhr_class_ajax_interceptor_vue.settings.switchOn) {
              // 开启拦截
              modifyResponse()
            }
          }
          this.onreadystatechange && this.onreadystatechange.apply(this, args)
        }

        this.onreadystatechange = null
        continue
      } else if (attr === 'onload') {
        xhr.onload = (...args) => {
          // 请求成功
          if (xhr_class_ajax_interceptor_vue.settings.switchOn) {
            // 开启拦截
            modifyResponse()
          }
          this.onload && this.onload.apply(this, args)
        }

        this.onload = null
        continue
      }

      if (typeof xhr[attr] === 'function') {
        this[attr] = xhr[attr].bind(xhr)
      } else {
        // responseText和response不是writeable的，但拦截时需要修改它，所以修改就存储在this[`_${attr}`]上
        if (attr === 'responseText' || attr === 'response' || attr === 'status' || attr === 'statusText') {
          Object.defineProperty(this, attr, {
            get: () => this[`_${attr}`] == undefined ? xhr[attr] : this[`_${attr}`],
            set: (val) => this[`_${attr}`] = val,
            enumerable: true
          })
        } else {
          Object.defineProperty(this, attr, {
            get: () => xhr[attr],
            set: (val) => xhr[attr] = val,
            enumerable: true
          })
        }
      }
    }
  },
  // window - fetch
  originalFetch: window.fetch.bind(window),
  // 插件 - fetch
  pliginFetch: function (...args) {
    return xhr_class_ajax_interceptor_vue.originalFetch(...args).then((response) => {
      let txt = undefined

      const { rules } = xhr_class_ajax_interceptor_vue.settings
      const apiSelectItem = xhr_class_ajax_interceptor_vue.getApiSelectItem(response.url, rules)
      if (apiSelectItem) {
        txt = apiSelectItem.response
      }

      if (txt !== undefined) {
        const stream = new ReadableStream({
          start (controller) {
            controller.enqueue(new TextEncoder().encode(txt))
            controller.close()
          }
        })

        const newResponse = new Response(stream, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        })
        const proxy = new Proxy(newResponse, {
          get: function (target, name) {
            switch (name) {
              case 'ok':
              case 'redirected':
              case 'type':
              case 'url':
              case 'useFinalURL':
              case 'body':
              case 'bodyUsed':
                return response[name]
            }
            return target[name]
          }
        })

        for (let key in proxy) {
          if (typeof proxy[key] === 'function') {
            proxy[key] = proxy[key].bind(newResponse)
          }
        }

        return proxy
      } else {
        return response
      }
    })
  }
}


window.addEventListener("message", function(event) {
  // data: { key: '', to: '', type: '', value: '', }
  let { data } = event
  if (data.type === 'ajaxInterceptor_xhr' && data.to === 'xhr.js') {
    if (data.key === 'ajaxInterceptor_xhr_switchOn') xhr_class_ajax_interceptor_vue.settings.switchOn = data.value
    if (data.key === 'ajaxInterceptor_xhr_rules') xhr_class_ajax_interceptor_vue.settings.rules = data.value
  }
  // 全局按钮开启，则重写XMLHttpRequest
  if (xhr_class_ajax_interceptor_vue.settings.switchOn) {
    window.XMLHttpRequest = xhr_class_ajax_interceptor_vue.pliginXHR
    window.fetch = xhr_class_ajax_interceptor_vue.pliginFetch
  } else {
    window.XMLHttpRequest = xhr_class_ajax_interceptor_vue.originalXHR
    window.fetch = xhr_class_ajax_interceptor_vue.originalFetch
  }
}, false)

// ifram 通知 需要想往 background -> 再往 xhr.js 发送消息

// iframe 数据变更 需要 通知 xhr.js
class sendXHR {
  public setSwitchOn(switchOn: boolean): void{
    chrome.runtime.sendMessage(
      chrome.runtime.id, 
      { type: 'ajaxInterceptor_xhr', to: 'background', key: 'ajaxInterceptor_xhr_switchOn', value: switchOn }
    )
  }
  public setRules(rules: []): void {
    chrome.runtime.sendMessage(
      chrome.runtime.id, 
      { type: 'ajaxInterceptor_xhr', to: 'background', key: 'ajaxInterceptor_xhr_rules', value: rules }
    )
  }
  public setAllShow(value: boolean): void {
    chrome.runtime.sendMessage(
      chrome.runtime.id, 
      { type: 'ajaxInterceptor_xhr', to: 'background', key: 'ajaxInterceptor_xhr_all_show', value }
    )
  }
}

export {
  sendXHR
}
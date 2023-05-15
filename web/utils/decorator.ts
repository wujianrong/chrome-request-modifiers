/**
 * 检查环境-是否在谷歌浏览器插件中执行 装饰器函数
 * @param target 
 * @param methodName 
 * @param descriptor 
 */
 export const checkEnv = (target: any, methodName: string, descriptor: PropertyDescriptor) => {
  const method = descriptor.value;
  const isChromeBrowser = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  // 重新定义方法，增加判断是否在浏览器插件环境中逻辑
  descriptor.value = function(...args: any[]) {
    if (isChromeBrowser && window.chrome && window.chrome.runtime) {
      // 在浏览器插件中
      return method.apply(this, args);
    } else {
      throw new Error('不在浏览器插件中，无法执行当前方法');
    }
  }
}
const domain = window.st_conf.domain || '.zhongan.com'
export default class cookie {
  constructor (domain = '.zhongan.com', path = '/', exp = 60 * 60 * 1000) {
    this.domain = domain
    this.path = path
    this.exp = exp
  }
  setCookie (name, value) {
    var exp = new Date();
    exp.setTime(exp.getTime() + this.exp);
    document.cookie = `${name}=${escape(value)};expires=${exp.toGMTString()};path=${this.path};domain=${this.domain};`
  }
  getCookie (name) {
    var arr,
      reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if ((arr = document.cookie.match(reg))) {
      return unescape(arr[2]);
    } else {
      return null;
    }
  }

  delCookie (name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = this.getCookie(name);
    if (cval != null) {
      document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
    }
  }
} 
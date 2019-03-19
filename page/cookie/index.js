// const domain = window.st_conf.domain || '.zhongan.com'
export default class Cookie {
  constructor (domain, path, exp) {
    this.domain = domain || '.zhongan.com'
    this.path = path || '/'
    this.exp = exp || 60 * 60 * 1000
  }
  setCookie (name, value) {
    var exp = new Date();
    exp.setTime(exp.getTime() + this.exp);
    debugger
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
    exp.setTime(exp.getTime() - 100 - this.exp);
    var cval = this.getCookie(name);
    if (cval != null) {
      // document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
      document.cookie = `${name}=${escape(cval)};expires=${exp.toGMTString()};path=${this.path};domain=${this.domain};`
    }
  }
} 



// const cookie = {
//   domain: 'localhost',
//   path: '/',
//   exp: 60 * 60 * 1000,
//   setCookie: function(name, value) {
//     var exp = new Date();
//     exp.setTime(exp.getTime() + cookie.exp);
//     document.cookie = `${name}=${escape(value)};expires=${exp.toGMTString()};path=${cookie.path};domain=${cookie.domain};`
//   },
//   getCookie: function(name) {
//     var arr,
//       reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
//     if ((arr = document.cookie.match(reg))) {
//       return unescape(arr[2]);
//     } else {
//       return null;
//     }
//   },
//   delCookie: function(name) {
//     var exp = new Date();
//     exp.setTime(exp.getTime() - 1);
//     var cval = cookie.getCookie(name);
//     if (cval != null) {
//       document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
//     }
//   }
// }
// export default cookie
const domain = window.st_conf.domain || '.zhongan.com'
const cookie = {
  setCookie: function(name, value) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + 60 * 60 * 1000);
    document.cookie = `${name}=${escape(value)};expires=${exp.toGMTString()};path=/;domain=${domain};`
      // name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/;domain="+ domain +";";
  },
  getCookie: function(name) {
    var arr,
      reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if ((arr = document.cookie.match(reg))) {
      return unescape(arr[2]);
    } else {
      return null;
    }
  },
  delCookie: function(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = cookie.getCookie(name);
    if (cval != null) {
      document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
    }
  }
}
export default cookie
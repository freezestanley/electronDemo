import cookie from './cookie'
(function() {
  window.ck = cookie
  var start = '/p/'
  var end = '/dm/open/cashier/cashier_pay_return.do'

  if (location.pathname.indexOf(start) === 0) {
    var cookieName = "__utrace",
    iseeCookieName = "iseebiz",
    dependCookie = window.ck.getCookie(cookieName);
    window.ck.setCookie(iseeCookieName, dependCookie + +new Date());
  } 
  if (location.pathname.indexOf(end) === 0) {
    window.ck.delCookie('iseebiz')
  }
})();

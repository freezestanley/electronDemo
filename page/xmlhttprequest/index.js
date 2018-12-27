const AjaxHook = function (ob = window) {
  ob.hookAjax = function (proxy) {
      window._ahrealxhr = window._ahrealxhr || XMLHttpRequest
      window.XMLHttpRequest = function () {
          this.xhr = new window._ahrealxhr;
          for (var attr in this.xhr) {
              var type = "";
              try {
                  type = typeof this.xhr[attr]
              } catch (e) {}
              if (type === "function") {
                  this[attr] = hookfun(attr);
              } else {
                  Object.defineProperty(this, attr, {
                      get: getFactory(attr),
                      set: setFactory(attr)
                  })
              }
          }
      }

      function getFactory(attr) {
          return function () {
              var v= this.hasOwnProperty(attr + "_")?this[attr + "_"]:this.xhr[attr];
              var attrGetterHook=(proxy[attr]||{})["getter"]
              return attrGetterHook&&attrGetterHook(v,this)||v
          }
      }

      function setFactory(attr) {
          return function (v) {
              var xhr = this.xhr;
              var that = this;
              var hook=proxy[attr];
              if (typeof hook==="function") {
                  xhr[attr] = function () {
                      proxy[attr](that) || v.apply(xhr, arguments);
                  }
              } else {
                  //If the attribute isn't writeable, generate proxy attribute
                  var attrSetterHook=(hook||{})["setter"];
                  v=attrSetterHook&&attrSetterHook(v,that)||v
                  try {
                      xhr[attr] = v;
                  }catch(e) {
                      this[attr + "_"] = v;
                  }
              }
          }
      }

      function hookfun(fun) {
          return function () {
              var args = [].slice.call(arguments)
              if (proxy[fun] && proxy[fun].call(this, args, this.xhr)) {
                  return;
              }
              return this.xhr[fun].apply(this.xhr, args);
          }
      }
      return window._ahrealxhr;
  }
  ob.unHookAjax = function () {
      if (window._ahrealxhr)  XMLHttpRequest = window._ahrealxhr;
      window._ahrealxhr = undefined;
  }

  return ob.hookAjax
}

export const CreateXMLHttp = function CreateXMLHttp(){
  //创建一个新变量并赋值false，使用false作为判断条件说明还没有创建XMLHTTPRequest对象 
  var flag=true;
  
  var xmlhttp = null;
  try{
    //尝试创建 XMLHttpRequest 对象，除 IE 外的浏览器都支持这个方法。
    xmlhttp=new XMLHttpRequest();
  }catch(e){
    try{
      //使用较新版本的 IE 创建 IE 兼容的对象（Msxml2.XMLHTTP）。
      xmlhttp=ActiveXobject("Msxml12.XMLHTTP");
    }catch(e1){
      try{
        //使用较老版本的 IE 创建 IE 兼容的对象（Microsoft.XMLHTTP）。
        xmlhttp=ActiveXobject("Microsoft.XMLHTTP");
      }catch(e2){
        flag=false; 
      } 
    }
  }
 
 //判断是否成功的例子：
  if(!flag){
    throw new RuntimeExecption("创建XMLHTTPRequest 对象失败");
  }else{
    return xmlhttp;
  }
}

export default AjaxHook
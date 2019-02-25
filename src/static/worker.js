
function Until () {
  console.log('this is until')
}
// xpath get obj dom
Until.prototype.selectNodes = function selectNodes(context, expression, namespaces) { 
  var doc = (context.nodeType !== 9 ? context.ownerDocument : context), 
    nodes = [], 
    result = null, 
    i = 0, 
    len = 0; 
    if (typeof doc.evaluate !== "undefined") { 
      var nsresolver = null; 
      if (namespaces instanceof Object) { 
        nsresolver = function(prefix) { 
          return namespaces[prefix]; 
        }; 
      } 
      result = doc.evaluate(expression, context, nsresolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); 
      if (result !== null) { 
        for (i = 0, len = result.snapshotLength; i < len; i++) { 
          nodes.push(result.snapshotItem(i)); 
        } 
      } 
      return nodes; 
    } else if (typeof context.selectNodes !== "undefined") { 
      if (namespaces instanceof Object) { 
        var ns = ''; 
        for (var prefix in namespaces) { 
          if (namespaces.hasOwnProperty(prefix)) { 
            ns += 'xmlns:' + prefix + "='" + namespaces[prefix] + "' "; 
          } 
        } 
        doc.setProperty("SelectionNamespaces", ns); 
      } 
      result = context.selectNodes(expression); 
      for (i = 0, len = result.length; i < len; i++) { 
        nodes.push(result[i]); 
      } 
      return nodes; 
    } else { 
      throw new Error("No XPath engine found."); 
    }
  } 
  // get path
  Until.prototype.readXPath = function readXPath(element) {
  if (element.id!==""){//判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
    return '//*[@id=\"'+element.id+'\"]';
  }
  if (element.getAttribute("class")!==null){ //判断class属性，如果这个元素有class，则显 示//*[@class="xPath"]  形式内容
    return '//*[@class=\"'+element.getAttribute("class")+'\"]';
  }
  //因为Xpath属性不止id和class，所以还可以更具class形式添加属性
  //这里需要需要主要字符串转译问题，可参考js 动态生成html时字符串和变量转译（注意引号的作用）
  if (element==document.body){//递归到body处，结束递归
    return '/html/'+element.tagName;
  }
  var ix= 0,//在nodelist中的位置，且每次点击初始化
      siblings= element.parentNode.childNodes;//同级的子元素

  for (var i= 0,l=siblings.length; i<l; i++) {
    var sibling= siblings[i];
    if (sibling==element){//如果这个元素是siblings数组中的元素，则执行递归操作
      return arguments.callee(element.parentNode)+'/'+element.tagName+((ix+1)==1?'':'['+(ix+1)+']');//ix+1是因为xpath是从1开始计数的，element.tagName+((ix+1)==1?'':'['+(ix+1)+']')三元运算符，如果是第一个则不显示，从2开始显示
    }else if(sibling.nodeType==1 && sibling.tagName==element.tagName){//如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
      ix++;
    }
  }
};

(function(){
  var until = new Until()
  function observer (obj) {
    var evt = obj.evt
    switch(obj.type) {
      case 'click':
        mouseClick(evt)
      break;
      case 'mouseover':
        mouseOver(evt)
      break;
      case 'unload':
        unload(evt)
      break;
    }
  }
  function mouseClick(ev) {
    // debugger
    console.log(ev)
  }
  function mouseOver(ev) {
    // debugger
    console.log(until.readXPath(ev.target))
    // if (ev.target.onmouseover) {
    //   console.log('has mouseover')
    // } else {
    //   console.log('no mouseover')
    // }
    // console.log(ev)
    // var event = window.getEventListeners(ev.target)
  }

  function unload(ev) {
    console.log(ev)
  }

  document.body.addEventListener('click', (ev) => observer({type:'click', evt: ev}))
  document.body.addEventListener('mouseover', (ev) => observer({type:'mouseover', evt: ev}))
  window.addEventListener('beforeunload', (ev) => observer({type:'unload', evt: ev}))

  var CreateWebSocket = (function () {
    return function (urlValue) {
        if (window.WebSocket) return (new window.WebSocket(urlValue));
        if (window.MozWebSocket) return new MozWebSocket(urlValue);
        return false;
    }
  })()
  var wst = new CreateWebSocket("ws://127.0.0.1:3000/test/123")
  wst.onopen = function (evt) {
    wst.send("第一条数据")
  }
  wst.onmessage = function (evt) {
    console.log("服务端说" + evt.data)
  }
  wst.onclose = function (evt) {
    console.log("Connection closed.")
  }

  var create = document.getElementById('create')
  create.onclick = function () {
    wst.send('123123123')
  }

})()
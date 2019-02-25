function loadScript(src) {
  // var script=document.createElement("script");
  //   script.type="text/javascript";
  //   script.src="http://localhost:3000/screenshot.js";
  //   document.getElementsByTagName('head')[0].appendChild(script);
  return new Promise((resolve, reject) => {
    let script=document.createElement("script");
    script.type="text/javascript";
    script.src= src;
    document.getElementsByTagName('head')[0].appendChild(script);
    script.onload = (value) => {
      console.log('done')
      resolve(value)
    }
    script.onerror = (err) => {
      reject(err)
    }
  }) 
}
// var wake = (time) => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(`${time / 1000}秒后醒来`)
//       console.log(`${time / 1000}秒后醒来`)
//     }, time)
//   })
// }
// wake(1000)
// loadScript('https://unpkg.com/axios/dist/axios.min.js').then((res) => {
//   console.log(res)
// }).catch((error) => {
//     console.log(error)
// })
var loadlist = [loadScript('https://unpkg.com/axios/dist/axios.min.js'),loadScript('http://localhost:3000/html2canvas.min.js')]

function debounce(method, delay){
  let timer = null;
  let result = function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout( function () {
            method.apply(context,args);
        }, delay);
    }
  result()
}
function snap() {
  html2canvas(document.body).then(function(canvas) {
    // let imgData = []
    // imgData.push(canvas.toDataURL("image/png"))
    axios({
      method: 'post',
      url: 'http://localhost:3000/images',
      headers: {
        "Content-Type": "text/plain"
      },
      data: canvas.toDataURL("image/jpeg",0.1)
    }).then(function (response) {
      console.log(response.data)
    }).catch(function (error) {
      console.log(error);
    });
  });
}
function domlistener () {
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
  var target = document.body; 
  var observer = new MutationObserver(function(mutations) { 
    console.dir(mutations)
    mutations.forEach(function(mutation) { 
      console.log('******************')
      console.log(mutation.type); 
      console.log('******************')
    }); 
    
    debounce(snap, 1000)
  }); 
  // 配置观察选项:
  var config = { attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true, characterDataOldValue: true } 
  // 传入目标节点和观察选项
  // observer.observe(target, config); 
  
  // 随后,你还可以停止观察
  // observer.disconnect();
}


Promise.all(loadlist).then((result) => {
  domlistener()
}).catch((error) => {
  console.log(error)
})
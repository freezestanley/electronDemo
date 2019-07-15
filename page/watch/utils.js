class tool {
  get isIE () {
    return !!window.ActiveXObject || "ActiveXObject" in window;
  };
  get getBroswer () {
		var explorer = window.navigator.userAgent,
			explorer;
		//ie
		if (explorer.indexOf("MSIE") >= 0) {
			explorer = 'ie';
		}
		//firefox
		else if (explorer.indexOf("Firefox") >= 0) {

			explorer = 'Firefox';
		}
		//Chrome
		else if (explorer.indexOf("Chrome") >= 0) {
			explorer = 'Chrome';
		}
		//Opera
		else if (explorer.indexOf("Opera") >= 0) {

			explorer = 'Opera';
		}
		//Safari
		else if (explorer.indexOf("Safari") >= 0) {
			explorer = 'Safari';
		}
		return explorer;
  }
  get getSystem () {
		var sUserAgent = navigator.userAgent;
		var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
		var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
		if (isMac) return "Mac";
		var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
		if (isUnix) return "Unix";
		var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
		if (isLinux) return "Linux";
		if (isWin) {
			var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
			if (isWin2K) return "Win2000";
			var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
			if (isWinXP) return "WinXP";
			var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
			if (isWin2003) return "Win2003";
			var isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
			if (isWinVista) return "WinVista";
			var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
			if (isWin7) return "Win7";
		}
		return "other";
  }
  get getCookie () {
		return document.cookie;
	};
	//获取分辨率
	get getResolution () {
		return (window.screen.width || 0) + "x" + (window.screen.height || 0);
  };
  //获取当前url协议.
	get getProtocol () {
		return document.location.protocol.split(':').join('');
  }
  get getAgent () {
		return navigator.userAgent;
	};
	//获取浏览器语言
	get getLanguage () {
		var type = navigator.appName,
			lang;
		if (type == "Netscape") {
			lang = navigator.language;
		} else {
			lang = navigator.userLanguage;
		}
		lang = lang.substr(0, 2);
		return lang;
  };
  get getBroswerInfo () {
    return {
      language: this.getLanguage,
      userAgent: this.getAgent,
      protocol: this.getProtocol,
      resolution: this.getResolution,
      cookie: this.getCookie,
      system: this.getSystem,
      broswer: this.getBroswer,
      geolocation: this.getGeolocation
    }
  }
  get getGeolocation () {
    debugger
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
          function (position) {
            debugger
            var y = {
              x: position.coords.latitude,
              y: position.coords.longitude
            }
            alert(y)
            return {
              x: position.coords.latitude,
              y: position.coords.longitude
            }
          },
          function (err) {//传入了error对象
            console.log(err)
          })
      }else {
        console.log("您当前使用的浏览器不支持地理定位服务")
        return {x:0, y:0}
    }
  }
}
export default new tool();
 //ajax全局变量触发过度
$(document).ajaxStart(function() {
	xw.load("载入中...");
});
$(document).ajaxStop(function(){
	xw.loadRemove();
});

$(document).ajaxError(function (e, xhr) {
    if (xhr) {
        if (xhr.status == 403) {
            xw.alert("页面停留时间过久，请重新访问页面",function(){
            	window.location.reload();
            })
        } else {
            xw.alert("系统异常，请稍后重试",function(){})
        }
    }
});

//倒计时
$.fn.countDown=function(o){
	var oParm=jQuery.extend({
		unClassName:'unclick',  //倒计时不可点击的classname
		interTime:60,           //倒计时时间
		interText:'s 重新发送', //倒计时的文字
		callBack:"",    //倒计时结束 执行的function
		isReturn:true,   //倒计时结束 是否还原
	},o);
	var inter,_self=$(this),t=oParm.interTime,oText=_self.text();
	if(_self.hasClass(oParm.unClassName)){
		return false;
	}
	_self.addClass(oParm.unClassName).text(t+oParm.interText);
	inter=setInterval(function(){
		if(t>0){
			t--;
			_self.addClass(oParm.unClassName).text(t+oParm.interText);
		}
		else{
			clearInterval(inter);
			if(oParm.isReturn){
				_self.removeClass(oParm.unClassName).text(oText);
			}
			if(typeof(oParm.callBack)=="function"){
				oParm.callBack();
			}
		}
	},1000);
}

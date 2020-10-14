var response_success = "success";
var response_fail = "fail";
var requst_source = "popup";
var dto = {code: "", msg: "", url: "", source: requst_source};
var response_dto = {code: response_success, source: requst_source}
var bgFunction = chrome.extension.getBackgroundPage();
var object = {
    "prompt": "鼠标停留对应按钮显示提示信息",
    "open_back": "打开对应后台",
    "copy_info": "复制订单信息，循环延时点击开始，弹出窗口复制xlsx",
    "stop_opera": "停止当前的执行操作"
}
$(function () {

    $("body").on("contextmenu", function (e) {
        window.event.returnValue = false;
        return false;
    });

    $("button").on("mouseenter mouseleave click", function (event) {
        if (event.type == "mouseleave") { // 移出
            $("#prompt").text(object["prompt"])
        } else if (event.type == "mouseenter") {// 移入
            $("#prompt").text(object[$(this).val()])
        } else if (event.type == "click") {
            if ($(this).val() == "open_back") {
                dto.code = response_success;
                dto.url = "https://mms.pinduoduo.com/"
                sendToContent($(this).val(), dto);
            } else if ($(this).val() == "stop_opera") {
                dto.code = response_success;
                dto.url = ""
                sendToContent($(this).val(), dto);
            }
            window.close();
        }
    });

    $("a.list-group-item").on("click", function (event) {
        var value = $(this).attr("value");
        if (value == "copy_order_address") {
            dto.code = response_success;
            dto.url = "https://www.so.com"
            sendToContent(value, dto);
            window.close();
        } else if (value == "naval_informa_identifica") {
            $("#informa_identifica").click();
            $("#informa_identifica").change(function () {
                var _this = this;
                var brushOrderNo = new Array();
                var errorOrderImg = new Array();
                for (let i = 0; i < this.files.length; i++) {
                    var file = this.files[i];
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    var name = this.files[i].name;
                    reader.onload = (function (fileReader,name) {
                        console.log(this.result);
                        //$("#name").html(file.name);
                        var base64Str = this.result;
                        //$("#tempImg").attr("src",base64Str);
                        var startNum = base64Str.indexOf("base64,");
                        startNum = startNum * 1 + 7;
                        var baseStr = base64Str.slice(startNum);
                        var orderNo = bgFunction.baiduOcrOrderImage(_this.files[i].name, baseStr);
                        if(orderNo != undefined){
                            brushOrderNo.push(orderNo);
                        }else{
                            errorOrderImg.push(_this.files[i].name);
                        }
                    })
                }
                console.info("改变");
                dto.code = response_success;
                dto.brushOrderArr = brushOrderNo;
                dto.errorOrderArr = errorOrderImg;
                sendToContent(value, dto);
            });
            //this.files = [];
        }
        //
    });

    function sendToContent(cmd, dto) {
        bgFunction.sendMessageToContentScript({cmd: cmd, request: dto}, function (response) {
            console.info(response)
        });
    }

});
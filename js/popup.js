var response_success = "success";
var response_fail = "fail";
var requst_source = "popup";
var dto = {code: "", msg: "", url: "", source: requst_source};
var response_dto = {code: response_success, source: requst_source};
var bgFunction = chrome.extension.getBackgroundPage();
var object = {
    "prompt": "鼠标停留对应按钮显示提示信息",
    "open_back": "打开对应后台",
    "copy_order_address": "智能订单操作点击解锁开始,输出窗口操作表格",
    "stop_opera": "停止当前的执行操作",
    "order_image_loading_Process": "智能订单截图识别,分辨水军信息",
    "setting_order_table": "设置表格表头,列表数据",
}
$(function () {
    bgFunction.initAccess_token();
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

    $(".list-group-item.list-group-item-action").on("mouseenter mouseleave click", function (event) {
        if (event.type == "mouseleave") { // 移出
            $("#prompt").text(object["prompt"])
        } else if (event.type == "mouseenter") {// 移入
            $("#prompt").text(object[$(this).attr("value")])
        } else if (event.type == "click") {
            var value = $(this).attr("value");
            if (value == "copy_order_address") {
                dto.code = response_success;
                sendToContent(value, dto);
                window.close();
            } else if (value == "order_image_loading_Process") {
                $("#informa_identifica").click();
                $("#informa_identifica").change(function () {
                    bgFunction.pictureOrderInfoProcess(this.files, 0, new Array(), new Array());
                    window.close();
                });
            }else if (value == "setting_order_table") {

                //dto.code = response_success;
                //sendToContent(value, dto);
                //window.close();
            }
        }
    });

    function sendToContent(cmd, dto) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            bgFunction.sendMessageToContentScript({cmd: cmd, pageTabs: tabs, request: dto}, function (response) {
                console.info(response);
            });
        });
    }

});
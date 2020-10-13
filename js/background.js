var response_success = "success";
var response_fail = "fail";
var requst_source = "background";
var response_dto = {code: response_success, source: requst_source}
var socket;
var opt = {method: "post", url: "http://www.baidu.com", async: true, data: {}};
ajax(opt)

function ajax(opt) {
    opt = opt || {};
    opt.method = opt.method.toUpperCase() || 'POST';
    opt.url = opt.url || '';
    opt.async = opt.async || true;
    opt.data = opt.data || null;
    opt.success = opt.success || function () {
    };
    var xmlHttp = null;
    if (XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
    } else {
        xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
    }
    var params = [];
    for (var key in opt.data) {
        params.push(key + '=' + opt.data[key]);
    }
    var postData = params.join('&');
    if (opt.method.toUpperCase() === 'POST') {
        xmlHttp.open(opt.method, opt.url, opt.async);
        xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        xmlHttp.send(postData);
    } else if (opt.method.toUpperCase() === 'GET') {
        xmlHttp.open(opt.method, opt.url + '?' + postData, opt.async);
        xmlHttp.send(null);
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            opt.success(JSON.parse(xmlHttp.responseText));//如果不是json数据可以去掉json转换
        }
    };
}

function getStorageKey() {
    var dto = {code: "", msg: "", url: "", element: "", value: "", source: requst_source};
    var connKey = sessionStorage.getItem('connKey')
    if (connKey != undefined) {
        dto.code = response_success;
        dto.msg = "服务已连接";
        chrome.runtime.sendMessage({cmd: "service_conn_success_connKey", "dataDto": dto});
        return;
    }
    var socket_ip = "127.0.0.1";
    try {
        socket = new WebSocket('ws://' + socket_ip + ':10239');
    } catch (e) {
        console.info(e)
    }
    socket.onopen = function (event) {
        // console.log("连接服务成功！");
        // dto.code = response_success;
        // dto.msg = "连接服务成功";
        // return dto;
        // sendMsg()
    };
    // 监听消息
    socket.onmessage = function (event) {
        var data = $.parseJSON(event.data);
        console.log(data);
        if (data.cmd == "connKey") {
            dto.code = response_success;
            dto.msg = data.desc;
            sessionStorage.setItem('connKey', data.connKey);
            chrome.runtime.sendMessage({cmd: "service_conn_success_connKey", "dataDto": dto});
        } else if (data.cmd == "service_bind_input_element_success") {
            if (data.code == response_success) {
                dto.code = response_success;
                dto.element = data.element;
                dto.source = "service"
                sendMessageToContentScript({
                    cmd: "service_bind_input_element_success",
                    requestDto: dto
                }, function (response) {
                    console.info(response);
                });
            }
        } else if (data.cmd == "service_execute_program_settings") {
            if (data.code == response_success) {
                dto.code = response_success;
                dto.element = data.element;
                dto.source = "service"
                sendMessageToContentScript({
                    cmd: "service_execute_program_settings",
                    requestDto: dto
                }, function (response) {
                    console.info(response);
                });
            }
        }
    };
    // 监听Socket的关闭
    socket.onclose = function (event) {
        sessionStorage.removeItem('connKey');
        dto.code = response_fail;
        dto.msg = "服务已关闭";
        chrome.runtime.sendMessage({cmd: "service_conn_error", "dataDto": dto});
    };
    socket.onerror = function (event) {
        dto.code = response_fail;
        dto.msg = "无法连接到服务,请重试";
        chrome.runtime.sendMessage({cmd: "service_conn_error", "dataDto": dto});
    };
}

// 接受来自前端的信息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var dto = {
        cmd: "",
        code: "",
        msg: "",
        option: "",
        content: "",
        type: "",
        url: "",
        element: "",
        value: "",
        source: requst_source
    };
    if (request.cmd == 'send_element_background') {
        // 发送数据到工具
        dto.cmd = "service_bind_element";
        dto.element = request.dataDto.element;
        dto.url = request.dataDto.url;
        dto.code = response_success;
        dto.option = request.dataDto.option;
        dto.content = request.dataDto.content;
        dto.type = request.dataDto.type;
        var dtostr = JSON.stringify(dto);
        socket.send(dtostr)
    }
});

// 发送消息到前端 获取topId方法
function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        console.info(tabs);
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
            if (callback) callback(response);
        });
    });
}

function baiduOcrOrderImage(imgBase64) {
    let url = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=24.7193727281fa2c5646ffbca147548dda.2592000.1605171490.282335-18040110";
    $.ajax({
        url: url,
        type: "post",
        contentType: "application/x-www-form-urlencoded",
        async:false,
        data: {image:imgBase64},
        success: function (response) {
            console.info(response);
        },
        error: function (error) {
            console.info(error);
        }
    });
}
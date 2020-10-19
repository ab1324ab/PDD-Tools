var response_success = "success";
var response_fail = "fail";
var requst_source = "background";
var response_dto = {code: response_success, source: requst_source};
var dto = {source: requst_source};
var socket;

function getStorageKey() {
    var dto = {code: "", msg: "", url: "", element: "", value: "", source: requst_source};
    var connKey = sessionStorage.getItem('connKey');
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
        socket.send(dtostr);
    }
});

// 发送消息到前端 获取topId方法
function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (message.pageTabs == undefined) {
            message.pageTabs = tabs;
        }
        chrome.tabs.sendMessage(message.pageTabs[0].id, message, function (response) {
            if (callback) callback(response);
        });
    });
}

//异步递归ocr
function pictureOrderInfoProcess(files, index, brushOrderNo, errorOrderImg) {
    let reader = new FileReader();
    reader.readAsDataURL(files[index]);
    reader.onload = function () {
        var baseStr = this.result.replace("data:image/jpeg;base64,", "");
        $.ajax({
            url: "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=24.7193727281fa2c5646ffbca147548dda.2592000.1605171490.282335-18040110",
            type: "post",
            contentType: "application/x-www-form-urlencoded",
            async: true,
            data: {image: baseStr},
            success: function (response) {
                console.info(response);
                var order_no = "";
                for (var i = 0; i < response.words_result.length; i++) {
                    if (response.words_result[i].words.indexOf("订单编号") != -1) {
                        order_no = response.words_result[i].words.split(":")[1];
                    }
                }
                console.info(files[index].name + " 识别: " + order_no);
                if (order_no != undefined && order_no != "") {
                    brushOrderNo.push(order_no + "|" + files[index].name);
                } else {
                    errorOrderImg.push(files[index].name);
                }
                isProcessCompleted(files, index, brushOrderNo, errorOrderImg);
            },
            error: function (error) {
                console.info(error);
                errorOrderImg.push(files[index].name);
                isProcessCompleted(files, index, brushOrderNo, errorOrderImg);
            }
        })
    }
}

function isProcessCompleted(files, index, brushOrderNo, errorOrderImg) {
    loadingProcess(index, files);
    if (index == files.length - 1) {
        dto.code = response_success;
        dto.brushOrderArr = brushOrderNo;
        dto.errorOrderArr = errorOrderImg;
        sendMessageToContentScript({
            cmd: "order_image_loading_Process",
            pageTabs: undefined,
            request: dto
        }, function (response) {
            console.info(response);
        })
    } else {
        index++;
        pictureOrderInfoProcess(files, index, brushOrderNo, errorOrderImg);
    }
}

async function loadingProcess(row, files) {
    console.info("当前进度 => " + row);
    dto.code = response_success;
    dto.total = files.length;
    dto.row = row + 1;
    dto.name = files[row].name;
    sendMessageToContentScript({
        cmd: "ocr_load_process",
        pageTabs: undefined,
        request: dto
    }, function (response) {
        //console.info(response);
        //return response;
    });
}
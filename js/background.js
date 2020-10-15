var response_success = "success";
var response_fail = "fail";
var requst_source = "background";
var response_dto = {code: response_success, source: requst_source}
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
var socket;

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
        if (message.pageTabs == undefined) {
            message.pageTabs = tabs;
        }
        chrome.tabs.sendMessage(message.pageTabs[0].id, message, function (response) {
            if (callback) callback(response);
        });
    });
}

//识别水军信息
function baiduOcrOrderImage(name, imgBase64) {
    let url = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=24.7193727281fa2c5646ffbca147548dda.2592000.1605171490.282335-18040110";
    var order_no = null;
    $.ajax({
        url: url,
        type: "post",
        contentType: "application/x-www-form-urlencoded",
        async: false,
        data: {image: imgBase64},
        success: function (response) {
            console.info(name);
            console.info(response);
            if (response.error_code != null) {
                order_no = null;
            }
            for (var i = 0; i < response.words_result.length; i++) {
                if (response.words_result[i].words.indexOf("订单编号") != -1) {
                    order_no = response.words_result[i].words.split(":")[1];
                }
            }
        },
        error: function (error) {
            console.info(error)
            order_no = null;
        }
    });
    return order_no;
}

// 处理图片信息
function pictureOrderInfoProcess(files) {
    var brushOrderNo = new Array();
    var errorOrderImg = new Array();
    for (let i = 0; i < files.length; i++) {
        var file = files[i];
        readFileBase64(file, i, files).then(function (result) {//处理 result
            var base64Str = result;
            var startNum = base64Str.indexOf("base64,");
            startNum = startNum * 1 + 7;
            var baseStr = base64Str.slice(startNum);
            //var orderNo = baiduOcrOrderImage(files[i].name, baseStr);
            let url = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=24.7193727281fa2c5646ffbca147548dda.2592000.1605171490.282335-18040110";
            var order_no = null;
            $.ajax({
                url: url,
                type: "post",
                contentType: "application/x-www-form-urlencoded",
                async: false,
                data: {image: baseStr},
                success: function (response) {
                    console.info(response);
                    if (response.error_code != undefined) {
                        order_no = undefined;
                    }
                    for (var i = 0; i < response.words_result.length; i++) {
                        if (response.words_result[i].words.indexOf("订单编号") != -1) {
                            order_no = response.words_result[i].words.split(":")[1];
                        }
                    }
                },
                error: function (error) {
                    console.info(error)
                    order_no = undefined;
                }
            });
            console.info(files[i].name + " 识别: " + order_no)
            if (order_no != undefined) {
                brushOrderNo.push(order_no + "|" + files[i].name);
            } else {
                errorOrderImg.push(files[i].name);
            }

        }).then(function () {
            if (i == files.length - 1) {
                dto.code = response_success;
                dto.brushOrderArr = brushOrderNo;
                dto.errorOrderArr = errorOrderImg;
                sendMessageToContentScript({
                    cmd: "naval_informa_identifica",
                    pageTabs: undefined,
                    request: dto
                }, function (response) {
                    console.info(response);
                })
            }
        })
        setTimeout(function () {
            console.info("ssssssssss=" + i);
            dto.code = response_success;
            dto.allCount = files.length;
            dto.presentRow = i;
            dto.name = files[i].name;
            sendMessageToContentScript({
                cmd: "ocr_load_process",
                pageTabs: undefined,
                request: dto
            }, function (response) {
                console.info(response);
            });
        }, 10)
    }
}

// 读取base64信息
function readFileBase64(img, row, files) {
    return new Promise(function (resolve, reject) {
        let reader = new FileReader()
        reader.readAsDataURL(img)
        reader.onload = function () {
             fccccc(img, row, files)
            resolve(this.result)
        }
    })
}

async function fccccc(img, row, files) {
    console.info("ssssssssss=" + row);
    dto.code = response_success;
    dto.allCount = files.length;
    dto.presentRow = row;
    dto.name = files[row].name;
    sendMessageToContentScript({
        cmd: "ocr_load_process",
        pageTabs: undefined,
        request: dto
    }, function (response) {
        console.info(response);
    });
}
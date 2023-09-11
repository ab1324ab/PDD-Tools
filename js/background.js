var response_success = "success";
var response_fail = "fail";
var requst_source = "background";
var response_dto = {code: response_success, source: requst_source};
var dto = {source: requst_source};
var socket;
var access_token = "";

setBadge();
function setBadge() {
    chrome.browserAction.setBadgeText({text: 'v1.4'});
    let color = "#F56C6C" + "#4eb61b" + "#4285f4";
    chrome.browserAction.setBadgeBackgroundColor({color: '#F56C6C'});
}

function initAccess_token() {
    var _this = this;
    var token = new Date();
    var storage = window.localStorage;
    var access = storage.getItem("access");
    var isGain = true;
    if (access !== undefined) {
        access = JSON.parse(access);
        if (access.expires_in > token.getTime()) {
            access_token = access.access_token;
            isGain = false;
            _this.spinner_show(true, "成功");
        }
    }
    if (isGain) {
        $.ajax({
            url: "http://www.nacei.cn/grantAccessToken",
            type: "post",
            contentType: "application/x-www-form-urlencoded",
            async: true,
            timeout : 2000, //超时时间设置，单位毫秒
            data: {token: token.getTime()},
            success: function (response) {
                var client_secret = JSON.parse(response);
                console.info(client_secret);
                _this.access_token = client_secret.access_token;
                var access = {};
                access.access_token = client_secret.access_token;
                access.expires_in = client_secret.expires_in;
                storage.setItem("access", JSON.stringify(access));
                _this.spinner_show(true, "成功");
            },
            error: function (error) {
                _this.spinner_show('order_image_loading_Process_sms_message', true, "获取AI识别Token失败");
            }
        })
    }
}

function spinner_show(byid, succ, message) {
    var views = chrome.extension.getViews({type: 'popup'});
    if (succ && views.length > 0) {
        views[0].document.getElementById("spinnerBorder").style.display = 'none';
        views[0].document.getElementById("featureList").style.display = 'block';
    }
    if (byid !== undefined && views.length > 0) {
        views[0].document.getElementById(byid).parentElement.parentElement.style.backgroundColor = '#e9ecef';
        views[0].document.getElementById(byid).parentElement.style.color = '#adb5bd';
        views[0].document.getElementById(byid).parentElement.parentElement.style.borderColor = '#dae0e5';
        views[0].document.getElementById(byid).parentElement.parentElement.setAttribute('aria-disabled', 'true');
        let className = views[0].document.getElementById(byid).parentElement.parentElement.className;
        views[0].document.getElementById(byid).parentElement.parentElement.className = className + ' ' + 'disabled';
        views[0].document.getElementById(byid).innerText = message;
    }
}

function initTableHeader(callback) {
    dto.code = response_success;
    sendMessageToContentScript({
        cmd: "init_gain_table_header",
        pageTabs: undefined,
        request: dto
    }, function (response) {
        if (response?.code === response_success) {
            localStorage.setItem("init_table_header", JSON.stringify(response.content));
            callback(JSON.stringify(response.content));
        }
    });
}

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
    if (request.cmd == 'gain_static_resource_address') {
        response_dto.plugins = localStorage.getItem("init_plugin_array");
        response_dto.jsx = evalJSX("/js/plugin.distribution")
        sendResponse(response_dto);
    } else if (request.cmd == 'gain_static_source_javascript_plugin') {
        sendResponse(evalJSX("/js/plugin/" + request.requestDto.type));
    } else if (request.cmd == 'send_element_background') {
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
    } else if (request.cmd == 'gain_table_header') {
        if (request.code == response_success) {
            var tableHeader = localStorage.getItem("table_header");
            dto.cmd = "send_response";
            dto.code = response_success;
            dto.content = JSON.parse(tableHeader);
            sendResponse(dto);
        }
    } else if (request.cmd == 'query_detail_img_base64_content_scripts') {
        if (request.code == response_success) {
            getBase64(request.image.src, dataURL => {
                sendMessageToContentScript({
                    cmd: "query_detail_img_base64_background",
                    pageTabs: undefined, request: request, base64: dataURL
                }, function (response) {
                    let res = response;
                });
            });
            sendResponse(dto);
        }
    }
});

// 发送消息到前端 获取topId方法
function sendMessageToContentScript(message, callback) {
    try{
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            if (message.pageTabs == undefined) {
                message.pageTabs = tabs;
            }
            chrome.tabs?.sendMessage(message?.pageTabs[0]?.id, message, function (response) {
                if (callback !== undefined) callback(response);
            });
        });
    }catch (e) {
    }
}

//异步递归ocr
function pictureOrderInfoProcess(files, index, brushOrderNo, errorOrderImg) {
    let reader = new FileReader();
    reader.readAsDataURL(files[index]);
    reader.onload = function () {
        var baseStr = this.result.replace("data:image/jpeg;base64,", "");
        $.ajax({
            url: "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=" + access_token,
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

/**
 * 获取获取图片初始化插件
 * @param
 */
function initPluginArray() {
    var distribution = evalJSX("/js/plugin.distribution")
    distribution = distribution.replace("plugin_select();", "initPlugin();");
    return distribution
}

/**
 * 获取可执行jsx方法
 * @param local
 */
function evalJSX(local) {
    var jsx = ""
    var href = window.location.href;
    href = href.match(/chrome-extension:\/\/[a-zA-Z]*\//g);
    $.ajax({
        url: href + local + ".jsx",
        type: "get",
        async: false,
        success: function (response) {
            jsx = response
        },
        error: function (error) {
            jsx = error
        }
    })
    return jsx;
}

function getBase64(url, callback) {
    var Img = new Image(), dataURL = '';
    Img.src = url + '?v=' + Math.random();
    Img.setAttribute('crossOrigin', 'Anonymous');
    Img.onload = function () {
        var canvas = document.createElement('canvas'), width = Img.width, height = Img.height;
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(Img, 0, 0, width, height);
        dataURL = canvas.toDataURL('image/jpeg');
        return callback ? callback(dataURL) : null;
    };
}

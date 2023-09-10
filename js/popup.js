var response_success = "success";
var response_fail = "fail";
var requst_source = "popup";
var dto = {code: "", msg: "", url: "", source: requst_source};
var response_dto = {code: response_success, source: requst_source};
var sortable;
var object = {
    "prompt": "鼠标停留对应按钮显示提示信息",
    "open_back": "打开对应后台",
    "open_yangkeduo_pdd": "打开网页版拼多多商城",
    "copy_order_address": "智能订单操作点击解锁开始,输出窗口操作表格",
    "stop_opera": "停止当前的执行操作",
    "order_image_loading_Process": "智能订单截图识别,分辨水军信息",
    "video_image_batch_download": "筛选图片视频批量智能下载",
    "setting_order_table": "设置表格表头,列表数据",
}

function initBackgroundJavaScript() {
    try {
        var bgFunction = chrome.extension.getBackgroundPage();
        return bgFunction;
    } catch (e) {
        console.info(e);
        return null;
    }
}

$(function () {
    try {
        initBackgroundJavaScript().initAccess_token();
        initBackgroundJavaScript().initTableHeader(function (response) {
            var tableHeader = [];
            var tableHeaderTmp = localStorage.getItem("table_header");
            if (tableHeaderTmp != undefined) {
                tableHeader = JSON.parse(tableHeaderTmp);
            }
            $("#tableHeader").empty();
            if (tableHeader.length > 0) {
                tableHeader.forEach((v, i) => {
                    var li = $('<li serial="' + v.serial + '"><img class="removeTableHeader table-Header-li" style="margin-left: -50px;" src="../images/delete.png"/><span>' + v.text + '</span></li>');
                    $("#tableHeader").append(li);
                })
            }
            let diffArr = [];
            var initTableHeaderTmp = response;
            if (initTableHeaderTmp != undefined) {
                var initTableHeaderArr = JSON.parse(initTableHeaderTmp);
                if (tableHeader.length > 0) {
                    initTableHeaderArr.forEach(v => {
                        var exist = false;
                        tableHeader.forEach(vt => {
                            if (v.text == vt.text) {
                                exist = true;
                                vt.serial = v.serial
                                return;
                            }
                        });
                        if (!exist) {
                            diffArr.push(v);
                        }
                    });
                    localStorage.setItem("table_header", JSON.stringify(tableHeader));
                } else {
                    diffArr = initTableHeaderArr;
                }
            }
            $("#newTableHeader").empty();
            diffArr.forEach((v, i) => {
                var li = $('<li serial="' + v.serial + '"><img class="addTableHeader table-Header-li" style="margin-left: -40px;" src="../images/add.png"/><span>' + v.text + '</span></li>');
                $("#newTableHeader").append(li);
            });
        });

        $("#tableHeader").on("click", function (event) {
            if (event.target.nodeName == "IMG") {
                var text = $(event.target).next().text();
                var serial = $(event.target).parent().attr("serial");
                var li = $('<li serial="' + serial + '"><img class="addTableHeader table-Header-li" style="margin-left: -40px;" src="../images/add.png"/><span>' + text + '</span></li>');
                $("#newTableHeader").append(li);
                $(event.target).parent().remove()
                sortable.save();
            }
        })

        $("#newTableHeader").on("click", function (event) {
            if (event.target.nodeName == "IMG") {
                var text = $(event.target).next().text();
                var serial = $(event.target).parent().attr("serial");
                var li = $('<li serial="' + serial + '"><img class="removeTableHeader table-Header-li" style="margin-left: -50px;" src="../images/delete.png"/><span>' + text + '</span></li>');
                $("#tableHeader").append(li);
                $(event.target).parent().remove();
                sortable.save();
            }
        })
    } catch (e) {
        console.info(e);
    }

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
                window.close();
            } else if ($(this).val() == "open_yangkeduo_pdd") {
                dto.code = response_success;
                dto.url = "https://mobile.yangkeduo.com"
                sendToContent($(this).val(), dto);
                window.close();
            } else if ($(this).val() == "add_table_handle") {
                // 已在其他地方绑定
            }
        }
    });
    let promptEvent = function (event) {
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
                    initBackgroundJavaScript().pictureOrderInfoProcess(this.files, 0, new Array(), new Array());
                    window.close();
                });
            } else if (value == "setting_order_table") {
                // 已在其他地方绑定
            } else if (value == "video_image_batch_download") {
                dto.code = response_success;
                sendToContent(value, dto);
                window.close();
            } else if ($(this).val() == "stop_opera") {
                dto.code = response_success;
                dto.url = ""
                sendToContent($(this).val(), dto);
                window.close();
            }
        }
    }
    $(".list-group-item.list-group-item-action").on("click", promptEvent);
    $(".container").on("mouseenter mouseleave", promptEvent);
    function sendToContent(cmd, dto, callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            initBackgroundJavaScript().sendMessageToContentScript({
                cmd: cmd,
                pageTabs: tabs,
                request: dto
            }, function (response) {
                if (callback) callback(response);
                console.info(response);
            });
        });
    }

    $("[data-toggle]").click(function () {
        var toggle = $(this).attr("data-toggle");
        Array.prototype.forEach.call($("[aria-drawer]"), function (v) {
            var aria = $(v).attr("aria-drawer");
            if (toggle == aria) {
                var display = $(v).parent().css("display")
                if (display == "block") {
                    $(v).animate({width: "0px"}, function () {
                        $(v).css("display", "none");
                        $(v).parent().css("display", "none");
                    });
                } else {
                    // 打开抽屉
                    $(v).parent().css("display", "block");
                    $(v).css("display", "block");
                    $(v).animate({width: "245px"});
                    processCurrent(toggle);
                }
            }
        })
    });

    /**
     * 打开抽屉, 业务处理
     * @param
     */
    function processCurrent(v) {
        switch (v) {
            case "setting_order_table" || "setting_order_table_all":
                if (sortable == undefined) {
                    sortable = Sortable.create(document.getElementById('tableHeader'), {
                        animation: 150,
                        store: {//缓存到localStorage
                            get: function (sortable) {
                                var table_header_arr = [];
                                var order = [];
                                var tableHeader = localStorage.getItem("table_header");
                                if (tableHeader != undefined) {
                                    table_header_arr = JSON.parse(tableHeader)
                                    table_header_arr.forEach(v => {
                                        order.push(v.generateId)
                                    })
                                }
                                return order ? order : [];
                            },
                            set: function (sortable) {
                                var order = sortable.toArray();
                                var table_header_arr = [];
                                Array.prototype.forEach.call($("#tableHeader").children(), (el => {
                                    var table_header = {};
                                    let str = el.tagName + el.className + el.src + el.href + el.textContent,
                                        i = str.length,
                                        sum = 0;
                                    while (i--) {
                                        sum += str.charCodeAt(i)
                                    }
                                    var generateId = sum.toString(36);
                                    table_header.generateId = generateId;
                                    table_header.serial = el.getAttribute("serial");
                                    table_header.text = el.innerText;
                                    table_header_arr.push(table_header);
                                }));
                                var content = localStorage.getItem("init_table_header");
                                if (content != undefined) {
                                    if (table_header_arr.length > 0) {
                                        var initTableHeaderArr = JSON.parse(content);
                                        initTableHeaderArr.forEach(v => {
                                            table_header_arr.forEach(vt => {
                                                if (v.text == vt.text) {
                                                    vt.serial = v.serial;
                                                }
                                            })
                                        })
                                    }
                                    localStorage.setItem("table_header", JSON.stringify(table_header_arr));
                                }
                            }
                        },
                        onAdd: function (evt) {
                            console.log('onAdd.foo:', [evt.item, evt.from]);
                        },
                        onUpdate: function (evt) {
                            console.log('onUpdate.foo:', [evt.item, evt.from]);
                        },
                        onRemove: function (evt) {
                            console.log('onRemove.foo:', [evt.item, evt.from]);
                        },
                        onStart: function (evt) {
                            console.log('onStart.foo:', [evt.item, evt.from]);
                        },
                        onSort: function (evt) {
                            console.log('onStart.foo:', [evt.item, evt.from]);
                        },
                        onEnd: function (evt) {
                            console.log('onEnd.foo:', [evt.item, evt.from]);
                        }
                    });
                }
                break;
            case "setting_plugin_manage":
                var result = initBackgroundJavaScript().initPluginArray();
                var pluginArray = eval(result)
                var initPluginArray = localStorage.getItem("init_plugin_array");
                var pluginArr = eval('(' + initPluginArray + ')');
                $("#pluginDistribution").empty();
                pluginArray.forEach(val => {
                    var li = $("<li serial='0' style='padding-left: 10px;'></li>");
                    var div = $("<div class='custom-control custom-switch'></div>");
                    var input = $("<input type='checkbox' class='custom-control-input' id='" + val.url + "'>")
                    if (pluginArr != undefined && pluginArr.includes(val.url)) {
                        input.prop("checked", false);
                    } else {
                        input.prop("checked", true);
                    }
                    input.change(function () {
                        var checked = $(this).is(':checked');
                        console.info(checked);
                        if (!checked) {
                            if (pluginArr == undefined) {
                                pluginArr = new Array()
                            }
                            pluginArr.push($(this).attr("id"));
                            localStorage.setItem("init_plugin_array", JSON.stringify(pluginArr));
                        } else {
                            if (pluginArr != undefined) {
                                var index = pluginArr.indexOf($(this).attr("id"));
                                pluginArr.splice(index, 1);
                                localStorage.setItem("init_plugin_array", JSON.stringify(pluginArr));
                            }
                        }
                    })
                    div.append(input);
                    div.append("<label style='padding-top: 3px;display: block;' class='custom-control-label' for='" + val.url + "'>" + val.name + "</label>");
                    li.append(div);
                    $("#pluginDistribution").append(li);
                })
                break;
        }
    }
});

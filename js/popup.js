var response_success = "success";
var response_fail = "fail";
var requst_source = "popup";
var dto = {code: "", msg: "", url: "", source: requst_source};
var response_dto = {code: response_success, source: requst_source};
var sortable;
var object = {
    "prompt": "鼠标停留对应按钮显示提示信息",
    "open_back": "打开对应后台",
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
            } else if ($(this).val() == "stop_opera") {
                dto.code = response_success;
                dto.url = ""
                sendToContent($(this).val(), dto);
                window.close();
            } else if ($(this).val() == "add_table_handle") {
                // 已在其他地方绑定
            }
        }
    });
    var shifou = false
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
                    initBackgroundJavaScript().pictureOrderInfoProcess(this.files, 0, new Array(), new Array());
                    window.close();
                });
            } else if (value == "setting_order_table") {
                // 已在其他地方绑定
            } else if (value == "video_image_batch_download") {
                var batchDownloadDrawer = $("#batchDownloadDrawer")
                if (batchDownloadDrawer.length <= 0) {
                    batchDownloadDrawer = $("<div id='batchDownloadDrawer' style='position: fixed;bottom: 0;width: 100%;height: 450px;border-top-color: #dae0e5;border-top-style: solid;border-top-width: 1px;'></div>")
                    var title = $("<div style='padding: 5px 20px;display: flex;flex-wrap: wrap;background-color: #f4f4f5;border-bottom-color: #dae0e5;border-bottom-style: solid;border-bottom-width: 1px;'></div>")
                    var title_text = $("<div style='flex-basis: 0;flex-grow: 1;min-width: 0;max-width: 100%;'>修改</div>")
                    title.append(title_text)
                    var close = $("<div style='flex-basis: 0;flex-grow: 1;min-width: 0;max-width: 100%;text-align: right;'>x</div>")
                    title.append(close)
                    title.on("mousedown mouseup", function (e) {
                        var thisDrawer = $("#batchDownloadDrawer")
                        if (e.type == "mousedown") {
                            var downY = e.clientY
                            var height = thisDrawer.height()
                            $(document).on("mousemove mouseleave", function (ev) {
                                if(ev.type == "mousemove"){
                                    var moveY = ev.clientY
                                    var poorY = height - (moveY - downY)
                                    var docHeight = $(document).height() - 30
                                    if (moveY < 0) {
                                        moveY = 0
                                    } else if (moveY > docHeight) {
                                        moveY = docHeight
                                    }
                                    thisDrawer.css("top", moveY)
                                    thisDrawer.css("height", poorY)
                                }else if(ev.type == "mouseleave"){
                                    $(document).unbind("mousemove")
                                }
                            })
                        } else if (e.type == "mouseup") {
                            $(document).unbind("mousemove")
                        }
                    })
                    batchDownloadDrawer.append(title);
                    var drawerBody = $("<div style='width: 100%;height: 100%;display: flex;flex-wrap: wrap;'></div>")
                    // 菜单
                    var menuLeft = $("<div style='flex-basis: 0;flex-grow: 1;min-width: 0;max-width: 250px;border-right-width: 1px;border-right-style: solid;border-right-color: #ced4da;'></div>")
                    var ul = $("<ul style='list-style-type: none;padding: 0;'></ul>")
                    // li排序
                    var sortLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;'></li>")
                    var select = $("<select style='appearance: none;-moz-appearance:none;-webkit-appearance:none;-moz-appearance:none;-webkit-appearance:none;background: url(https://inews.gtimg.com/newsapp_bt/0/5443201980/640) no-repeat scroll right center transparent;background-size: 20px;display: block;width: 100%;height: calc(1.5em + .75rem + 2px);padding: .10rem .75rem;font-weight: 400;color: #495057;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da;border-radius: .25rem;transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;' ></select>")
                    var option = $("<option style='font-size: 16px;' value='1'>原排序</option>")
                    select.append(option)
                    var maxOption = $("<option style='font-size: 16px;' value='1'>大图</option>")
                    select.append(maxOption)
                    var minOption = $("<option style='font-size: 16px;' value='1'>小图</option>")
                    select.append(minOption)
                    sortLi.append(select)
                    ul.append(sortLi)
                    // 视图
                    var viewLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;'></li>")
                    var button = $("<button style='width: 100%;border: 1px solid #ced4da;' class='btn btn-light'></button>")
                    var isvg = $("<svg xmlns='http://www.w3.org/2000/svg' fill='currentColor' class='bi bi-ui-checks-grid' viewBox='0 0 16 16' id='ui-checks-grid' style='width: 15px;vertical-align: middle;margin-right: 5px;'><path fill-rule='evenodd' d='M2 10a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1H2zm9-9a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V2a1 1 0 00-1-1h-3zm0 9a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1h-3zm0-10a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2V2a2 2 0 00-2-2h-3zM2 9a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2v-3a2 2 0 00-2-2H2zm7 2a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3zM0 2a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm5.354.854l-2 2a.5.5 0 01-.708 0l-1-1a.5.5 0 11.708-.708L3 3.793l1.646-1.647a.5.5 0 11.708.708z'></path></svg>")
                    button.append(isvg)
                    var spanText = $("<span style='display: inline-block;vertical-align: middle;'>视图</span>")
                    button.append(spanText)
                    viewLi.append(button)
                    ul.append(viewLi)
                    // 高度
                    var heightLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;display: flex;'></li>")
                    var height = $("<div style='width: 100%;max-width: 40px;line-height: 2;'>高度：</div><input type='text' style='width: 100%;font-weight: 400;color: #495057;border: 1px solid #ced4da;' class='btn' placeholder='高度'/>")
                    heightLi.append(height)
                    ul.append(heightLi)
                    // 宽度
                    var widthtLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;display: flex;'></li>")
                    var width = $("<div style='width: 100%;max-width: 40px;line-height: 2;'>宽度：</div><input type='text' style='width: 100%;font-weight: 400;color: #495057;border: 1px solid #ced4da;' class='btn' placeholder='宽度'/>")
                    widthtLi.append(width)
                    ul.append(widthtLi)
                    // 名称
                    var filterLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;display: flex;'></li>")
                    var filter = $("<div style='width: 100%;max-width: 40px;line-height: 2;'>名称：</div><input type='text' style='width: 100%;font-weight: 400;color: #495057;border: 1px solid #ced4da;' class='btn' placeholder='输入过滤名称'/>")
                    filterLi.append(filter)
                    ul.append(filterLi)
                    // 重置
                    var resetLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;'></li>")
                    var reset = $("<button style='width: 100%;border: 1px solid #ced4da;' class='btn btn-light'></button>")
                    var isvg = $("<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\" class=\"bi bi-bootstrap-reboot\" viewBox=\"0 0 16 16\" id=\"bootstrap-reboot\" style='width: 15px;vertical-align: middle;margin-right: 5px;' ><path fill-rule=\"evenodd\" d=\"M1.161 8a6.84 6.84 0 106.842-6.84.58.58 0 010-1.16 8 8 0 11-6.556 3.412l-.663-.577a.58.58 0 01.227-.997l2.52-.69a.58.58 0 01.728.633l-.332 2.592a.58.58 0 01-.956.364l-.643-.56A6.812 6.812 0 001.16 8zm5.48-.079V5.277h1.57c.881 0 1.416.499 1.416 1.32 0 .84-.504 1.324-1.386 1.324h-1.6zm0 3.75V8.843h1.57l1.498 2.828h1.314L9.377 8.665c.897-.3 1.427-1.106 1.427-2.1 0-1.37-.943-2.246-2.456-2.246H5.5v7.352h1.141z\"></path></svg>")
                    reset.append(isvg)
                    var spanText = $("<span style='display: inline-block;vertical-align: middle;'>重置</span>")
                    reset.append(spanText)
                    resetLi.append(reset)
                    ul.append(resetLi)
                    // 下载
                    var resetLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;'></li>")
                    var reset = $("<button style='width: 100%;' class='btn btn-outline-primary'></button>")
                    var isvg = $("<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\" class=\"bi bi-cloud-download\" viewBox=\"0 0 16 16\" id=\"cloud-download\" style='width: 15px;vertical-align: middle;margin-right: 5px;'><path fill-rule=\"evenodd\" d=\"M4.406 1.342A5.53 5.53 0 018 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 010-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 00-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 010 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z\"></path><path fill-rule=\"evenodd\" d=\"M7.646 15.854a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 14.293V5.5a.5.5 0 00-1 0v8.793l-2.146-2.147a.5.5 0 00-.708.708l3 3z\"></path></svg>")
                    reset.append(isvg)
                    var spanText = $("<span style='display: inline-block;vertical-align: middle;'>下载</span>")
                    reset.append(spanText)
                    resetLi.append(reset)
                    ul.append(resetLi)
                    // for (var i = 0; i < 4; i++) {
                    //     var li = $("<li style='padding: 5px;border: 1px solid #e9ecef;'>菜单" + i + "</li>")
                    //     ul.append(li)
                    // }
                    menuLeft.append(ul)
                    drawerBody.append(menuLeft)

                    var bodyContent = $("<div style='flex-basis: 0;flex-grow: 1;min-width: 0;max-width: 100%;'></div>")
                    drawerBody.append(bodyContent)
                    batchDownloadDrawer.append(drawerBody)
                    $("body").append(batchDownloadDrawer);
                }


            }
        }
    });

    function sendToContent(cmd, dto) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            initBackgroundJavaScript().sendMessageToContentScript({
                cmd: cmd,
                pageTabs: tabs,
                request: dto
            }, function (response) {
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
                    $(v).parent().css("display", "block");
                    $(v).css("display", "block");
                    $(v).animate({width: "245px"});
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
                }
            }
        })

    });


});

var response_success = "success";
var response_fail = "fail";
var requst_source = "content";
var dto = {code: "", msg: "", url: "", element: "", option: "", content: "", type: "", source: requst_source};
var response_dto = {code: response_success, source: requst_source};
var timer = null;
var timer_stop = null;
var timer_container_count = null;// 图片验证码出现计时40s
var cover_content =
    '<div style="position: fixed;top: 0px;left: 0px;z-index: 1040;width: 100vw;height: 100vh;background-color: rgba(0, 0, 0, 0.5);">' +
    '   <div style="position: absolute;background-color: white;padding: 16px;padding-bottom: 37px;border-radius: 5px;font-size: 1rem;right: auto;top: 40%;font-weight: 300;margin: 0 auto;left: 50%;margin-left: -116px;">' +
    '       <div style="margin-bottom: 10px">' +
    '           <button type="button" class="btn-plugin btn-plugin-outline-primary" style="width: 200px;display: block;margin: 0 auto;" onclick="copy_cover()" >复制</button>' +
    '           <button id="cover_close" value="" style="position: absolute;right: 16px;top: 16px;" type="button" class="btn-plugin btn-plugin-outline-primary" onclick="isClose()">X</button>' +
    '       </div>' +
    '       <div style="text-align: center;height: auto;max-height: 400px;overflow-y: auto;">' +
    '           <div style="display: inline-block;vertical-align: middle;">' +
    '               <img style="display: inline-block;vertical-align: middle;" width="50" src="https://timgsa.baidu.com/timg?image&amp;quality=80&amp;size=b9999_10000&amp;sec=1602329894089&amp;di=d74ebf0e63b11375bc6b5c687ac394de&amp;imgtype=0&amp;src=http%3A%2F%2Fimg.ui.cn%2Fdata%2Ffile%2F4%2F9%2F2%2F2108294.gif">' +
    '               <span>处理中...</span>' +
    '           </div>' +
    '       </div>' +
    '       <div id="ocr_load_process" style="font-weight: 400;font-size: 14px;position: absolute;bottom: 16px;"></div>' +
    '       <textarea style="margin: 0px;height: 0px;width: 0px;padding: 0;position: absolute;border-top-width: 0px;border-right-width: 0px;" id="textarea_content"></textarea>' +
    '   </div>' +
    '</div>';
var script = '<script type="text/javascript">\n' +
    'function copy_cover () {\n' +
    '   var tr_arr = document.getElementById("new_table").getElementsByTagName("tr");\n' +
    '   var content = "\\n";\n' +
    '   for (let i = 0; i < tr_arr.length; i++) {\n' +
    '       var td = tr_arr[i];\n' +
    '       for (let j = 0; j < td.children.length; j++) {\n' +
    '           var innerText = td.children[j].innerText; \n' +
    '           if(isRealNum(innerText) && innerText.length >= 11){\n' +
    '               content += "\'"+innerText + "\\t";\n' +
    '           }else{\n' +
    '               content += innerText + "\\t";\n' +
    '           }\n' +
    '       }\n' +
    '       content += "\\n";\n' +
    '   }\n' +
    '   document.getElementById("textarea_content").innerHTML = content;\n' +
    '   document.getElementById("textarea_content").select()\n' +
    '   document.execCommand("copy");\n' +
    '}\n' +
    'function isRealNum(val) {\n' +
    '   if (val === "" || val == null) {\n' +
    '       return false;\n' +
    '   }\n' +
    '   if (!isNaN(val)) {\n' +
    '       return true;\n' +
    '   } else {\n' +
    '       return false;\n' +
    '   }\n' +
    '}\n' +
    'function isClose() \n{' +
    '   var cover_close_value = document.getElementById("cover_close").value;\n' +
    '   if(cover_close_value == ""){\n' +
    '      document.getElementById("cover_close").value = "stop" \n ' +
    '   } else if(cover_close_value == "stop"){\n' +
    '      document.getElementById("cover_close").value = "close" \n' +
    '   }\n' +
    '}\n' +
    '</script>';
$("body").append('<div id="cover" style="display: none">' + cover_content + '</div>');
$("body").append(script);
// 接受来自后端的信息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.cmd == "open_back") {
        if (request.request.code == response_success) {
            window.open(request.request.url);
            sendResponse(response_dto);
        }
    } else if (request.cmd == "copy_order_address") {
        $(document.getElementById("cover")).html(cover_content);
        if (request.request.code == response_success) {
            $('#cover').show(800);
            timer_stop = setInterval((function () { // 检测是否关闭
                var cover_close_value = $("#cover_close").attr("value");
                if (cover_close_value == "stop") {
                    clearInterval(timer);
                    if (new_table[0].children.length > 0) {
                        if ($("#new_table").length == 0) {
                            writeInCover(new_table);
                        }
                    } else {
                        $("#cover_close").attr("value", "close");
                    }
                } else if (cover_close_value == "close") {
                    clearInterval(timer);
                    clearInterval(timer_stop);
                    timer_stop = null;
                    timer = null;
                    // 返回初始化
                    i = 0;
                    new_table = $("<table></table>");
                    $("#cover_close").attr("value", "");
                    $('#cover').css("display", "none");
                } else if ($("[data-testid='beast-core-modal']").length > 0 || $("[id='captchaClickImg']").length > 0) {
                    timer_container_count++;
                    if (timer_container_count > 100 && timer_container_count < 150) {
                        console.info("暂停任务");
                        clearInterval(timer);
                        timer = null;
                    }
                } else if ($("[data-testid='beast-core-modal']").length == 0 && $("[id='captchaClickImg']").length == 0 && timer_container_count >= 100) {
                    console.info("重新开启任务");
                    copyOrderAddress();
                    timer_container_count = 0;
                }
            }), 100);
            copyOrderAddress();
            sendResponse(response_dto);
        }
    } else if (request.cmd == "order_image_loading_Process") {
        if (request.request.code == response_success) {
            sendMessageToBackground({cmd: "gain_table_header", code: response_success}, function (response) {
                if (response.code == response_success) {
                    var signIndex = 1;
                    if (response.content != undefined) {
                        response.content.forEach((v, i) => {
                            if (v.text == '订单标识（水军识别专用）') {
                                signIndex = i;
                                return;
                            }
                        })
                    }
                    var brushOrderArr = request.request.brushOrderArr;
                    var errorOrderArr = request.request.errorOrderArr;
                    console.info(brushOrderArr);
                    console.info(errorOrderArr);
                    var isExistArr = new Array();
                    if ($("#new_table").length == 1) {
                        var new_tr = $("#new_table").find("tr");
                        for (let j = 0; j < new_tr.length; j++) {
                            var order_no = $(new_tr[j]).find("td:nth-child(1)").text();
                            var new_td = $("<td class='waterArmy_signIndex'></td>");
                            new_td.css("border", "1px solid #d4d5d5");
                            new_td.css("padding", "10px");
                            new_td.text(" ");
                            for (let k = 0; k < brushOrderArr.length; k++) {
                                if (order_no == brushOrderArr[k].split("|")[0]) {
                                    new_td.text("水军");
                                    isExistArr.push(brushOrderArr[k]);
                                    break;
                                }
                            }
                            if ($(new_tr[j]).find(".waterArmy_signIndex").length != 0) {
                                $(new_tr[j]).find(".waterArmy_signIndex").text(new_td.text());
                            } else {
                                $(new_tr[j]).find("td:nth-child(" + signIndex + ")").after(new_td);
                            }
                        }
                        var differArr = brushOrderArr.concat(isExistArr).filter(function (v, i, arr) {
                            return arr.indexOf(v) === arr.lastIndexOf(v);
                        });
                        $(".new_error").empty();
                        var new_diff = $("<div class='new_error'><div style='color: red;font-weight: 600;text-align: left;margin-top: 5px;'>没有匹配订单：</div></div>");
                        new_diff.css("color", "green");
                        var new_diff_content = $("<div style='margin-top: 5px;margin-left: 25px;'></div>");
                        new_diff.append(new_diff_content);
                        for (var i = 0; i < differArr.length; i++) {
                            var div = $("<div style='display: inline-block;'></div>");
                            div.html(differArr[i].split("|")[1] + "&nbsp;&nbsp;&nbsp;");
                            new_diff_content.append(div);
                        }
                        $(".new_diff").empty();
                        var new_error = $("<div class='new_diff'><div style='color: red;font-weight: 600;text-align: left;margin-top: 5px;'>无法识别图片：</div></div>");
                        new_error.css("color", "green");
                        var new_error_content = $("<div style='margin-top: 5px;margin-left: 25px;'></div>");
                        new_error.append(new_error_content);
                        for (var i = 0; i < errorOrderArr.length; i++) {
                            var div = $("<div style='display: inline-block;'></div>");
                            div.html(errorOrderArr[i] + "&nbsp;&nbsp;&nbsp;");
                            new_error_content.append(div);
                        }
                        if (errorOrderArr.length > 0) {
                            $("#new_table").parent().after(new_error);
                        }
                        if (differArr.length > 0) {
                            $("#new_table").parent().after(new_diff);
                        }
                    }
                }
            })
        }
        sendResponse(response_dto);
    } else if (request.cmd == "ocr_load_process") {
        if (request.request.code == response_success) {
            var total = request.request.total;
            var row = request.request.row;
            var name = request.request.name;
            console.info("当前处理：" + name + " 共：" + row + "/" + total);
            if (total == row) {
                var div = $("<div>完成&nbsp;共&nbsp;<span style='color: #afafaf;'>" + total + "</span></div>");
            } else {
                var div = $("<div>当前：<span style='color: #afafaf;'>" + name + "</span>&nbsp;共：<span style='color: #afafaf;'>" + row + "/" + total + "</span></div>");
            }
            $("#ocr_load_process").html(div);
        }
        sendResponse(response_dto);
    } else if (request.cmd == "stop_opera") {
        if (request.request.code == response_success) {
            var cover_close_value = document.getElementById("cover_close").value;
            if (cover_close_value == "") {
                document.getElementById("cover_close").value = "stop";
            } else if (cover_close_value == "stop") {
                document.getElementById("cover_close").value = "close";
            }
        }
        sendResponse(response_dto);
    } else if (request.cmd == "init_gain_table_header") {
        if (request.request.code == response_success) {
            var thead = $('[data-testid="beast-core-table-middle-thead"]');
            if (thead != null) {
                var ths = $(thead).find('[data-testid="beast-core-table-th"]');
                var tableHeaderArr = [];
                for (let j = 0; j < ths.length; j++) {
                    var notTh = ths[j].className.trim().split(" ").length;
                    if (notTh < 2) {
                        var tableHeader = {};
                        var thText = ths[j].innerText;
                        tableHeader.text = thText;
                        tableHeader.serial = j + 1;
                        tableHeaderArr.push(tableHeader);
                    }
                }
                if (ths.length > 0) {
                    var tableHeader = {};
                    tableHeader.text = "订单标识（水军识别专用）";
                    tableHeader.serial = 0;
                    tableHeaderArr.push(tableHeader);
                }
                response_dto.code = response_success;
                response_dto.content = tableHeaderArr;
                sendResponse(response_dto);
            } else {
                response_dto.code = response_fail;
                response_dto.msg = "无";
                sendResponse(response_dto);
            }
        }
    } else if (request.cmd == "video_image_batch_download") {
        if (request.request.code == response_success) {
            var batchDownloadDrawer = $("#batchDownloadDrawer")
            var clientHeight = document.documentElement.clientHeight
            if (batchDownloadDrawer.length <= 0) {
                batchDownloadDrawer = $("<div id='batchDownloadDrawer' style='background-color: white;z-index: 9999999999;position: fixed;bottom: 0;width: 100%;height: 0px;border-top-color: #dae0e5;border-top-style: solid;border-top-width: 1px;'></div>")
                var title = $("<div style='cursor: n-resize;padding: 5px 20px;display: flex;flex-wrap: wrap;background-color: #f4f4f5;border-bottom-color: #dae0e5;border-bottom-style: solid;border-bottom-width: 1px;'></div>")
                var title_text = $("<div style='flex-basis: 0;flex-grow: 1;min-width: 0;max-width: 100%;'>修改</div>")
                title.append(title_text)
                var operation = $("<div style='flex-basis: 0;flex-grow: 1;min-width: 0;max-width: 100%;text-align: right;'></div>")
                var minButt = $("<a style='cursor:default;border: 1px solid #ced4da;padding: 0 5px;height: 18px;' class='btn-plugin btn-plugin-light'></a>")
                var minIco = $("<svg style='width: 15px;vertical-align: unset;' xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\" class=\"bi bi-arrow-bar-down\" viewBox=\"0 0 16 16\" id=\"arrow-bar-down\"><path fill-rule=\"evenodd\" d=\"M1 3.5a.5.5 0 01.5-.5h13a.5.5 0 010 1h-13a.5.5 0 01-.5-.5zM8 6a.5.5 0 01.5.5v5.793l2.146-2.147a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 01.708-.708L7.5 12.293V6.5A.5.5 0 018 6z\"></path></svg>");
                minButt.append(minIco)
                minButt.click(function (e) {
                    $(batchDownloadDrawer).animate({top: clientHeight - 30, hieght: 0})
                })
                operation.append(minButt);
                var zoomButt = $("<a style='cursor:default;border: 1px solid #ced4da;padding: 0 5px;height: 18px;' class='btn-plugin btn-plugin-light'></a>")
                var zoomIco = $("<svg style='width: 15px;vertical-align: unset;' xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\" class=\"bi bi-arrow-bar-up\" viewBox=\"0 0 16 16\" id=\"arrow-bar-up\"><path fill-rule=\"evenodd\" d=\"M8 10a.5.5 0 00.5-.5V3.707l2.146 2.147a.5.5 0 00.708-.708l-3-3a.5.5 0 00-.708 0l-3 3a.5.5 0 10.708.708L7.5 3.707V9.5a.5.5 0 00.5.5zm-7 2.5a.5.5 0 01.5-.5h13a.5.5 0 010 1h-13a.5.5 0 01-.5-.5z\"></path></svg>");
                zoomButt.append(zoomIco)
                zoomButt.click(function (e) {
                    // $(batchDownloadDrawer).css("height", clientHeight)
                    $(batchDownloadDrawer).animate({top: 0, height: clientHeight}, function () {
                        $(batchDownloadDrawer).css("height", "auto")
                    })
                })
                operation.append(zoomButt);
                var closeButt = $("<a style='cursor:default;border: 1px solid #ced4da;padding: 0 5px;height: 18px;' class='btn-plugin btn-plugin-light'></a>")
                var closeIco = $("<svg style='width: 15px;vertical-align: unset;' xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\" class=\"bi bi-x\" viewBox=\"0 0 16 16\" id=\"x\"><path fill-rule=\"evenodd\" d=\"M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z\"></path></svg>");
                closeButt.append(closeIco)
                closeButt.click(function (e) {
                    $(batchDownloadDrawer).animate({top: clientHeight}, function () {
                        $(batchDownloadDrawer).remove()
                    });
                })
                operation.append(closeButt);
                title.append(operation)
                title.on("mousedown", function (e) {
                    var thisDrawer = $("#batchDownloadDrawer")
                    var downY = e.clientY
                    var height = thisDrawer.height()
                    $(document).on("mousemove mouseleave mouseup", function (ev) {
                        if (ev.type == "mousemove") {
                            var moveY = ev.clientY - 10
                            var poorY = height - (moveY - downY)
                            var docHeight = clientHeight - 30
                            if (moveY < 0) {
                                moveY = 0
                            } else if (moveY > docHeight) {
                                moveY = docHeight
                            }
                            thisDrawer.css("top", moveY)
                            thisDrawer.css("height", poorY)
                            thisDrawer.css("height", "auto");
                        } else if (ev.type == "mouseleave") {
                            $(document).unbind("mousemove")
                        } else if (ev.type == "mouseup") {
                            $(document).unbind("mousemove")
                        }
                    })
                })
                batchDownloadDrawer.append(title);
                var drawerBody = $("<div id='drawerBody' style='width: 100%;display: flex;flex-wrap: wrap;height: calc(100% - 30px);'></div>")
                // 菜单
                var menuLeft = $("<div style='flex-basis: 0;flex-grow: 1;min-width: 0;max-width: 250px;border-right-width: 1px;border-right-style: solid;border-right-color: #ced4da;'></div>")
                var ul = $("<ul style='list-style-type: none;padding: 0;'></ul>")
                // li排序
                var sortLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;'></li>")
                var select = $("<select style='appearance: none;-moz-appearance:none;-webkit-appearance:none;-moz-appearance:none;-webkit-appearance:none;background: url(https://inews.gtimg.com/newsapp_bt/0/5443201980/640) no-repeat scroll right center transparent;background-size: 20px;display: block;width: 100%;height: calc(1.5em + .75rem + 2px);padding: .10rem .75rem;font-weight: 400;color: #495057;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da;border-radius: .25rem;transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;' ></select>")
                var option = $("<option style='font-size: 16px;' value='1'>原排序</option>")
                select.append(option)
                var maxOption = $("<option style='font-size: 16px;' value='1'>大图优先</option>")
                select.append(maxOption)
                var minOption = $("<option style='font-size: 16px;' value='1'>小图优先</option>")
                select.append(minOption)
                sortLi.append(select)
                ul.append(sortLi)
                // 视图
                var viewLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;'></li>")
                var button = $("<button style='width: 100%;border: 1px solid #ced4da;' class='btn-plugin btn-plugin-light'></button>")
                var isvg = $("<svg xmlns='http://www.w3.org/2000/svg' fill='currentColor' class='bi bi-ui-checks-grid' viewBox='0 0 16 16' id='ui-checks-grid' style='width: 15px;vertical-align: middle;margin-right: 5px;'><path fill-rule='evenodd' d='M2 10a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1H2zm9-9a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V2a1 1 0 00-1-1h-3zm0 9a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1h-3zm0-10a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2V2a2 2 0 00-2-2h-3zM2 9a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2v-3a2 2 0 00-2-2H2zm7 2a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3zM0 2a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm5.354.854l-2 2a.5.5 0 01-.708 0l-1-1a.5.5 0 11.708-.708L3 3.793l1.646-1.647a.5.5 0 11.708.708z'></path></svg>")
                button.append(isvg)
                var spanText = $("<span style='display: inline-block;vertical-align: middle;'>视图</span>")
                button.append(spanText)
                viewLi.append(button)
                ul.append(viewLi)
                // 高度
                var heightLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;display: flex;'></li>")
                var height = $("<div style='width: 100%;max-width: 40px;line-height: 2;'>高度</div><input type='text' style='width: 100%;font-weight: 400;color: #495057;border: 1px solid #ced4da;' class='btn-plugin' placeholder='高度'/>")
                heightLi.append(height)
                ul.append(heightLi)
                // 宽度
                var widthtLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;display: flex;'></li>")
                var width = $("<div style='width: 100%;max-width: 40px;line-height: 2;'>宽度</div><input type='text' style='width: 100%;font-weight: 400;color: #495057;border: 1px solid #ced4da;' class='btn-plugin' placeholder='宽度'/>")
                widthtLi.append(width)
                ul.append(widthtLi)
                // 名称
                var filterLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;display: flex;'></li>")
                var filter = $("<div style='width: 100%;max-width: 40px;line-height: 2;'>名称</div><input type='text' style='width: 100%;font-weight: 400;color: #495057;border: 1px solid #ced4da;' class='btn-plugin' placeholder='输入过滤名称'/>")
                filterLi.append(filter)
                ul.append(filterLi)
                // 重置
                var resetLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;'></li>")
                var reset = $("<button style='width: 100%;border: 1px solid #ced4da;' class='btn-plugin btn-plugin-light'></button>")
                var isvg = $("<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\" class=\"bi bi-bootstrap-reboot\" viewBox=\"0 0 16 16\" id=\"bootstrap-reboot\" style='width: 15px;vertical-align: middle;margin-right: 5px;' ><path fill-rule=\"evenodd\" d=\"M1.161 8a6.84 6.84 0 106.842-6.84.58.58 0 010-1.16 8 8 0 11-6.556 3.412l-.663-.577a.58.58 0 01.227-.997l2.52-.69a.58.58 0 01.728.633l-.332 2.592a.58.58 0 01-.956.364l-.643-.56A6.812 6.812 0 001.16 8zm5.48-.079V5.277h1.57c.881 0 1.416.499 1.416 1.32 0 .84-.504 1.324-1.386 1.324h-1.6zm0 3.75V8.843h1.57l1.498 2.828h1.314L9.377 8.665c.897-.3 1.427-1.106 1.427-2.1 0-1.37-.943-2.246-2.456-2.246H5.5v7.352h1.141z\"></path></svg>")
                reset.append(isvg)
                var spanText = $("<span style='display: inline-block;vertical-align: middle;'>重置</span>")
                reset.append(spanText)
                resetLi.append(reset)
                ul.append(resetLi)
                // 下载
                var resetLi = $("<li style='padding: 12px 20px;border: 1px solid #e9ecef;'></li>")
                var reset = $("<button style='width: 100%;' class='btn-plugin btn-plugin-outline-primary'></button>")
                var isvg = $("<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\" class=\"bi bi-cloud-download\" viewBox=\"0 0 16 16\" id=\"cloud-download\" style='width: 15px;vertical-align: middle;margin-right: 5px;'><path fill-rule=\"evenodd\" d=\"M4.406 1.342A5.53 5.53 0 018 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 010-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 00-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 010 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z\"></path><path fill-rule=\"evenodd\" d=\"M7.646 15.854a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 14.293V5.5a.5.5 0 00-1 0v8.793l-2.146-2.147a.5.5 0 00-.708.708l3 3z\"></path></svg>")
                reset.append(isvg)
                var spanText = $("<span style='display: inline-block;vertical-align: middle;'>下载</span>")
                reset.append(spanText)
                resetLi.append(reset)
                ul.append(resetLi)
                menuLeft.append(ul)
                drawerBody.append(menuLeft)
                var bodyContent = $("<div id='bodyContent' style='height: calc(100% - 11px);padding: 5px;flex-basis: 0;flex-grow: 1;min-width: 0;overflow-y: scroll;max-width: 100%;background-color: #f8f9fa;'></div>")
                //aiparser(bodyContent)
                var images = $("img")
                for (var i = 0; i < images.length; i++) {
                    var imgDiv = $("<div style='border: 1px solid red;width: 100px;height: 100px;margin: 5px;display: inline-flex;position: relative;'></div>")
                    $(imgDiv).click(function () {
                        $(this).toggleClass("cancel-img");
                    })
                    var imgD = $("<img src='" + images[i].src + "' height='100' width='100'>")
                    imgDiv.append(imgD)
                    var img_url = images[i].src;
                    var img = new Image();
                    img.src = img_url;
                    if (!img.complete) {
                        img.onload = async function () {
                            console.log('from:onload : width:' + img.width + ',height:' + img.height);
                        };
                    }
                    var imgHeight = img.height
                    var imgWidth = img.width
                    var urlArr = img.src.split("/")
                    var imgName = urlArr[urlArr.length - 1];
                    if (imgName.split(".")[0].length > 4) {
                        var namePrefix = imgName.split(".")[0]
                        var sub = namePrefix.substring(2, namePrefix.length - 2)
                        imgName = imgName.replace(sub, "...")
                        imgName = imgName.replace("?", "")
                    }
                    var title = $("<div id='src" + i + "' style='background: rgba(0, 0, 0, 0.5);color: white;width: 100px;bottom: 0;font-weight: 600;position: absolute;'><div style='padding-left: 5px'>" + imgName + "</div><div style='padding-left: 5px'>" + imgWidth + " x " + imgHeight + "</div></div>")
                    imgDiv.append(title)
                    bodyContent.append(imgDiv)
                }
                drawerBody.append(bodyContent)
                batchDownloadDrawer.append(drawerBody)
                $("body").append(batchDownloadDrawer)
                $(batchDownloadDrawer).animate({height: "450px"});
            }
        }
        sendResponse(response_dto);
    }
});

let i = 0;
var new_table = $("<table></table>");

function copyOrderAddress() {
    new_table.attr("id", "new_table");
    new_table.css("border-collapse", "collapse");
    timer = setInterval((function () {
        var tr_arr = $($("table")[1]).find("tr");
        var td = $(tr_arr[i]).find("td:nth-child(3)");
        var className = $(td).find("i").attr("class");
        if (className != undefined && className.indexOf("unlock") == -1) {
            $(td).find("i").click();
        } else {
            do {
                i++;
                if (i >= tr_arr.length) {
                    break;
                }
                td = $(tr_arr[i]).find("td:nth-child(3)");
                className = $(td).find("i").attr("class");
                if (className.indexOf("unlock") == -1) {
                    $(td).find("i").click();
                    break;
                }
            } while (true)
        }
        var scroll = $("[data-testid='beast-core-table-middle-body']")[0].children[0];
        if (i > 5) {
            $(scroll).animate({scrollTop: 60 * (i + 1) - 60}, 1000);
        }
        if (i >= tr_arr.length) {
            let j = 0
            var check = true;
            do { // 检测是否还有未点击
                if (j >= tr_arr.length) {
                    break;
                }
                td = $(tr_arr[j]).find("td:nth-child(3)");
                className = $(td).find("i").attr("class");
                if (className.indexOf("unlock") == -1) {
                    check = false;
                    i = -1;
                    break;
                }
                j++;
            } while (true);
            if (check) {
                var arr_index = [{serial: 2}, {serial: 3}, {serial: 4}, {serial: 5}, {serial: 6}, {serial: 11}, {serial: 10}];
                sendMessageToBackground({cmd: "gain_table_header", code: response_success}, function (response) {
                    console.info(response)
                    if (response.content != undefined) {
                        arr_index = response.content;
                    }
                    for (let j = 0; j < tr_arr.length; j++) {
                        var new_tr = $("<tr></tr>");
                        var tr = tr_arr[j];
                        for (let k = 0; k < arr_index.length; k++) {
                            var new_td = $("<td></td>");
                            new_td.css("border", "1px solid #d4d5d5");
                            new_td.css("padding", "10px");
                            if (k == 0) {
                                new_td.css("width", "200px");
                            }
                            var serial = parseInt(arr_index[k].serial);
                            if (serial == 0) {
                                continue;
                            }
                            var text_td = $(tr).children().eq(serial).text().replace(".beast-core-ellipsis-2{-webkit-line-clamp:2;-webkit-box-orient: vertical;}", "");
                            text_td = text_td.replace("回收单号", "");
                            text_td = text_td.replace("锁定", "");
                            new_td.text(text_td);
                            new_tr.append(new_td);
                        }
                        new_table.append(new_tr);
                    }
                    var next_PGT = $("[data-testid='beast-core-pagination-next']");
                    if (next_PGT.length != 0 && next_PGT.attr("class").indexOf("disabled") == -1) { // 判断下一页
                        next_PGT.click();
                        i = -1;
                    } else {
                        clearInterval(timer);
                        writeInCover(new_table);
                    }
                })

            }
        }
        i++;
    }), 10000);
}

/**
 * 写入表格内容
 * @param tableContent
 */
function writeInCover(tableContent) {
    var cover = $(document.getElementById("cover").children[0].children[0]);
    $(cover).css("left", "0");
    $(cover).css("top", "0");
    $(cover).css("margin-left", "0px");
    $(document.getElementById("cover").children[0].children[0].children[1]).html(tableContent);
    var coverw = $(cover).width();
    var coverow = $(cover).outerWidth();
    var coverml = (coverw + (coverow - coverw)) / 2;
    $(cover).css("margin-left", "-" + coverml + "px");
    $(cover).css("top", "20%");
    $(cover).css("left", "50%");
}

function sendMessageToBackground(message, callback) {
    chrome.runtime.sendMessage(message, res => {
        callback(res);
    })
}

function aiparser(bodyContent) {
    // if(top != self){
    //     return;
    // }
    // var index = 0;
    // function PrefixZero(num, n) {
    //     return (Array(n).join(0) + num).slice(-n);
    // }
    // function send(img){
    //     new ParsedPItem(img, index++, _tabInfo, function(item){
    //         if(item.width > 300){
    //             item.ext = 'jpg';
    //             chrome.runtime.sendMessage({
    //                 cmd: 'ADD_IMG',
    //                 tabId: _tabInfo.id,
    //                 item: item,
    //             });
    //         }
    //     })
    // }
    // chrome.runtime.sendMessage({
    //     cmd: 'SET_GROUPS',
    //     groups: [
    //         '主图',
    //         '视频',
    //         'SKU图片',
    //         '详情',
    //     ]
    // })
    if (location.href.match('detail.1688.com')) {
        var itemImgs = document.querySelectorAll('#dt-tab img');
        var colorImgs = document.querySelectorAll('.obj-leading img,.table-sku img');
        var descImgs = document.querySelectorAll('.de-description-detail img');
        var mainIndex = 1;
        itemImgs.forEach(function (img) {
            var src = img.dataset.lazySrc || img.src

            var imgDiv = $("<div style='width: 100px;height: 100px;border: 1px solid red;margin: 5px;display: inline-flex;'></div>")
            var imgv = $("<img alt='主图' src='" + src + "' height='100' width='100'>")
            imgDiv.append(imgv)
            bodyContent.append(imgDiv)
            // send({
            //     src: img.dataset.lazySrc || img.src,
            //     group: '主图',
            //     groupIndex: 0,
            //     alt: '主图-'+PrefixZero(mainIndex++, 2),
            // })
        });
        var colorIndex = 1;
        colorImgs.forEach(function (img) {
            var src = img.dataset.lazySrc || img.src

            var imgDiv = $("<div style='width: 100px;height: 100px;border: 1px solid red;margin: 5px;display: inline-flex;'></div>")
            var imgv = $("<img alt='SKU图片' src='" + src + "' height='100' width='100'>")
            imgDiv.append(imgv)
            bodyContent.append(imgDiv)
            // send({
            //     src: img.src,
            //     group: 'SKU图片',
            //     groupIndex: 2,
            //     alt: 'SKU-'+PrefixZero(colorIndex++, 2)+'-'+img.alt,
            // })
        });
        // var detailIndex = 1;
        descImgs.forEach(function (img) {
            var src = img.dataset.lazySrc || img.src

            var imgDiv = $("<div style='width: 100px;height: 100px;border: 1px solid red;margin: 5px;display: inline-flex;'></div>")
            var imgv = $("<img alt='详情' src='" + src + "' height='100' width='100'>")
            imgDiv.append(imgv)
            bodyContent.append(imgDiv)
            // send({
            //     src: img.src,
            //     group: '详情',
            //     groupIndex: 3,
            //     alt: '详情-'+PrefixZero(detailIndex++, 2),
            // })
        });
        // if(descImgs.length == 0){
        //     var tfsUrl = $('#desc-lazyload-container').attr('data-tfs-url');
        //     if(tfsUrl){
        //         if(!tfsUrl.match('desc.alicdn.com')){
        //             tfsUrl+'?_='+Date.now();
        //         }
        //         chrome.runtime.sendMessage({
        //             cmd: 'NET',
        //             settings:{
        //                 url: tfsUrl,
        //             }
        //         }, function(res){
        //             if(res.status == 'ok'){
        //                 var result = res.data.match(/https:\/\/cbu01.alicdn.com\/img[^ ]*?\.jpg/g);
        //                 if(result){
        //                     result.forEach(function(img){
        //                         send({
        //                             src: img,
        //                             group: '详情',
        //                             groupIndex: 3,
        //                             alt: '详情-'+PrefixZero(detailIndex++, 2),
        //                         });
        //                     });
        //                 }
        //             }
        //         });
        //     }
        // }
        // if(location.href.match('detail.1688.com/pic')){
        //     document.querySelectorAll('#dt-bp-tab-nav li[data-img]').forEach(function(item){
        //         send({
        //             src: item.dataset.img
        //         });
        //     });
        // }
        // var detailGalery = document.querySelector('.mod-detail-version2018-gallery, .mod-detail-gallery');
        // var detailGaleryConfig;
        // if(detailGalery){
        //     detailGaleryConfig = JSON.parse(detailGalery.dataset.modConfig);
        //     if(detailGaleryConfig.userId && detailGaleryConfig.mainVideoId){
        //         var videoUrl = 'https://cloud.video.taobao.com/play/u/'+detailGaleryConfig.userId+'/p/1/e/6/t/1/'+detailGaleryConfig.mainVideoId+'.mp4';
        //         new VItem({
        //             src: videoUrl,
        //             group: '视频',
        //             groupIndex: 1,
        //         }, index++, _tabInfo, function(item){
        //             chrome.runtime.sendMessage({
        //                 cmd: 'ADD_VIDEO',
        //                 tabId: _tabInfo.id,
        //                 item: item,
        //             });
        //         });
        //     }
        // }
    } else {
        document.querySelectorAll('img').forEach(function (img, index) {
            new ParsedPItem(img, index, _tabInfo, function (item) {
                chrome.runtime.sendMessage({
                    cmd: 'ADD_IMG',
                    tabId: _tabInfo.id,
                    item: item,
                });
            })
        });
    }
}

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
    '           <button type="button" class="btn btn-outline-primary" style="width: 200px;display: block;margin: 0 auto;" onclick="copy_cover()" >复制</button>' +
    '           <button id="cover_close" value="" style="position: absolute;right: 16px;top: 16px;" type="button" class="btn btn-outline-primary" onclick="isClose()">X</button>' +
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

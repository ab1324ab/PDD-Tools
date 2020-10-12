var response_success = "success";
var response_fail = "fail";
var requst_source = "content";
var dto = {code: "", msg: "", url: "", element: "", option: "", content: "", type: "", source: requst_source};
var response_dto = {code: response_success, source: requst_source};
var timer = null;
var timer_stop = null;
var cover_content = '<div style="position: fixed;top: 0px;opacity: 0.5;left: 0px;z-index: 1040;width: 100vw;height: 100vh;background-color: rgb(0, 0, 0);"></div>' +
    '<div style="position: fixed;z-index: 1041;background-color: white;padding: 16px;border-radius: 5px;font-size: 1rem;left: 50%;top: 40%;transform: translateX(-50%);font-weight: 300;">' +
    '<div style="margin-bottom: 10px">' +
    '<button type="button" class="btn btn-outline-primary" style="width: 200px;display: block;margin: 0 auto;" onclick="copy_cover()" >复制</button>' +
    '<button id="cover_close" style="position: absolute;right: 16px;top: 16px;" type="button" class="btn btn-outline-primary" onclick="document.getElementById(\'cover\').style.display =\'none\';">X</button>' +
    '</div>' +
    '<div style="text-align: center;height: auto;max-height: 400px;overflow-y: auto;">' +
    '<div style="display: inline-block;vertical-align: middle;"><img style="display: inline-block;vertical-align: middle;" width="50" src="https://timgsa.baidu.com/timg?image&amp;quality=80&amp;size=b9999_10000&amp;sec=1602329894089&amp;di=d74ebf0e63b11375bc6b5c687ac394de&amp;imgtype=0&amp;src=http%3A%2F%2Fimg.ui.cn%2Fdata%2Ffile%2F4%2F9%2F2%2F2108294.gif">处理中...</div>' +
    '</div>' +
    '<textarea style="margin: 0px;height: 0px;width: 0px;padding: 0;position: absolute;border-top-width: 0px;border-right-width: 0px;" id="textarea_content"></textarea>' +
    '</div>';
var script = '<script type="text/javascript">\n' +
    'function copy_cover () {\n' +
    '   debugger;var tr_arr = document.getElementById("new_table").children;\n' +
    '   var content = "\\n";\n' +
    '   for (let i = 0; i < tr_arr.length; i++) {\n' +
    '       var td = tr_arr[i];\n' +
    '       for (let j = 0; j < td.children.length; j++) {\n' +
    '           var innerText = td.children[j].innerText; ' +
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
    '</script>';
$("body").append('<div id="cover" style="display: none">' + cover_content + '</div>');
$("body").append(script);
// 接受来自后端的信息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    $(document.getElementById("cover")).html(cover_content);
    if (request.cmd == "open_back") {
        if (request.request.code == response_success) {
            window.open(request.request.url);
            sendResponse(response_dto);
        }
    } else if (request.cmd == "copy_order_address") {
        if (request.request.code == response_success) {
            $('#cover').show(800);
            timer_stop = setInterval((function () { // 检测是否关闭
                if ($('#cover').css("display") == 'none') {
                    clearInterval(timer);
                    clearInterval(timer_stop);
                    timer_stop = null;
                    timer = null;
                }
            }), 100);
            let i = 0;
            var new_table = $("<table></table>");
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
                var scroll = $(document.querySelector(".TB_outerWrapper_4-62-1.TB_bordered_4-62-1.TB_notTreeStriped_4-62-1").children[0].children[0].children[1].children[0]);
                if (i > 8) {
                    scroll.animate({scrollTop: 60 * (i + 1) - 60}, 1000);
                }
                var arr_index = [2, 11, 10, 3, 4, 5, 6];
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
                            i = 0;
                            break;
                        }
                        j++;
                    } while (true)
                    if (check) {
                        for (let j = 0; j < tr_arr.length; j++) {
                            var new_tr = $("<tr></tr>");
                            var tr = tr_arr[j];
                            for (let k = 0; k < arr_index.length; k++) {
                                var new_td = $("<td></td>");
                                new_td.css("border", "1px solid #d4d5d5");
                                new_td.css("padding", "10px");
                                var text_td = $(tr).find(":nth-child(" + arr_index[k] + ")").text().replace(".beast-core-ellipsis-2{-webkit-line-clamp:2;-webkit-box-orient: vertical;}", "");
                                text_td = text_td.replace("回收单号", "");
                                text_td = text_td.replace("锁定", "");
                                new_td.text(text_td);
                                new_tr.append(new_td);
                            }
                            new_table.append(new_tr);
                        }
                        if(false){ // 判断下一页

                        }else{
                            clearInterval(timer);
                            $(document.getElementById("cover").children[1]).css("top", "20%");
                            $(document.getElementById("cover").children[1].children[1]).html(new_table);
                        }
                    }
                }
                i++;
            }), 1000);
        }
    } else if (request.cmd == "stop_opera") {
        if (request.request.code == response_success) {
            $('#cover').hide(800);
            clearInterval(timer);
            timer = null;
        }
    } else if (request.cmd == "service_execute_program_settings") {
        //console.info("点击" + request.request.element);
        $(request.request.element)[0].click();
    }
});


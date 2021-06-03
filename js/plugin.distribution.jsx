plugin_select();

/**
 * 选择插件列表
 * @returns {string}
 */
function plugin_select() {
    var pluginArr = eval('([$$])');
    const arrList = initPlugin();
    for (const val in arrList) {
        if(location.href.match(arrList[val].url)){
            if(pluginArr != undefined && pluginArr.includes(arrList[val].url)){
                return "public.plugin";
            } else {
                return arrList[val].url;
            }
        }
    }
    return "public.plugin";
}

/**
 * 初始化插件列表
 * @returns {any[]}
 */
function initPlugin() {
    var plugin_detail = { name: '1688批发网', url: 'detail.1688.com' };
    var plugin_mobile = { name: '拼多多手机网页', url: 'mobile.yangkeduo.com' };
    var plugin_image = { name: '百度图片插件', url: 'image.baidu.com' };
    // 插件数组
    var plugin_array = new Array();
    plugin_array.push(plugin_detail);
    plugin_array.push(plugin_mobile);
    plugin_array.push(plugin_image);
    return plugin_array;
}

plugin_select()

/**
 * 选择插件列表
 * @returns {string}
 */
function plugin_select() {
    if (location.href.match('detail.com')) {
       return "detail.1688.com"
    } else if (location.href.match('mobile.yangkeduo.com')) {

    } else {
        return "public.plugin"
    }
}



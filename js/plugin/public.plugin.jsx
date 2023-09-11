essentials()

function essentials() {
    var detailIndex = 1;
    document.querySelectorAll('img').forEach(function (img, index) {
        if($(img).attr("src") || $(img).attr("data-src")){
            var src = $(img).attr("src") || $(img).attr("data-src");
            if (src.indexOf(window.location.protocol) === -1 && src.indexOf('base64') === -1 )
                src = window.location.protocol +'//'+ window.location.host + src;
            send({
                src: src,
                group: '全图',
                groupIndex: 0,
                alt: '图片-' + PrefixZero(detailIndex++, 2),
            })
        }
    });
}

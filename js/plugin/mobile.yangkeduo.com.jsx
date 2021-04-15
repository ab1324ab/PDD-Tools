essentials()

function essentials() {
    var detailIndex = 1;
    document.querySelectorAll('img').forEach(function (img, index) {
        send({
            src: $(img).attr("src"),
            group: '全图',
            groupIndex: 0,
            alt: '图片-' + PrefixZero(detailIndex++, 2),
        })
    });
}

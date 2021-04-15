essentials()

function essentials() {
    var itemImgs = document.querySelectorAll('#dt-tab img');
    var colorImgs = document.querySelectorAll('.obj-leading img,.table-sku img');
    var descImgs = document.querySelectorAll('.de-description-detail img');
    var mainIndex = 1;
    itemImgs.forEach(function (img) {
        send({
            src: img.dataset.lazySrc || img.src,
            group: '主图',
            groupIndex: 0,
            alt: '主图-' + PrefixZero(mainIndex++, 2),
        })
    });
    var colorIndex = 1;
    colorImgs.forEach(function (img) {
        send({
            src: img.src,
            group: 'SKU图片',
            groupIndex: 2,
            alt: 'SKU-' + PrefixZero(colorIndex++, 2) + '-' + img.alt,
        })
    });
    var detailIndex = 1;
    descImgs.forEach(function (img) {
        send({
            src: img.src,
            group: '详情',
            groupIndex: 3,
            alt: '详情-' + PrefixZero(detailIndex++, 2),
        })
    });
    if (descImgs.length == 0) {
        var tfsUrl = $('#desc-lazyload-container').attr('data-tfs-url');
        if (tfsUrl) {
            if (!tfsUrl.match('desc.alicdn.com')) {
                tfsUrl + '?_=' + Date.now();
            }
            $.ajax({
                url: tfsUrl,
                data: {},
                async: false,
                type: 'get',
                success: function (data) {
                    console.info(data)
                    var result = data.match(/https:\/\/cbu01.alicdn.com\/img[^ ]*?\.jpg/g);
                    if (result) {
                        result.forEach(function (img) {
                            send({
                                src: img,
                                group: '详情',
                                groupIndex: 3,
                                alt: '详情-' + PrefixZero(detailIndex++, 2),
                            });
                        });
                    }
                }
            })
        }
    }
    if (location.href.match('detail.1688.com/pic')) {
        document.querySelectorAll('#dt-bp-tab-nav li[data-img]').forEach(function (item) {
            send({
                src: item.dataset.img
            });
        });
    }
    // var detailGalery = document.querySelector('.mod-detail-version2018-gallery, .mod-detail-gallery');
    // var detailGaleryConfig;
    // if (detailGalery) {
    //     detailGaleryConfig = JSON.parse(detailGalery.dataset.modConfig);
    //     if (detailGaleryConfig.userId && detailGaleryConfig.mainVideoId) {
    //         var videoUrl = 'https://cloud.video.taobao.com/play/u/' + detailGaleryConfig.userId + '/p/1/e/6/t/1/' + detailGaleryConfig.mainVideoId + '.mp4';
    //         new VItem({
    //             src: videoUrl,
    //             group: '视频',
    //             groupIndex: 1,
    //         }, index++, _tabInfo, function (item) {
    //             chrome.runtime.sendMessage({
    //                 cmd: 'ADD_VIDEO',
    //                 tabId: _tabInfo.id,
    //                 item: item,
    //             });
    //         });
    //     }
    // }
}



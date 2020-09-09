import { dispatch } from 'vendor';

export default class {
    static $inject = ['$scope', '$timeout', 'myUtils', '$uibModalInstance', 'params', '$stateParams', 'newsService'];

    historyContent = ''
    currentContent = ''
    constructor(...$inject) {
        dispatch(this, $inject);
        this.currentTitle = this.params.currentTitle;
        this.currentContent = this.params.currentContent;
        this.addShow = false;
        this.hasScrollEvent = false; // 判断是否需要添加scroll事件
        this.channelPage = {
            pageCur: 1,
            pageSize: 10,
            pageNum: 1,
            total: 0,
        };
        this.dynamicList = [];
        this.getHistoryList(this.params.origin_id);
    }
    // 获取历史对比列表
    getHistoryList(id) {
        this.num = 0;
        const param = {
            origin_id: id,
            per_num: this.channelPage.pageSize,
            page: this.channelPage.pageCur,
            type: 'article',
        };
        this.newsService.toggled(param)
            .then((data) => {
                if (!this.hasScrollEvent) {
                    this.hasScrollEvent = true;
                    $('#history-version').scroll(() => {
                        this.scrollHistory();
                    });
                }
                this.channelPage.total = parseInt(data.data.total, 10);
                this.channelPage.pageNum = Math.ceil(this.channelPage.total / this.channelPage.pageSize);//总共多少页
                this.Idx = [];
                this.historyContent = data.data.data[0].content;
                this.dynamicList = data.data.data;
                // this.Msglist = [];
                this.dynamicList.forEach((v, idx) => {
                    v.historyList = [];
                    for (let i = 0; i < v.history_list.content.length; i += 1) {
                        const obj = {};
                        obj.content = v.history_list.content[i];
                        obj.isClick = v.history_list.redirect[i];
                        v.historyList.push(obj);
                    }
                    v.historyList.forEach((t) => {
                        if (t.isClick == 1) {
                            t.isActived = false;
                            this.Idx.push(idx);
                        }
                    });
                });
                if (this.Idx.length) {
                    const params = this.dynamicList[this.Idx[0]];
                    this.getDetial(params, this.Idx[0]);
                } else {
                    document.getElementById('current-content').innerHTML = this.historyContent;
                    this.lastTime = this.dynamicList[this.dynamicList.length - 1].time;
                }
                window.setTimeout(() => {
                    this.fitstList = $('.left-version-content').height();
                }, 200);
            });
    }
    scrollHistory() {
        const divscroll = document.getElementById('history-version');
        const scrollTop = divscroll.scrollTop;//页面上卷的高度
        // const wholeHeight = divscroll.scrollHeight;//页面底部到顶部的距离
        const divHeight = divscroll.clientHeight;//页面可视区域的高度
        if (this.num > 0) {
            if (scrollTop >= divHeight * this.num) {
                this.channelPage.pageCur = this.channelPage.pageCur + 1;
                this.scrollGetHistory();
                this.num += 1;
            }
        } else {
            if (scrollTop + divHeight >= this.fitstList && this.channelPage.pageNum > this.channelPage.pageCur) {
                this.channelPage.pageCur = this.channelPage.pageCur + 1;
                this.scrollGetHistory();
                this.num += 1;
            }
            console.log('');
        }
    }
    //滚动时加载更多频道
    scrollGetHistory() {
        this.addShow = true;
        const param = {
            origin_id: this.params.origin_id,
            per_num: this.channelPage.pageSize,
            page: this.channelPage.pageCur,
        };
        this.newsService.toggled(param)
            .then((data) => {
                this.addShow = false;
                if (data.data.data) {
                    const tempArr = data.data.data;
                    tempArr.forEach((v, idx) => {
                        v.historyList = [];
                        for (let i = 0; i < v.history_list.content.length; i += 1) {
                            const obj = {};
                            obj.content = v.history_list.content[i];
                            obj.isClick = v.history_list.redirect[i];
                            v.historyList.push(obj);
                        }
                        v.historyList.forEach((t) => {
                            if (t.isClick == 1) {
                                t.isActived = false;
                                this.Idx.push(idx);
                            }
                        });
                    });
                    this.dynamicList = this.dynamicList.concat(tempArr);
                    // console.log(this.dynamicList);
                    // window.setTimeout(() => {
                    //     this.secList = $('.left-version-content').height();
                    //     console.log(this.secList, '2');
                    // }, 200);
                }
            });
    }
    // 获取历史详情
    getDetial(nor, outIdx) {
        this.currentIndex = outIdx;
        nor.historyList.forEach((m) => {
            if (m.isClick == 1) {
                m.isActived = true;
            }
        });
        if (outIdx + 1 < this.dynamicList.length) {
            const lastParams = this.dynamicList[outIdx + 1];
            this.compareHistory(nor.content, lastParams.content);
        }
        this.lastTime = nor.time;
    }
    compareHistory(news, lasts) {
        const param = {
            old_content: lasts,
            new_content: news,
        };
        this.historyDetailLoading = true;
        this.newsService.getCompareHistory(param)
        .then((data) => {
            this.historyDetailLoading = false;
            if (data.error_code == 0) {
                document.getElementById('current-content').innerHTML = data.data.content;
                $('#current-content *').removeAttr('style');
                $('#current-content img').parents('p').css({ textAlign: 'center' });
                $('#current-content img').css({ maxWidth: '341px', height: 'auto' });
            }
        });
    }
    cancel() {
        this.$uibModalInstance.dismiss('cancel');
    }
    reset() {
        this.$uibModalInstance.close({ content: this.historyContent, title: this.historyTitle });
    }
}

import { dispatch, getInjector } from 'vendor';

const injector = getInjector();
const FileUploader = injector.get('FileUploader');
const config = injector.get('config');
const http = injector.get('http');

export default class {
    static $inject = ['$scope', '$uibModalInstance', 'params', '$timeout', 'myUtils', 'newsService', '$uibModal'];
    constructor(...$inject) {
        dispatch(this, $inject);
        this.DOC = window.translate.common;
        //判断是上传还是替换
        // if (!this.params.img) {
        //     //上传
        //     this.isReplace = false;
        // } else {
        //     this.isReplace = true;
        // }
        if (this.params.type && this.params.type == '1') {
            this.isReplace = false;
        } else {
            this.isReplace = true;
        }


        this.showList = [];//图片上传展示
        this.chosedList = [[], []]; //选中二维数组

        this.picSuccess = false;
        this.proNumber = 0;
        this.proValue = 0;
        this.uploadedNum = 0;

        this.initCoverUpload();


        //tab3网络图片
        this.searchListAll = [];
        this.searchList = [];
        this.searchOptions = {
            pageCur: 0,
            pageSize: 10,
        };
        if (this.params.title) {
            this.searchWord = this.params.title;
            this.search();
        } else {
            this.searchWord = '';
        }
        this.searchTip = this.DOC.enterSearch;
    }
    //tab1 上传图片start
    initCoverUpload() {
        // let picNumber;

        this.newsImgloader = new FileUploader({
            url: config.getUrl('news_upimg'),
            withCredentials: true,
        });

        this.newsImgloader.onAfterAddingAll = (addedFileItems) => {
            angular.forEach(addedFileItems, (item, index) => {
                if (item.file.size > 20 * 1024 * 1024) {
                    this.newsImgloader.removeFromQueue(index);
                    this.myUtils.newHogeTip({
                        msg: '图片大小需要在20M以内，请重新上传！',
                    });
                }
            });

            this.proNumber = this.newsImgloader.queue.length;
            if (this.proNumber > 1) {
                $('#picUp').modal('show');
            }

            this.img_loading = true;
            this.newsImgloader.uploadAll();
        };
        this.newsImgloader.onCompleteItem = (fileItem, response) => {
            if (response && (response.error_code || response.error_message)) {
                this.myUtils.newHogeTip({
                    msg: response.error_message || config.error_tip,
                }, () => {
                    this.img_loading = false;
                });
                return;
            }
            this.img_loading = false;
            let localitem = {};
            if (response && response.data && response.data.url) {
                response.data.chosed = true;
                this.showList.unshift(response.data);
                this.chosedList[0].unshift(response.data);
                localitem = response.data;

                if (this.proNumber > 1) {
                    //上传进度条
                    this.uploadedNum += 1;
                    this.proValue = window.parseInt((this.uploadedNum / this.proNumber) * 100);
                    if (localitem.origin_name) {
                        this.upName = localitem.origin_name;
                    } else {
                        this.upName = this.DOC.upFail;
                    }
                    if (this.uploadedNum == this.proNumber) {
                        this.proValue = 100;
                        this.$timeout(() => {
                            this.picSuccess = true;
                        }, 300);
                        this.$timeout(() => {
                            $('#picUp').modal('hide');
                            // this.uploadedNum=0;
                            this.proValue = 0;
                            this.proNumber = 0;
                            this.picSuccess = false;
                        }, 1500);
                    }
                }
            }
        };
    }

    uploadChose(item) {
        // type
        if (this.isReplace) {
            this.clearChose();//清空选择
            if (item.chosed) {
                item.chosed = false;
            } else {
                item.chosed = true;
                this.chosedList[0] = [item];
            }
        } else if (item.chosed) { //已经选中了
            let hasChosed = {};
            angular.forEach(this.chosedList[0], (chose, index) => {
                if (item.key == chose.key) {
                    hasChosed = chose;
                    hasChosed.delIndex = index;
                    item.chosed = false;
                    return;
                }
                chose.chosed = true;
            });
            this.chosedList[0].splice(hasChosed.delIndex, 1);
            item.chosed = false;
        } else { //还未选中
            item.chosed = true;
            this.chosedList[0].unshift(item);
        }
    }
    //tab1 上传图片end

    //tab3 网络图片start
    keyPress(event) {
        if (event.keyCode == 13) {
            this.search();
        }
    }
    search() {
        this.searchList = [];
        this.searchListAll = [];
        this.searchOptions.pageCur = 0;
        const param = {
            key: this.searchWord,
        };
        this.newsService.search(param)
            .then((data) => {
                angular.forEach(data, (value) => {
                    this.searchList.push({
                        url: value,
                        chosed: false,
                        isdown: false,
                        ondown: false,
                        proValue: 0,
                    });
                });
                this.searchListAll[0] = this.searchList;
            });
    }
    onPrev() {
        this.searchOptions.pageCur -= 1;
        this.searchList = this.searchListAll[this.searchOptions.pageCur];
    }
    onNext() {
        this.searchOptions.pageCur += 1;
        if (this.searchListAll[this.searchOptions.pageCur]) {
            this.searchList = this.searchListAll[this.searchOptions.pageCur];
        } else {
            this.searchTurn();
        }
    }
    searchTurn() {
        this.searchTip = '正在疯狂搜索图片！';
        this.searchList = [];
        const param = {
            page: this.searchOptions.pageCur,
            per_num: 10,
            key: this.searchWord,
        };
        http(config.getUrl('search_cover'), param)
            .then((data) => {
                if (data.status_code || data.message) {
                    this.myUtils.newHogeTip({
                        msg: data.message || config.error_tip,
                    });
                } else {
                    angular.forEach(data.data, (value) => {
                        this.searchList.push({
                            url: value,
                            chosed: false,
                            isdown: false,
                            ondown: false,
                            proValue: 0,
                        });
                    });
                    this.searchListAll[this.searchOptions.pageCur] = this.searchList;
                }
            })
            .catch(() => {
                this.searchTurn();
            });
    }
    searchDown(item, index) {
        item.ondown = true;
        item.proValue = 20;
        this.$timeout(() => {
            item.proValue = 100;
        }, 2000);
        const indexX = angular.copy(this.searchOptions.pageCur);
        this.newsService.newsUpimg({ url: item.url })
            .then((data) => {
                if (!data.url) {
                    item.proValue = 90;
                    this.myUtils.newHogeTip({
                        msg: this.DOC.downloadFailed,
                    }, () => {
                        this.$timeout(() => {
                            item.proValue = 0;
                        }, 500);
                    });
                    return;
                }
                this.$timeout(() => {
                    // if (this.chosedList[1][0]) {
                    //     angular.forEach(this.chosedList[1], (value) => {
                    //
                    //     });
                    // }

                    data.origin_url = item.url;
                    data.x = indexX;
                    data.y = index;

                    item = data;

                    item.proValue = 100;
                    item.chosed = true;
                    item.isdown = true;
                    item.ondown = false;


                    if (this.isReplace) { //替换
                        this.clearChose();//清空选择
                        this.chosedList[1] = [item];
                    } else {
                        this.chosedList[1].unshift(item);
                    }

                    this.searchList[index] = item;
                    this.searchListAll[indexX][index] = item;
                }, 2000);
            });
    }
    searchChose(item, index) {
        if (this.isReplace) { //替换
            this.clearChose();//清空选择
            if (item.chosed) {
                item.chosed = false;
            } else {
                item.chosed = true;
                this.chosedList[1] = [item];
            }
        } else if (item.chosed) {
            let hasChosed = {};
            angular.forEach(this.chosedList[1], (chose, num) => {
                if (item.key == chose.key) {
                    hasChosed = chose;
                    hasChosed.delIndex = num;
                    item.chosed = false;
                    return;
                }
                chose.chosed = true;
            });
            this.chosedList[1].splice(hasChosed.delIndex, 1);

            item.chosed = false;
            this.searchListAll[item.x][index].chosed = false;
        } else {
            item.chosed = true;
            this.chosedList[1].unshift(item);
        }
    }
    //tab3 网络图片end

    //isReplace=true .清除选中
    clearChose() {
        //tab1
        this.chosedList[0] = [];
        if (this.showList[0]) {
            this.showList[0].chosed = false;
        } else {
            this.showList = [];
        }

        //tab2
        this.chosedList[1] = [];
        if (this.searchListAll[0] && this.searchListAll[0][0]) {
            angular.forEach(this.searchList, (vv) => {
                vv.chosed = false;
            });
            angular.forEach(this.searchListAll, (first) => {
                angular.forEach(first, (second) => {
                    second.chosed = false;
                });
            });
        }
    }

    save() {
        this.save_loading = true;

        if (!this.chosedList[0][0] && !this.chosedList[1][0]) {
            this.save_loading = false;
            this.myUtils.newHogeTip({
                msg: '请选择需要插入的图片！',
            });
            return;
        }

        this.save_loading = false;
        this.$uibModalInstance.close({ chosedList: this.chosedList });
    }
    close() {
        this.$uibModalInstance.dismiss('cancel');
    }

}


import { dispatch } from 'vendor';


export default class {
    static $inject = ['$scope', '$uibModalInstance', 'params', '$timeout', 'myUtils', 'newsService', '$uibModal'];
    constructor(...$inject) {
        dispatch(this, $inject);
        this.DOC = window.translate.common;
        this.originUrl = this.params.img;
        this.originSize = {
            width: this.params.width,
            height: this.params.height,
            naturalWidth: this.params.naturalWidth,
            naturalHeight: this.params.naturalHeight,
            proportion: (this.params.naturalWidth / this.params.width).toFixed(2),
        };

        this.showUrl = this.originUrl;
        this.imgKey = '';
        this.clippingList = [
            {
                name: '还原(1.4:1)',
                value: 1.4 / 1,
                id: 1,
            },
            {
                name: '16:9',
                value: 16 / 9,
                id: 2,
            },
            {
                name: '9:16',
                value: 9 / 16,
                id: 3,
            },
            {
                name: '3:4',
                value: 3 / 4,
                id: 4,
            },
            {
                name: '4:3',
                value: 4 / 3,
                id: 5,
            },
            {
                name: '自定义',
                value: null,
                id: 0,
            },
        ];
        this.flipList = [
            {
                name: '逆时针旋转90度',
                value: 'rotateL',
                id: 11,
            },
            {
                name: '顺时针旋转90度',
                value: 'rotateR',
                id: 12,
            },
            {
                name: '水平镜像翻转',
                value: 'scaleX',
                id: 13,
            },
            {
                name: '竖直镜像翻转',
                value: 'scaleY',
                id: 14,
            },
        ];

        //下拉框值控制
        this.clip = true;

        //历史操作
        this.canLeft = false;
        this.canRight = false;
        this.step = 0;

        // this.historyList = [];

        this.urlList = [this.originUrl];

        //当前操作类型
        this.currentType = 'clip';

        //clip
        this.clipType = '1';
        this.customNum = {
            width: '',
            height: '',
        };
        this.clipOptions = {
            viewMode: 1,
            aspectRatio: '',
            autoCrop: true,
        };

        this.$scope.$watch('vm.customNum', (newValue) => {
            if ((newValue.width <= 0 || newValue.height <= 0) && this.clipType == 0) {
                this.myUtils.newHogeTip({
                    msg: '裁剪比例系数不得小于或等于0！',
                });
            }
            if (newValue.width > 0 && newValue.height > 0 && this.clipType == 0) {
                this.clipOptions.aspectRatio = this.customNum.width / this.customNum.height;
                $('#imageEdit').cropper('destroy').cropper(this.clipOptions);
            }
        }, true);


        this.$scope.$watch('vm.urlList', (newValue) => {
            if (newValue.length == 1) {
                this.canLeft = false;
                // this.canRight = false;
            } else {
                this.canLeft = true;
            }
        }, true);

        this.$scope.$watch('vm.step', () => {
            if (this.step == 0 && this.urlList.length > 1) {
                this.canLeft = false;
                this.canRight = true;
            }
            if (this.step != 0 && this.step == this.urlList.length - 1) {
                this.canRight = false;
                this.canLeft = true;
            }
            if (this.step == 21) {
                this.urlList.splice(1, 1);
                this.step -= 1;
            }
        }, true);
    }
    clipClick(value) {
        if (!value) {
            $('#imageEdit').cropper('crop');
        }
        this.currentType = 'clip';
    }
    flipClick(value) {
        if (!value) {
            $('#imageEdit').cropper('clear');
        }

        this.currentType = 'flip';
    }
    //撤销重做
    goLeft() {
        if (this.step == 1) {
            this.step -= 1;
            this.canLeft = false;
            this.showUrl = this.originUrl;

            this.$timeout(() => {
                $('#imageEdit').cropper('destroy').cropper(this.clipOptions);
            }, 50);
            if (this.currentType == 'flip') {
                this.$timeout(() => {
                    $('#imageEdit').cropper('clear');
                }, 100);
            }
        } else {
            this.step -= 1;
            this.canRight = true;
            this.getOperateData();
        }
    }
    goRight() {
        this.step += 1;
        this.canLeft = true;
        this.getOperateData();
    }
    getOperateData() {
        this.showUrl = this.urlList[this.step];
        this.$timeout(() => {
            $('#imageEdit').cropper('destroy').cropper(this.clipOptions);
        }, 50);
        this.$timeout(() => {
            if (this.currentType == 'flip') {
                $('#imageEdit').cropper('clear');
            }
        }, 100);
    }
    //裁剪
    choseClip(item) {
        this.clipType = item.id;
        if (this.clipType !== 0) {
            this.clipOptions.aspectRatio = item.value;
            $('#imageEdit').cropper('destroy').cropper(this.clipOptions);
        } else if (this.customNum.width > 0 && this.customNum.height > 0) {
            this.clipOptions.aspectRatio = this.customNum.width / this.customNum.height;
            $('#imageEdit').cropper('destroy').cropper(this.clipOptions);
        } else {
            this.myUtils.newHogeTip({
                msg: '请输入正确的裁剪比例！',
            });
        }
        this.currentType = 'clip';
    }
    applicationDate(type) {
        const param = $('#imageEdit').cropper('getCroppedCanvas');

        // $('#imageEdit').cropper('setData',data);
        // $('#imageEdit').cropper('setCroppedCanvas',data);

        this.newsService.newsUpimg({ url: param.toDataURL() })
            .then((data) => {
                if (!data.url) {
                    this.myUtils.newHogeTip({
                        msg: '操作失败！',
                    });
                    return;
                }
                this.showUrl = data.url;
                this.imgKey = data.file_name;
                if (this.step != this.urlList.length - 1) {
                    this.urlList.splice(this.step + 1, this.urlList.length - this.step);
                }
                this.urlList.push(data.url);
                this.step = this.urlList.length - 1;

                if (type == 'clip') {
                    this.$timeout(() => {
                        $('#imageEdit').cropper('destroy').cropper(this.clipOptions);
                    }, 200);
                } else {
                    this.$timeout(() => {
                        $('#imageEdit').cropper('clear');
                    }, 200);
                }
                this.myUtils.newHogeTip({
                    msg: '操作成功',
                    type: 'success',
                });
            });
    }
    //旋转
    choseFlip(item) {
        switch (item.value) {
        case 'rotateL':
            $('#imageEdit').cropper('rotate', -90);
            break;
        case 'rotateR':
            $('#imageEdit').cropper('rotate', 90);
            break;
        case 'scaleX':
            $('#imageEdit').cropper('scaleX', -1);
            break;
        case 'scaleY':
            $('#imageEdit').cropper('scaleY', -1);
            break;
        default:
            break;
        }
        this.currentType = 'flip';
        this.applicationDate('flip');
    }

    save() {
        this.save_loading = true;
        const editImg = document.createElement('img');
        // editImg.id = 'lastImg';
        // editImg.style = 'position:absolute;left:0; top:0; z-index:-10; opacity:0;';
        // $('#whereTo')[0].appendChild(editImg);
        editImg.setAttribute('src', this.showUrl);

        this.save_loading = false;
        this.$uibModalInstance.close(
            {
                data: this.showUrl,
                width: editImg.naturalWidth,
                height: editImg.naturalHeight,
                proportion: window.parseFloat(this.originSize.proportion),
                imgKey: this.imgKey,
            },
        );
    }
    close() {
        this.$uibModalInstance.dismiss('cancel');
    }


}


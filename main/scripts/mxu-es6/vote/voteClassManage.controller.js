import { dispatch } from 'vendor';

 //const injector = getInjector();
// const $stateParams = injector.get('$stateParams');

export default class {
    //$scope,$state,http,config,$timeout,myUtils,FileUploader,$uibModal
    static $inject = ['$scope', '$state', '$q', 'http', 'config', '$timeout', 'myUtils', '$uibModal', '$filter', 'permission', 'voteService'];
    constructor(...$inject) {
        dispatch(this, $inject);
        // this.typeList = ['全部分类', '吉林融媒', '长春市', '延边市', '湖南省', '江苏卫视', '中央电视台'];
        this.typeList = [];
        this.level1List = [];
        this.level2List = [];
        this.level3List = [];
        this.level4List = [];
        this.currentLevel1 = -1;
        this.currentLevel2 = -1;
        this.currentLevel3 = -1;
        this.currentLevel4 = -1;
        this.level1SelectedItem = '';
        this.level2SelectedItem = '';
        this.level3SelectedItem = '';
        this.currentFatherId = 0;
        this.shortBox = false;
        this.currentLevel = '';
        this.showMask = false;
        this.classSortableOpt = {
            opacity: 0.7,
            cursor: 'move',
            disabled: true,
        };
        this.getList();
    }
    getList() {
        const param = {
            fid: 0,
        };
        this.voteService.getClassList(param)
        .then((data) => {
            data.forEach((v) => {
                if (v.id == v.childs) {
                    v.childs = '';
                }
            });
            this.level1List = data;
        });
    }
    findNextLevel(item, index) {
        this.level2List = [];
        this.level3List = [];
        this.level4List = [];
        this.currentLevel1 = index;
        this.level1SelectedItem = item;
        const param = {
            fid: item.id,
        };
        this.voteService.getClassList(param)
        .then((data) => {
            data.forEach((v) => {
                if (v.id == v.childs) {
                    v.childs = '';
                }
            });
            this.level2List = data;
        });
    }
    findNextLevel2(item, index) {
        this.level3List = [];
        this.level4List = [];
        this.currentLevel2 = index;
        this.level2SelectedItem = item;
        const param = {
            fid: item.id,
        };
        this.voteService.getClassList(param)
        .then((data) => {
            data.forEach((v) => {
                if (v.id == v.childs) {
                    v.childs = '';
                }
            });
            this.level3List = data;
        });
    }
    findNextLevel3(item, index) {
        this.level4List = [];
        this.currentLevel3 = index;
        this.level3SelectedItem = item;
        const param = {
            fid: item.id,
        };
        this.voteService.getClassList(param)
        .then((data) => {
            data.forEach((v) => {
                if (v.id == v.childs) {
                    v.childs = '';
                }
            });
            this.level4List = data;
        });
    }

    addClassify(levelIndex) {
        if (levelIndex == 'level2' && this.level1SelectedItem == '') {
            this.myUtils.newHogeTip({
                msg: '请选择父级栏目',
            });
            return;
        }
        if (levelIndex == 'level3' && this.level2SelectedItem == '') {
            this.myUtils.newHogeTip({
                msg: '请选择父级栏目',
            });
            return;
        }
        if (levelIndex == 'level4' && this.level3SelectedItem == '') {
            this.myUtils.newHogeTip({
                msg: '请选择父级栏目',
            });
            return;
        }
        if (levelIndex == 'level2') {
            this.currentFatherId = this.level1SelectedItem.id;
        } else if (levelIndex == 'level3') {
            this.currentFatherId = this.level2SelectedItem.id;
        } else if (levelIndex == 'level4') {
            this.currentFatherId = this.level3SelectedItem.id;
        }

        const modalInstance = this.$uibModal.open({
            backdrop: 'static',
            templateUrl: '../views/mxu/rhhManage/creat-modal.html',
            controller: 'creatModalCtrl',
            controllerAs: 'vm',
            windowClass: 'creat-modal',
            resolve: {
                param: {
                    levelIndex,
                    currentFatherId: this.currentFatherId,
                },
            },
        });
        modalInstance.result.then(() => {
            this.getList();
            if (levelIndex == 'level1') {
                this.getList();
            }
            if (levelIndex == 'level2') {
                const param = {
                    fid: this.level1SelectedItem.id,
                };
                this.voteService.getClassList(param)
                .then((data) => {
                    data.forEach((v) => {
                        if (v.id == v.childs) {
                            v.childs = '';
                        }
                    });
                    this.level2List = data;
                });
            }
            if (levelIndex == 'level3') {
                const param = {
                    fid: this.level2SelectedItem.id,
                };
                this.voteService.getClassList(param)
                .then((data) => {
                    data.forEach((v) => {
                        if (v.id == v.childs) {
                            v.childs = '';
                        }
                    });
                    this.level3List = data;
                });
            }
            if (levelIndex == 'level4') {
                const param = {
                    fid: this.level3SelectedItem.id,
                };
                this.voteService.getClassList(param)
                .then((data) => {
                    data.forEach((v) => {
                        if (v.id == v.childs) {
                            v.childs = '';
                        }
                    });
                    this.level4List = data;
                });
            }
        });
    }
    editClassify(item) {
        const modalInstance = this.$uibModal.open({
            backdrop: 'static',
            templateUrl: '../views/mxu/rhhManage/creat-modal.html',
            controller: 'creatModalCtrl',
            controllerAs: 'vm',
            windowClass: 'creat-modal',
            resolve: {
                param() {
                    return item;
                },
            },
        });
        modalInstance.result.then(() => {});
        // modalInstance.result.then((result) => {
        //     console.log(result);
        // });
    }
    deleteClass(item, currentLevelIndex) {
        this.myUtils.confirm({
            // msg: `您确定删除该${item.name}?`,
            msg: '您确定删除该分类?',
        }, () => {
            const param = { id: item.id };
            this.voteService.deleteClass(param)
            .then((data) => {
                if (data == 'success') {
                    if (currentLevelIndex == 'level1') {
                        this.level1List.splice(this.level1List.indexOf(item), 1);
                    }
                    if (currentLevelIndex == 'level2') {
                        this.level2List.splice(this.level2List.indexOf(item), 1);
                    }
                    if (currentLevelIndex == 'level3') {
                        this.level3List.splice(this.level3List.indexOf(item), 1);
                    }
                    if (currentLevelIndex == 'level4') {
                        this.level4List.splice(this.level4List.indexOf(item), 1);
                    }
                    this.myUtils.newHogeTip({
                        type: 'success',
                        msg: '删除成功!',
                    });
                }
            });
        });
    }
    // showSortBox() {
    //     this.shortBox = !this.shortBox;
    //     this.tempConList = angular.copy(this.typeList);
    //     this.columnSortableOpt.disabled = false;
    // }
    showLevelSortBox(levelIndex) {
        this.currentLevel = levelIndex;
        this.showMask = true;
        this.classSortableOpt.disabled = false;
        if (levelIndex == 'level1') {
            this.tempConList = angular.copy(this.level1List);
        }
        if (levelIndex == 'level2') {
            this.tempConList = angular.copy(this.level2List);
        }
        if (levelIndex == 'level3') {
            this.tempConList = angular.copy(this.level3List);
        }
        if (levelIndex == 'level4') {
            this.tempConList = angular.copy(this.level4List);
        }
    }
    sortSave() {
        this.classSortableOpt.disabled = true;
        this.shortBox = !this.shortBox;
        const idsArr = [];//排序之前的列表
        const orderArr = [];//排序之后的列表
        if (this.currentLevel == 'level1') {
            this.level1List.forEach((v) => {
                idsArr.push(v.id);
            });
            this.tempConList.forEach((v) => {
                orderArr.push(v.order_id);
            });
        }
        if (this.currentLevel == 'level2') {
            this.level2List.forEach((v) => {
                idsArr.push(v.id);
            });
            this.tempConList.forEach((v) => {
                orderArr.push(v.order_id);
            });
        }
        if (this.currentLevel == 'level3') {
            this.level3List.forEach((v) => {
                idsArr.push(v.id);
            });
            this.tempConList.forEach((v) => {
                orderArr.push(v.order_id);
            });
        }
        if (this.currentLevel == 'level4') {
            this.level4List.forEach((v) => {
                idsArr.push(v.id);
            });
            this.tempConList.forEach((v) => {
                orderArr.push(v.order_id);
            });
        }
        const param = {
            id: idsArr.toString(),
            order_id: orderArr.toString(),
        };
        this.voteService.sortClass(param);
        this.showMask = false;
    }
    sortCancel() {
        this.showMask = false;
        this.classSortableOpt.disabled = true;
        if (this.currentLevel == 'level1') {
            this.level1List = this.tempConList;
        }
        if (this.currentLevel == 'level2') {
            this.level2List = this.tempConList;
        }
        if (this.currentLevel == 'level3') {
            this.level3List = this.tempConList;
        }
        if (this.currentLevel == 'level4') {
            this.level4List = this.tempConList;
        }
        // this.subList = this.tempConList;
    }
}

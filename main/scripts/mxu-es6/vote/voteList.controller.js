import { dispatch, getInjector } from 'vendor';

const injector = getInjector();
const $stateParams = injector.get('$stateParams');

export default class {
    //$scope,$state,http,config,$timeout,myUtils,FileUploader,$uibModal
    static $inject = ['$scope', '$state', '$q', 'http', 'config', '$timeout', 'myUtils', '$uibModal', '$filter', 'permission', 'voteService'];
    constructor(...$inject) {
        dispatch(this, $inject);
        this.classList = [];
        this.level2List = [];
        this.level3List = [];
        this.level4List = [];
        this.currentClassName = '';
        this.currentLevel2Name = '';
        this.currentLevel3Name = '';
        this.currentLevel4Name = '';

        this.currentLevelIndex = 'level1';
        this.currentFatherItem = '';
        this.timeArr = [
            { name: window.translate.content.allTime, key: null },
            { name: window.translate.content.pastSeven, key: 1 },
            { name: window.translate.content.pastThirty, key: 2 },
            { name: window.translate.content.pastNinety, key: 3 },
            { name: window.translate.content.customize, key: 0 },
        ];
        this.voteList = [];
        this.status = '全部状态';
        this.time = '全部时间';
        this.stateList = [
            { name: '全部状态', key: null },
            { name: '进行中', key: 1 },
            { name: '已过期', key: 2 },
        ];//状态的list
        this.startTime = '';
        this.endTime = '';
        this.operaShow = false;
        this.currentIndex = -1;
        this.checkList = [];
        //批量删除的id
        this.deleteIds = [];

        this.rangeDate = {
            startDate: $stateParams.start_time ? moment($stateParams.start_time) : moment.unix(1490976000),
            endDate: $stateParams.end_time ? moment($stateParams.end_time) : moment() };
        this.options = {
            minDate: moment().subtract(90, 'days'),
            maxDate: moment(),
            opens: 'right',
            locale: {
                applyClass: 'btn-green',
                applyLabel: window.translate.content.confirm,
                fromLabel: 'From',
                format: 'YYYY-MM-DD',
                toLabel: 'To',
                cancelLabel: window.translate.content.cancel,
            },
            eventHandlers: {
                'apply.daterangepicker': () => {
                    this.$state.go('app.vote', {
                        date_search: null,
                        start_time: this.rangeDate.startDate.format('YYYY-MM-DD'),
                        end_time: this.rangeDate.endDate.format('YYYY-MM-DD'),
                    });
                    this.startTime = this.rangeDate.startDate.format('YYYY-MM-DD');
                    this.endTime = this.rangeDate.endDate.format('YYYY-MM-DD');
                    this.time = `${this.startTime}-${this.endTime}`;
                    this.paramObj.start_time = this.rangeDate.startDate.format('YYYY-MM-DD');
                    this.paramObj.end_time = this.rangeDate.endDate.format('YYYY-MM-DD');
                    this.paramObj.date_search = 0;
                    this.getVoteList(this.paramObj);
                },
                'showCalendar.daterangepicker': () => {
                    this.open = true;
                },
                'hide.daterangepicker': () => {
                    this.open = false;
                },
            },
        };
        this.pageOptions = {
            pageCur: $stateParams.page === undefined ? 1 : $stateParams.page, //当前第几页
            pageSize: $stateParams.per_num === undefined ? 10 : $stateParams.per_num, //每页多少条
            pageNum: 1, //共多少页
            total: 0, //总共多少条
        };
        $('body').keydown(() => {
            if (event.keyCode == '13') {
                this.search(document.getElementById('keyword').value);
            }
        });
        this.paramObj = {
            category_id: '',
        };
        this.classParam = {
            fid: 0,
        };
        this.getListArr(this.classParam);
        this.getVoteList(this.paramObj);
    }
    getVoteList(paramObj) {
        this.vote_loading = true;
        paramObj.page = this.pageOptions.pageCur;//当前为第几页
        paramObj.per_num = this.pageOptions.pageSize;//一页多少条
        this.voteService.getList(paramObj).then((data) => {
            this.voteList = data.data;
            this.vote_loading = false;
            this.voteList.forEach((v) => {
                if (v.closing_date) {
                    v.closing_date = new Date(v.closing_date) > new Date() ? v.closing_date : '已过期';
                } else {
                    v.closing_date = '永久有效';
                }
            });

            this.pageOptions.total = parseInt(data.total, 10);//总共多少条
            this.pageOptions.pageNum = Math.ceil(this.pageOptions.total / this.pageOptions.pageSize);
        });
    }

    goCreat() {
        this.$state.go('app.editVote', {
            id: 0,
        });
    }
     /* 侧边栏------start------*/
    getListArr(classParam) {
        this.voteService.getClassList(classParam)
        .then((data) => {
            data.forEach((v) => {
                if (v.id == v.childs) {
                    v.childs = '';
                }
            });
            this.classList = data;
        });
    }
    choseClass(currentClass) {
        this.currentClassName = currentClass.name;
    }
    choseClass2(currentClass) {
        this.currentLevel2Name = currentClass.name;
    }
    choseClass3(currentClass) {
        this.currentLevel3Name = currentClass.name;
    }
    choseClass4(currentClass) {
        this.currentLevel4Name = currentClass.name;
    }
    // currentLevel2Name
    nextLevel1(item) {
        this.currentFatherItem = item;
        this.currentLevelIndex = 'level2';
        this.currentLevel2Name = '';
        $('#levelBox1').animate({ marginLeft: '-142px' }, 200);
        const param = {
            fid: this.currentFatherItem.id,
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
    nextLevel2(item) {
        this.currentFatherItem = item;
        this.currentLevelIndex = 'level3';
        this.currentLevel3Name = '';
        $('#levelBox1').animate({ marginLeft: '-284px' }, 200);
        const param = {
            fid: this.currentFatherItem.id,
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
    nextLevel3(item) {
        this.currentFatherItem = item;
        this.currentLevelIndex = 'level4';
        this.currentLevel4Name = '';
        $('#levelBox1').animate({ marginLeft: '-426px' }, 200);
        const param = {
            fid: this.currentFatherItem.id,
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
    allState() {
        if (this.currentLevelIndex == 'level1') {
            this.classParam.fid = 0;
            this.getListArr(this.classParam);
            this.currentClassName = '';
            this.level2List = [];
            this.level3List = [];
            this.level4List = [];
            this.paramObj = {
                category_id: '',
            };
            this.getVoteList(this.paramObj);
        } else if (this.currentLevelIndex == 'level2') {
            this.paramObj = {
                category_id: this.currentFatherItem.id,
            };
            this.getVoteList(this.paramObj);
            $('#levelBox1').animate({ marginLeft: '0px' }, 200);
            this.currentLevelIndex = 'level1';
            this.level2List = [];
            this.level3List = [];
            this.level4List = [];
        } else if (this.currentLevelIndex == 'level3') {
            this.paramObj = {
                category_id: this.currentFatherItem.id,
            };
            this.getVoteList(this.paramObj);
            $('#levelBox1').animate({ marginLeft: '-142px' }, 200);
            this.currentLevelIndex = 'level2';
            this.level3List = [];
            this.level4List = [];
        } else if (this.currentLevelIndex == 'level4') {
            this.paramObj = {
                category_id: this.currentFatherItem.id,
            };
            this.getVoteList(this.paramObj);
            $('#levelBox1').animate({ marginLeft: '-284px' }, 200);
            this.currentLevelIndex = 'level3';
            this.level4List = [];
        }
    }
    searchClassList(searchItem) {
        this.paramObj.category_id = searchItem.id;
        this.paramObj.page = this.pageOptions.pageCur;//当前为第几页
        this.paramObj.per_num = this.pageOptions.pageSize;//一页多少条
        this.getVoteList(this.paramObj);
    }
    /* 侧边栏------end*/

    chooseStatus(currentState) {
        this.status = currentState.name;
        this.paramObj.status = currentState.key;
        this.getVoteList(this.paramObj);
    }
    chooseTime(currentTime) {
        this.time = currentTime.name;
        this.paramObj.date_search = currentTime.key;
        if (currentTime.key == 0) {
            console.log('自定义时间');
        } else {
            this.paramObj.start_time = null;
            this.paramObj.end_time = null;
            this.getVoteList(this.paramObj);
        }
    }
    search(key) {
        this.paramObj.title = key;
        this.getVoteList(this.paramObj);
    }
    toggleStatus(item) {
        item.is_use = item.is_use ? 0 : 1;
        const param = {
            id: item.id,
            is_use: item.is_use,
        };
        this.voteService.upDateVote(param).then((data) => {
            console.log(data);
        });
    }
    showOpera(item, index) {
        this.operaShow = true;
        this.currentIndex = index;
    }
    hideOpera(item, index) {
        this.operaShow = false;
        this.currentIndex = index;
    }
    // 详情
    goDetail(item) {
        this.$state.go('app.detailVote', {
            id: item.id,
        });
    }
    // 编辑
    goEdit(item) {
        this.$state.go('app.editVote', {
            id: item.id,
        });
    }
    // 预览
    goPreview(item) {
        const param = {
            id: item.id,
        };
        this.voteService.getVoteDetail(param).then((data) => {
            if (data.mode == 0) {
                this.is_senior = false;
            } else {
                this.is_senior = true;
            }
            const voteData = {
                title: data.title,
                option: data.options,
                is_senior: this.is_senior,
                is_open_group: item.is_open_option_category,
                creat_time: data.creat_time,
                voteId: item.id,
            };
            const showPreviews = this.$uibModal.open({
                templateUrl: '../views/mxu/vote/preview/votePreview_modal.html',
                controller: 'previewVoteModalCtrl',
                windowClass: 'showPreviews',
                backdrop: 'static',
                controllerAs: 'vm',
                resolve: { param: voteData },
            });
            showPreviews.result.then(() => {
                this.isPreview = true;
            });
        });
    }
    // 删除
    goDel(item) {
        this.myUtils.confirm({
            msg: '确认删除?',
        }, () => {
            this.voteList.splice(this.voteList.indexOf(item), 1);
            const param = {
                id: item.id,
            };
            this.voteService.deleVote(param).then((data) => {
                if (data == 'success') {
                    this.myUtils.newHogeTip({
                        msg: '删除成功',
                        type: 'success',
                    });
                }
            });
        });
    }
    changePage() {
        this.$state.go('app.vote', { page: this.pageOptions.pageCur, per_num: this.pageOptions.pageSize });
    }
    itemCheck(item) {
        return this.checkList.includes(item);
    }
    allChecked() {
        return this.checkList.length === this.voteList.length;
    }
    toggle(item) {
        if (this.checkList.includes(item)) {
            this.checkList.splice(this.checkList.indexOf(item), 1);
        } else {
            this.checkList.push(item);
        }
    }
    toggleAll() {
        if (this.checkList.length == this.voteList.length) {
            this.checkList = [];
        } else {
            this.checkList = Object.assign(this.checkList, this.voteList);
        }
    }
    // 批量删除
    allDelete() {
        this.myUtils.confirm({
            msg: '确认删除?',
        }, () => {
            this.deleteIds = [];
            this.checkList.forEach((v) => {
                this.deleteIds.push(v.id);
            });
            const param = {
                id: this.deleteIds.join(','),
            };
            this.voteService.deleVote(param).then((data) => {
                if (data == 'success') {
                    this.getVoteList(this.paramObj);
                    this.myUtils.newHogeTip({
                        msg: '删除成功',
                        type: 'success',
                    });
                }
            });
        });
    }


}

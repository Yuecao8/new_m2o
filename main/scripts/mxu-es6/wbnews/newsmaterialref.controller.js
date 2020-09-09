import { dispatch } from 'vendor';


export default class {
    static $inject = ['$scope', '$uibModalInstance', 'params', '$timeout', 'myUtils', 'newsService', '$uibModal'];

    constructor(...$inject) {
        dispatch(this, $inject);
        this.loading = true;
        this.newsMaterialPre = false;
        this.pageOptions = {
            showTotal: true,
            showCounts: false,
            showPages: true,
            pageCur: 1,
            // pageCount: [{ page: 10 }, { page: 20 }, { page: 30 }, { page: 50 }],
            pageSize: 10,
            pageNum: 1,
            total: 0,
            showJump: false, // 跳转
        };
        // 判断mxu
        this.systemSet = false;
        if (window.sessionStorage.getItem('edition') == 'mxu') {
            this.systemSet = true;
        }
        this.title = '';

        this.navList = [];
        this.materialList = [];
        this.stateType = 'video';
        this.typeList = new Map([['gallery', '图集'], ['video', '视频'], ['audio', '音频']]);
        // this.typeTitle = this.typeList.get(this.stateType);

        this.myueditor = this.params.editor;
        this.chosed = [];

        this.getClassify(this.stateType);
    }
    typeChange(type) {
        this.stateType = type;
        this.title = '';
        this.getClassify(this.stateType);
    }
    /** 分类 **/
    getClassify(Type) {
        this.navList = [];
        this.newsService.getClassify({ type: Type })
            .then((data) => {
                this.child = data;
                angular.forEach(this.child, (v) => {
                    v.level = 2;
                });
                const all = {
                    id: -1,
                    name: '全部素材',
                    childData: this.child,
                    is_last: 0,
                    level: 1,
                    active: true,
                    child_open: true,
                };
                this.storage = all;
                this.navList.push(all);
                this.getList();
            });
    }
    getChilds(item) {
        if (item.id == '-1') {
            return;
        }
        this.newsService.getClassify({ type: this.stateType, fid: item.id })
            .then((data) => {
                item.childData = [];
                [item.childData.fid, item.childData.level] = [item.id, item.level + 1];
                angular.forEach(data, (v) => {
                    v.level = item.childData.level;
                    item.childData.push(v);
                });
            });
    }
    selectClass(item) {
        this.pageOptions.pageCur = 1;
        angular.forEach(this.navList, (value) => {
            value.active = false;
        });
        item.active = true;
        if (this.storage) {
            this.storage.active = false;
        }
        this.storage = item;
        this.getList();
    }

    // 刷新视图
    getList() {
        this.loading = true;
        const param = {
            status: 2,
            page: this.pageOptions.pageCur,
            per_num: this.pageOptions.pageSize,
            title: this.title, // 标题搜索
            category_id: this.storage.id == -1 ? null : this.storage.id,
        };
        this.materialList = [];

        this.newsService.getList(param, this.stateType)
            .then((data) => {
                this.loading = false;
                if (data.total) {
                    data.data.forEach((material) => {
                        material.is_chosed = false;
                        if (this.chosed[0] && material.id == this.chosed[0].id) {
                            material.is_chosed = true;
                        }
                        if ((this.stateType != 'gallery' && material.transcode_status == 2) || this.stateType == 'gallery') {
                            this.materialList.push(material);
                        }
                    });

                    this.pageOptions.total = window.parseInt(data.total);
                    this.pageOptions.pageNum = Math.ceil(this.pageOptions.total / this.pageOptions.pageSize);
                } else {
                    this.materialList = [];
                }
            });
    }
    // 搜索
    search() {
        this.pageOptions.pageCur = 1;
        this.getList();
    }
    keyPress(event) {
        if (event.keyCode == 13) {
            event.target.blur();
            // this.title = event.target.value;
            this.search();
        }
    }
    choseItem(item) {
        this.materialList.forEach((material) => {
            material.is_chosed = false;
        });
        item.is_chosed = true;
        this.chosed = [item];
    }
    cancelChose(item) {
        item.is_chosed = false;
        this.chosed = [];
    }
    save() {
        this.save_loading = true;
        this.newsService.materialSave({ type: this.stateType, id: this.chosed[0].id })
            .then((data) => {
                this.save_loading = false;
                this.$uibModalInstance.close(data);
            });
    }
    close() {
        this.$uibModalInstance.dismiss('cancel');
    }
    /*****预览*****/
    newsMaterialPreview(item) {
        this.preTitle = item.title;
        this.newsMaterialPre = true;
        this.atlasLoading = true;
        //获取图集预览列表
        if (this.stateType == 'gallery') {
            this.getAtlas(item.id, item.photo_count);
            this.atlasLoading = false;
        } else {
            if (item.transcode_status != 2) {
                this.myUtils.newHogeTip({
                    msg: '正在转码或转码失败',
                });
                return;
            }
            if (this.stateType == 'video') {
                this.getVideoDetail(item);
            } else {
                this.audioLoading = true;
                this.getAudioDetail(item);
            }

            this.atlasLoading = false;
        }
    }
    getAtlas(id, count) {
        this.newsService.getAtlas(id, count)
            .then((data) => {
                if (data.data && data.error_code == 0) {
                    this.atlas = data.data;
                    this.activeIndex = 1;
                    //初始化swiper
                    setTimeout(() => {
                        const that = this;
                        // eslint-disable-next-line
                        this.galleryTop = new window.Swiper('.gallery-top', {
                            prevButton: '.turn-right',
                            nextButton: '.turn-left',
                            onSlidePrevEnd() {
                                that.activeIndex = that.galleryTop.activeIndex + 1;
                                const activeNum = document.getElementById('active-index');
                                activeNum.innerHTML = that.activeIndex;
                                const galleryBref = document.getElementById('gallery-bref');
                                galleryBref.innerHTML = that.atlas[that.activeIndex - 1].photo_name;
                            },
                            onSlideNextEnd() {
                                that.activeIndex = that.galleryTop.activeIndex + 1;
                                const activeNum = document.getElementById('active-index');
                                activeNum.innerHTML = that.activeIndex;
                                const galleryBref = document.getElementById('gallery-bref');
                                galleryBref.innerHTML = that.atlas[that.activeIndex - 1].photo_name;
                            },
                        });
                        // eslint-disable-next-line
                        this.galleryThumbs=new window.Swiper('.gallery-thumbs', {
                            spaceBetween: 12,
                            centeredSlides: true,
                            slidesPerView: 'auto',
                            touchRatio: 0.2,
                            slideToClickedSlide: true,
                        });
                        this.galleryTop.params.control = this.galleryThumbs;
                        this.galleryThumbs.params.control = this.galleryTop;
                    });
                } else {
                    this.newsMaterialPre = false;
                }
            });
    }
    getVideoDetail(item) {
        this.newsService.getVideoDetail(item.id)
            .then((data) => {
                this.videoDetail = data;
                this.video = data.url;
                this.video_img = data.index_pic;
            });
    }
    getAudioDetail(item) {
        this.newsService.getAudioDetail(item.id)
            .then((data) => {
                this.audioDetail = data;
                this.audio = data.url;
                this.audio_img = data.index_pic;
                this.initAudio();
                this.audioLoading = false;
            });
    }
    initAudio() {
        this.audioTag = document.getElementById('audioTag');
        this.audioInit();
    }

    audioInit() {
        this.audioTag.volume = 0.3;
        this.audioTag.load();
        $('#audioTag').on('canplay', () => {
            this.orginDurtion = $('#audioTag').get(0).duration;
            this.duration = this.transTime($('#audioTag').get(0).duration);
            // document.getElementById('current-time').innerHTML = ('00:00');
            document.getElementById('durtion-time').innerHTML = (this.duration);
            this.audioTag.ontimeupdate = () => { this.changeAudioTime(); };
            //点击进度条
            $('#progress').click((e) => {
                event.stopPropagation();
                const rate = (e.offsetX / 220);
                this.progressWidth = rate * 100;
                $('#progress-bar').width(`${this.progressWidth}%`);
                this.audioTag.currentTime = this.orginDurtion * rate;
            });
            //监听结束
            $('#audioTag').on('ended', () => {
                this.audioTag.currentTime = 0;
                $('.btn-audio').addClass('typeface-menu_bofang');
                $('.btn-audio').removeClass('fa-pause');
            });
        });
        $('.control-icon').click(() => {
            event.stopPropagation();//防止冒泡
            if (this.audioTag.paused) { //如果当前是暂停状态
                $('.btn-audio').addClass('fa-pause');
                $('.btn-audio').removeClass('typeface-menu_bofang');
                this.audioTag.play(); //播放
            } else { //当前是播放状态
                $('.btn-audio').addClass('typeface-menu_bofang');
                $('.btn-audio').removeClass('fa-pause');
                this.audioTag.pause(); //暂停
            }
        });
    }

    changeAudioTime() {
        document.getElementById('current-time').innerHTML = this.transTime(this.audioTag.currentTime);
        this.progressWidth = (this.audioTag.currentTime / this.orginDurtion) * 100;
        $('#progress-bar').width(`${this.progressWidth}%`);
    }
    transTime(time) {
        const duration = parseInt(time, 10);
        let minute = parseInt(duration / 60, 10);
        let sec = `${duration % 60}`;
        const isM0 = ':';
        if (minute == 0) {
            minute = '00';
        } else if (minute < 10) {
            minute = `0${minute}`;
        }
        if (sec.length == 1) {
            sec = `0${sec}`;
        }
        return minute + isM0 + sec;
    }

    preClose() {
        if (this.stateType == 'audio') {
            this.audioTag.ontimeupdate = () => {};
            $('#audioTag').off('ended');
            $('#audioTag').off('emptied');
            $('#audioTag').off('timeupdate');
            this.newsMaterialPre = false;
            this.orginDurtion = '';
            this.duration = '';
        } else if (this.stateType == 'gallery') {
            this.atlas = [];
        } else {
            this.video = '';
            this.videoImg = '';
        }
        this.newsMaterialPre = false;
    }

}


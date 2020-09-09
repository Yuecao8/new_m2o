import { dispatch } from 'vendor';


export default class {
    static $inject = ['$scope', '$uibModalInstance', 'params', '$timeout', 'myUtils', 'newsService', '$uibModal'];

    constructor(...$inject) {
        dispatch(this, $inject);
        const item = this.params.param;
        this.newsMaterialPreview(item);
    }
    /** 分类 **/
    close() {
        this.$uibModalInstance.dismiss('cancel');
    }
    /*****预览*****/
    newsMaterialPreview(item) {
        this.preTitle = item.title;
        this.newsMaterialPre = true;
        this.atlasLoading = true;
        this.type = item.type;
        //获取图集预览列表
        if (item.type == 'image') {
            this.preImg(item);
        } else if (item.type == 'gallery') {
            this.getAtlas(item.extend_id, 100);
            this.atlasLoading = false;
        } else {
            if (this.type == 'video') {
                this.getVideoDetail(item);
            } else {
                this.audioLoading = true;
                this.getAudioDetail(item);
            }

            this.atlasLoading = false;
        }
    }
    preImg(item) {
        this.activeIndex = 1;
        //初始化swiper
        item.phone_name = item.title;
        item.photo_url = item.image_url;
        this.atlas = [item];
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
                    this.$uibModalInstance.dismiss('cancel');
                }
            });
    }
    getVideoDetail(item) {
        this.newsService.getVideoDetail(item.extend_id)
            .then((data) => {
                if (data.transcode_status != 2) {
                    this.myUtils.newHogeTip({
                        msg: '正在转码或转码失败',
                    });
                    this.$uibModalInstance.dismiss('cancel');
                    return;
                }
                this.videoDetail = data;
                this.video = data.url;
                this.video_img = data.index_pic;
            });
    }
    getAudioDetail(item) {
        this.newsService.getAudioDetail(item.extend_id)
            .then((data) => {
                if (data.transcode_status != 2) {
                    this.myUtils.newHogeTip({
                        msg: '正在转码或转码失败',
                    });
                    this.$uibModalInstance.dismiss('cancel');
                    return;
                }
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
        if (this.type == 'audio') {
            this.audioTag.ontimeupdate = () => {};
            $('#audioTag').off('ended');
            $('#audioTag').off('emptied');
            $('#audioTag').off('timeupdate');
            this.newsMaterialPre = false;
            this.orginDurtion = '';
            this.duration = '';
        } else if (this.type == 'gallery') {
            this.atlas = [];
        } else {
            this.video = '';
            this.videoImg = '';
        }
        this.newsMaterialPre = false;
        this.$uibModalInstance.dismiss('cancel');
    }

}


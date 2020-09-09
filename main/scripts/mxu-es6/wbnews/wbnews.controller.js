import { dispatch, getInjector } from 'vendor';

let configContent;
if (window.CONFIG.custom_sign) {
    $.getJSON(`../../../../../libs/${window.CONFIG.custom_sign}.json?_v=${window.Hg_Version}`, (data) => {
        configContent = data;
    });
}
const injector = getInjector();
const FileUploader = injector.get('FileUploader');
const $stateParams = injector.get('$stateParams');
const config = injector.get('config');
const http = injector.get('http');

export default class {
    static $inject = ['$scope', '$state', 'config', '$location', '$timeout', 'myUtils', 'newsService', '$rootScope', '$q', 'common', 'permission', '$uibModal', '$interval', 'picEdit', '$sce'];
    constructor(...$inject) {
        dispatch(this, $inject);
        // 遵义配置--稿件保存 不跳转
        if (configContent && configContent.zy_special_save) {
            this.noJump = configContent.zy_special_save ? 1 : 0;
        }
        // 判断是否是资阳
        if (sessionStorage.getItem('systemSet') && angular.fromJson(sessionStorage.getItem('systemSet')).auto_submit_audit) {
            this.showZY = true;
        } else {
            this.getSystem();
        }
        // 吉林融媒屏蔽词敏感词提示
        if (configContent && configContent.sensitive_prompt) {
            this.sensitive_prompt = true;
        }
        // 获取默认审核流程
        this.getDefaultProcess();
        this.isOneClick = true;
        // 保存当前token （跳转用）
        this.access_token = this.$location.search().access_token;
        //资源类型判断
        this.videoAccept = [
            '.wmv', '.avi', '.dat', '.asf', '.rm', '.rmvb', '.mpg', '.mpeg', '.3gp', '.mov', '.mp4',
            '.m4v', '.dvix', '.dv', '.dat', '.mkv', '.flv', '.vob', '.qt', '.divx', '.cpk', '.fli',
            '.flc', '.mod', '.m4a', '.f4v', '.3ga', '.caf', '.vob', '.ts'];
        this.audioAccept = [
            '.wav', '.aif', '.au', '.mp3', '.ram', '.wma', '.mmf', '.amr', '.aac', '.flac'];
        this.imgAccept = [
            '.jpg', '.jpeg', '.bmp', '.tif', '.gif', '.png', '.webp'];
        this.annexAccept = [
            '.doc', '.docx', '.xlsx', '.xls', '.pdf', '.txt', '.zip', '.rar', '.ppt', '.pptx'];
        //实例化编辑器
        this.myeditor = {};
        // this.newEditor();
        if (configContent && configContent.content && configContent.content.detail_category_name) {
            this.detailCategoryName = configContent.content.detail_category_name;
        } else {
            this.detailCategoryName = undefined;
        }
        if (configContent && configContent.content && configContent.content.detail_column_name) {
            this.detailColumnName = configContent.content.detail_column_name;
        } else {
            this.detailColumnName = undefined;
        }
        this.key = '';
        //是否显示详情中甘肃分类选项
        if (configContent && configContent.content && configContent.content.detail_fenlei_name) {
            this.detailFenleiName = configContent.content.detail_fenlei_name;
        } else {
            this.detailFenleiName = undefined;
        }
        //是否在创建时自动补全来源
        if (configContent && configContent.content && configContent.content.source && configContent.content.source.news && configContent.content.source.news.is_open && configContent.content.source.news.source_name) {
            this.autoSource = true;
            this.autoSourceName = configContent.content.source.news.source_name;
        } else {
            this.autoSource = false;
        }
        this.moduleType = $stateParams.module_type;
        this.moduleStatus = $stateParams.module_status;
        this.newsInfo = {};
        this.back = false;
        this.param = {
            id: $stateParams.id,
        };
        this.editStatus = $stateParams.status;
        this.noEdit = $stateParams.read ? $stateParams.read : 0;
        this.noEditStatus = $stateParams.status ? $stateParams.status : 0;
        this.isHeiMa = false;
        if (window.sessionStorage.getItem('open_heima') == 'true') {
            this.isHeiMa = true;
        }
        // 记录前面列表的页码 回去的时候会在相应页码
        this.pageCount = $stateParams.page;
        this.pageSize = $stateParams.pageSize;
        this.listSearch = $stateParams.listSearch;
        // this.showType = $stateParams.id ? 1 : 2;
        this.showType = 2;
        this.delAttachId = [];
        this.topicAssociated = [];
        // 草稿动画
        this.draftLoading = false;
        this.draftLoadingOn = false;
        // 关键词
        // this.keyList = [];
        // this.autoBule = true;
        // xr-提审流程
        this.is_show_process = 0;
        this.pro_list = {};
        this.showProcessBox = false;
        this.user_name = this.myUtils.storage.get('user_info').username;
        this.create_user_name = '';
        //  当前审核进度
        this.currentWebProgress = 1;
        //推荐
        // this.relevantList = [];
        this.transcodeItems = [];//转码请求数组
        // this.watch();//监听转码数组长度
        this.newsresources = [];//文稿资源数组
        this.newsResourcesNum = 1;//文稿资源上传初始
        this.clicked = '0';
        this.DOC = window.translate.news;
        this.columnTitle = window.translate.common.column;
        this.autoText = window.translate.common.autAcquisition;
        this.brief_type = 0;
        window.imgList = {};
        this.currentSiteId = this.$rootScope.rootSiteItems.id;
        // 这是cb加的;
        this.initLocalUpload();
        this.showImgObj = {};
        this.titleColor = false;
        this.outlinkUrl = '';
        this.contentNumber = 140;
        // 是另存为？
        this.isSave = 'save';

        // 组件
        this.btnIndex = 1;
        this.btnList = [];
        this.htmlCodes = [];
        this.keyValue = '';
        this.startNum = 0;
        this.typeNum = 0;
        this.pageNum = 20;
        this.totalNum = 0;
        this.ifScroll = 1;
        this.recentType = false;
        this.templateState = false;
        this.recentArray = localStorage.getItem('recentArray') ? JSON.parse(localStorage.getItem('recentArray')) : [];
        this.userInfo = localStorage.getItem('user_info') && JSON.parse(JSON.parse(localStorage.getItem('user_info')).value);
        this.prms = JSON.parse(JSON.parse(localStorage.getItem('user_info')).value).prms;
        this.openBase = this.prms.includes('article-base-click-num');
        // 协同嵌入
        if (this.$location.search().hideSynergyKind || window.sessionStorage.getItem('hideSynergyKind')) {
            this.hideAccessKind = true;
            this.listProjectId = this.$location.search().project_id;
            this.listProjectTitle = this.$location.search().project_title;
        } else {
            this.hideAccessKind = false;
        }
        if (window.CONFIG.auto_author) { //根据global.js中auto_author控制是否自动补全作者
            this.autoAuthor = true;
        } else {
            this.autoAuthor = false;
        }
        //加载更多--组件
        // $('.component-list-box').scroll(() => {
        //     this.scrollList();
        // });
        // $('body').keydown(() => {
        //     if (event.keyCode == '13') {
        //         this.searchTemplate();
        //     }
        // });
        this.hotFlag = $stateParams.hotFlag;
        this.publishFlag = $stateParams.publishFlag;
        this.commentFlag = $stateParams.commentFlag;
        this.publishType = $stateParams.publishType;
        this.category_id = $stateParams.category_id;
        this.column_id = $stateParams.column_id;
        this.reviewType = $stateParams.reviewType;
        this.reviewFlag = $stateParams.reviewFlag;
        this.hotList = $stateParams.hotList;
        this.thisStatus = $stateParams.thisStatus;
        this.type = $stateParams.type;
        this.thisType = $stateParams.thisType;
        this.ButtonId = $stateParams.ButtonId;
        this.id = $stateParams.id;
        this.status = $stateParams.status;
        this.title = $stateParams.title;
        this.contentParam = {
            urlType: 'article',
            cover_type: '1',
            cover_keys: [],
            mainColumn: [],
            is_close_comment: '',
            is_original: 1,
            content_type: '',
            title: '',
            subtitle: '',
            author: '',
            source: '',
            base: '',
            source_link: '',
            materials: [], //文稿正文图
            brief: '',
            // _extend: '',
            extend: '',
            success: false,
            label_ids: [], //标签
        };
        //历史记录
        this.getHistory = 0;
        // 是否是协同跳plus
        if (window.sessionStorage.getItem('hideNavigation')) {
            this.is_workcall_to_plus = true;
        } else {
            this.is_workcall_to_plus = false;
        }
        // this.permission = this.permission;
        this.relatedIds = [];
        if (this.param.id) {
            this.publish = false;
            if (this.is_workcall_to_plus) {
                if (window.localStorage.getItem('workcall_jump_manuscript')) {
                    window.localStorage.removeItem('workcall_jump_manuscript');
                }
            }
            this.getInfo();
            this.$timeout(() => {
                this.getOrigin();
            }, 500);
        } else {
            this.isNew = true;
            this.isDel = false;
            this.publish = true;
            this.autoSave();
            if (this.is_workcall_to_plus) {
                this.conductInfo({}, true);
            } else {
                this.getDraft();
            }
            this.$timeout(() => {
                this.getOrigin();
            }, 500);
        }
        // this.initVideoUpload();//video上传
        // this.initAudioUpload();//audio上传
        this.initAttachmentUpload();//上传附件
        // this.initNewsResources();//文稿资源

        this.$scope.$watch('vm.title', (value) => {
            if (value && value.length >= 45) {
                this.titleColor = true;
            } else {
                this.titleColor = false;
            }
            this.contentParam.title = value;
        });
        this.$scope.$watch('vm.isApplyRight', (value) => {
            if (value) {
                $('#article-edit-cb').html(this.newsInfo.content ? this.newsInfo.content.replace(/\s/g, '&nbsp;') : '');
            }
        });
        const listener = this.$scope.$on('$stateChangeStart', (event, toState, toParams) => {
            this.last = {
                title: this.title,
                is_bold: this.is_bold,
                is_italic: this.is_italic,
                bgcolor: this.bgcolor,
                // keyList: this.keyList,
                time: this.time,
                img: this.newsInfo.img,
                brief_type: this.brief_type,
                define_brief: this.define_brief,
                index_pic: this.newsInfo.index_pic,
                attach_ids: this.newsInfo.attach_ids,
                //公共部分start
                cover_type: this.contentParam.cover_type,
                cover_keys: this.contentParam.cover_keys,
                mainColumn: this.contentParam.mainColumn,
                is_close_comment: this.contentParam.is_close_comment,
                is_original: this.contentParam.is_original,
                content_type: this.contentParam.content_type,
                subtitle: this.contentParam.subtitle,
                author: this.contentParam.author,
                source: this.contentParam.source,
                publish_column: this.contentParam.publish_column,
                base: this.contentParam.base,
                source_link: this.contentParam.source_link,
                brief: this.contentParam.brief,
                _extend: this.contentParam._extend,
                extend: this.contentParam.extend,
                label_ids: [], //标签

                // content: this.myeditor && this.myeditor.getContent(),
            };
            if (this.noEdit) {
                this.back = true;
            } else if (!this.back && !this.saveState) {
                event.preventDefault();
                if (angular.equals(this.last, this.origin)) {
                    this.back = true;
                    event.defaultPrevented = false;
                    listener();
                    this.$state.go(toState.name, toParams, { reload: true });
                } else {
                    this.myUtils.confirm({
                        msg: this.DOC.sureLeave,
                    }, (data) => {
                        if (data) {
                            listener();
                            this.back = true;
                            event.defaultPrevented = false;
                            this.$state.go(toState.name, toParams, { reload: true });
                        }
                    });
                }
            }
        });
        window.imgManageConfirm = (cbk) => {
            this.myUtils.confirm({
                msg: this.DOC.sureDelete,
            }, (data) => {
                if (data && $.isFunction(cbk)) {
                    cbk(true);
                }
            });
        };
        this.$scope.$on('$destroy', () => {
            clearInterval(this.interval);
            window.onscroll = null;
        });
        $(window).scroll(() => {
            const scrollTop = $(window).scrollTop();
            const wbPosition = document.getElementById('wb-position');
            if (!wbPosition) {
                return;
            }
            if (scrollTop > 60) {
                wbPosition.style.position = 'fixed';
                wbPosition.style.top = '60px';
            } else {
                wbPosition.style.position = 'static';
                wbPosition.style.top = '0';
            }
        });
    }
    getSystem() {
        this.newsService.getSystem()
            .then((data) => {
                if (data.error_code == 0 && data.data) {
                    if (data.data.auto_submit_audit) {
                        this.showZY = true;
                    } else {
                        this.showZY = false;
                    }
                } else {
                    this.showZY = false;
                }
            });
    }
    toShow() {
        this.showType = this.showType == 2 ? 1 : 2;
    }
    uploadWbImage() {
        window.setTimeout(() => {
            $('#noImgFile').click();
        }, 200);
    }
    // 上传图片
    initLocalUpload() {
        this.localUploader = new FileUploader({
            url: this.config.getUrl('tuji_upload'),
            withCredentials: true,
            method: 'post',
        });
        this.localUploader.onAfterAddingFile = (item) => {
            if (this.atlas && this.atlas.id) {
                item.formData = [{ gallery_id: this.atlas.id, site_id: this.currentSiteId }];
            } else {
                item.formData.push({
                    site_id: this.currentSiteId,
                });
            }
        };
        this.localUploader.onAfterAddingAll = () => {
            this.localUploader.uploadAll();
            this.upload_loading = true;
        };
        this.localUploader.onCompleteItem = (fileItem, response) => {
            if ((fileItem.file.size / 1024 / 1024) > 5) {
                this.myUtils.newHogeTip({
                    msg: '图片不能大于5M',
                });
                return;
            }
            let localitem = [];
            if (response && (response.error_code || response.error_message)) {
                localitem.error = true;
                localitem.photo_name = window.translate.atlas.upFail;
            }
            if (response && response.data) {
                if (response.data instanceof Object) {
                    const index = response.data.photo_name.lastIndexOf('.');
                    response.data.photo_name = response.data.photo_name.substring(0, index);
                    localitem = response.data;
                    this.insertImg(localitem);
                } else {
                    angular.forEach(response.data, (vv) => {
                        const index = vv.photo_name.lastIndexOf('.');
                        vv.photo_name = vv.photo_name.substring(0, index);
                        localitem = vv;
                        this.insertImg(localitem);
                    });
                }
            }
            this.upload_loading = false;
        };
    }
    insertImg(data) {
        this.showImgObj = data;
        if ($stateParams.id) {
            // this.allListChange.unshift(data);
        }
    }
    // 获取默认审核流程
    getDefaultProcess() {
        this.newsService.getProcessDefault()
            .then((data) => {
                if (data.data) {
                    this.defaultProcessID = data.data.id;
                } else {
                    // this.chooseProcess();
                    this.defaultProcessID = '';
                }
            });
    }
    //关键联想
    associate() {
        console.log(this.key);
    }
    /**添加视频**/
    createVideoModel(type) {
        const modalMaterialRef = this.$uibModal.open({
            templateUrl: '../views/mxu/wbnew/newsupmaterial_modal.html',
            controller: 'newsMaterialRefCtrl',
            controllerAs: 'vm',
            // windowClass: 'news-materialrefModel',
            windowClass: 'wbnew-materialrefModel',
            backdrop: 'static',
            backdropClass: 'newsMaterial-class',
            resolve: {
                params: {
                    editor: this.myeditor,
                    type,
                },
            },
        });
        modalMaterialRef.result.then((result) => {
            result.success = true;
            result.progress = 100;
            const param = {
                id: result.extend_id,
                type: result.type,
            };
            http(config.getUrl('video_audio_short_url'), param, 'get')
                .then((data) => {
                    if (data && (data.error_code || data.error_message)) {
                        this.myUtils.newHogeTip({
                            msg: data.error_message || config.error_tip,
                        });
                        return;
                    }
                    // const html = $('#article-edit-cb').html();
                    // const lastNotUrlContent = html.indexOf('<a>') < 0 ? html : html.split('<a>')[0];
                    // const content = `${lastNotUrlContent}<a>${data.data.player_url}</a>`;
                    // $('#article-edit-cb').html('');
                    const content = `<a>${data.data.player_url}</a>`;
                    $('#article-edit-cb').append(content);
                    this.countNum();
                });
        });
    }
    /**主图在线编辑图片弹框**/
    onlineCut(img) {
        const modalInstance = this.$uibModal.open({
            templateUrl: '../views/mxu/wbnew/newscutimg_modal.html',
            controller: 'newsCutImgCtrl',
            controllerAs: 'vm',
            windowClass: 'news-cutModel',
            backdrop: 'static',
            backdropClass: 'newsMaterial-class',
            resolve: {
                params: {
                    img,
                },
            },
        });
        modalInstance.rendered.then(() => {
            const options = {
                aspectRatio: 1.4 / 1,
                autoCrop: true,
            };
            // Cropper
            $('#imageEdit').on({
                ready() {
                    $(this).cropper('crop');
                },
            }).cropper(options);
        });
        modalInstance.result.then((result) => {
            this.showImgObj.photo_url = result.data;
            this.showImgObj.photo_key = result.imgKey;
        });
    }
    // 删除图片事件
    deletePhotoUrl() {
        this.showImgObj = {};
    }
    // chenbiao 将输入的链接转化为视频短链接
    transShortUrl() {
        const param = {
            url: this.outlinkUrl,
        };
        http(config.getUrl('short_url_trans'), param, 'post')
            .then((data) => {
                if (data && (data.error_code || data.error_message)) {
                    this.myUtils.newHogeTip({
                        msg: data.error_message || config.error_tip,
                    });
                    return;
                }
                // const html = $('#article-edit-cb').html();
                // const lastNotUrlContent = html.indexOf('<a>') < 0 ? html : html.split('<a>')[0];
                // const content = `${lastNotUrlContent}<a>${data.data.url}</a>`;
                // $('#article-edit-cb').html('');
                const content = `<a>${data.data.url}</a>`;
                $('#article-edit-cb').append(content);
                this.outlinkUrl = '';
                this.countNum();
            });
    }
    // 计算正文字数
    countNum() {
        let num = 0;
        if ($('#article-edit-cb').html().indexOf('<a>') > -1) {
            num = 133 - $('#article-edit-cb').text().length;
        } else {
            num = 140 - $('#article-edit-cb').text().length;
        }
        this.contentNumber = num;
    }
    // 转化短链接的键盘事件  enter事件时触发短链接转化交互
    outlinkEnter(e) {
        if (e.keyCode === 13) {
            this.transShortUrl();
        }
    }
    getOrigin() {
        this.origin = {
            title: this.title,
            // keyList: angular.copy(this.keyList),
            time: this.time,
            img: this.newsInfo.img,
            brief_type: this.brief_type,
            define_brief: this.define_brief,
            index_pic: this.newsInfo.index_pic,
            attach_ids: angular.copy(this.newsInfo.attach_ids),
            //公共部分start
            cover_type: this.contentParam.cover_type,
            cover_keys: this.contentParam.cover_keys,
            mainColumn: this.contentParam.mainColumn,
            is_close_comment: this.contentParam.is_close_comment,
            is_original: this.contentParam.is_original,
            content_type: this.contentParam.content_type,
            subtitle: this.contentParam.subtitle,
            author: this.contentParam.author,
            source: this.contentParam.source,
            publish_column: this.contentParam.publish_column,
            base: this.contentParam.base,
            source_link: this.contentParam.source_link,
            brief: this.contentParam.brief,
            content: this.newsInfo.content,
            _extend: this.contentParam._extend,
            extend: this.contentParam.extend,
        };
        this.countNum();
    }
    /** 获取草稿信息 **/
    getDraft() {
        this.info_loading = true;
        http(config.getUrl('edit_draft'), { type: 'article', article_type: 'weibo' })
            .then((data) => {
                this.info_loading = false;
                if (data && (data.error_code || data.error_message)) {
                    this.myUtils.newHogeTip({
                        msg: data.error_message || config.error_tip,
                    });
                    return;
                }
                let isEmpty = false;
                if (JSON.stringify(data.data) == '{}' || !data.data) {
                    data.data = {};
                    isEmpty = true;
                }
                // 如果配置中设置了自动来源 进行处理
                if (this.autoSource) {
                    data.data.source = this.autoSourceName;
                }
                this.conductInfo(data.data, isEmpty);
                // this.relevant();
            });
    }
    /** 删除 草稿信息**/
    delDraft() {
        this.del_loading = true;
        http(config.getUrl('delete_draft'), { type: 'article', article_type: 'weibo' }, 'delete')
            .then((data) => {
                this.del_loading = false;
                if (data && (data.error_code || data.error_message)) {
                    this.myUtils.newHogeTip({
                        msg: data.error_message || config.error_tip,
                    });
                    return;
                }
                this.isDel = true;
                this.clearDraft();
                this.draftTip = '草稿已撤回';
                this.$timeout(() => {
                    this.draftDown = false;
                }, 2000);
            });
    }
    clearDraft() {
        window.attachList = [];
        window.imgList = [];
        window.index_pic = '';
        this.newsInfo = {};
        // this.myeditor.ready(() => { //编辑器初始化完成再赋值
        //     this.myeditor.setContent('', false);  //赋值给UEditor
        // });
        this.title = '';
        // this.brief_type = '';
        this.brief = '';
        // this.keyList = [];
        this.is_comment = false;
        this.is_close_comment = false;
        this.showImgObj = {};
        $('#article-edit-cb').html('');
        this.contentParam = {
            urlType: 'article',
            cover_type: '0',
            cover_keys: [],
            mainColumn: [],
            is_close_comment: 0,
            is_original: 1,
            content_type: '',
            subtitle: '',
            author: '',
            source: '',
            base: '',
            source_link: '',
            materials: [], //文稿正文图
            brief: '',
            label_ids: [], //标签
        };
        if (this.newsInfo.is_close_comment == undefined) {
            this.newsInfo.is_close_comment = 0;
        } else {
            this.newsInfo.is_close_comment = window.parseInt(this.newsInfo.is_close_comment);
        }
        this.is_comment = !this.newsInfo.is_close_comment;
        this.is_close_comment = !this.is_comment;
        this.newsInfo.attach_ids = [];
    }
    /** 获取文稿信息 **/
    getInfo() {
        this.info_loading = true;
        const url = `${config.getUrl('news_detail')}/${this.param.id}`;
        http(url)
            .then((data) => {
                if (data && (data.error_code || data.error_message)) {
                    this.myUtils.newHogeTip({
                        msg: data.error_message || config.error_tip,
                    });
                    return;
                }
                this.info_loading = false;
                if (data && data.data && data.data.id) {
                    this.conductInfo(data.data);
                }
                this.auditId = data.data.auditing && data.data.auditing.id;
                this.auditProcessId = data.data.auditing && data.data.auditing.process_id;
                // 陈标注释的审稿二期功能
                this.auditType = data.data.type;
                this.create_user_name = data.data.create_user_name;
            }, () => {
                this.info_loading = false;
            });
    }

    toggleShowAudit() {
        this.showAudit = !this.showAudit;
        if (this.showAudit) {
            this.toggleLog(1);
        }
    }

    getProcessData() {
        const auditParam = { origin_id: this.param.id, type: this.auditType };
        this.newsService.getProgress(auditParam)
            .then((d) => { //获取到的是当前的审核流程信息
                const nodes = d.data.nodes;
                this.processData = angular.copy(d.data);
                if (this.processData.nodes.length == this.processData.progress) {
                    this.currentWebProgress = this.processData.progress;
                } else {
                    this.currentWebProgress = this.processData.progress + 1;
                }
                this.currentNodes = []; //要显示的简单node节点
                // 对展示的数据进行处理
                if (this.editStatus == 5 || (this.editStatus == 1 && this.auditId)) {
                    if (d.data.progress == 0) {
                        if (nodes[1]) {
                            nodes[0].hasNext = true;
                        }
                        nodes[0].isAuditing = true;
                        // nodes[0].hasPass = true;
                        this.currentNodes.push(nodes[0]);
                        if (nodes[1]) {
                            this.currentNodes.push(nodes[1]);
                        }
                    } else {
                        nodes[d.data.progress - 1].hasNext = true;
                        nodes[d.data.progress - 1].hasPass = true;
                        this.currentNodes.push(nodes[d.data.progress - 1]);
                        nodes[d.data.progress].isAuditing = true;
                        this.currentNodes.push(nodes[d.data.progress]);
                    }
                } else if (this.editStatus == 4) {
                    if (d.data.progress == 1) {
                        nodes[0].isBlocked = true;
                        this.currentNodes.push(nodes[0]);
                    } else {
                        nodes[d.data.progress - 1].isBlocked = true;
                        nodes[d.data.progress - 2].hasPass = true;
                        nodes[d.data.progress - 2].hasNext = true;
                        this.currentNodes.push(nodes[d.data.progress - 2]);
                        this.currentNodes.push(nodes[d.data.progress - 1]);
                    }
                } else if (this.editStatus == 2 || this.editStatus == 3 || this.editStatus == 9) {
                    if (d.data.progress == 1) {
                        nodes[0].isAudited = true;
                        nodes[0].hasPass = true;
                        this.currentNodes.push(nodes[0]);
                    } else {
                        nodes[d.data.progress - 1].isAudited = true;
                        nodes[d.data.progress - 2].hasPass = true;
                        nodes[d.data.progress - 1].hasPass = true;
                        nodes[d.data.progress - 2].hasNext = true;
                        this.currentNodes.push(nodes[d.data.progress - 2]);
                        this.currentNodes.push(nodes[d.data.progress - 1]);
                    }
                }
                angular.forEach(this.currentNodes, (node) => {
                    if (node.user && node.user.id) {
                        node.users = [];
                        node.users[0] = node.user;
                    }
                    angular.forEach(node.users, (user) => {
                        if (!user.avatar) {
                            if (new RegExp('[\u4E00-\u9FA5]+').test(user.name)) {
                                user.avatarName = user.name.substr(-2, user.name.length);
                            }
                            if (new RegExp('[A-Za-z]+').test(user.name)) {
                                user.avatarName = user.name.substr(1);
                            }
                            user.bgColor = Math.floor(Math.random() * 3);
                        }
                    });
                });
                this.proNodes = d.data.nodes;
                //开始处理完整流程中的数据
                if (this.editStatus == 3 || this.editStatus == 2 || this.editStatus == 9) { //已发布或者已审核  应该所有的都是对号
                    angular.forEach(this.processData.nodes, (node) => {
                        if (node.users.length > 2) {
                            this.showBigDiv = true;
                        }
                        node.hasPass = true;
                        if (node.user && node.user.id) {
                            node.users = [];
                            node.users[0] = node.user;
                        }
                        // 判断各节点的状态
                        angular.forEach(node.users, (user) => {
                            if (!user.avatar) {
                                if (new RegExp('[\u4E00-\u9FA5]+').test(user.name)) {
                                    user.avatarName = user.name.substr(-2, user.name.length);
                                }
                                if (new RegExp('[A-Za-z]+').test(user.name)) {
                                    user.avatarName = user.name.substr(1);
                                }
                                user.bgColor = Math.floor(Math.random() * 3);
                            }
                        });
                    });
                } else if (this.editStatus == 4) {
                    angular.forEach(this.processData.nodes, (node, index) => {
                        if (node.users.length > 2) {
                            this.showBigDiv = true;
                        }
                        if (index < this.processData.progress - 1) {
                            node.hasPass = true;
                        }
                        if (index == (this.processData.progress - 1)) {
                            node.isBlocked = true;
                        }
                        if (node.user && node.user.id) {
                            node.users = [];
                            node.users[0] = node.user;
                        }
                        // 判断各节点的状态
                        angular.forEach(node.users, (user) => {
                            if (!user.avatar) {
                                if (new RegExp('[\u4E00-\u9FA5]+').test(user.name)) {
                                    user.avatarName = user.name.substr(-2, user.name.length);
                                }
                                if (new RegExp('[A-Za-z]+').test(user.name)) {
                                    user.avatarName = user.name.substr(1);
                                }
                                user.bgColor = Math.floor(Math.random() * 3);
                            }
                        });
                    });
                } else if (this.editStatus == 5 || (this.editStatus == 1 && this.auditId)) {
                    angular.forEach(this.processData.nodes, (node, index) => {
                        if (node.users.length > 2) {
                            this.showBigDiv = true;
                        }
                        if (index < this.processData.progress) {
                            node.hasPass = true;
                        }
                        if (index == this.processData.progress) {
                            node.isAuditing = true;
                        }
                        if (node.user && node.user.id) {
                            node.users = [];
                            node.users[0] = node.user;
                        }
                        // 判断各节点的状态
                        angular.forEach(node.users, (user) => {
                            if (!user.avatar) {
                                if (new RegExp('[\u4E00-\u9FA5]+').test(user.name)) {
                                    user.avatarName = user.name.substr(-2, user.name.length);
                                }
                                if (new RegExp('[A-Za-z]+').test(user.name)) {
                                    user.avatarName = user.name.substr(1);
                                }
                                user.bgColor = Math.floor(Math.random() * 3);
                            }
                        });
                    });
                }
                // angular.forEach(this.processData.nodes, (node) => {
                //     if (node.users.length > 2) {
                //         this.showBigDiv = true;
                //     }
                //     // 判断各节点的状态
                //     angular.forEach(node.users, (user) => {
                //         if (!user.avatar) {
                //             if (new RegExp('[\u4E00-\u9FA5]+').test(user.name)) {
                //                 user.avatarName = user.name.substr(-2, user.name.length);
                //             }
                //             if (new RegExp('[A-Za-z]+').test(user.name)) {
                //                 user.avatarName = user.name.substr(1);
                //             }
                //             user.bgColor = Math.floor(Math.random() * 3);
                //         }
                //     });
                // });
            });
    }

    getAuditLog() { //获取日志信息
        this.logLoading = true;
        this.newsService.getAuditLog(this.auditId, this.param.id, this.auditType)
            .then((data) => {
                this.loading = false;
                if (!data.error_code) {
                    this.logList = data.data;
                    angular.forEach(this.logList, (v) => {
                        v.operationName = v.operation == 0 ? '提审' : v.operation == 1 ? '审核' : v.operation == -1 ? '打回' : null;
                        v.name = v.name || '未知用户';
                    });
                } else {
                    this.myUtils.newHogeTip({
                        msg: '获取日志失败',
                    });
                }
            });
    }

    setComment() { //发表评论
        if (this.comment && this.isOneClick) {
            this.isOneClick = false;
            const param = { content_id: this.auditId, content: this.comment };
            this.newsService.setComment(param)
                .then((data) => { //获取到的是当前的审核评论  与后端沟通  到底用的是哪个id
                    if (!data.error_code && data.data) {
                        const arr = data.data.created_at.split(' ');
                        data.data.time = `${arr[0].replace('-', '@').split('@')[1]} ${arr[1].replace(':', '@').split(':')[0].replace('@', ':')}`;
                        if (!this.userInfo.avatar) {
                            if (new RegExp('[\u4E00-\u9FA5]+').test(this.userInfo.name)) {
                                data.data.user = {};
                                data.data.user.avatarName = this.userInfo.name.substr(-2, this.userInfo.name.length);
                            }
                            if (new RegExp('[A-Za-z]+').test(this.userInfo.name)) {
                                data.data.user = {};
                                data.data.user.avatarName = this.userInfo.name.substr(1);
                            }
                            data.data.user.bgColor = Math.floor(Math.random() * 3);
                        } else {
                            if (!data.data.user) {
                                data.data.user = {};
                            }
                            data.data.user.avatar = this.userInfo.avatar;
                        }
                        data.data.user.name = this.userInfo.name;
                        this.commentList.push(data.data);
                        // this.getComment();
                        this.comment = '';
                    }
                    this.isOneClick = true;
                });
        }
    }
    relevant() {
        if (this.title) {
            const param = {
                title: this.title,
                full_title_search: 1,
            };
            this.newsService.searchTitle(param)
                .then((data) => {
                    if (data.data.length) {
                        if (data.data.length == 1 && data.data[0].id == this.param.id) {
                            console.log('当前稿件');
                        } else {
                            this.myUtils.newHogeTip({
                                msg: '标题已存在！',
                            });
                        }
                    }
                });
        }
    }
    getComment() {
        this.commentLoading = true;
        this.newsService.getComment(this.auditId)
            .then((data) => { //获取到的是当前的审核评论  与后端沟通  到底用的是哪个id
                this.commentLoading = false;
                if (!data.error_code) {
                    this.commentList = data.data;
                    angular.forEach(this.commentList, (v) => {
                        const arr = v.created_at.split(' ');
                        v.time = `${arr[0].replace('-', '@').split('@')[1]} ${arr[1].replace(':', '@').split(':')[0].replace('@', ':')}`;
                        if (!v.user.avatar) {
                            if (new RegExp('[\u4E00-\u9FA5]+').test(v.user.name)) {
                                v.user.avatarName = v.user.name.substr(-2, v.user.name.length);
                            }
                            if (new RegExp('[A-Za-z]+').test(v.user.name)) {
                                v.user.avatarName = v.user.name.substr(1);
                            }
                            v.user.bgColor = Math.floor(Math.random() * 3);
                        }
                    });
                }
            });
    }

    toggleLog(flag) {
        if (flag == 2) {
            this.getAuditLog();
            this.showLog = true;
        } else if (flag == 1) {
            this.getProcessData();
            this.getComment();
            this.showLog = false;
        }
    }

    showFullProcess() {
        this.showBottomDiv = !this.showBottomDiv;
        // if (this.showBigDiv) {
        //     this.showBottomDiv = !this.showBottomDiv;
        // } else {
        //     this.showRightDiv = !this.showRightDiv;
        // }
    }

    /** 初始化数据 **/
    conductInfo(data, isEmpty) {
        this.workcall_third_data = '';
        if (data.project_id || data.project_id != 0) {
            if (this.topicAssociated.length) {
                this.topicAssociated[0].id = data.project_id;
            }
        }
        // if (data.project_type) {
        //     if (this.topicAssociated.length) {
        //         this.topicAssociated[0].title = data.project_type;
        //     }
        // }
        if (data.project_name) {
            if (this.topicAssociated.length) {
                this.topicAssociated[0].title = data.project_name;
            }
        }
        window.attachList = data.materials;
        window.imgList = data.materials;
        window.index_pic = data.index_pic;
        this.newsInfo = data;
        this.newsInfo.urlType = 'article';
        this.previewTitle = data.title;
        const { contentParam } = this; //传给左侧栏目的数据  双向绑定
        this.title = data.title; //文稿标题
        this.publish_column = data.publish_column;
        this.showImgObj.photo_url = data.weibo_indexpic; //微博图片
        $('#article-edit-cb').html(data.content ? data.content.replace(/\s/g, '&nbsp;') : '');
        this.countNum();
        //封面
        if (this.newsInfo.index_pic) {
            const getTimestamp = new Date().getTime();
            this.newsInfo.img = `${this.myUtils.getImgsrc(this.newsInfo.index_pic, { cut_mode: 2, w: 408 })}?timestamp=${getTimestamp}`;
        }
        // this.brief_type = this.newsInfo.brief_type ? this.newsInfo.brief_type : 0;
        // if (this.newsInfo.keywords && this.newsInfo.keywords !== '') {
        //     this.keyList = this.newsInfo.keywords.split(',');
        // }
        //公共部分start
        if (this.newsInfo.is_close_comment == undefined) {
            this.newsInfo.is_close_comment = 0;
        } else {
            this.newsInfo.is_close_comment = window.parseInt(this.newsInfo.is_close_comment);
        }
        this.is_comment = !this.newsInfo.is_close_comment;
        this.is_close_comment = !this.is_comment;
        if (this.newsInfo.is_original == undefined) {
            this.newsInfo.is_original = 0;
        } else {
            this.newsInfo.is_original = window.parseInt(this.newsInfo.is_original);
        }
        this.is_original_med = !this.newsInfo.is_original;
        this.is_original = !this.is_original_med;

        contentParam.cover_type = this.newsInfo.cover_type ? this.newsInfo.cover_type : '0';
        contentParam.cover_keys = this.newsInfo.cover_keys ? this.newsInfo.cover_keys : [];
        if (sessionStorage.getItem('content_category_id') && !this.param.id) {
            const category = angular.fromJson(sessionStorage.getItem('content_category_id'));
            contentParam.mainColumn.push({ id: category.id, name: category.name });
        } else {
            contentParam.mainColumn = this.newsInfo.category_id ? [{ id: this.newsInfo.category_id, name: this.newsInfo.category_name }] : [];
        }

        contentParam.is_close_comment = !this.is_comment;
        contentParam.is_original = !this.is_original_med;
        contentParam.content_type = this.newsInfo.content_type;
        contentParam.subtitle = this.newsInfo.subtitle;
        contentParam.title = this.title; //网络图搜索
        // contentParam.author = this.newsInfo.author;
        if (this.autoAuthor && !this.param.id) {
            contentParam.author = this.newsInfo.author ? this.newsInfo.author : this.userInfo.name;
        } else {
            contentParam.author = this.newsInfo.author;
        }
        contentParam.source = this.newsInfo.source;
        contentParam.publish_column = this.newsInfo.publish_column;
        contentParam.brief = this.newsInfo.brief;
        contentParam.base = this.newsInfo.base;
        contentParam.source_link = this.newsInfo.source_link ? this.newsInfo.source_link : '';
        contentParam._extend = this.newsInfo._extend;
        contentParam.success = true;
        //标签初始化
        contentParam.label_ids = [];
        const labelsId = [];
        if (this.newsInfo.labels && this.newsInfo.labels.length) {
            this.newsInfo.labels.forEach((vv) => {
                labelsId.push(vv.id);
            });
            contentParam.label_ids = labelsId;
        } else if (this.newsInfo.label_ids) {
            //草稿
            contentParam.label_ids = this.newsInfo.label_ids;
        }
        //公共部分end

        //头部信息初始化
        this.copyNews = angular.copy(this.newsInfo);
        this.newsInfo.attach_ids = [];
        // this.newsInfo.attach_ids = this.newsInfo.attach_ids ? this.newsInfo.attach_ids : [];
        if (data.materials) {
            angular.forEach(data.materials, (v) => {
                this.newsInfo.attach_ids.push(window.parseInt(v.id));
                if (v.type == 'image') {
                    contentParam.materials = data.materials;
                    v._mSrc = v.image_url;
                }
                if (v.type == 'document' || v.type == 'video' || v.type == 'audio' || v.type == 'gallery' || v.type == 'image') {
                    v.success = true;
                    v.progress = 100;
                    this.newsresources.push(v);
                }
            });
        }
        if (!this.param.id && !isEmpty) {
            this.draftDown = true;
            this.draftTip = '已载入上次保存的草稿';
        }
        if (this.is_workcall_to_plus) {
            const workcallThirdData = window.localStorage.getItem('workcall_jump_manuscript');
            if (workcallThirdData) {
                this.workcall_third_data = JSON.parse(workcallThirdData);
                this.title = this.workcall_third_data.params.title;
                this.source_type = this.workcall_third_data.params.source_type;
                this.workcall_third_data.params.content = this.workcall_third_data.params.content.replace(/%%/g, '%');
                const editorContent = decodeURI(this.workcall_third_data.params.content);
                $('#article-edit-cb').html(editorContent);
            }
        }
        // if ($stateParams.id) {
        //     this.relevantList = this.newsInfo.related;
        //     angular.forEach(this.newsInfo.related, (vv) => {
        //         this.relatedIds.push(vv.publish_id);
        //     });
        // }
    }

    /**
     * 编辑器开始
     */
    /** 自动保存 **/
    autoSave() {
        if (this.noJump) {
            this.interval = this.$interval(() => {
                this.getContent();
            }, 5000);
            this.$rootScope.interval = this.interval;
        } else {
            this.interval = this.$interval(() => {
                this.getContent();
            }, 30000);
            this.$rootScope.interval = this.interval;
        }
        // this.interval = window.setInterval(() => {
        //     this.getContent();
        // }, 30000);
        // this.$rootScope.interval = this.interval;
    }

    /** 获取编辑器内容 **/ //cb注释
    getContent(type) {
        this.newsInfo.content = $('#article-edit-cb').html()
            .replace(/<div>|<\/div>/g, '')
            .replace(/&nbsp;/g, ' ');
        //保存草稿信息
        this.newsInfo.auto_draft = 1;
        this.newsInfo.title = this.title;
        // 公共部分 start
        if (this.contentParam.cover_keys.length.length) {
            this.newsInfo.cover_type = 1;
        } else {
            this.newsInfo.cover_type = 0;
        }
        this.newsInfo.cover_keys = this.contentParam.cover_keys.length ? JSON.stringify(this.contentParam.cover_keys) : [];
        if (this.contentParam.mainColumn.length) {
            this.newsInfo.category_id = this.contentParam.mainColumn[0].id;
            this.newsInfo.category_name = this.contentParam.mainColumn[0].name;
        }
        this.newsInfo.is_original = !!this.contentParam.is_original;
        this.newsInfo.brief = this.contentParam.brief;
        this.newsInfo.content_type = this.contentParam.content_type;
        this.newsInfo.publish_column = this.contentParam.publish_column;
        this.newsInfo.source = this.contentParam.source;
        this.newsInfo.base = this.contentParam.base;
        this.newsInfo.source_link = this.contentParam.source_link == 'http://' ? '' : this.contentParam.source_link;
        //扩展字段
        delete this.newsInfo.material;

        //公共部分 end
        this.curNews = $.extend(true, {}, this.copyNews, this.newsInfo);
        const params = angular.copy(this.newsInfo);
        params.weibo_indexpic = this.showImgObj.photo_url;
        params.article_type = 'weibo';
        //标签
        params.label_ids = this.contentParam.label_ids;
        // params.attach_ids = params.attach_ids ? params.attach_ids.join(',') : '';
        if (!this.param.id && !type) {
            this.newsInfo.type = 'article';
            params.type = 'article';
            params.article_type = 'weibo';
            // 协同跳plus不保存草稿
            if (!this.is_workcall_to_plus) {
                this.draftLoading = true;
                http(config.getUrl('edit_draft'), params, 'post')
                    .then((data) => {
                        if (data && (data.error_code || data.error_message)) {
                            this.myUtils.newHogeTip({
                                msg: data.error_message || config.error_tip,
                            });
                            return;
                        }
                        this.draftLoading = false;
                        this.draftLoadingOn = true;
                        this.$timeout(() => {
                            this.draftLoadingOn = false;
                        }, 1500);
                    });
            }
        }
    }
    /** 编辑器结束 **/

    /** 是否关闭评论以及立即发布 **/
    setOther(type) {
        this.newsInfo[type] = !this.newsInfo[type];
        this.newsInfo[type] = this.newsInfo[type] ? 1 : 0;
    }
    // 选择提审流程
    chooseProcess() {
        if (!this.is_show_process) {
            const showPreviews = this.$uibModal.open({
                templateUrl: '../views/mxu/common/audit_modal.html',
                controller: 'webprocessCtrl',
                windowClass: 'showAudit',
                backdrop: 'static',
                controllerAs: 'vm',
                resolve: {
                    param: {
                        id: '',
                        title: '',
                        type: '',
                    } },
            });
            showPreviews.result.then((data) => {
                if (data) {
                    this.pro_list = data[0];
                    this.showProcessBox = true;
                    this.is_show_process = 1;
                }
            });
        } else {
            this.showProcessBox = !this.showProcessBox;
        }
    }
    reElectionProcess() {
        this.showProcessBox = false;
        this.is_show_process = 0;
        this.chooseProcess();
    }
    clearProcess() {
        this.pro_list = {};
        this.is_show_process = 0;
        this.showProcessBox = false;
    }
    /** 保存 **/
    verify() {
        let errorMessage;
        if (this.newsInfo.title && this.newsInfo.title.length < 1) {
            errorMessage = '标题不能少于1个字';
        }
        if (!this.newsInfo.title) {
            errorMessage = this.DOC.noTitleEmpty;
        }
        if (!this.newsInfo.content) {
            errorMessage = this.DOC.noContentEmpty;
        }
        // if (this.contentParam.mainColumn.length == 0) {
        //     errorMessage = this.DOC.noClassify;
        // }
        //封面图类型 与 数组之间判断
        if (this.contentParam.cover_keys.length == 0) {
            this.newsInfo.cover_type = 0;
            delete this.newsInfo.cover_keys;
        } else if (this.contentParam.cover_type == 2 && (!(this.contentParam.cover_keys.length == 3 && this.contentParam.cover_keys[0] && this.contentParam.cover_keys[1] && this.contentParam.cover_keys[2]))) {
            errorMessage = '请选择三张封面图!';
        }
        if (this.newsInfo.source_link && (this.newsInfo.source_link.indexOf('http://') != 0 && (this.newsInfo.source_link.indexOf('https://') != 0))) {
            errorMessage = '原文链接请以 http:// 或 https:// 开头';
        }
        return errorMessage;
    }
    //保存标签
    saveLabel() {
        const param = {
            content_type: 'article',
            content_data_id: $stateParams.id,
            label_ids: this.contentParam.label_ids.join(','),
        };
        if ($stateParams.publishFlag || parseInt(this.editStatus, 10) === 3) {
            param.is_publish = 1;
        }
        this.newsService.saveLabel(param);
    }
    //敏感词
    promptSensitive() {
        const content = $('#article-edit-cb').text();
        const string = `${content} ${this.title}`;
        this.clicked = '1';
        this.newsService.checkBanWord({ content: string })
        .then((res) => {
            this.clicked = '0';
            if (res.data.length) {
                const promptModalInstance = this.$uibModal.open({
                    templateUrl: '../views/mxu/common/promptSensitive.html',
                    controller: 'promptSensitiveCtrl',
                    controllerAs: 'vm',
                    windowClass: 'prompt-senModel',
                    backdrop: 'static',
                    resolve: {
                        param: {
                            checkBanWord: res.data,
                        },
                    },
                });
                promptModalInstance.result.then((result) => {
                    if (result.save === true) {
                        this.toSave();
                    }
                });
            } else {
                this.toSave();
            }
        });
    }
    toSave() {
        if (this.isSave == 'saveAudit') {
            if (this.defaultProcessID == '' && !this.pro_list.id && !this.auditProcessId) {
                this.chooseProcess();
                return;
            }
            if (this.pro_list.id) {
                this.newsInfo.process_id = this.pro_list.id;
            } else if (this.auditProcessId) {
                delete this.newsInfo.process_id;
            } else {
                this.newsInfo.process_id = this.defaultProcessID;
            }
        }
        this.clicked = '1';
        if (this.interval) {
            this.$interval.cancel(this.interval);
        }
        let url;
        let method;
        const params = angular.copy(this.newsInfo);
        if (this.param.id) {
            // 编辑
            this.save_loading = true;
            if (this.isSave == 'saveAs') {
                delete params.id;
                delete params.sign;
                params.copy = 1;
                params._extend = JSON.stringify(params._extend);
                url = config.getUrl('news_create');
                method = 'post';
            } else {
                url = config.getUrl('news_create');
                method = 'put';
                params.article_id = this.param.id;
            }
            // this.save_loading = true;
            // url = config.getUrl('news_create');
            // method = 'put';
            // params.article_id = this.param.id;
        } else {
            //新建
            this.save_loading = true;
            url = config.getUrl('news_create');
            method = 'post';
        }
        const columnIDs = [];
        if (this.contentParam.publish_column) {
            this.contentParam.publish_column.forEach((vv) => {
                if (vv.column.length) {
                    vv.column.forEach((v) => {
                        columnIDs.push(v.column_id);
                    });
                }
            });
        }
        params.column_id = columnIDs.join(',');
        // 根据json配置控制表单项必填
        if (configContent && configContent.content && configContent.content.categoryRequired && !params.category_id) {
            this.myUtils.newHogeTip({
                msg: `${this.detailCategoryName || '分类'}不能为空！`,
            });
            this.clicked = '0';
            return;
        }
        if (configContent && configContent.content && configContent.content.columnRequired && !columnIDs.length) {
            this.myUtils.newHogeTip({
                msg: `${this.detailColumnName || '栏目'}不能为空！`,
            });
            this.clicked = '0';
            return;
        }
        delete params.publish_column;
        this.saveState = true;
        params.cover_keys = JSON.stringify(this.contentParam.cover_keys);
        if (this.contentParam.cover_keys.length) { // 判断有没有封面图 赋值相应cover_type
            params.cover_type = 1;
        } else {
            params.cover_type = 0;
        }
        if (this.is_workcall_to_plus) {
            params.project_id = this.topicAssociated[0].id;
            // params.project_type = this.topicAssociated[0].title;
            params.project_name = this.topicAssociated[0].title;
            params.source_type = this.source_type;
        }
        /*********一键稿件 */
        window.localStorage.removeItem('workcall_jump_manuscript');
        // if ($('#article-edit-cb').text().length > 140) { // 判断正文是否超140字限制
        //     this.myUtils.newHogeTip({
        //         msg: '正文超过字数限制',
        //     });
        //     this.clicked = '1';
        //     return;
        // }
        // params.content = $('#article-edit-cb').text();
        params.content = $('#article-edit-cb').html()
            .replace(/<div>|<\/div>/g, '')
            .replace(/&nbsp;/g, ' ');
        params.weibo_indexpic = this.showImgObj.photo_key;
        params.article_type = 'weibo';
        params.title = this.title;
        this.clicked = '1';
        params.content = params.content.replace(/<[^>]+>/g, '');
        //标签
        if (this.param.id && this.isSave != 'saveAs') {
            this.saveLabel();
            params.label_ids = this.contentParam.label_ids.join(',');
        } else {
            params.label_ids = this.contentParam.label_ids.join(',');
        }
        http(url, params, method)
            .then((data) => {
                if (data && (data.error_code || data.error_message)) {
                    this.myUtils.newHogeTip({
                        msg: data.error_message || config.error_tip,
                    }, () => {
                        this.save_loading = false;
                        this.publish_loading = false;
                    });
                    this.clicked = '0';
                    return;
                }
                this.save_loading = false;
                this.publish_loading = false;
                if (data.data && !this.param.id) {
                    this.param.id = data.data.id;
                    this.myUtils.newHogeTip({
                        msg: this.DOC.saveSuccess,
                        type: 'success',
                    }, () => {
                        // this.myeditor.destroy();
                        if (!this.noJump) {
                            if (this.publishFlag) {
                                this.$state.go('app.publish.menu.list', { per_num: this.pageSize, page: this.pageCount, type: this.publishType, hideSynergyKind: this.hideAccessKind ? true : null, access_token: this.access_token, column_id: this.column_id });
                            } else {
                                this.$state.go('app.content.menu.list', { type: 'article', page: this.pageCount, per_num: this.pageSize, article_type: this.moduleType, title: this.listSearch, hideSynergyKind: this.hideAccessKind ? true : null, project_id: this.listProjectId ? this.listProjectId : null, project_title: this.listProjectTitle ? this.listProjectTitle : null, access_token: this.access_token, category_id: this.category_id });
                            }
                        }
                    });
                }
                if (data.data && this.param.id) {
                    this.myUtils.newHogeTip({
                        msg: this.tipMsg,
                        type: 'success',
                    }, () => {
                        if (!this.noJump) {
                            history.go(-1);
                        }
                    });
                }
            });
    }
    save(saveTag) {
        this.isSave = saveTag;
        this.tipMsg = '';
        if (this.isSave == 'saveAs') {
            this.tipMsg = '另存为成功';
        } else {
            this.tipMsg = '更新成功';
        }
        this.getContent('save');
        // const errorMessage = this.verify();
        // if (errorMessage) {
        //     this.myUtils.newHogeTip({
        //         msg: errorMessage,
        //     });
        //     this.clicked = '0';
        //     return;
        // }
        if (this.contentParam.mainColumn[0]) {
            this.newsInfo.category_id = this.contentParam.mainColumn[0].id;
            this.newsInfo.category_name = this.contentParam.mainColumn[0].name;
        } else {
            this.newsInfo.category_id = 0;
            this.newsInfo.category_name = '';
        }
        if (this.pro_list.id) {
            this.newsInfo.process_id = this.pro_list.id;
        }
        if (this.sensitive_prompt) {
            //敏感词
            this.promptSensitive();
        } else {
            this.toSave();
        }
    }
    /** 摘要操作 (没有对接) **/
    showTab() {
        this.edit = false;
        this.dis = true;
    }

    closeAuto() {
        this.showAuto = false;
    }
    addAnnex() {
        $('#up-file').click();
        $('#morechose').toggle();
        $('#edui22_state').toggleClass('edui-state-checked');
    }
    genUniqHash() {
        return Math.floor(Date.now() / 1000) + Math.random().toString().slice(2, 8);
    }
    /** 上传视频 音频 附件 **/
    initAttachmentUpload() {
        this.attachmentloader = new FileUploader({
            url: config.getUrl('upload_indexpic'),
            withCredentials: true,
        });
        this.attachmentloader.onAfterAddingFile = (item) => {
            item.num = this.newsResourcesNum + 1;
            this.newsResourcesNum = this.newsResourcesNum + 1;
            const lastIndex = item.file.name.lastIndexOf('.');
            // item.title = item.file.name.substring(0, lastIndex);//文件名去除格式后缀
            item.title = item.file.name;//文件名带格式后缀
            item.extension = item.file.name.substring(lastIndex + 1).toLowerCase();//文件的后缀名
            if (this.newsResourcesType != 'all') { //判断文件的类型
                item.type = this.newsResourcesType;
            } else if (this.videoAccept.includes(`.${item.extension}`)) {
                item.type = 'video';
            } else if (this.audioAccept.includes(`.${item.extension}`)) {
                item.type = 'audio';
            } else if (this.annexAccept.includes(`.${item.extension}`)) {
                item.type = 'document';
            } else if (this.imgAccept.includes(`.${item.extension}`)) {
                item.type = 'image';
            }
            item.file_size = `${item.file.size / (1000).toFixed(2)}KB`;//文件大小KB
            item.fileSize = item.file.size / (1000).toFixed(2);//文件大小KB
            if (this.nowAccept.indexOf(`.${item.extension}`) < 0) {
                this.myUtils.newHogeTip({
                    msg: '文件上传类型出错,请重新上传!',
                });
                item.error_type = '文件上传类型出错,请重新上传!';
                this.attachmentloader.removeFromQueue(this.attachmentloader.getIndexOfItem(item));
                return;
            }
            if (item.type == 'document' && item.fileSize > 2000000) {
                this.myUtils.newHogeTip({
                    msg: '文件上传类型出错,请重新上传!',
                });
                item.error_type = '文件上传大小超过2G,请重新上传!';
                this.attachmentloader.removeFromQueue(this.attachmentloader.getIndexOfItem(item));
                return;
            }
            if (item.type == 'video' || item.type == 'audio') {
                item.formData.push({
                    type: 'media',
                    site_id: this.currentSiteId,
                });
            } else {
                item.formData.push({
                    type: item.type,
                    site_id: this.currentSiteId,
                });
            }
            //默认占位图
            // const fileId = item._file.lastModified;
            // this.myeditor.execCommand('inserthtml', `<img class="upload-file" id="file_${fileId}" src="../../assets/images/mxu/news/file_default.png"/>`);
            this.attachmentloader.uploadAll();
            this.newsresources.push(item);
        };
        this.attachmentloader.onProgressItem = (progress) => {
            angular.forEach(this.newsresources, (vv) => {
                if (vv.num == progress.num) {
                    vv.progress = progress.progress;
                    $(`.circleChart#circle_${vv.num}`).circleChart({
                        size: 15,
                        value: vv.progress,
                        startAngle: 180,
                        color: '#8FD097',
                    });
                }
            });
        };
        this.attachmentloader.onCompleteItem = (fileItem, response) => {
            if (!response) {
                angular.forEach(this.newsresources, (vv) => {
                    if (vv.num && vv.num == fileItem.num) {
                        vv.isRetry = true;
                    }
                });
                return;
            }
            if (response && (response.error_code || response.error_message)) {
                angular.forEach(this.newsresources, (vv) => {
                    if (vv.num && vv.num == fileItem.num) {
                        vv.isFail = true;
                        this.$timeout(() => {
                            $(`.circleChart#error_${vv.num}`).circleChart({
                                size: 15,
                                value: 60,
                                startAngle: 180,
                                color: '#E7505A',
                                animate: false,
                            });
                        });
                        vv.error_tip = response.error_message || '上传错误';
                    }
                });
                this.attachmentloader.removeFromQueue(this.attachmentloader.getIndexOfItem(fileItem));
                this.myUtils.newHogeTip({
                    msg: response.error_message || config.error_tip,
                }, () => {
                });

                return;
            }
            if (response && response.data) {
                if (response.data.type == 'image') {
                    const imgDom = document.createElement('img');
                    imgDom.setAttribute('src', response.data.url);
                    this.$timeout(() => {
                        const lastWidth = Math.min(726, imgDom.naturalWidth);
                        this.myeditor.execCommand('inserthtml', `<img class="upload-image" id="${response.data.id}" src="${response.data.url}" _src="${response.data.url}" width="${lastWidth}"/>`);
                        this.myeditor.execCommand('insertparagraph');
                    }, 100);
                }
                this.newsInfo.attach_ids = this.newsInfo.attach_ids ? this.newsInfo.attach_ids : [];
                this.newsInfo.attach_ids.push(window.parseInt(response.data.id));
                angular.forEach(this.newsresources, (vv) => {
                    if (vv.num && vv.num == fileItem.num) {
                        vv.id = response.data.id;
                        vv.extend_id = response.data.extend_id;
                        vv.file_name = response.data.file_name;
                        vv.title = response.data.title;
                        vv.url = response.data.url;
                        vv.download_url = response.data.download_url;
                        this.$timeout(() => {
                            vv.success = true;
                        }, 1000);
                    }
                });
                this.$timeout(() => {
                    this.myUtils.newHogeTip({
                        msg: '上传成功!',
                        type: 'success',
                    });
                    // console.log($(window.frames.ueditor_0).find(`#file_${fileItem._file.lastModified}`).attr('src'));
                    // $(`<div>${this.myeditor.getAllHtml()}</div>`).find(`#file_${fileItem._file.lastModified}`).attr('src', '../assets/images/mxu/avatar-32.jpg');
                }, 1000);
                this.attachmentloader.removeFromQueue(this.attachmentloader.getIndexOfItem(fileItem));
            }
        };
    }

    preResource(item) {
        if (item.type == 'video') {
            this.sourceClass = 'video-pre-resource';
        } else {
            this.sourceClass = 'pre-ResourceModel';
        }
        this.$uibModal.open({
            templateUrl: '../views/mxu/new/preModal.html',
            controller: 'preResourceCtrl',
            controllerAs: 'vm',
            windowClass: 'preResource',
            backdrop: 'static',
            resolve: {
                params: {
                    param: item,
                },
            },
        });
        /*********************** 新版文稿资源  end******************************/
    }


    cancelForm() {
        window.localStorage.removeItem('workcall_jump_manuscript');
        if (this.publishFlag) {
            this.$state.go('app.publish.menu.list', { per_num: this.pageSize, page: this.pageCount, type: this.publishType, hideSynergyKind: this.hideAccessKind ? true : null, access_token: this.access_token, column_id: this.column_id });
        } else if (this.reviewFlag) {
            this.$state.go('app.content.review.list', { page: this.pageCount, per_num: this.pageSize, type: this.reviewType, hideSynergyKind: this.hideAccessKind ? true : null });
        } else {
            this.$state.go('app.content.menu.list', { type: 'article', page: this.pageCount, per_num: this.pageSize, article_type: this.moduleType, title: this.listSearch, hideSynergyKind: this.hideAccessKind ? true : null, project_id: this.listProjectId ? this.listProjectId : null, project_title: this.listProjectTitle ? this.listProjectTitle : null, access_token: this.access_token, category_id: this.category_id });
        }
    }

    //历史记录
    toggled(open) {
        this.histLoading = true;
        if (open && !this.getHistory) {
            this.historyList = [];
            this.newsService.toggled({ origin_id: $stateParams.id })
            .then((data) => {
                this.histLoading = false;
                if (data.error_code == 0) {
                    this.getHistory = 1;
                    this.historyList = data.data;
                    this.noHistory = true;
                }
            });
        }
    }
    compareHistroy() {
        const current = $('#article-edit-cb').html()
            .replace(/<div>|<\/div>/g, '')
            .replace(/&nbsp;/g, ' ');
        const modal = this.$uibModal.open({
            templateUrl: '../views/mxu/new/compare-history.html',
            controller: 'compareHistroyCtrl',
            controllerAs: 'vm',
            windowClass: 'compareHistroy',
            backdrop: 'static',
            resolve: {
                params: {
                    // param: item,
                    currentContent: current,
                    currentTitle: this.title,
                    origin_id: $stateParams.id,
                },
            },
        });
        this.myUtils.removeScroll();
        modal.result.then((data) => {
            this.title = data.title;
            this.myeditor.execCommand('cleardoc');
            this.myeditor.execCommand('inserthtml', data.content);
        })
        .finally(() => {
            this.myUtils.resumeScroll();
        });
    }
    // 组件
    componentBtns(index) {
        this.typeNum = 0;
        this.startNum = 0;
        this.btnIndex = index;
        this.recentType = false;
        this.htmlCodes = [];
        this.ifScroll = 1;
        this.getList(this.startNum, this.btnIndex, this.keyValue);
    }
    otherTab() {
        this.templateState = false;
    }
    getTemplateList() {
        this.templateState = true;
        this.recentType = false;
        this.typeNum = 1;
        this.ifScroll = 1;
        this.newsService.getTemCategory()
        .then((data) => {
            this.btnList = data.data;
            this.startNum = 0;
            this.getList(this.startNum, this.btnIndex, this.keyValue);
        });
    }
    getList(startNum, sortId, keyValue) {
        if (this.typeNum == 1) {
            this.list_loading = false;
        } else {
            this.list_loading = true;
        }
        const params = {
            offset: startNum,
            count: this.pageNum,
            sort_id: sortId,
            name: keyValue,
        };
        this.newsService.getArticleTemplate(params)
        .then((data) => {
            this.list_loading = false;
            this.totalNum = data.data.total;
            angular.forEach(data.data.list, (v, k) => {
                data.data.list[k].code = this.$sce.trustAsHtml(data.data.list[k].code);
            });
            this.htmlCodes = this.htmlCodes.concat(data.data.list);
        });
    }
    showHtml(htmlcode) {
        this.myeditor.execCommand('inserthtml', htmlcode.toString());
        if (JSON.stringify(this.recentArray).indexOf(JSON.stringify({ code: htmlcode.toString() })) == -1) {
            if (this.recentArray.length >= 20) {
                this.recentArray.splice(0, 0, { code: htmlcode.toString() });
                this.recentArray.pop();
            } else {
                this.recentArray.push({ code: htmlcode.toString() });
            }
            localStorage.setItem('recentArray', JSON.stringify(this.recentArray));
        }
    }

    searchTemplate() {
        this.startNum = 0;
        this.btnIndex = 0;
        this.ifScroll = 1;
        this.htmlCodes = [];
        this.recentType = false;
        this.getList(this.startNum, this.btnIndex, this.keyValue);
    }
    recentlyUsed() {
        this.btnIndex = 0;
        this.ifScroll = 0;
        this.recentType = true;
        this.htmlCodes = JSON.parse(localStorage.getItem('recentArray'));
        angular.forEach(this.htmlCodes, (v, k) => {
            this.htmlCodes[k].code = this.$sce.trustAsHtml(this.htmlCodes[k].code);
        });
    }
    scrollList() {
        if (this.ifScroll) {
            const divscroll = document.getElementById('component-list-box');
            const scrollTop = divscroll.scrollTop;//页面上卷的高度scrollTop
            const wholeHeight = divscroll.scrollHeight;//页面底部到顶部的距离
            const divHeight = divscroll.clientHeight;//页面可视区域的高度
            if (scrollTop + divHeight >= wholeHeight && this.totalNum > (this.startNum + this.pageNum)) {
                this.startNum = this.startNum + this.pageNum;
                this.getList(this.startNum, this.btnIndex, this.keyValue);
            }
        }
    }
}

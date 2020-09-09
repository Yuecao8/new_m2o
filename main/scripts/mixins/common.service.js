import { dispatch, getInjector } from 'vendor';


let configContent;
if (window.CONFIG.custom_sign) {
    $.getJSON(`../../../../../../libs/${window.CONFIG.custom_sign}.json?_v=${window.Hg_Version}`, (data) => {
        configContent = data;
    });
}

const inject = getInjector();
const $stateParams = inject.get('$stateParams');

export default class {
    static $inject = ['http', 'config', 'myUtils', '$interval', '$state', '$location', 'ContentService'];
    constructor(...$inject) {
        dispatch(this, $inject);
        //轮询可编辑
        this.is_edit = $stateParams.type;
        this.username = '';
        this.translate_mw = '';
        this.translate_zw = '';
        this.pageOptions = {
            pageCur: $stateParams.page === undefined ? 1 : $stateParams.page,
            pageSize: $stateParams.per_num === undefined ? 10 : $stateParams.per_num,
            pageNum: 1,
            total: 0,
        };
        // 协同跳转 2.18
        if (this.$location.search().hideSynergyKind || window.sessionStorage.getItem('hideSynergyKind')) {
            this.hideAccessKind = true;
        } else {
            this.hideAccessKind = false;
        }
        //遵义权限
        if (configContent && configContent.is_zy_special) {
            this.zyPermissions = configContent.is_zy_special ? 1 : 0;
        }
        //温州人 快点温州上报
        if (configContent && configContent.show_report) {
            this.show_report = configContent.show_report;
        } else {
            this.show_report = false;
        }
    }
    _goEdit(obj, tips) {
        this.is_edit = $stateParams.type;
        // 有上报功能 且上报状态为“成功”,“待审核”的 不可编辑
        if ((obj.report_status === 3 || obj.report_status === 1) && this.is_edit == 'article' && this.show_report) {
            this.myUtils.newHogeTip({
                msg: '该稿件已上报，暂不可编辑，请打回后再编辑',
            });
            return;
        }
        if (this.zyPermissions) {
            if (!obj.can_operate || !obj.can_edit) {
                obj.onlyRead = 2;
            } else if (({}.hasOwnProperty.call(obj, 'audit') && obj.audit != null && obj.audit.id && obj.status != 4 && !obj.audit.edit_status)) {
                obj.onlyRead = 1;
            } else {
                obj.onlyRead = null;
            }
            this.loading = true;
            if (obj.is_headline == 1) {
                obj.onlyRead = 1;
                obj.hotList = true;
            }
        } else {
            this.newPermission = JSON.parse(window.sessionStorage.getItem('permission'));
            if (this.newPermission.all_prms == 0) {
                if (this.newPermission.prms && this.newPermission.prms.length > 0) {
                    if (this.newPermission.prms.indexOf(`${this.is_edit}-update`) < 0) {
                        obj.onlyRead = 2;
                    }
                }
            } else if (!obj.can_operate) {
                obj.onlyRead = 2;
            } else if (({}.hasOwnProperty.call(obj, 'audit') && obj.audit != null && obj.audit.id && obj.status != 4 && !obj.audit.edit_status)) {
                obj.onlyRead = 1;
            } else {
                obj.onlyRead = null;
            }
            this.loading = true;
            if (obj.is_headline == 1 && !obj.can_edit_headline) {
                obj.onlyRead = 1;
                obj.hotList = true;
            }
        }
        if (tips == 'zw') {
            this.translate_zw = 1;
        } else if (tips == 'mw') {
            this.translate_mw = 1;
        } else {
            this.translate_mw = '';
            this.translate_zw = '';
        }
        //检测当前稿件是否可以编辑
        if (obj.id) {
            const param = {
                type: this.is_edit,
                origin_id: obj.id,
            };
            if (tips == 'zw') {
                this.translate_zw = 1;
            } else if (tips == 'mw') {
                this.translate_mw = 1;
            } else {
                this.translate_mw = '';
            }
            this.ContentService.getEditstatus(param)
                .then((res) => {
                    this.is_edit = res.data.is_edit;
                    this.username = res.data.user_name;
                    if (!this.is_edit) {
                        this.myUtils.newHogeTip({
                            msg: `${this.username}正在编辑中,请稍后重试!`,
                        });
                        this.loading = false;
                        return;
                    }
                    switch (obj.type) {
                    case 'article':
                        if ((obj.article_type === 'common' || obj.article_type === 'weixin' || obj.article_type === 'broadcast') && this.is_edit) {
                            this.$state.go('app.content.news', { translate_mw: this.translate_mw, translate_zw: this.translate_zw, id: obj.id, read: obj.onlyRead, status: obj.status, page: $stateParams.page, pageSize: this.pageOptions.pageSize, typeFlag: obj.article_type, hotList: obj.hotList, listSearch: $stateParams.title, hideSynergyKind: this.hideAccessKind ? true : null, project_id: $stateParams.project_id ? $stateParams.project_id : null, project_title: $stateParams.project_title, module_type: $stateParams.article_type, module_status: $stateParams.status, language: obj.language, category_id: $stateParams.category_id, date_search: $stateParams.date_search, start_time: $stateParams.start_time, end_time: $stateParams.end_time, full_text_search: $stateParams.full_text_search });
                        } else if (obj.article_type === 'tv' && this.is_edit) {
                            this.$state.go('app.content.tvnews', { translate_mw: this.translate_mw, translate_zw: this.translate_zw, id: obj.id, read: obj.onlyRead, status: obj.status, page: $stateParams.page, pageSize: this.pageOptions.pageSize, hotList: obj.hotList, listSearch: $stateParams.title, hideSynergyKind: this.hideAccessKind ? true : null, project_id: $stateParams.project_id ? $stateParams.project_id : null, project_title: $stateParams.project_title, module_type: $stateParams.article_type, module_status: $stateParams.status, language: obj.language, category_id: $stateParams.category_id, date_search: $stateParams.date_search, start_time: $stateParams.start_time, end_time: $stateParams.end_time, full_text_search: $stateParams.full_text_search });
                        } else if (obj.article_type === 'weibo' && this.is_edit) {
                            this.$state.go('app.content.wbnews', { translate_mw: this.translate_mw, translate_zw: this.translate_zw, id: obj.id, read: obj.onlyRead, status: obj.status, page: $stateParams.page, pageSize: this.pageOptions.pageSize, hotList: obj.hotList, listSearch: $stateParams.title, hideSynergyKind: this.hideAccessKind ? true : null, project_id: $stateParams.project_id ? $stateParams.project_id : null, project_title: $stateParams.project_title, module_type: $stateParams.article_type, module_status: $stateParams.status, language: obj.language, category_id: $stateParams.category_id, date_search: $stateParams.date_search, start_time: $stateParams.start_time, end_time: $stateParams.end_time, full_text_search: $stateParams.full_text_search });
                        }
                        break;
                    case 'gallery':
                        this.$state.go('app.content.atlas', { translate_mw: this.translate_mw, translate_zw: this.translate_zw, id: obj.id, read: obj.onlyRead, status: obj.status, page: $stateParams.page, pageSize: this.pageOptions.pageSize, hotList: obj.hotList, listSearch: $stateParams.title, hideSynergyKind: this.hideAccessKind ? true : null, project_id: $stateParams.project_id ? $stateParams.project_id : null, project_title: $stateParams.project_title, module_status: $stateParams.status, language: obj.language, category_id: $stateParams.category_id, date_search: $stateParams.date_search, start_time: $stateParams.start_time, end_time: $stateParams.end_time });
                        this.loading = false;
                        break;
                    case 'video':
                        this.$state.go('app.content.video', { translate_mw: this.translate_mw, translate_zw: this.translate_zw, id: obj.id, read: obj.onlyRead, status: obj.status, page: $stateParams.page, pageSize: this.pageOptions.pageSize, hotList: obj.hotList, listSearch: $stateParams.title, hideSynergyKind: this.hideAccessKind ? true : null, project_id: $stateParams.project_id ? $stateParams.project_id : null, project_title: $stateParams.project_title, module_status: $stateParams.status, language: obj.language, category_id: $stateParams.category_id, date_search: $stateParams.date_search, start_time: $stateParams.start_time, end_time: $stateParams.end_time });
                        this.loading = false;
                        break;
                    case 'audio':
                        this.$state.go('app.content.audio', { translate_mw: this.translate_mw, translate_zw: this.translate_zw, id: obj.id, read: obj.onlyRead, status: obj.status, page: $stateParams.page, pageSize: this.pageOptions.pageSize, hotList: obj.hotList, listSearch: $stateParams.title, hideSynergyKind: this.hideAccessKind ? true : null, project_id: $stateParams.project_id ? $stateParams.project_id : null, project_title: $stateParams.project_title, module_status: $stateParams.status, language: obj.language, category_id: $stateParams.category_id, date_search: $stateParams.date_search, start_time: $stateParams.start_time, end_time: $stateParams.end_time });
                        this.loading = false;
                        break;
                    case 'link':
                        this.$state.go('app.content.outlink', { translate_mw: this.translate_mw, translate_zw: this.translate_zw, id: obj.id, read: obj.onlyRead, status: obj.status, page: $stateParams.page, pageSize: this.pageOptions.pageSize, hotList: obj.hotList, listSearch: $stateParams.title, hideSynergyKind: this.hideAccessKind ? true : null, project_id: $stateParams.project_id ? $stateParams.project_id : null, project_title: $stateParams.project_title, module_status: $stateParams.status, language: obj.language, category_id: $stateParams.category_id });
                        this.loading = false;
                        break;
                    case 'topic':
                        this.$state.go('app.content.special', { translate_mw: this.translate_mw, translate_zw: this.translate_zw, id: obj.id, read: obj.onlyRead, status: obj.status, page: $stateParams.page, pageSize: this.pageOptions.pageSize, hotList: obj.hotList, listSearch: $stateParams.title, hideSynergyKind: this.hideAccessKind ? true : null, project_id: $stateParams.project_id ? $stateParams.project_id : null, project_title: $stateParams.project_title, module_status: $stateParams.status, language: obj.language, category_id: $stateParams.category_id });
                        this.loading = false;
                        break;
                    case 'youliao':
                        this._getyouliaoDetail(obj);
                        this.loading = false;
                        break;
                    default:
                    }
                });
        }
    }
    _getyouliaoDetail(obj) {
        const param = {
            id: obj.id,
        };
        this.ContentService.getyouliaoDetail(param)
            .then((data) => {
                this.youliaoDetail = data;
            });
    }
}

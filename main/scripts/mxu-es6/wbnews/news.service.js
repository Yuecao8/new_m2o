import { dispatch } from 'vendor';

export default class {
    static $inject = ['http', 'config', 'myUtils'];

    constructor(...$inject) {
        dispatch(this, $inject);
    }
    handles(result) {
        if (!result) return false;
        if (result.error_code || result.error_message) {
            this.myUtils.newHogeTip({
                msg: result.error_message || this.config.error_tip,
            });
            return false;
        }
        return result.data;
    }
    getSystem() {
        return this.http(this.config.getUrl('system_set'))
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                return {};
            }
            return result;
        });
    }
    goUrl(param) {
        const url = this.config.getUrl('template_preview_url');
        return this.http(url, param)
            .then((result) => {
                if (!result) return result;
                if (result.error_code || result.error_message) {
                    this.myUtils.newHogeTip({
                        msg: result.error_message || this.config.error_tip,
                    });
                    return result;
                }
                return result;
            });
    }
    /**引用图片**/
    newsUpimg(param) {
        const url = this.config.getUrl('news_upimg');
        return this.http(url, param, 'post')
            .then(result => this.handles(result));
    }
    upLoadImg(param) {
        const url = this.config.getUrl('content_imgUpload');
        return this.http(url, param, 'post')
            .then(result => this.handles(result));
    }
    search(param) {
        return this.http(this.config.getUrl('search_cover'), param)
            .then(result => this.handles(result));
    }
    /**引用视频**/
    //视频
    newsUpVideo(param) {
        const url = this.config.getUrl('video_upload');
        return this.http(url, param, 'post')
            .then(result => this.handles(result));
    }
    /**素材引用**/
    //分类操作
    getClassify(param) {
        const url = this.config.getUrl('content_classify_list');
        return this.http(url, param)
            .then(result => this.handles(result));
    }
    getList(params, type) {
        let url = '';
        switch (type) {
        case 'gallery':
            url = this.config.getUrl('gallery_list');
            break;
        case 'video':
            url = this.config.getUrl('video_list');
            break;
        case 'audio':
            url = this.config.getUrl('audio_list');
            break;
        default:
            break;
        }
        return this.http(url, params)
            .then(result => this.handles(result));
    }
    postMaterial(param) {
        const url = this.config.getUrl('material_post');
        return this.http(url, param, 'post')
            .then(result => this.handles(result));
    }
    deleteMedia(param) {
        const url = this.config.getUrl('upload_indexpic');
        return this.http(url, param, 'DELETE')
            .then((result) => {
                if (!result) return {};
                if (result.error_code || result.error_message) {
                    this.myUtils.newHogeTip({
                        msg: result.error_message || this.config.error_tip,
                    });
                    return {};
                }
                return result;
            });
    }
    getResourceHtml(param) {
        const url = `${this.config.getUrl('article_quote')}/${param}`;
        return this.http(url)
            .then((result) => {
                if (!result) return {};
                if (result.error_code || result.error_message) {
                    this.myUtils.newHogeTip({
                        msg: result.error_message || this.config.error_tip,
                    });
                    return {};
                }
                return result.data;
            });
    }
    materialSave(param) {
        const url = this.config.getUrl('article_attach');
        return this.http(url, param, 'POST')
            .then((result) => {
                if (!result) return {};
                if (result.error_code || result.error_message) {
                    this.myUtils.newHogeTip({
                        msg: result.error_message || this.config.error_tip,
                    });
                    return {};
                }
                return result.data;
            });
    }
    downLoad(param) {
        const url = this.config.getUrl('article_download_url');
        return this.http(url, param)
            .then((result) => {
                if (!result) return {};
                if (result.error_code || result.error_message) {
                    this.myUtils.newHogeTip({
                        msg: result.error_message || this.config.error_tip,
                    });
                    return {};
                }
                return result;
            });
    }

    getAtlas(param, count) {
        const url = this.config.getUrl('tuji_tuji_img').replace('{id}', param);
        return this.http(url, { per_num: count })
            .then((result) => {
                if (!result) return {};
                if (result.error_code || result.error_message) {
                    this.myUtils.newHogeTip({
                        msg: result.error_message || this.config.error_tip,
                    });
                    return {};
                }
                return result;
            });
    }
    getVideoDetail(id) {
        const url = `${this.config.getUrl('vod_detail')}/${id}`;
        return this.http(url)
            .then((result) => {
                if (result.error_code || result.error_message) {
                    this.myUtils.newHogeTip({
                        msg: result.error_message || this.config.error_tip,
                    });
                    return {};
                }
                return result.data;
            });
    }
    getAudioDetail(id) {
        const url = `${this.config.getUrl('audio_detail')}/${id}`;
        return this.http(url)
            .then((result) => {
                if (result.error_code || result.error_message) {
                    this.myUtils.newHogeTip({
                        msg: result.error_message || this.config.error_tip,
                    });
                    return {};
                }
                return result.data;
            });
    }
    toggled(param) {
        return this.http(this.config.getUrl('content_history'), param)
            .then((result) => {
                if (result.error_code || result.error_message) {
                    this.myUtils.newHogeTip({
                        msg: result.error_message || this.config.error_tip,
                    });
                    return {};
                }
                return result;
            });
    }
    getHisroyList(id) {
        const url = `${this.config.getUrl('content_history')}/${id}`;
        return this.http(url)
            .then((result) => {
                if (result.error_code || result.error_message) {
                    this.myUtils.newHogeTip({
                        msg: result.error_message || this.config.error_tip,
                    });
                    return {};
                }
                return result;
            });
    }
    getCompareHistory(param) {
        return this.http(this.config.getUrl('compare_history'), param, 'post')
        .then((result) => {
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                return {};
            }
            return result;
        });
    }
    // 获取样式模板分类
    getTemCategory() {
        return this.http(this.config.getUrl('template_category'))
        .then((result) => {
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                return {};
            }
            return result;
        });
    }
    getWxTemList(params) {
        return this.http(this.config.getUrl('wxtemplate_list'), params)
        .then((result) => {
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                return {};
            }
            return result;
        });
    }
    // 获取样式模板列表
    getArticleTemplate(params) {
        return this.http(this.config.getUrl('article_template'), params)
        .then((result) => {
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                return {};
            }
            return result;
        });
    }

    //获取当前流程状态
    getProgress(params) {
        return this.http(this.config.getUrl('process_item'), params)
        .then((result) => {
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                return {};
            }
            return result;
        });
    }

    //获取评论列表内容
    getComment(id) {
        const url = this.config.getUrl('review_comment');
        return this.http(`${url}?content_id=${id}`)
        .then((result) => {
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                return {};
            }
            return result;
        });
    }

    //获取评论列表内容
    setComment(param) {
        const url = this.config.getUrl('review_comment');
        return this.http(url, param, 'POST')
            .then((result) => {
                if (result.error_code || result.error_message) {
                    this.myUtils.newHogeTip({
                        msg: result.error_message || this.config.error_tip,
                    });
                    return {};
                }
                return result;
            });
    }

    //审稿日志
    getAuditLog(id, originId, type) {
        const url = `${this.config.getUrl('audit_log')}?content_id=${id}&origin_id=${originId}&type=${type}`;
        return this.http(url)
            .then((result) => {
                if (result.error_code || result.error_message) {
                    this.myUtils.newHogeTip({
                        msg: result.error_message || this.config.error_tip,
                    });
                    return {};
                }
                return result;
            });
    }
    getAuditList() {
        return this.http(this.config.getUrl('current_process'))
            .then((result) => {
                if (result.error_code || result.error_message) {
                    this.handlerError(result.error_message);
                    return {};
                }
                return result;
            });
    }
    getAudit(id) {
        return this.http(this.config.getUrl('default_process').replace('{id}', id), {}, 'put')
            .then((result) => {
                if (result.error_code || result.error_message) {
                    this.handlerError(result.error_message);
                    return {};
                }
                return result;
            });
    }
    searchTitle(params) {
        let url = '';
        url = this.config.getUrl('article_list');
        return this.http(url, params)
            .then((result) => {
                if (result.error_code || result.error_message) {
                    console.warn(result.error_message || this.config.error_tip);
                    return {};
                }
                return result.data;
            });
    }
    // 获取默认流程
    getProcessDefault() {
        return this.http(this.config.getUrl('zy_default_process'))
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                // this.myUtils.newHogeTip({
                //     msg: result.error_message || this.config.error_tip,
                // });
                return {};
            }
            return result;
        });
    }
    // 标签保存
    saveLabel(param) {
        return this.http(this.config.getUrl('content_bind'), param, 'post')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                return {};
            }
            return result;
        });
    }
    // 屏蔽词校验
    checkBanWord(param) {
        return this.http(this.config.getUrl('check_ban_word'), param, 'post')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                return {};
            }
            return result;
        });
    }

}

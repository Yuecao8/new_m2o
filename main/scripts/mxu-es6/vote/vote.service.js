import { dispatch } from 'vendor';

export default class {
    static $inject = ['http', 'config', 'myUtils'];

    constructor(...$inject) {
        dispatch(this, $inject);
    }


    getClassList(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('vote_class_list'), param, 'get')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
    creatClass(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('vote_class_list'), param, 'post')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
    upDataClass(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('vote_class_list'), param, 'put')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
    deleteClass(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('vote_class_list'), param, 'DELETE')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
    sortClass(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('categorySort'), param, 'put')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }

    creatVote(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('creat_vote'), param, 'post')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
    upDateVote(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('creat_vote'), param, 'put')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
    // 投票详情
    getVoteDetail(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('voteDetail'), param, 'get')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
    //获取投票分组
    getVGroup(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('voteGroup'), param, 'get')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
    //创建投票分组
    creatVGroup(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('voteGroup'), param, 'post')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
   //创建投票分组
    deleteVGroup(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('voteGroup'), param, 'delete')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
     //编辑投票分组
    editVGroup(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('voteGroup'), param, 'put')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
    //移动投票分组
    moveVGroup(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('moveGroup'), param, 'put')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
    //排序分组
    sortVGroup(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('sortGroup'), param, 'put')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
    // 投票结果详情
    getResultsDetail(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('results_detail'), param, 'get')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }
    getVRecords(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('vote_records'), param, 'get')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }


    getList(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('creat_vote'), param, 'get')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }

    // 投票删除

    deleVote(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('creat_vote'), param, 'delete')
        .then((result) => {
            if (!result) return {};
            if (result.error_code || result.error_message) {
                this.myUtils.newHogeTip({
                    msg: result.error_message || this.config.error_tip,
                });
                console.warn(result.error_message || this.config.error_tip);
                return {};
            }
            return result.data;
        });
    }

    votePreview(param) {
        return this.http(this.config.getUrl('vote_preview'), param, 'get')
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
    getGOptions(param) {
        return this.http(this.config.getUrl('getGroupOpt'), param, 'get')
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
    controlGroupSwitch(param) {
        param.singleChoseSite = true;
        return this.http(this.config.getUrl('groupSwitch'), param, 'put')
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


}

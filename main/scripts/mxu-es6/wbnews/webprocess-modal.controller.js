import { dispatch } from 'vendor';


export default class {
    static $inject = ['$scope', 'myUtils', '$uibModalInstance', 'param', 'newsService'];
    constructor(...$inject) {
        dispatch(this, $inject);
        this.audit_show = true;
        $('.pace-done').css('overflow-y', 'hidden');
        this.checkDefault = false;
        this.audit_id = '';
        this.argument = {
            content_id: this.param.id,
            content_type: this.param.type,
            client_id: 1,
        };
        this.getProcessList();
        this.showPC = true;
    }

    getProcessList() {
        this.processList = [];
        this.newsService.getAuditList()
            .then((data) => {
                this.auditList = [];
                this.processList = data.data;
                this.processList.forEach((process) => {
                    process.updated_at = moment(process.updated_at).format('MM-DD HH:mm');
                    process.nodes.forEach((node) => {
                        node.rangeName = node.range == 1 ? '全体用户' : (node.range == 2 ? '指定用户' : '指定角色');
                        if (node.users[0]) {
                            node.users.forEach((user) => {
                                if (!user.avatar) {
                                    if (new RegExp('[\u4E00-\u9FA5]+').test(user.name)) {
                                        // user.avatarName = user.name.slice(-2);
                                        user.avatarName = user.name.substr(-2, user.name.length);
                                    }
                                    if (new RegExp('[A-Za-z]+').test(user.name)) {
                                        user.avatarName = user.name.substr(1);
                                    }
                                    user.bgColor = Math.floor(Math.random() * 3);
                                }
                            });
                        }
                    });
                    if (process.nodes.length <= 5) {
                        process.ellipsis = false;
                        process.showNodes = angular.copy(process.nodes);
                    } else {
                        process.ellipsis = true;
                        process.showNodes = angular.copy(process.nodes.slice(0, 4));
                        const lastNode = process.nodes.slice(process.nodes.length - 1, process.nodes.length);
                        process.showNodes.push({ range: 0 });
                        process.showNodes.push(lastNode[0]);
                    }
                    if (process.default) {
                        process.default = true;
                        process.select_default = true;
                        this.auditList.push(process);
                        this.audit_id = process.id;
                    } else {
                        process.default = false;
                        process.select_default = false;
                    }
                });
            });
    }
    getList() {
        this.audit_show = !this.audit_show;
        this.getProcessList();
    }
    check(item) {
        this.audit_id = item.id;
    }
    getAudit() {
        if (this.checkDefault) {
            this.newsService.getAudit(this.audit_id)
            .then(() => {
                this.myUtils.newHogeTip({
                    type: 'success',
                    msg: '设置默认审稿流程成功！',
                });
            });
        }
        this.setAuditList(this.audit_id);
    }
    setAuditList(id) {
        this.auditList = [];
        this.processList.forEach((process) => {
            if (process.id == id) {
                this.auditList.push(process);
                this.audit_id = process.id;
            }
        });
        this.audit_show = !this.audit_show;
    }

    close() {
        this.$uibModalInstance.dismiss('cancel');
        $('.pace-done').css('overflow-y', 'visible');
    }
    submit() {
        this.$uibModalInstance.close(this.auditList);
        $('.pace-done').css('overflow-y', 'visible');
    }
}

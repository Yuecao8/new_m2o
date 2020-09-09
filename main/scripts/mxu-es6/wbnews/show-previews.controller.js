import { dispatch, getInjector } from 'vendor';

const injector = getInjector();
const $stateParams = injector.get('$stateParams');

export default class {
    static $inject = ['$scope', 'myUtils', '$uibModalInstance', 'param', '$stateParams', 'newsService'];
    constructor(...$inject) {
        dispatch(this, $inject);
        this.loading = true;
        this.width = '380px';
        this.title = this.param.title;
        this.argument = {
            content_id: $stateParams.id,
            content_type: 'article',
            client_id: 3,
        };
        this.getUrl(this.argument);
        this.showPC = false;
    }

    getUrl(param) {
        this.newsService.goUrl(param).then((data) => {
            if (!data.error_code) {
                $('#frame_namess').remove();
                $(`<iframe id="frame_namess" ng-show="!vm.loading" frameborder="0" width="${this.width}" height="100%" src="${data.data}"></iframe>`).appendTo('#frame_src');
                const frame = document.getElementById('frame_namess');
                if (frame.attachEvent) {
                    frame.attachEvent('onload', () => {
                        this.$scope.$apply(() => {
                            this.loading = false;
                        });
                    });
                } else {
                    frame.onload = () => {
                        this.$scope.$apply(() => {
                            this.loading = false;
                        });
                    };
                }
            }
        });
    }

    select(obj) {
        if (obj == 'PC') {
            this.loading = true;
            this.showPC = true;
            this.width = '100%';
            const param = {
                content_id: $stateParams.id,
                content_type: 'article',
                client_id: 1,
            };
            this.getUrl(param);
        } else {
            this.width = '380px';
            this.loading = true;
            this.showPC = false;
            const param = {
                content_id: $stateParams.id,
                content_type: 'article',
                client_id: 3,
            };
            this.getUrl(param);
        }
    }

    close() {
        this.$uibModalInstance.dismiss('cancel');
    }
}

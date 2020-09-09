export default {
    template: `
       <div class="video-pre new-material-pre" ng-cloak ng-if="vm.stateType == 'video'" >
            <div class="pre-body" my-loading="vm.atlasLoading">
                <div class="header">
                    <span class="title">{{vm.preTitle}}</span>
                    <i class="fa fa-remove close-icon" ng-click="vm.preClose()"></i>
                </div>
                <div class="media-body">
                    <video controls="" preload="true" ng-poster="{{vm.videoImg}}" src="{{vm.video}}"></video>
                </div>
            </div>
        </div>
        
    `,
    bindings: {
        stateType: '<',
        atlasLoading: '<',
        preTitle: '<',
        video: '=',
        videoImg: '=',
        newsMaterialPre: '=',
        preClose: '&',
    },
    controllerAs: 'vm',
    controller: ['newsService', class {
        constructor(newsService) {
            this.newsService = newsService;
        }

    }],
};


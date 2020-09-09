export default {
    template: `
        <div class="new-material-pre" ng-cloak ng-if="vm.stateType == 'gallery' || vm.stateType == 'image'">
            <div class="pre-body" my-loading="vm.atlasLoading">
                <div class="header">
                    <span class="title">{{vm.preTitle}}</span>
                    <i class="fa fa-remove close-icon" ng-click="vm.preClose()"></i>
                </div>
                <div class="img-body">
                    <div class="top-swiper">
                        <div class="swiper-container gallery-top">
                            <div class="swiper-wrapper">
                                <div class="swiper-slide" id="top-{{v.index}}" ng-repeat="(index,img) in vm.atlas" ng-style="{'background-image': 'url(' + img.photo_url + ')'}"></div>
                            </div>
                            <div class="turn-right">
                                <i class="fa typeface-pagination_shangyiye"></i>
                            </div>
                            <div class="turn-left">
                                <i class="fa typeface-pagination_xiayiye"></i>
                            </div>
                        </div>
                        <div class="gallery-tip" ng-if="!vm.hide">
                            <div class="show-num">
                                <span class="active-index" id="active-index">{{vm.activeIndex}}</span>
                                <span class="slash">/</span>
                                <span class="all-length">{{vm.atlas.length}}</span>
                            </div>
                            <div class="gallery-bref" id="gallery-bref">
                                {{vm.atlas[vm.activeIndex-1].photo_name}}
                            </div>
                            <div class="gallery-icon" ng-click="vm.hideIcon()">
                                <i class="fa typeface-card_zhankai"></i>
                             </div>
                        </div>
                        <div class="gallery-tip-hide" ng-if="vm.hide" ng-click="vm.hideIcon()">
                            <i class="fa typeface-menu_shouqi"></i>
                            <span>显示</span>
                        </div>
                    </div>
        
                    <div class="bottom-swiper">
                        <div class="swiper-container gallery-thumbs">
                            <div class="swiper-wrapper">
                                <div ng-repeat="img in vm.atlas" class="swiper-slide" ng-style="{'background-image': 'url(' + img.photo_url + ')'}"></div>
                            </div>
                        </div>
                    </div>
                    <!-- Swiper end-->
                </div>
                <div class="media-body">
                </div>
            </div>
        </div> 
        
    `,
    bindings: {
        stateType: '<',
        atlasLoading: '<',
        preTitle: '<',
        atlas: '=',
        newsMaterialPre: '=',
        activeIndex: '<',
        preClose: '&',
    },
    controllerAs: 'vm',
    controller: ['newsService', class {
        constructor(newsService) {
            this.newsService = newsService;
        }
        hideIcon() {
            this.hide = !this.hide;
        }


    }],
};


import wbnewsCtrl from './wbnews.controller';
import newsUpImgCtrl from './newsupimg.controller';
import newsMaterialRefCtrl from './newsmaterialref.controller';
// import atlasPre from './atlasPre.component';
// import videoPre from './videoPre.component';
import preResourceCtrl from './preResource.controller';
import newsCutImgCtrl from './newscutimg.controller';
import previewHtmlModalCtrl from './show-previews.controller';
import compareHistroyCtrl from './compare-history.controller';
import webprocessCtrl from './webprocess-modal.controller';
import promptSensitiveCtrl from './../common/prompt-sensitive.controller';
import newsService from './news.service';

angular.module('app')
    .controller('wbnewsCtrl', wbnewsCtrl)
    .controller('newsUpImgCtrl', newsUpImgCtrl)
    .controller('newsCutImgCtrl', newsCutImgCtrl)
    // .component('atlasPre', atlasPre)
    // .component('videoPre', videoPre)
    .controller('preResourceCtrl', preResourceCtrl)
    .controller('newsMaterialRefCtrl', newsMaterialRefCtrl)
    .controller('previewHtmlModalCtrl', previewHtmlModalCtrl)
    .controller('compareHistroyCtrl', compareHistroyCtrl)
    .controller('webprocessCtrl', webprocessCtrl)
    .controller('promptSensitiveCtrl', promptSensitiveCtrl)
    .service('newsService', newsService);

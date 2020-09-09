import voteListCtrl from './voteList.controller';
import voteClassManageCtrl from './voteClassManage.controller';
import previewVoteModalCtrl from './preview/votePreview.controller';
import editVoteCtrl from './editVote.controller';
import creatModalCtrl from './creatModalCtrl.controller';
import detailVoteCtrl from './detailVote.controller';
import mobileGroupCtrl from './mobileGroupCtrl.controller';
import sortGroupCtrl from './sortGroupCtrl.controller';

import voteService from './vote.service';

angular.module('app')
    .controller('voteListCtrl', voteListCtrl)
    .controller('voteClassManageCtrl', voteClassManageCtrl)
    .controller('editVoteCtrl', editVoteCtrl)
    .controller('previewVoteModalCtrl', previewVoteModalCtrl)
    .controller('creatModalCtrl', creatModalCtrl)
    .controller('detailVoteCtrl', detailVoteCtrl)
    .controller('mobileGroupCtrl', mobileGroupCtrl)
    .controller('sortGroupCtrl', sortGroupCtrl)
    .service('voteService', voteService);

// @flow

import {loadData} from './db/cloudant';
import {processData} from './db/parser';

class SocialMediaController {
    getTopics(req, res): void {
        loadData((data) => res.json(processData(data)));
    }
};

export default SocialMediaController;

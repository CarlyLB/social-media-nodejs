// @flow

import Cloudant from 'cloudant';
import dotenv from 'dotenv';
import kwExtractor from "keyword-extractor";
import _ from 'lodash';
import array from 'lodash/array';

// Load authnetication from env vars.
dotenv.config();

let cloudantUrl: ?string = process.env.CLOUDANT_URL;

// Initialize the library with my account.
let cloudant = Cloudant({url: cloudantUrl, plugin: 'retry'});
let twitter = cloudant.db.use('twitter')

export const loadData = (callback: Function): void => {
    twitter.list({include_docs: true}, function (err, data) {
        if (err) {
            throw err;
        } else {
            callback(data);
        }
    });
}

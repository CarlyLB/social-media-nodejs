// @flow

import kwExtractor from "keyword-extractor";
import _ from 'lodash';
import stats from 'stats-lite';
import type {Stats, Topic, WordFreq, Content} from '../types/definitions'

type FirstPass = {
    topic: string,
    keywords: string[],
    sentiment: number,
    anger: number,
    disgust: number,
    fear: number,
    joy: number,
    sadness: number,
    text: string,
    at: number,
    avatar: ?string
};

const keywords = (doc: *) => {
    let keywords = doc.Keywords.filter(kw => kw.relevance > 0.2).map(kw => normaliseWord(kw.text));
    let otherWords = doc.all_words.map(normaliseWord);
    let allWords = _.concat(keywords, otherWords);

    return _.compact(allWords);
}

const normaliseWord = (word: string) => {
    // Replace multiple spaces, urls, and 1-2 letter words
    const clean = word.toLowerCase()
        .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
        .replace(/https?\w+/g, '')
        .replace(/suncorp?\w*/g, '')
        .replace(/(\b((\w|\d){1,2})\b(\s|$))/g, ' ')
        .replace(/\s+/, ' ');

    const noStopWords = kwExtractor.extract(clean, {
        language: "english",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: false,
        return_chained_words: true
    });

    return _.join(noStopWords, ' ').trim();
}

const computeStats = (array: Object[], key: string): Stats => {
    const numbers: number[] = array.map(a => a[key]);

    return {
        avg: stats.mean(numbers),
        min: _.min(numbers),
        max: _.max(numbers),
        qrt1: stats.percentile(numbers, 0.25),
        qrt3: stats.percentile(numbers, 0.75)
    };
}

const computeFreq= (rawTweets: FirstPass[]): WordFreq[] => {
    const agg = {};
    rawTweets.forEach(t => t.keywords.forEach(w => {
            agg[w] = agg[w]? agg[w] + 1 : 1;
    }));
    const sortedPairs: Object[] = _.sortBy(_.toPairs(agg), a => -a[1]);
    const topSortedPairs: Object[] = sortedPairs.slice(0, 5);
    return topSortedPairs.map(a => {
        return {word: a[0], freq: a[1]}
    });
}

const aggegateTopic = (topic: string, rawTweets: FirstPass[]): Topic => {
    let contents: Content[] = rawTweets.map(rt => {
        return {text: rt.text, at: rt.at, sentiment: rt.sentiment, avatar: rt.avatar}
    });
    contents = _.sortBy(contents, c => -c.at);

    return {
        word: topic,
        mentions: rawTweets.length,
        sentiment: computeStats(rawTweets, 'sentiment'),
        sadness: computeStats(rawTweets, 'sadness'),
        joy: computeStats(rawTweets, 'joy'),
        fear: computeStats(rawTweets, 'fear'),
        disgust: computeStats(rawTweets, 'disgust'),
        anger: computeStats(rawTweets, 'anger'),
        wordFreq: computeFreq(rawTweets),
        contents: contents.slice(0,150),
    }
}

export const processData = (data: *): Topic[] => {
    const confidentTopics = data.rows.filter(d => d.doc.topic_confidence > 0.1)

    const cleaned: FirstPass = confidentTopics.map((d) => {
        return ({
            topic: d.doc.topic,
            keywords: keywords(d.doc),
            sentiment: d.doc.sentiment_score,
            anger: d.doc.tone_anger,
            disgust: d.doc.tone_disgust,
            fear: d.doc.tone_fear,
            joy: d.doc.tone_joy,
            sadness: d.doc.tone_sadness,
            text: d.doc.tweet_text,
            at: Date.parse(d.doc.tweet_ts),
            avatar: d.doc.tweet_user_profile_pic_url
        })
    });

    let topicsArr: any = Object.entries(_.groupBy(cleaned, e => e.topic));
    let response = topicsArr.map((a) => aggegateTopic(a[0], a[1]));

    return response;
}

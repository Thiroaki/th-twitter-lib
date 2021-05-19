"use strict";
/*
* 拡張メソッドを用いて独自の処理を実装.
* 参考: https://kakkoyakakko2.hatenablog.com/entry/2018/06/28/003000
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Twitter = __importStar(require("twitter-api-client"));
Twitter.TwitterClient.prototype.getTweetById = async function (id) {
    return await this.tweets.statusesShow({ id: id, include_entities: true, tweet_mode: "extended", trim_user: false });
};
Twitter.TwitterClient.prototype.getTweetByUrl = async function (url) {
    return await this.getTweetById(new URL(url).pathname.match(/\d+$/)[0]);
};
Twitter.TwitterClient.prototype.getUserById = async function (user_id) {
    return await this.accountsAndUsers.usersShow({ user_id: user_id });
};
Twitter.TwitterClient.prototype.getUserByScreenName = async function (screen_name) {
    return await this.accountsAndUsers.usersShow({ screen_name: screen_name });
};
Twitter.TwitterClient.prototype.getUser = async function (user) {
    return await this.accountsAndUsers.usersShow(user);
};
/**
 * ツイートにある動画の、一番ビットレートが高いmp4のURLを返します。
 * 動画が無かったら、空のstringを返します。
 */
Twitter.TwitterClient.prototype.getVideoUrl = function (status) {
    let videoUrl = "";
    if (!status.extended_entities)
        return videoUrl;
    let medias = status.extended_entities.media;
    for (let i = 0; i < medias.length; i++) {
        const media = medias[i];
        if ((media.type == "video" || media.type == "animated_gif") && media.video_info) {
            let variants = media.video_info.variants.filter(v => v.content_type == "video/mp4");
            variants.sort((a, b) => { return b.bitrate - a.bitrate; });
            videoUrl = (variants[0].url);
            break;
        }
    }
    return videoUrl;
};
/**
 * ツイートのメディア(画像や動画)のURLを返します。
 * メディアが無かったら配列は空です。
 */
Twitter.TwitterClient.prototype.getMediaUrls = function (status) {
    let urls = [];
    if (!status.extended_entities)
        return urls;
    let medias = status.extended_entities.media;
    for (const media of medias) {
        if (media.type == "photo") {
            urls.push(media.media_url_https);
        }
        else {
            urls.push(this.getVideoUrl(status));
        }
    }
    return urls;
};
/**
 * フォローしているユーザーのIDを，string配列で返します．
 */
Twitter.TwitterClient.prototype.getFriendsIds = async function (params) {
    params.count = 5000;
    let res = [];
    while (true) {
        let chunk = await this.accountsAndUsers.friendsIds(params);
        if (chunk.next_cursor == 0)
            break;
        res = res.concat(chunk.ids);
        params.cursor = chunk.next_cursor;
    }
    let res_str = res.map(val => val.toString());
    return res_str;
};
/**
 * 指定したIDより未来のユーザーツイート(自分のツイート)を返します．
 */
Twitter.TwitterClient.prototype.getUserTweetsUntilId = async function (tweet_id) {
    let params = {
        count: 200,
        since_id: tweet_id,
        trim_user: false,
        exclude_replies: false,
        include_rts: true,
        tweet_mode: "extended"
    };
    let res = [];
    while (1) {
        let chunk = await this.tweets.statusesUserTimeline(params);
        if (chunk.length == 0)
            break;
        res = res.concat(chunk);
        // chunk の最後の要素の id をセット
        params.max_id = chunk[chunk.length - 1].id;
    }
    return res;
};
/**
 * メディアツイートかどうかを返します．
 */
Twitter.TwitterClient.prototype.hasMedia = function (tweet) {
    // extended_entities is nullable
    if (tweet.extended_entities && tweet.extended_entities.media) {
        return true;
    }
    else {
        return false;
    }
};
exports.default = Twitter;
//# sourceMappingURL=index.js.map
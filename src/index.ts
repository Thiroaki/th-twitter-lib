/*
* 拡張メソッドを用いて独自の処理を実装.
* 参考: https://kakkoyakakko2.hatenablog.com/entry/2018/06/28/003000
*/

import * as Twitter from "twitter-api-client";

declare module "twitter-api-client" {
  interface TwitterClient {
    // メソッドを追加する時は、ここに型を定義して下で実装
    getTweetById(id: string | number): Promise<Twitter.StatusesShowById>;
    getTweetByUrl(url: string): Promise<Twitter.StatusesShowById>;
    getUserById(user_id: string | number): Promise<Twitter.UsersShow>;
    getUserByScreenName(screen_name: string): Promise<Twitter.UsersShow>;
    getUser(params: Twitter.UsersShowParams): Promise<Twitter.UsersShow>;
    getVideoUrl(status: Twitter.StatusesShowById): string;
    getMediaUrls(status: Twitter.StatusesShowById): string[];
    getFriendsIds(params: Twitter.FriendsIdsParams): Promise<string[]>;
    getUserTweetsUntilId(id: string | number): Promise<Twitter.StatusesShowById[]>;
    hasMedia(tweet: Twitter.StatusesShowById): boolean;
  }

  interface StatusesShowById {
    full_text: string;
  }
}


Twitter.TwitterClient.prototype.getTweetById = async function (id: string | number) {
  return await this.tweets.statusesShowById({ id: id, include_entities: true, tweet_mode: "extended", trim_user: false });
}
Twitter.TwitterClient.prototype.getTweetByUrl = async function (url: string) {
  return await this.getTweetById(new URL(url).pathname.match(/\d+$/)![0] as string);
}
Twitter.TwitterClient.prototype.getUserById = async function (user_id: string | number) {
  return await this.accountsAndUsers.usersShow({ user_id: user_id });
}
Twitter.TwitterClient.prototype.getUserByScreenName = async function (screen_name: string) {
  return await this.accountsAndUsers.usersShow({ screen_name: screen_name });
}
Twitter.TwitterClient.prototype.getUser = async function (user: Twitter.UsersShowParams) {
  return await this.accountsAndUsers.usersShow(user);
}

/**
 * ツイートにある動画の、一番ビットレートが高いmp4のURLを返します。
 * 動画が無かったら、空のstringを返します。
 */
Twitter.TwitterClient.prototype.getVideoUrl = function (status: Twitter.StatusesShowById) {
  let videoUrl: string = "";
  if (!status.extended_entities) return videoUrl;
  let medias = status.extended_entities.media;
  for (let i = 0; i < medias.length; i++) {
    const media = medias[i];
    if ((media.type == "video" || media.type == "animated_gif") && media.video_info) {
      let variants = media.video_info.variants.filter(v => v.content_type == "video/mp4");
      variants.sort((a, b) => { return b.bitrate! - a.bitrate! });
      videoUrl = (variants[0].url);
      break;
    }
  }
  return videoUrl;
}

/**
 * ツイートのメディア(画像や動画)のURLを返します。
 * メディアが無かったら配列は空です。
 */
Twitter.TwitterClient.prototype.getMediaUrls = function (status: Twitter.StatusesShowById) {
  let urls: string[] = [];
  if (!status.extended_entities) return urls;
  let medias = status.extended_entities.media;
  for (const media of medias) {
    if (media.type == "photo") {
      urls.push(media.media_url_https);
    } else {
      urls.push(this.getVideoUrl(status))
    }
  }
  return urls;
}

/**
 * フォローしているユーザーのIDを，string配列で返します．
 */
Twitter.TwitterClient.prototype.getFriendsIds = async function (params: Twitter.FriendsIdsParams) {
  params.count = 5000;

  let res: number[] = [];
  while (true) {
    let chunk = await this.accountsAndUsers.friendsIds(params);
    if (chunk.next_cursor == 0) break;
    res = res.concat(chunk.ids);
    params.cursor = chunk.next_cursor;
  }

  let res_str = res.map(val => val.toString());
  return res_str;
}

/**
 * 指定したIDより未来のユーザーツイートを返します．
 */
Twitter.TwitterClient.prototype.getUserTweetsUntilId = async function (id: string | number) {
  let params: Twitter.StatusesUserTimelineParams = {
    count: 200,
    since_id: id,
    trim_user: false,
    exclude_replies: false,
    include_rts: true,
    tweet_mode: "extended"
  };

  let res: Twitter.StatusesUserTimeline[] = [];
  while (1) {
    let chunk = await this.tweets.statusesUserTimeline(params);
    if (chunk.length == 0) break;
    res = res.concat(chunk);
    // chunk の最後の要素の id をセット
    params.max_id = chunk[chunk.length - 1].id;
  }

  return res as Twitter.StatusesShowById[];
}

/**
 * メディアツイートかどうかを返します．
 */
Twitter.TwitterClient.prototype.hasMedia = function (tweet: Twitter.StatusesShowById) {
  // extended_entities is nullable
  if (tweet.extended_entities && tweet.extended_entities.media) {
    return true;
  } else {
    return false;
  }
}

export default Twitter;

/*
* 拡張メソッドを用いて独自の処理を実装.
* 参考: https://kakkoyakakko2.hatenablog.com/entry/2018/06/28/003000
*/

import * as Twitter from "twitter-api-client";

let client: Twitter.TwitterClient;

declare module "twitter-api-client" {
  interface TwitterClient {
    // メソッドを追加する時は、ここに型を定義して下で実装
    getClient(): Twitter.TwitterClient;
    getTweetById(id: string): Promise<Twitter.StatusesShowById>;
    getTweetByUrl(url: string): Promise<Twitter.StatusesShowById>;
    getUserById(user_id: string): Promise<Twitter.UsersShow>;
    getUserByScreenName(screen_name: string): Promise<Twitter.UsersShow>;
    getVideoUrl(status: Twitter.StatusesShowById): string;
    getMediaUrls(status: Twitter.StatusesShowById): string[];
  }

  interface StatusesDestroyById{
    full_text: string;
  }
}
Twitter.TwitterClient.prototype.getClient = () => {
  client = new Twitter.TwitterClient({
    apiKey: process.env.TWITTER_API_KEY as string,
    apiSecret: process.env.TWITTER_API_SECRET as string,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });
  return client;
}
Twitter.TwitterClient.prototype.getTweetById = async (id: string) => {
  return await client.tweets.statusesShowById({ id: id, include_entities: true, tweet_mode: "extended" });
}
Twitter.TwitterClient.prototype.getTweetByUrl = async (url: string) => {
  return await client.getTweetById(new URL(url).pathname.match(/\d+$/)![0] as string);
}
Twitter.TwitterClient.prototype.getUserById = async (user_id: string) => {
  return await client.accountsAndUsers.usersShow({ user_id: user_id });
}
Twitter.TwitterClient.prototype.getUserByScreenName = async (screen_name: string) => {
  return await client.accountsAndUsers.usersShow({ screen_name: screen_name });
}

/**
 * ツイートにある動画の、一番ビットレートが高いmp4のURLを返します。
 * 動画が無かったら、空のstringを返します。
 */
Twitter.TwitterClient.prototype.getVideoUrl = (status: Twitter.StatusesShowById) => {
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
Twitter.TwitterClient.prototype.getMediaUrls = (status: Twitter.StatusesShowById) => {
  let urls: string[] = [];
  if (!status.extended_entities) return urls;
  let medias = status.extended_entities.media;
  for (const media of medias) {
    if (media.type == "photo") {
      urls.push(media.media_url_https);
    }else{
      urls.push(client.getVideoUrl(status))
    }
  }
  return urls;
}

export default Twitter;

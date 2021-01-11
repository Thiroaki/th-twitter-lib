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
Twitter.TwitterClient.prototype.getTweetById = (id: string) => {
  return new Promise((resolve, reject) => {
    client.tweets.statusesShowById({ id: id, include_entities: true, tweet_mode: "extended" })
      .then(res => { resolve(res) })
      .catch(err => { reject("err") });
  });

}
Twitter.TwitterClient.prototype.getTweetByUrl = async (url: string) => {
  let id = new URL(url).pathname.match(/\d+$/)?.[0] as string;
  return client.getTweetById(id);
}
Twitter.TwitterClient.prototype.getUserById = async (user_id: string) => {
  return await client.accountsAndUsers.usersShow({ user_id: user_id });
}
Twitter.TwitterClient.prototype.getUserByScreenName = async (screen_name: string) => {
  return await client.accountsAndUsers.usersShow({ screen_name: screen_name });
}

export default Twitter;

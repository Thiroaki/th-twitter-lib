import * as Twitter from "twitter-api-client";
declare module "twitter-api-client" {
    interface TwitterClient {
        getTweetById(id: string | number): Promise<Twitter.StatusesShow>;
        getTweetByUrl(url: string): Promise<Twitter.StatusesShow>;
        getUserById(user_id: string | number): Promise<Twitter.UsersShow>;
        getUserByScreenName(screen_name: string): Promise<Twitter.UsersShow>;
        getUser(params: Twitter.UsersShowParams): Promise<Twitter.UsersShow>;
        getVideoUrl(status: Twitter.StatusesShow): string;
        getMediaUrls(status: Twitter.StatusesShow): string[];
        getFriendsIds(params: Twitter.FriendsIdsParams): Promise<string[]>;
        getUserTweetsUntilId(id: string | number): Promise<Twitter.StatusesShow[]>;
        hasMedia(tweet: Twitter.StatusesShow): boolean;
    }
}
export default Twitter;

import * as Twitter from "twitter-api-client";
declare module "twitter-api-client" {
    interface TwitterClient {
        getTweetById(id: string | number): Promise<Twitter.StatusesShowById>;
        getTweetByUrl(url: string): Promise<Twitter.StatusesShowById>;
        getUserById(user_id: string | number): Promise<Twitter.UsersShow>;
        getUserByScreenName(screen_name: string): Promise<Twitter.UsersShow>;
        getUser(params: Twitter.UsersShowParams): Promise<Twitter.UsersShow>;
        getVideoUrl(status: Twitter.StatusesShowById): string;
        getMediaUrls(status: Twitter.StatusesShowById): string[];
        getFriendsIds(params: Twitter.FriendsIdsParams): Promise<string[]>;
        getUserTweetsUntilSpecificId(params: Twitter.StatusesUserTimelineParams, id: string | number): Promise<Twitter.StatusesShowById[]>;
        hasMedia(tweet: Twitter.StatusesShowById): boolean;
    }
    interface StatusesShowById {
        full_text: string;
    }
}
export default Twitter;

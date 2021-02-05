import * as Twitter from "twitter-api-client";
declare module "twitter-api-client" {
    interface TwitterClient {
        getClient(): Twitter.TwitterClient;
        getTweetById(id: string): Promise<Twitter.StatusesShowById>;
        getTweetByUrl(url: string): Promise<Twitter.StatusesShowById>;
        getUserById(user_id: string): Promise<Twitter.UsersShow>;
        getUserByScreenName(screen_name: string): Promise<Twitter.UsersShow>;
        getVideoUrl(status: Twitter.StatusesShowById): string;
        getMediaUrls(status: Twitter.StatusesShowById): string[];
    }
    interface StatusesDestroyById {
        full_text: string;
    }
}
export default Twitter;

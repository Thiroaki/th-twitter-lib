"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const id = "1348643773966782465";
const url = "https://twitter.com/hernes_vr/status/1357599045095596032";
let twitter = index_1.default.TwitterClient.prototype.getClient();
// twitter.tweets.statusesShowById({ id: id, include_entities: true, tweet_mode: "extended" })
//   .then(res => { console.log(res) })
//   .catch(err => { console.log(err) });
twitter.getTweetById(id)
    .then(tw => {
    //console.log(tw)
})
    .catch(err => {
    console.log("error");
});
async function m() {
    for (let i = 0; i < 4; i++) {
        let txt = "";
        let tweet = await twitter.getTweetByUrl(url);
        if (!tweet.extended_entities)
            return;
        let medias = tweet.extended_entities.media.concat();
        medias.shift();
        medias.forEach(media => {
            txt += media.media_url_https + "\n";
        });
        console.log(i + txt);
    }
}
m();
//# sourceMappingURL=test.js.map
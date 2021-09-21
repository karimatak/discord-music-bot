const {google} = require('googleapis');


const getYoutubeVideoInfo = async (search) => {
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
    const params = {
        "part": [
            "snippet"
          ],
          "maxResults": 1,
          "order": "viewCount",
          "q": search
    };

    return (await youtube.search.list(params)).data.items[0] ?? getYoutubeVideoInfo("lah in3el ibchi inak");
}

module.exports = getYoutubeVideoInfo;
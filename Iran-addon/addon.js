import { addonBuilder } from "stremio-addon-sdk";

import got from "got";
import * as cheerio from "cheerio";

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
  id: "community.DonyayeSerial",
  version: "0.0.2",
  catalogs: [],
  resources: ["stream"],
  types: ["movie", "series"],
  name: "Iranian Servers",
  description: "To stream from Iranian urls",
  idPrefixes: ["kitsu", "tt"],
};
const builder = new addonBuilder(manifest);

builder.defineStreamHandler(({ type, id }) => {
  console.log("request for streams: " + type + " " + id);
  // Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
  [prefix, series, episode] = id.split(":");

  return getStreams(id).then((streams) => ({ streams }));
});

export default builder.getInterface();

const getStreams = function (id) {
  let streams = [];

  // Naruto Shippuden
  [prefix, series, episode] = id.split(":");
  if (prefix === "kitsu" && series === "1555") {
    const baseURL = `http://dls2.top-movies2filmha.tk/DonyayeSerial/series/Naruto.Shippuuden/`;
    const range = [
      (Math.floor((episode - 1) / 50) * 50 + 1 + "").padStart(3, "0"),
      (Math.floor((episode - 1) / 50) * 50 + 50 + "").padStart(3, "0"),
    ];
    streams = [
      {
        title: "1080p x265 WEBRip AnimeRG mkv",
        url: `${baseURL}${range[0]}-${
          range[1]
        }/1080p.x265.WEBRip/Naruto.Shippuden.${episode.padStart(
          3,
          "0"
        )}.1080p.x265.WEBRip.AnimeRG.DonyayeSerial.mkv`,
        behaviorHints: {
          bingeGroup: "1080p.x265.WEBRip.AnimeRG.DonyayeSerial",
        },
      },
      {
        title: "720p x265 mkv",
        url: `${baseURL}${range[0]}-${
          range[1]
        }/720p.x265/Naruto.Shippuden.${episode.padStart(
          3,
          "0"
        )}.720p.x265.DonyayeSerial.mkv`,
        behaviorHints: {
          bingeGroup: "720p.x265.DonyayeSerial",
        },
      },
    ];
  }

  // The Simpsons
  [series_id, season, episode] = id.split(":");
  if (series_id === "tt0096697") {
    const baseURL =
      "https://img5.downloadha.com/hosein/Animation/October2019/The.Simpsons/";
    if (season < 13) {
      got(baseURL + `S${season.padStart(2, "0")}/`).then((res) => {
        const $ = cheerio.load(res.body);
        $("a").each((i, elem) => {
          const link = elem.attribs.href;
          if (
            link.split(".")[2] ===
            `S${season.padStart(2, "0")}E${episode.padStart(2, "0")}`
          ) {
            streams = [
              {
                title: "DVDRip-jlw mkv",
                url: `${baseURL}S${season.padStart(2, "0")}/${link}`,
                behaviorHints: {
                  bingeGroup: `The.Simpsons.S${season.padStart(2, "0")}`,
                },
              },
            ];
          }
        });
      });
    }
  }
  return Promise.resolve(streams);
};

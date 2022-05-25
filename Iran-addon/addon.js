const { addonBuilder } = require("stremio-addon-sdk");

const got = (...args) => import('got').then(({default: got}) => got(...args));
const cheerio = require("cheerio")
const fs = require('fs');

var lib = {}

// import got from "got";
// import * as cheerio from "cheerio";

const loadLib = ()=>{
  fs.readFile('./lib.json',(err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return 
    }
    console.log('Library imported successfully.');
    lib = JSON.parse(jsonString);
    // console.log(lib);
  })
}
loadLib()

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
  id: "community.DonyayeSerial",
  version: "0.0.3",
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

module.exports = builder.getInterface();

const getStreams = async function (id) {
  let streams = [];

  // check the offline library
  if (lib[id]){
    streams = lib[id];
    console.log("Retrieved from library:", streams);
    return Promise.resolve(streams);
  }

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
          bingeGroup: "Naruto.Shippuden.1080p.x265.WEBRip.AnimeRG.DonyayeSerial",
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
          bingeGroup: "Naruto.Shippuden.720p.x265.DonyayeSerial",
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
      const res = await got(baseURL + `S${season.padStart(2, "0")}/`);
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
                bingeGroup: `The.Simpsons`,
              },
            },
          ];
        }
      });
    }
  }
  console.log(streams);
  return Promise.resolve(streams);
};

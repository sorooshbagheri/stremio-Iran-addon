const { addonBuilder } = require("stremio-addon-sdk");

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
  id: "community.DonyayeSerial",
  version: "0.0.1",
  catalogs: [],
  resources: ["stream"],
  types: ["movie", "series"],
  name: "DonyayeSerial",
  description: "To stream from Iranian urls",
  idPrefixes: ["kitsu"],
};
const builder = new addonBuilder(manifest);

builder.defineStreamHandler(({ type, id }) => {
  console.log("request for streams: " + type + " " + id);
  // Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
  [prefix, series, episode] = id.split(":");

//   if (prefix === "kitsu" && series === "1555") {
//     return Promise.resolve({ streams: getStreams(id) });
//   }
  return getStreams(id).then(streams => ({streams}))
});

module.exports = builder.getInterface();

const getStreams = function (id) {
  [_, series, episode] = id.split(":");
  let streams = []
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
      },
      {
        title: "720p x265 mkv",
        url: `${baseURL}${range[0]}-${
          range[1]
        }/720p.x265/Naruto.Shippuden.${episode.padStart(
          3,
          "0"
        )}.720p.x265.DonyayeSerial.mkv`,
      },
    ];
  }
  return Promise.resolve(streams);
};

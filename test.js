const got = (...args) => import("got").then(({ default: got }) => got(...args));
const cheerio = require("cheerio");

const getStreams = async function (id) {
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
                            url: `${baseURL}S${season.padStart(
                                2,
                                "0"
                            )}/${link}`,
                            behaviorHints: {
                                bingeGroup: `The.Simpsons.S${season.padStart(
                                    2,
                                    "0"
                                )}`,
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

const getAlmasMovieStreams = async function (id) {
    let streams = [];
    [series_id, season, episode] = id.split(":");

    if (season) {
        //sereis
        const baseURL = "http://iamnotindangeriamthedanger.website/filmgir/?i=";
        for (let q = 1; q < 11; q++) {
            const res = await got(baseURL + `${series_id}&f=${season}&q=${q}`);
            const $ = cheerio.load(res.body);
            const title = $("div.mb-2").text();
            if (title) {
                console.log(title);
                $("div.my-1").each((i, elem) => {
                    if (i == (episode - 1)) {
                        // console.log(elem.children[0].attribs.href);
                        streams.push({
                            title: title,
                            url: `${elem.children[0].attribs.href}`,
                            behaviorHints: {
                                bingeGroup: series_id + " " + title,
                            },
                        });
                    }
                });
            }
        }
    } else {
        //movies
        const baseURL = "https://filmgirbot.site/?showitem=";
        const res = await got(baseURL + `${id}`);
        const $ = cheerio.load(res.body);
        $("div.movieLinks p").each((i, elem) => {
            // console.log(elem);
            streams.push({
                title: `${$(`div.movieLinks p:nth-of-type(${i+1})`).text()}`,
                url: `${elem.children[1].attribs.href}`,
            });
        });
    }
    console.log(streams);
    return Promise.resolve(streams);
};

getAlmasMovieStreams("tt10640346");

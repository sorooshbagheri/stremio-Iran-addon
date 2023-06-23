const got = (...args) => import("got").then(({ default: got }) => got(...args));
const cheerio = require("cheerio");
const { get } = require("cheerio/lib/api/traversing");

const winston = require("winston");

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // new winston.transports.Console({}),
        new winston.transports.Http({
            host: "script.google.com",
            path: "/macros/s/AKfycbz2USb0S2F4kOQXEoTn4LJt1F17w2oy1tqd9x0RKdkmPQ13SnnZti1LN1MESB32t9z6/exec",
            // ssl: true,
        }),
    ],
});

const titleLogger = winston.createLogger({
    format: winston.format.combine(winston.format.simple()),
    transports: [
        new winston.transports.Console({}),
        // new winston.transports.Http({
        //     host: "script.google.com",
        //     path: "/macros/s/AKfycbxol4x54hUjrJKDVJv5bvGNaR1H8czsLa5p-O81c0oJkFJKSqoqRtmkC6fT5pGvqnlksQ/exec",
        //     ssl: true,
        // }),
    ],
});

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
                    if (i == episode - 1) {
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
                title: `${$(`div.movieLinks p:nth-of-type(${i + 1})`).text()}`,
                url: `${elem.children[1].attribs.href}`,
            });
        });
    }
    console.log(streams);
    return Promise.resolve(streams);
};

const getAlmasMovieSubs = async function (id) {
    let subs = [];
    [series_id, season, episode] = id.split(":");

    if (season) {
        //sereis subtitles
        const baseURL = "http://iamnotindangeriamthedanger.website/filmgir/?i=";
        for (let q = 1; q < 11; q++) {
            const res = await got(baseURL + `${series_id}&f=${season}&q=${q}`);
            const $ = cheerio.load(res.body);
            const title = $("div.mb-2").text();
            if (title) {
                console.log(title);
                $("div.my-1").each((i, elem) => {
                    if (i == episode - 1) {
                        // console.log(elem.children[2].attribs.href);
                        subs.push({
                            url: `${elem.children[2].attribs.href}`,
                            lang: "farsi",
                        });
                    }
                });
            }
        }
    }
    console.log(subs);
    return Promise.resolve(subs);
};

const recursiveAddStreams = async function (
    streams,
    baseDir,
    seasonFound,
    episode
) {
    console.log("Openning ", baseDir, "...");
    logger.info("Openning ", baseDir, "...");
    res = await got(baseDir);
    $ = cheerio.load(res.body);
    let nodes = $(".list tbody td.n a");
    if (nodes[1].attribs.href.slice(-1) != "/") {
        // there are no further inside directories
        for (let i = 0; i < nodes.length; i++) {
            const elem = nodes[i];
            let link = elem.attribs.href;
            if (
                (seasonFound && i == episode) ||
                (!seasonFound && new RegExp(`E0*${episode}[-.]`).test(link))
            ) {
                titleLogger.info(link);
                let encoding = "",
                    lang = "",
                    dubbed = "",
                    quality = "";
                let size = `💾 ${
                    $(".list tbody td.s code")[i - 1].children[0].data
                }`;
                if (/.*dubbed.*/i.test(link)) {
                    if (/.*\bfa(rsi)\b.*/i.test(link)) {
                        dubbed = "Dubbed";
                        lang = "🇮🇷Fa";
                    }
                }
                let _ = link.match(/\.\d{3,4}p\./);
                if (_) {
                    quality = _[0].slice(1, -1);
                }
                if (link.includes("x265")) encoding = "x265";
                streams.push({
                    name: `IranServer \n ${quality} ${encoding}`,
                    description: `${size} ${lang} ${dubbed}\n${link}\n🔗 DonyayeSerial`,
                    title: link,
                    url: `${baseDir + elem.attribs.href}`,
                    behaviorHints: {
                        notWebReady: true,
                        bingeGroup: series_id + ".donyayeSerial." + baseDir,
                    },
                });
            }
        }
    } else {
        // all links in this dir are directories
        for (let i = 0; i < nodes.length; i++) {
            const elem = nodes[i];
            let link = elem.attribs.href;
            if (i > 0)
                streams = await recursiveAddStreams(
                    streams,
                    baseDir + link,
                    seasonFound,
                    episode
                );
        }
    }
    return streams;
};

const getDonyayeSerialStreams = async function (id) {
    const searchURL =
        "https://donyayeserial.online/wp-admin/admin-ajax.php?action=live_func";
    let streams = [];
    [series_id, season, episode] = id.split(":");
    if (series_id == "kitsu") {
        series_id = await kitsuToName(season);
    }

    //search for page url
    let res = await got(`${searchURL}&keyword=${series_id}`);
    let $ = cheerio.load(res.body);
    let pageURL;
    try {
        pageURL = $("a")["0"].attribs.href;
        console.log(
            `Corresponding DonyayeSerial webpage is found:\n${pageURL}`
        );
        logger.info(
            `Corresponding DonyayeSerial webpage is found:\n${pageURL}`
        );
    } catch (error) {
        return Promise.reject(["Item not found in DonyayeSerial database"]);
    }

    res = await got(pageURL);
    $ = cheerio.load(res.body);
    if (season) {
        //gather links
        let links = [];
        let seasonFound = false;
        console.log(`Corresponding DonyayeSerial directories are found":`);
        logger.info(`Corresponding DonyayeSerial directories are found":`);
        $(".download_box a").each((i, elem) => {
            let link = elem.attribs.href;
            // console.log(link);
            if (link.match(new RegExp("S0*" + season))) {
                links.push(link);
                seasonFound = true;
            }
        });
        if (!seasonFound) {
            $(".download_box a").each((i, elem) => {
                let link = elem.attribs.href;
                links.push(link);
            });
        }

        //find the episode link
        for (const dir of links) {
            streams = await recursiveAddStreams(
                streams,
                dir,
                seasonFound,
                episode
            );
        }
    } else {
        // movies
        $(".download_box a").each((i, elem) => {
            let link = elem.attribs.href;
            if (link.slice(-1) != "/") {
                let title = link.split("/").slice(-1)[0];
                console.log(title);
                logger.info(title);
                titleLogger.info(title);
                let encoding = "",
                    lang = "",
                    dubbed = "";
                size = "";
                quality = "";
                if (/.*\bdubbed\b.*/i.test(link)) {
                    if (/.*\bfa(rsi)\b.*/i.test(link)) {
                        dubbed = "Dubbed";
                        lang = "🇮🇷Fa";
                    }
                }
                if (elem.attribs.title) {
                    size = `💾${elem.attribs.title.split("/").slice(-1)}`;
                    if (/\b\d{3,4}p\b/.test(elem.attribs.title))
                        quality = elem.attribs.title.match(/\b\d{3,4}p\b/)[0];
                }
                if (link.includes("x265")) encoding = "x265";
                streams.push({
                    name: `IranServer \n ${quality} ${encoding}`,
                    description: `${size} ${lang} ${dubbed}\n${title}\n🔗 DonyayeSerial`,
                    title: title,
                    url: `${link}`,
                    behaviorHints: {
                        notWebReady: true,
                    },
                });
            }
        });
    }
    console.log(streams);
    return Promise.resolve(streams);
};

// getDonyayeSerialStreams("kitsu:1555:1");
// getDonyayeSerialStreams("tt0047478"); // seven samurai
// getDonyayeSerialStreams("tt0068646"); // godfather
getDonyayeSerialStreams("tt4633694"); // spiderman
// let _ ="https://dls5.top-movies2filmha.tk/DonyayeSerial/series/Naruto.Shippuden/Dubbed/0001-0050/720p/Naruto.Shippuden.S01E001-002.HDTV.720p.x264.Dubbed.FA.mkv"
// console.log(/.*dubbed.*/i.test(_))

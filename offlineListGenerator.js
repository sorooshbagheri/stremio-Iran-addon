const got = (...args) => import("got").then(({ default: got }) => got(...args));
const cheerio = require("cheerio");
const fs = require("fs");

const lib = {};

const toFile = () => {
    fs.writeFile("lib.json", JSON.stringify(lib), (err) => {
        if (err) {
            console.error(err);
        }
        console.log("JSON data is saved.");
    });
};

const getStreams = async function (id) {
    let streams = [];
    console.log(id);

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
                                bingeGroup: `The.Simpsons`,
                            },
                        },
                    ];
                }
            });
        }
    }
    console.log(streams);

    lib[id] = streams;

    return Promise.resolve(streams);
};

const run = async () => {
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 24; j++) {
            await getStreams(`tt0096697:${i + 1}:${j + 1}`);
        }
    }
    toFile();
};

run();

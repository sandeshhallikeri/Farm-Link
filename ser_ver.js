/*
 * ============================================================
 * FarmLink Mandi Price Backend
 * ============================================================
 *
 * Permanent reliability version:
 * - Loads API key from .env
 * - Persistent mandi cache
 * - 3 automatic retries
 * - 20 second timeout
 * - Uses last successful data if data.gov.in fails
 * - Cache survives server restart
 * - Does not delete good cache during refresh
 *
 * Requires Node.js 18+
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");


/* ============================================================
   LOCAL .ENV LOADER
   ============================================================ */

function loadLocalEnv() {
    try {
        const envPath = path.join(__dirname, ".env");

        if (!fs.existsSync(envPath)) {
            return;
        }

        const lines =
            fs.readFileSync(envPath, "utf8")
                .split(/\r?\n/);

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith("#")) {
                continue;
            }

            const equalsIndex =
                trimmed.indexOf("=");

            if (equalsIndex === -1) {
                continue;
            }

            const key =
                trimmed.slice(0, equalsIndex).trim();

            let value =
                trimmed.slice(equalsIndex + 1).trim();

            if (
                (value.startsWith('"') &&
                 value.endsWith('"')) ||
                (value.startsWith("'") &&
                 value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }

            if (
                key &&
                process.env[key] === undefined
            ) {
                process.env[key] = value;
            }
        }

    } catch (error) {
        console.warn(
            "Could not read .env:",
            error.message
        );
    }
}

loadLocalEnv();


/* ============================================================
   CONFIGURATION
   ============================================================ */

const PORT =
    process.env.PORT || 3000;

const API_KEY =
    String(
        process.env.DATA_GOV_API_KEY || ""
    ).trim();

const RESOURCE_ID =
    "9ef84268-d588-465a-a308-a864a43d0070";

const DATA_API =
    `https://api.data.gov.in/resource/${RESOURCE_ID}`;


/*
 * Fresh cache window:
 * 30 minutes
 */
const CACHE_TTL_MS =
    30 * 60 * 1000;


/*
 * Persistent cache file.
 *
 * This keeps the last successful mandi data
 * even after Node.js is restarted.
 */
const CACHE_FILE =
    path.join(
        __dirname,
        "mandi-cache.json"
    );


/*
 * Network protection.
 */
const FETCH_TIMEOUT_MS =
    20 * 1000;

const MAX_FETCH_ATTEMPTS =
    3;

const RETRY_DELAYS_MS =
    [2000, 5000, 10000];


/*
 * Number of records downloaded.
 */
const DATA_LIMIT =
    5000;


/* ============================================================
   IN-MEMORY CACHE
   ============================================================ */

let mandiCache = {

    records: [],

    total: 0,

    title: "",

    fetchedAt: 0,

    loadingPromise: null
};


/* ============================================================
   PERSISTENT CACHE
   ============================================================ */

function savePersistentCache() {

    try {

        const payload = {

            records:
                mandiCache.records,

            total:
                mandiCache.total,

            title:
                mandiCache.title,

            fetchedAt:
                mandiCache.fetchedAt
        };


        const temporaryFile =
            `${CACHE_FILE}.tmp`;


        fs.writeFileSync(
            temporaryFile,
            JSON.stringify(payload),
            "utf8"
        );


        fs.renameSync(
            temporaryFile,
            CACHE_FILE
        );


        console.log(
            `Persistent mandi cache saved: ${mandiCache.records.length} records.`
        );

    } catch (error) {

        console.warn(
            "Could not save persistent mandi cache:",
            error.message
        );
    }
}


function loadPersistentCache() {

    try {

        if (!fs.existsSync(CACHE_FILE)) {

            console.log(
                "No persistent mandi cache found yet."
            );

            return;
        }


        const raw =
            fs.readFileSync(
                CACHE_FILE,
                "utf8"
            );


        const saved =
            JSON.parse(raw);


        if (
            !saved ||
            !Array.isArray(saved.records) ||
            saved.records.length === 0 ||
            !saved.fetchedAt
        ) {

            console.warn(
                "Persistent mandi cache is invalid; ignoring it."
            );

            return;
        }


        mandiCache.records =
            saved.records;

        mandiCache.total =
            Number(saved.total) ||
            saved.records.length;

        mandiCache.title =
            saved.title ||
            "Current Daily Mandi Prices";

        mandiCache.fetchedAt =
            Number(saved.fetchedAt) ||
            0;


        console.log(
            `Persistent mandi cache loaded: ${mandiCache.records.length} records.`
        );

    } catch (error) {

        console.warn(
            "Could not load persistent mandi cache:",
            error.message
        );
    }
}


function hasAnyCachedData() {

    return (
        Array.isArray(
            mandiCache.records
        ) &&

        mandiCache.records.length > 0 &&

        mandiCache.fetchedAt > 0
    );
}


function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


/* ============================================================
   API KEY CHECK
   ============================================================ */

if (!API_KEY) {

    console.warn("");

    console.warn(
        "WARNING: DATA_GOV_API_KEY is not set."
    );

    console.warn(
        "Set it in the .env file."
    );

    console.warn("");
}


/* ============================================================
   BASIC HELPERS
   ============================================================ */

function sendJson(
    response,
    statusCode,
    data
) {

    const body =
        JSON.stringify(data);


    response.writeHead(
        statusCode,
        {
            "Content-Type":
                "application/json; charset=utf-8",

            "Cache-Control":
                "no-store",

            "Access-Control-Allow-Origin":
                "*"
        }
    );


    response.end(body);
}


function sendText(
    response,
    statusCode,
    text,
    contentType = "text/plain"
) {

    response.writeHead(
        statusCode,
        {
            "Content-Type":
                `${contentType}; charset=utf-8`
        }
    );


    response.end(text);
}


function clean(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value).trim();
}


function matches(
    value,
    selected
) {

    if (!selected) {
        return true;
    }

    return (
        clean(value)
            .toLowerCase() ===
        clean(selected)
            .toLowerCase()
    );
}


/* ============================================================
   COMMODITY GROUP RULES
   ============================================================ */

const GROUP_RULES = [

    {
        group: "Cereals",

        keys: [
            "wheat",
            "paddy",
            "rice",
            "bajra",
            "pearl millet",
            "jowar",
            "sorghum",
            "maize",
            "barley",
            "ragi",
            "cumbu",
            "jau"
        ]
    },

    {
        group: "Pulses",

        keys: [
            "arhar",
            "tur",
            "moong",
            "urad",
            "gram",
            "chana",
            "masur",
            "lentil",
            "peas"
        ]
    },

    {
        group: "Oil Seeds",

        keys: [
            "groundnut",
            "mustard",
            "rapeseed",
            "soyabean",
            "soybean",
            "sunflower",
            "sesamum",
            "sesame",
            "niger",
            "castor",
            "linseed"
        ]
    },

    {
        group: "Fibre Crops",

        keys: [
            "cotton",
            "kapas",
            "jute",
            "mesta"
        ]
    },

    {
        group: "Vegetables",

        keys: [
            "onion",
            "potato",
            "tomato",
            "brinjal",
            "cabbage",
            "cauliflower",
            "gourd",
            "pumpkin",
            "carrot",
            "beetroot",
            "chilli",
            "capsicum",
            "beans",
            "okra",
            "bhindi",
            "cucumber",
            "spinach",
            "radish"
        ]
    },

    {
        group: "Fruits",

        keys: [
            "apple",
            "banana",
            "mango",
            "orange",
            "grape",
            "guava",
            "papaya",
            "pomegranate",
            "watermelon",
            "mosambi",
            "pineapple"
        ]
    },

    {
        group: "Spices",

        keys: [
            "turmeric",
            "coriander",
            "cumin",
            "jeera",
            "pepper",
            "cardamom",
            "ginger",
            "garlic",
            "fenugreek",
            "methi"
        ]
    }
];


function commodityGroup(
    commodity
) {

    const lower =
        clean(commodity)
            .toLowerCase();


    for (const rule of GROUP_RULES) {

        if (
            rule.keys.some(
                key =>
                    lower.includes(key)
            )
        ) {

            return rule.group;
        }
    }


    return "Others";
}


/* ============================================================
   NORMALIZE RECORD
   ============================================================ */

function normalizeRecord(
    record
) {

    return {

        state:
            clean(record.state),

        district:
            clean(record.district),

        market:
            clean(record.market),

        commodity:
            clean(record.commodity),

        variety:
            clean(
                record.variety ||
                record.variety_name ||
                ""
            ),

        grade:
            clean(
                record.grade ||
                ""
            ),

        commodityGroup:
            commodityGroup(
                record.commodity
            ),

        min_price:
            record.min_price,

        max_price:
            record.max_price,

        modal_price:
            record.modal_price,

        arrival_date:
            clean(
                record.arrival_date
            ),

        arrival_quantity:
            record.arrival_quantity ??
            record.arrival_qty ??
            record.arrival ??
            null
    };
}


/* ============================================================
   DATA.GOV.IN
   ============================================================ */

async function fetchDataGovRecords() {

    if (!API_KEY) {

        throw new Error(
            "DATA_GOV_API_KEY is not configured on the server."
        );
    }


    const url =
        new URL(DATA_API);


    url.searchParams.set(
        "api-key",
        API_KEY
    );


    url.searchParams.set(
        "format",
        "json"
    );


    url.searchParams.set(
        "limit",
        String(DATA_LIMIT)
    );


    url.searchParams.set(
        "offset",
        "0"
    );


    let lastError = null;


    for (
        let attempt = 1;
        attempt <= MAX_FETCH_ATTEMPTS;
        attempt++
    ) {

        console.log(
            `Downloading fresh mandi data from data.gov.in (attempt ${attempt}/${MAX_FETCH_ATTEMPTS})...`
        );


        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                () =>
                    controller.abort(),
                FETCH_TIMEOUT_MS
            );


        try {

            const response =
                await fetch(
                    url.toString(),
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json",

                            "User-Agent":
                                "FarmLink-Mandi-Price-Server/1.0"
                        },

                        signal:
                            controller.signal
                    }
                );


            const text =
                await response.text();


            if (!response.ok) {

                if (
                    response.status === 401
                ) {

                    throw new Error(
                        `data.gov.in HTTP 401: API key is invalid or missing. ${text}`
                    );
                }


                if (
                    response.status === 403
                ) {

                    throw new Error(
                        `data.gov.in HTTP 403: API key is not authorised for this resource. ${text}`
                    );
                }


                if (
                    response.status === 429
                ) {

                    throw new Error(
                        "data.gov.in HTTP 429: Rate limit exceeded."
                    );
                }


                if (
                    response.status >= 500
                ) {

                    throw new Error(
                        `data.gov.in HTTP ${response.status}: upstream server error. ${text}`
                    );
                }


                throw new Error(
                    `data.gov.in HTTP ${response.status}: ${text}`
                );
            }


            let data;


            try {

                data =
                    JSON.parse(text);

            } catch {

                throw new Error(
                    "data.gov.in returned a non-JSON response."
                );
            }


            console.log(
                "data.gov.in response keys:",
                Object.keys(data)
            );


            console.log(
                "data.gov.in status:",
                data.status
            );


            console.log(
                "data.gov.in total:",
                data.total
            );


            console.log(
                "data.gov.in records:",
                Array.isArray(data.records)
                    ? data.records.length
                    : "NOT AN ARRAY"
            );


            if (
                data.status &&
                data.status !== "ok"
            ) {

                throw new Error(
                    data.message ||
                    "data.gov.in returned an error."
                );
            }


            if (
                !Array.isArray(
                    data.records
                )
            ) {

                throw new Error(
                    "data.gov.in response does not contain a valid records array."
                );
            }


            const rawRecords =
                data.records;


            const records =
                rawRecords.map(
                    normalizeRecord
                );


            if (
                records.length === 0
            ) {

                throw new Error(
                    "data.gov.in returned zero mandi records."
                );
            }


            console.log(
                `Downloaded ${records.length} mandi records.`
            );


            return {

                records,

                total:
                    Number(data.total) ||
                    records.length,

                title:
                    data.title ||
                    "Current Daily Mandi Prices"
            };


        } catch (error) {

            lastError =
                error;


            const message =
                clean(
                    error &&
                    error.message
                );


            /*
             * Do not retry authorization errors.
             */
            const permanentError =
                message.includes(
                    "HTTP 401"
                ) ||

                message.includes(
                    "HTTP 403"
                ) ||

                message.includes(
                    "API key"
                ) ||

                message.includes(
                    "zero mandi records"
                ) ||

                message.includes(
                    "valid records array"
                );


            if (
                permanentError ||
                attempt === MAX_FETCH_ATTEMPTS
            ) {

                break;
            }


            console.warn(
                `data.gov.in request failed: ${message}`
            );


            const delay =
                RETRY_DELAYS_MS[
                    Math.min(
                        attempt - 1,
                        RETRY_DELAYS_MS.length - 1
                    )
                ];


            console.warn(
                `Retrying data.gov.in in ${delay / 1000} seconds...`
            );


            await sleep(delay);


        } finally {

            clearTimeout(timeout);
        }
    }


    throw (
        lastError ||
        new Error(
            "Unable to download mandi data from data.gov.in."
        )
    );
}


/* ============================================================
   CACHE
   ============================================================ */

function cacheIsFresh() {

    return (

        mandiCache.records.length > 0 &&

        (
            Date.now() -
            mandiCache.fetchedAt
        ) < CACHE_TTL_MS
    );
}


async function getMandiData() {

    /*
     * 1. Use fresh cache.
     */

    if (
        cacheIsFresh()
    ) {

        return {

            records:
                mandiCache.records,

            total:
                mandiCache.total,

            title:
                mandiCache.title,

            fromCache:
                true,

            stale:
                false,

            fetchedAt:
                mandiCache.fetchedAt
        };
    }


    /*
     * 2. If another request is already downloading,
     *    wait for it.
     */

    if (
        mandiCache.loadingPromise
    ) {

        return await
            mandiCache.loadingPromise;
    }


    /*
     * 3. Try fresh download.
     *
     * If it fails and old data exists,
     * continue serving old data.
     */

    mandiCache.loadingPromise =
        (async () => {

            try {

                const data =
                    await fetchDataGovRecords();


                mandiCache.records =
                    data.records;


                mandiCache.total =
                    data.total;


                mandiCache.title =
                    data.title;


                mandiCache.fetchedAt =
                    Date.now();


                /*
                 * Save ONLY successful data.
                 */

                savePersistentCache();


                return {

                    records:
                        mandiCache.records,

                    total:
                        mandiCache.total,

                    title:
                        mandiCache.title,

                    fromCache:
                        false,

                    stale:
                        false,

                    fetchedAt:
                        mandiCache.fetchedAt
                };


            } catch (error) {

                /*
                 * IMPORTANT:
                 *
                 * Never throw away good old data
                 * because of a temporary API failure.
                 */

                if (
                    hasAnyCachedData()
                ) {

                    console.warn(
                        "Fresh mandi download failed:",
                        error.message
                    );


                    console.warn(
                        "Serving the last successful mandi cache instead."
                    );


                    return {

                        records:
                            mandiCache.records,

                        total:
                            mandiCache.total,

                        title:
                            mandiCache.title,

                        fromCache:
                            true,

                        stale:
                            true,

                        fetchedAt:
                            mandiCache.fetchedAt,

                        refreshError:
                            error.message
                    };
                }


                /*
                 * No old data exists.
                 * The error must be returned.
                 */

                throw error;


            } finally {

                mandiCache.loadingPromise =
                    null;
            }

        })();


    return await
        mandiCache.loadingPromise;
}


/* ============================================================
   LOCAL FILTERING
   ============================================================ */

function filterRecords(
    records,
    filters
) {

    return records
        .filter(record => {

            if (
                filters.state &&
                !matches(
                    record.state,
                    filters.state
                )
            ) {

                return false;
            }


            if (
                filters.district &&
                !matches(
                    record.district,
                    filters.district
                )
            ) {

                return false;
            }


            if (
                filters.market &&
                !matches(
                    record.market,
                    filters.market
                )
            ) {

                return false;
            }


            if (
                filters.commodityGroup &&
                !matches(
                    record.commodityGroup,
                    filters.commodityGroup
                )
            ) {

                return false;
            }


            if (
                filters.commodity &&
                !matches(
                    record.commodity,
                    filters.commodity
                )
            ) {

                return false;
            }


            if (
                filters.variety &&
                !matches(
                    record.variety,
                    filters.variety
                )
            ) {

                return false;
            }


            if (
                filters.grade &&
                !matches(
                    record.grade,
                    filters.grade
                )
            ) {

                return false;
            }


            if (
                filters.date &&
                !matches(
                    record.arrival_date,
                    filters.date
                )
            ) {

                return false;
            }


            return true;
        });
}


/* ============================================================
   UNIQUE VALUES
   ============================================================ */

function uniqueValues(
    records,
    field
) {

    return [

        ...new Set(

            records
                .map(
                    record =>
                        clean(
                            record[field]
                        )
                )
                .filter(Boolean)
        )

    ].sort(
        (a, b) =>
            a.localeCompare(
                b,
                "en",
                {
                    sensitivity:
                        "base"
                }
            )
    );
}


/* ============================================================
   DATE PARSER
   ============================================================ */

function parseMandiDate(
    value
) {

    if (!value) {
        return 0;
    }


    const text =
        String(value).trim();


    /*
     * DD/MM/YYYY
     * DD-MM-YYYY
     */

    let match =
        text.match(
            /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/
        );


    if (match) {

        return Date.UTC(

            Number(match[3]),

            Number(match[2]) - 1,

            Number(match[1])
        );
    }


    /*
     * YYYY-MM-DD
     */

    match =
        text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );


    if (match) {

        return Date.UTC(

            Number(match[1]),

            Number(match[2]) - 1,

            Number(match[3])
        );
    }


    const timestamp =
        Date.parse(text);


    return Number.isNaN(timestamp)
        ? 0
        : timestamp;
}


/* ============================================================
   FILTER OBJECT
   ============================================================ */

function readFilters(
    requestUrl
) {

    return {

        state:
            clean(
                requestUrl.searchParams.get(
                    "state"
                )
            ),

        district:
            clean(
                requestUrl.searchParams.get(
                    "district"
                )
            ),

        market:
            clean(
                requestUrl.searchParams.get(
                    "market"
                )
            ),

        commodityGroup:
            clean(
                requestUrl.searchParams.get(
                    "commodityGroup"
                )
            ),

        commodity:
            clean(
                requestUrl.searchParams.get(
                    "commodity"
                )
            ),

        variety:
            clean(
                requestUrl.searchParams.get(
                    "variety"
                )
            ),

        grade:
            clean(
                requestUrl.searchParams.get(
                    "grade"
                )
            ),

        date:
            clean(
                requestUrl.searchParams.get(
                    "date"
                )
            )
    };
}


/* ============================================================
   GET /api/options
   ============================================================ */

async function handleOptions(
    requestUrl,
    response
) {

    try {

        const filters =
            readFilters(
                requestUrl
            );


        const data =
            await getMandiData();


        const records =
            filterRecords(
                data.records,
                filters
            );


        const commodityGroups = [

            "Cereals",
            "Pulses",
            "Oil Seeds",
            "Fibre Crops",
            "Vegetables",
            "Fruits",
            "Spices",
            "Others"

        ].filter(
            group =>
                records.some(
                    record =>
                        record.commodityGroup ===
                        group
                )
        );


        sendJson(
            response,
            200,
            {

                states:
                    uniqueValues(
                        records,
                        "state"
                    ),

                districts:
                    uniqueValues(
                        records,
                        "district"
                    ),

                markets:
                    uniqueValues(
                        records,
                        "market"
                    ),

                commodityGroups,

                commodities:
                    uniqueValues(
                        records,
                        "commodity"
                    ),

                varieties:
                    uniqueValues(
                        records,
                        "variety"
                    ),

                grades:
                    uniqueValues(
                        records,
                        "grade"
                    ),

                dates:
                    uniqueValues(
                        records,
                        "arrival_date"
                    ),

                recordCount:
                    records.length,

                fromCache:
                    data.fromCache,

                stale:
                    data.stale || false,

                fetchedAt:
                    data.fetchedAt || null,

                refreshError:
                    data.refreshError || null
            }
        );


    } catch (error) {

        console.error(
            "OPTIONS DATA ERROR:",
            error.message
        );


        sendJson(
            response,

            error.message.includes("429")
                ? 429
                : 500,

            {
                error:
                    error.message
            }
        );
    }
}


/* ============================================================
   GET /api/prices
   ============================================================ */

async function handlePrices(
    requestUrl,
    response
) {

    try {

        const filters =
            readFilters(
                requestUrl
            );


        const data =
            await getMandiData();


        let records =
            filterRecords(
                data.records,
                filters
            );


        /*
         * Newest records first.
         */

        records.sort(
            (a, b) =>
                parseMandiDate(
                    b.arrival_date
                ) -
                parseMandiDate(
                    a.arrival_date
                )
        );


        /*
         * Maximum browser response.
         */

        const MAX_RESULTS =
            5000;


        if (
            records.length >
            MAX_RESULTS
        ) {

            records =
                records.slice(
                    0,
                    MAX_RESULTS
                );
        }


        /*
         * Find latest date.
         */

        const dates =
            records
                .map(
                    record =>
                        record.arrival_date
                )
                .filter(Boolean)
                .sort(
                    (a, b) =>
                        parseMandiDate(b) -
                        parseMandiDate(a)
                );


        const lastUpdated =
            dates.length
                ? dates[0]
                : null;


        sendJson(
            response,
            200,
            {

                records,

                total:
                    records.length,

                totalAvailable:
                    data.total,

                lastUpdated,

                title:
                    data.title,

                fromCache:
                    data.fromCache,

                stale:
                    data.stale || false,

                fetchedAt:
                    data.fetchedAt || null,

                refreshError:
                    data.refreshError || null
            }
        );


    } catch (error) {

        console.error(
            "PRICE API ERROR:",
            error.message
        );


        sendJson(
            response,

            error.message.includes("429")
                ? 429
                : 500,

            {
                error:
                    error.message
            }
        );
    }
}


/* ============================================================
   GET /api/cache
   ============================================================ */

function handleCache(
    response
) {

    const age =
        mandiCache.fetchedAt
            ? Date.now() -
              mandiCache.fetchedAt
            : null;


    sendJson(
        response,
        200,
        {

            cached:
                mandiCache.records.length > 0,

            records:
                mandiCache.records.length,

            total:
                mandiCache.total,

            cacheAgeSeconds:
                age === null
                    ? null
                    : Math.round(
                        age / 1000
                    ),

            cacheFresh:
                cacheIsFresh(),

            cacheStale:
                hasAnyCachedData() &&
                !cacheIsFresh(),

            cacheTTLSeconds:
                Math.round(
                    CACHE_TTL_MS /
                    1000
                ),

            fetchedAt:
                mandiCache.fetchedAt
                    ? new Date(
                        mandiCache.fetchedAt
                    ).toISOString()
                    : null,

            loading:
                Boolean(
                    mandiCache.loadingPromise
                )
        }
    );
}


/* ============================================================
   GET /api/refresh
   ============================================================ */

function handleRefresh(
    response
) {

    /*
     * Force expiry without deleting the last
     * successful data.
     *
     * If the next API request fails,
     * old data remains available.
     */

    mandiCache.fetchedAt = 0;


    sendJson(
        response,
        200,
        {

            ok: true,

            message:
                "Mandi cache marked stale. The next API request will try a fresh download; if data.gov.in fails, the previous successful data remains available."
        }
    );
}


/* ============================================================
   STATIC FILE SERVER
   ============================================================ */

const MIME_TYPES = {

    ".html":
        "text/html; charset=utf-8",

    ".js":
        "application/javascript; charset=utf-8",

    ".css":
        "text/css; charset=utf-8",

    ".json":
        "application/json; charset=utf-8",

    ".png":
        "image/png",

    ".jpg":
        "image/jpeg",

    ".jpeg":
        "image/jpeg",

    ".webp":
        "image/webp",

    ".svg":
        "image/svg+xml",

    ".ico":
        "image/x-icon"
};


function serveStatic(
    requestUrl,
    response
) {

    let pathname =
        decodeURIComponent(
            requestUrl.pathname
        );


    /*
     * Home page.
     */

    if (
        pathname === "/" ||
        pathname === ""
    ) {

        pathname =
            "/index.html";
    }


    /*
     * Prevent directory traversal.
     */

    pathname =
        pathname.replace(
            /\.\./g,
            ""
        );


    const filePath =
        path.join(
            __dirname,
            pathname
        );


    /*
     * Never expose secrets,
     * cache files, or server source.
     */

    const protectedFiles = [

        ".env",

        "mandi-cache.json",

        "server.js",

        "ser_ver(1).js",

        "ser_ver(2).js"

    ];


    const requestedBaseName =
        path.basename(
            filePath
        ).toLowerCase();


    if (
        protectedFiles.some(
            file =>
                requestedBaseName ===
                file.toLowerCase()
        )
    ) {

        sendText(
            response,
            403,
            "Forbidden"
        );

        return;
    }


    fs.stat(
        filePath,
        (error, stats) => {

            if (
                error ||
                !stats.isFile()
            ) {

                sendText(
                    response,
                    404,
                    "File not found"
                );

                return;
            }


            const extension =
                path.extname(
                    filePath
                ).toLowerCase();


            const contentType =
                MIME_TYPES[extension] ||
                "application/octet-stream";


            fs.readFile(
                filePath,
                (readError, data) => {

                    if (readError) {

                        sendText(
                            response,
                            500,
                            "Unable to read file"
                        );

                        return;
                    }


                    response.writeHead(
                        200,
                        {
                            "Content-Type":
                                contentType
                        }
                    );


                    response.end(data);
                }
            );
        }
    );
}


/* ============================================================
   MAIN SERVER
   ============================================================ */

const server =
    http.createServer(
        async (
            request,
            response
        ) => {

            try {

                const requestUrl =
                    new URL(
                        request.url,
                        `http://${request.headers.host}`
                    );


                /*
                 * CORS preflight.
                 *
                 * This is only for requests coming
                 * to FarmLink's own server.
                 *
                 * It does NOT send OPTIONS to data.gov.in.
                 */

                if (
                    request.method ===
                    "OPTIONS"
                ) {

                    response.writeHead(
                        204,
                        {

                            "Access-Control-Allow-Origin":
                                "*",

                            "Access-Control-Allow-Methods":
                                "GET, OPTIONS",

                            "Access-Control-Allow-Headers":
                                "Content-Type"
                        }
                    );


                    response.end();

                    return;
                }


                /*
                 * Only GET is required.
                 */

                if (
                    request.method !==
                    "GET"
                ) {

                    sendJson(
                        response,
                        405,
                        {
                            error:
                                "Method not allowed"
                        }
                    );

                    return;
                }


                /*
                 * OPTIONS
                 */

                if (
                    requestUrl.pathname ===
                    "/api/options"
                ) {

                    await handleOptions(
                        requestUrl,
                        response
                    );

                    return;
                }


                /*
                 * PRICES
                 */

                if (
                    requestUrl.pathname ===
                    "/api/prices"
                ) {

                    await handlePrices(
                        requestUrl,
                        response
                    );

                    return;
                }


                /*
                 * HEALTH
                 */

                if (
                    requestUrl.pathname ===
                    "/api/health"
                ) {

                    sendJson(
                        response,
                        200,
                        {

                            status:
                                "ok",

                            apiConfigured:
                                Boolean(
                                    API_KEY
                                ),

                            resourceId:
                                RESOURCE_ID,

                            cache:
                                {

                                    records:
                                        mandiCache
                                            .records
                                            .length,

                                    fresh:
                                        cacheIsFresh(),

                                    stale:
                                        hasAnyCachedData() &&
                                        !cacheIsFresh(),

                                    loading:
                                        Boolean(
                                            mandiCache
                                                .loadingPromise
                                        ),

                                    fetchedAt:
                                        mandiCache
                                            .fetchedAt
                                            ? new Date(
                                                mandiCache
                                                    .fetchedAt
                                            ).toISOString()
                                            : null
                                }
                        }
                    );


                    return;
                }


                /*
                 * CACHE STATUS
                 */

                if (
                    requestUrl.pathname ===
                    "/api/cache"
                ) {

                    handleCache(
                        response
                    );

                    return;
                }


                /*
                 * MANUAL REFRESH
                 */

                if (
                    requestUrl.pathname ===
                    "/api/refresh"
                ) {

                    handleRefresh(
                        response
                    );

                    return;
                }


                /*
                 * Everything else =
                 * static website file.
                 */

                serveStatic(
                    requestUrl,
                    response
                );


            } catch (error) {

                console.error(
                    "SERVER ERROR:",
                    error
                );


                sendJson(
                    response,
                    500,
                    {
                        error:
                            "Internal server error"
                    }
                );
            }
        }
    );


/* ============================================================
   STARTUP CACHE LOAD
   ============================================================ */

/*
 * Load the last successful dataset before
 * accepting requests.
 */
loadPersistentCache();


/* ============================================================
   START SERVER
   ============================================================ */

server.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "======================================"
        );

        console.log(
            " FarmLink Mandi Price Server"
        );

        console.log(
            "======================================"
        );

        console.log(
            ` Website: http://localhost:${PORT}`
        );

        console.log(
            ` API:     http://localhost:${PORT}/api`
        );

        console.log(
            ` Health:  http://localhost:${PORT}/api/health`
        );

        console.log(
            ` Cache:   http://localhost:${PORT}/api/cache`
        );

        console.log(
            ` API Key: ${API_KEY ? "Configured" : "NOT CONFIGURED"}`
        );

        console.log(
            ` Persistent cache: ${
                fs.existsSync(CACHE_FILE)
                    ? "Available"
                    : "Not created yet"
            }`
        );

        console.log(
            " Retry protection: 3 attempts"
        );

        console.log(
            " Stale-cache fallback: Enabled"
        );

        console.log(
            "======================================"
        );

        console.log("");
    }
);
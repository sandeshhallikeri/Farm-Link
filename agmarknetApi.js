/*
 * FarmLink - Mandi Price API Client
 *
 * Browser-side API client.
 * IMPORTANT:
 * The data.gov.in API key is NOT stored in this file.
 * The browser talks only to your own Node.js server.
 */

window.AGMARKNET_API = {

    // Your backend URL
    backend: "/api",

    GROUP_ORDER: [
        "Cereals",
        "Pulses",
        "Oil Seeds",
        "Fibre Crops",
        "Vegetables",
        "Fruits",
        "Spices",
        "Others"
    ],

    /*
     * MSP Rs./quintal for 2026-27
     */
    MSP: {
        "Bajra(Pearl Millet/Cumbu)": 2775,
        "Bajra": 2775,

        "Barley(Jau)": 1980,
        "Barley": 1980,

        "Wheat": 2425,
        "Maize": 2400,

        "Jowar(Sorghum)": 3371,
        "Jowar": 3371,

        "Paddy(Dhan)(Common)": 2369,
        "Paddy": 2369,

        "Ragi": 4886,

        "Arhar (Tur/Red Gram)(Whole)": 8000,
        "Arhar": 8000,

        "Moong(Green Gram)": 8768,
        "Moong": 8768,

        "Urad (Black Gram)": 7800,
        "Urad": 7800,

        "Cotton": 7710,
        "Kapas": 7710,

        "Groundnut": 6783,

        "Soyabean": 5328,
        "Soybean": 5328,

        "Mustard": 5650,
        "Rapeseed": 5650,

        "Sunflower": 7287,
        "Sesamum": 9846
    },

    /*
     * Commodity grouping rules
     */
    GROUP_RULES: [
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
    ],

    /*
     * Determine commodity group
     */
    commodityGroup(name) {

        const lower = String(name || "").toLowerCase();

        for (const rule of this.GROUP_RULES) {

            if (
                rule.keys.some(
                    key => lower.includes(key)
                )
            ) {
                return rule.group;
            }
        }

        return "Others";
    },

    /*
     * Find MSP
     */
    mspFor(name) {

        if (this.MSP[name] != null) {
            return this.MSP[name];
        }

        const lower = String(name || "").toLowerCase();

        for (const [key, value] of Object.entries(this.MSP)) {

            const keyLower = key.toLowerCase();

            if (
                lower.includes(keyLower) ||
                keyLower.includes(lower)
            ) {
                return value;
            }
        }

        return null;
    },

    /*
     * Format numbers using Indian numbering
     */
    formatNumber(value) {

        if (
            value === null ||
            value === undefined ||
            value === "" ||
            Number.isNaN(Number(value))
        ) {
            return "—";
        }

        return Number(value).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    /*
     * Escape HTML before inserting API values into the page
     */
    escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    /*
     * Convert date into readable format
     */
    formatDate(value) {

        if (!value) {
            return "—";
        }

        const parts = String(value).split(/[/-]/);

        if (parts.length !== 3) {
            return value;
        }

        let day;
        let month;
        let year;

        /*
         * Handles:
         * DD/MM/YYYY
         * DD-MM-YYYY
         */
        if (parts[0].length <= 2) {

            day = Number(parts[0]);
            month = Number(parts[1]);
            year = Number(parts[2]);

        } else {

            return value;
        }

        if (
            !day ||
            !month ||
            !year
        ) {
            return value;
        }

        const date = new Date(
            year,
            month - 1,
            day
        );

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    },

    /*
     * Generic GET request to our backend
     */
    async request(endpoint, params = {}) {

        const url = new URL(
            this.backend + endpoint,
            window.location.origin
        );

        Object.entries(params).forEach(
            ([key, value]) => {

                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {
                    url.searchParams.set(
                        key,
                        value
                    );
                }
            }
        );

        const response = await fetch(
            url.toString(),
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                `Server returned HTTP ${response.status}`
            );
        }

        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                `HTTP ${response.status}`
            );
        }

        return data;
    },

    /*
     * Get dropdown options
     *
     * Examples:
     *
     * /api/options
     *
     * /api/options?state=Karnataka
     *
     * /api/options?state=Karnataka&district=Dharwad
     */
    async getOptions(filters = {}) {

        return await this.request(
            "/options",
            filters
        );
    },

    /*
     * Get filtered mandi prices
     *
     * Filters can contain:
     *
     * state
     * district
     * market
     * commodityGroup
     * commodity
     * variety
     * grade
     * date
     */
    async getPrices(filters = {}) {

        const data = await this.request(
            "/prices",
            filters
        );

        if (!data || !Array.isArray(data.records)) {
            return {
                records: [],
                total: 0,
                lastUpdated: null
            };
        }

        return {
            records: this.parseAgmarknetRecords(
                data.records
            ),

            total:
                Number(data.total) ||
                data.records.length,

            lastUpdated:
                data.lastUpdated ||
                null
        };
    },

    /*
     * Convert API records into the format
     * used by your FarmLink frontend.
     */
    parseAgmarknetRecords(records) {

        return records.map(
            (rec, index) => {

                const minP =
                    parseFloat(rec.min_price);

                const maxP =
                    parseFloat(rec.max_price);

                const modalP =
                    parseFloat(rec.modal_price);

                return {

                    id:
                        `AGM-LIVE-${index}`,

                    commodity:
                        rec.commodity ||
                        "Agricultural Produce",

                    category:
                        rec.commodityGroup ||
                        this.commodityGroup(
                            rec.commodity
                        ),

                    state:
                        rec.state ||
                        "India",

                    district:
                        rec.district ||
                        "—",

                    mandi:
                        rec.market ||
                        "APMC",

                    variety:
                        rec.variety ||
                        "—",

                    grade:
                        rec.grade ||
                        "—",

                    minPrice:
                        Number.isNaN(minP)
                            ? null
                            : minP,

                    maxPrice:
                        Number.isNaN(maxP)
                            ? null
                            : maxP,

                    modalPrice:
                        Number.isNaN(modalP)
                            ? null
                            : modalP,

                    arrivalsTonnes:
                        rec.arrival_quantity ??
                        null,

                    date:
                        rec.arrival_date ||
                        null,

                    msp:
                        this.mspFor(
                            rec.commodity
                        )
                };
            }
        );
    },

    /*
     * Convenience function for the
     * Agmarknet-style filter page.
     */
    async search(filters = {}) {

        return await this.getPrices(
            filters
        );
    }
};
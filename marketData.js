/* ==========================================================================
   FARMLINK — GOVERNMENT MARKET PRICE DATA & NORMALIZATION (APMC MANDI)
   Source: Data.gov.in / Agmarknet (Karnataka State Agricultural Marketing Board)
   Date: 02-09-2026
   ========================================================================== */

const FARMLINK_MARKET_DATA = [
    {
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "market": "Bengaluru APMC (Binny Mill)",
        "commodity": "Tomato",
        "variety": "Local",
        "grade": "FAQ",
        "minPrice": 2200,
        "maxPrice": 3400,
        "modalPrice": 2900,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Kolar",
        "market": "Kolar APMC",
        "commodity": "Tomato",
        "variety": "Hybrid",
        "grade": "FAQ",
        "minPrice": 2000,
        "maxPrice": 3200,
        "modalPrice": 2700,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Mysuru",
        "market": "Mysuru APMC (Bandipalya)",
        "commodity": "Tomato",
        "variety": "Local",
        "grade": "FAQ",
        "minPrice": 2100,
        "maxPrice": 3300,
        "modalPrice": 2800,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Ramanagara",
        "market": "Ramanagara APMC",
        "commodity": "Tomato",
        "variety": "Local",
        "grade": "FAQ",
        "minPrice": 2300,
        "maxPrice": 3500,
        "modalPrice": 3000,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Tumakuru",
        "market": "Tumakuru APMC",
        "commodity": "Tomato",
        "variety": "Local",
        "grade": "FAQ",
        "minPrice": 2100,
        "maxPrice": 3100,
        "modalPrice": 2750,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Chikkaballapur",
        "market": "Chikkaballapur APMC",
        "commodity": "Tomato",
        "variety": "Local",
        "grade": "FAQ",
        "minPrice": 2000,
        "maxPrice": 3100,
        "modalPrice": 2650,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "market": "Bengaluru APMC (Binny Mill)",
        "commodity": "Onion",
        "variety": "Local",
        "grade": "Medium",
        "minPrice": 2000,
        "maxPrice": 3200,
        "modalPrice": 2600,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Mysuru",
        "market": "Mysuru APMC (Bandipalya)",
        "commodity": "Onion",
        "variety": "Local",
        "grade": "Medium",
        "minPrice": 1900,
        "maxPrice": 3000,
        "modalPrice": 2500,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Kolar",
        "market": "Kolar APMC",
        "commodity": "Onion",
        "variety": "Local",
        "grade": "Medium",
        "minPrice": 2100,
        "maxPrice": 3300,
        "modalPrice": 2700,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Ramanagara",
        "market": "Ramanagara APMC",
        "commodity": "Onion",
        "variety": "Local",
        "grade": "Medium",
        "minPrice": 2000,
        "maxPrice": 3100,
        "modalPrice": 2550,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "market": "Bengaluru APMC (Binny Mill)",
        "commodity": "Potato",
        "variety": "Jyothi",
        "grade": "FAQ",
        "minPrice": 1800,
        "maxPrice": 2800,
        "modalPrice": 2300,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Hassan",
        "market": "Hassan APMC",
        "commodity": "Potato",
        "variety": "Kufri",
        "grade": "FAQ",
        "minPrice": 1600,
        "maxPrice": 2500,
        "modalPrice": 2100,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Kolar",
        "market": "Kolar APMC",
        "commodity": "Potato",
        "variety": "Jyothi",
        "grade": "FAQ",
        "minPrice": 1700,
        "maxPrice": 2600,
        "modalPrice": 2200,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Mysuru",
        "market": "Mysuru APMC (Bandipalya)",
        "commodity": "Potato",
        "variety": "Local",
        "grade": "FAQ",
        "minPrice": 1800,
        "maxPrice": 2700,
        "modalPrice": 2250,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "market": "Bengaluru APMC (Binny Mill)",
        "commodity": "Brinjal",
        "variety": "Round Green",
        "grade": "FAQ",
        "minPrice": 2500,
        "maxPrice": 3800,
        "modalPrice": 3100,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Mysuru",
        "market": "Mysuru APMC (Bandipalya)",
        "commodity": "Brinjal",
        "variety": "Local",
        "grade": "FAQ",
        "minPrice": 2300,
        "maxPrice": 3500,
        "modalPrice": 2900,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Ramanagara",
        "market": "Ramanagara APMC",
        "commodity": "Brinjal",
        "variety": "Round Green",
        "grade": "FAQ",
        "minPrice": 2400,
        "maxPrice": 3600,
        "modalPrice": 3000,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "market": "Bengaluru APMC (Binny Mill)",
        "commodity": "Cabbage",
        "variety": "Local",
        "grade": "FAQ",
        "minPrice": 1400,
        "maxPrice": 2200,
        "modalPrice": 1800,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Kolar",
        "market": "Kolar APMC",
        "commodity": "Cabbage",
        "variety": "Local",
        "grade": "FAQ",
        "minPrice": 1300,
        "maxPrice": 2000,
        "modalPrice": 1700,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Chikkaballapur",
        "market": "Chikkaballapur APMC",
        "commodity": "Cabbage",
        "variety": "Local",
        "grade": "FAQ",
        "minPrice": 1200,
        "maxPrice": 1900,
        "modalPrice": 1600,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Bengaluru Rural",
        "market": "Hoskote APMC",
        "commodity": "Carrot",
        "variety": "Local",
        "grade": "Local",
        "minPrice": 2000,
        "maxPrice": 2500,
        "modalPrice": 2100,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Bengaluru South",
        "market": "Ramanagara APMC",
        "commodity": "Carrot",
        "variety": "Local",
        "grade": "Local",
        "minPrice": 4000,
        "maxPrice": 5200,
        "modalPrice": 4800,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Chamarajanagar",
        "market": "Chamarajanagar APMC",
        "commodity": "Carrot",
        "variety": "Local",
        "grade": "Local",
        "minPrice": 1500,
        "maxPrice": 3000,
        "modalPrice": 2300,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Kalaburagi",
        "market": "Kalaburagi APMC",
        "commodity": "Carrot",
        "variety": "Local",
        "grade": "Local",
        "minPrice": 1000,
        "maxPrice": 3000,
        "modalPrice": 2000,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Kolar",
        "market": "Bangarpet APMC",
        "commodity": "Carrot",
        "variety": "Local",
        "grade": "Local",
        "minPrice": 2500,
        "maxPrice": 3000,
        "modalPrice": 2700,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    },
    {
        "state": "Karnataka",
        "district": "Mysuru",
        "market": "Mysuru APMC",
        "commodity": "Carrot",
        "variety": "Medium",
        "grade": "Medium",
        "minPrice": 3300,
        "maxPrice": 3500,
        "modalPrice": 3500,
        "priceUnit": "Rs./Quintal",
        "arrivalDate": "02-09-2026"
    }
];


function getAvailableMarketCrops() {
    const crops = [];
    FARMLINK_MARKET_DATA.forEach(function(item) {
        if (!crops.includes(item.commodity)) {
            crops.push(item.commodity);
        }
    });
    return crops;
}

function getMarketsForCrop(cropName) {
    if (!cropName) return [];
    return FARMLINK_MARKET_DATA
        .filter(function(item) {
            return item.commodity.toLowerCase() === cropName.toLowerCase();
        })
        .map(function(item) {
            return item.market;
        });
}

function getMarketPriceInfo(cropName, marketName) {
    if (!cropName) return null;

    let match = null;
    if (marketName) {
        match = FARMLINK_MARKET_DATA.find(function(item) {
            return item.commodity.toLowerCase() === cropName.toLowerCase() &&
                   item.market.toLowerCase() === marketName.toLowerCase();
        });
    }

    if (!match && marketName) {
        match = FARMLINK_MARKET_DATA.find(function(item) {
            return item.commodity.toLowerCase() === cropName.toLowerCase() &&
                   (item.district.toLowerCase().includes(marketName.toLowerCase()) ||
                    item.market.toLowerCase().includes(marketName.toLowerCase()));
        });
    }

    if (!match) {
        match = FARMLINK_MARKET_DATA.find(function(item) {
            return item.commodity.toLowerCase() === cropName.toLowerCase();
        });
    }

    if (!match) return null;

    return {
        state: match.state,
        district: match.district,
        market: match.market,
        commodity: match.commodity,
        variety: match.variety,
        grade: match.grade,
        arrivalDate: match.arrivalDate,
        minPriceQuintal: match.minPrice,
        maxPriceQuintal: match.maxPrice,
        modalPriceQuintal: match.modalPrice,
        minPriceKg: Math.round((match.minPrice / 100) * 10) / 10,
        maxPriceKg: Math.round((match.maxPrice / 100) * 10) / 10,
        modalPriceKg: Math.round((match.modalPrice / 100) * 10) / 10
    };
}

/* ==========================================================================
   FARMLINK — TRANSPORTERS DATA & FUNCTIONS
   ========================================================================== */

const FARMLINK_TRANSPORTERS = [
    {
        id: "trans-1",
        name: "Ravi Transport",
        vehicle: "Mini Truck (Tata Ace)",
        capacity: 1000,
        location: "Bengaluru",
        ratePerKm: 25,
        available: true,
        contact: "+91 98450 12345"
    },
    {
        id: "trans-2",
        name: "Kolar Green Haulers",
        vehicle: "Pickup Van (Bolero)",
        capacity: 1200,
        location: "Kolar",
        ratePerKm: 22,
        available: true,
        contact: "+91 98450 23456"
    },
    {
        id: "trans-3",
        name: "Kaveri Agro Logistics",
        vehicle: "Medium Truck (Canter)",
        capacity: 2500,
        location: "Mysuru",
        ratePerKm: 32,
        available: true,
        contact: "+91 98450 34567"
    },
    {
        id: "trans-4",
        name: "Ramanagara Express Logistics",
        vehicle: "Mini Truck (Tata Ace)",
        capacity: 1000,
        location: "Ramanagara",
        ratePerKm: 24,
        available: true,
        contact: "+91 98450 45678"
    },
    {
        id: "trans-5",
        name: "Tumakuru Rural Transport",
        vehicle: "Pickup Truck",
        capacity: 1500,
        location: "Tumakuru",
        ratePerKm: 23,
        available: true,
        contact: "+91 98450 56789"
    }
];

function getTransporters(locationFilter) {
    if (!locationFilter) return FARMLINK_TRANSPORTERS;
    const filtered = FARMLINK_TRANSPORTERS.filter(function(t) {
        return t.location.toLowerCase().includes(locationFilter.toLowerCase());
    });
    return filtered.length > 0 ? filtered : FARMLINK_TRANSPORTERS;
}

function getTransporterById(id) {
    return FARMLINK_TRANSPORTERS.find(function(t) {
        return t.id === id;
    }) || FARMLINK_TRANSPORTERS[0];
}


export const RANKS = [
  { name: 'Bronze', min: 0, max: 1199, minMatch: 0 },
  { name: 'Silver', min: 1200, max: 1499, minMatch: 800 },
  { name: 'Gold', min: 1500, max: 1799, minMatch: 1200 },
  { name: 'Platinum', min: 1800, max: 2099, minMatch: 1500 },
  { name: 'Diamond', min: 2100, max: 2399, minMatch: 1800 },
  { name: 'Master', min: 2400, max: 9999, minMatch: 2100 }
];

export const getRank = (elo) => {
  return RANKS.find(r => elo >= r.min && elo <= r.max) || RANKS[0];
};

export const getAllowedRange = (userElo) => {
    const rank = getRank(userElo);
    // User must be able to match with people at least their own rank's minMatch
    // Also, logic: min_elo selected must be <= userElo (obviously)
    // But importantly, min_elo selected must be >= rank.minMatch
    return {
        minAllowed: rank.minMatch,
        maxAllowed: 3000 // Arbitrary high cap
    };
};

export const validateMatchPreference = (userElo, minElo, maxElo) => {
    // Rule 1: Range must include User
    if (userElo < minElo || userElo > maxElo) {
        return { valid: false, error: "Search range must include your current ELO." };
    }

    // Rule 2: Min Elo restriction based on Rank
    const { minAllowed } = getAllowedRange(userElo);
    if (minElo < minAllowed) {
        return { valid: false, error: `Grandmaster/High Rank cannot search below ${minAllowed} ELO.` }; // Generic message, can be specific
    }

    return { valid: true };
};

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  servicesService,
  promotionsService,
  propertiesService,
  quotesService,
  profilesService,
} from "../utils/djangoServices";

const STALE_MS = 5 * 60 * 1000; // 5 minutes

const initialDomain = {
  items: [],
  count: 0,
  status: "idle",
  error: null,
  loadedAt: 0,
};

const initialState = {
  services: { ...initialDomain },
  promotions: { ...initialDomain },
  properties: { ...initialDomain },
  quotes: { ...initialDomain },
  users: { ...initialDomain },
};

export const fetchAllIfNeeded = createAsyncThunk(
  "management/fetchAllIfNeeded",
  async (domains, { getState }) => {
    const state = getState().management;
    const now = Date.now();
    const need = (d) =>
      !d.loadedAt || now - d.loadedAt > STALE_MS || d.items.length === 0;

    const requested =
      Array.isArray(domains) && domains.length
        ? domains
        : ["services", "promotions", "properties", "quotes"];

    const tasks = {};
    if (requested.includes("services") && need(state.services)) {
      tasks.services = servicesService.getServices({});
    }
    if (requested.includes("promotions") && need(state.promotions)) {
      tasks.promotions = promotionsService.getPromotions({});
    }
    if (requested.includes("properties") && need(state.properties)) {
      tasks.properties = propertiesService.getProperties({});
    }
    if (requested.includes("quotes") && need(state.quotes)) {
      tasks.quotes = quotesService.getQuotes({});
    }
    if (requested.includes("users") && need(state.users)) {
      // Customers only for management overview
      tasks.users = profilesService.getProfiles({ role: "customer" });
    }

    const entries = Object.entries(tasks);
    if (entries.length === 0) return {}; // nothing to fetch

    const results = await Promise.all(
      entries.map(([k, p]) => p.then((r) => [k, r]))
    );
    const payload = {};
    for (const [k, res] of results) {
      if (res && res.success) {
        // Normalize for services/properties/quotes (already normalized) and profiles (paginated object)
        let items = [];
        let count = 0;
        if (Array.isArray(res.data)) {
          items = res.data;
          count = res.count ?? res.data.length;
        } else if (res?.data && typeof res.data === "object") {
          // DRF pagination object
          items = Array.isArray(res.data.results) ? res.data.results : [];
          count = typeof res.data.count === "number" ? res.data.count : items.length;
        }
        payload[k] = { items, count };
      } else {
        payload[k] = { error: res?.error || `Failed to load ${k}` };
      }
    }
    return payload;
  }
);

const managementSlice = createSlice({
  name: "management",
  initialState,
  reducers: {
    upsertQuote: (state, action) => {
      const quote = action.payload;
      if (!quote || !quote.id) return;
      const domain = state.quotes;
      const idx = domain.items.findIndex((item) => item.id === quote.id);
      if (idx >= 0) {
        domain.items[idx] = { ...domain.items[idx], ...quote };
      } else {
        domain.items.unshift(quote);
        domain.count += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllIfNeeded.pending, (state, action) => {
        const requested =
          Array.isArray(action.meta.arg) && action.meta.arg.length
            ? action.meta.arg
            : ["services", "promotions", "properties", "quotes"];
        requested.forEach((key) => {
          const d = state[key];
          if (!d) return;
          if (
            !d.loadedAt ||
            Date.now() - d.loadedAt > STALE_MS ||
            d.items.length === 0
          ) {
            d.status = "loading";
            d.error = null;
          }
        });
      })
      .addCase(fetchAllIfNeeded.fulfilled, (state, action) => {
        const now = Date.now();
        Object.entries(action.payload || {}).forEach(([key, res]) => {
          const d = state[key];
          if (!d) return;
          if (res?.error) {
            d.status = "error";
            d.error = res.error;
          } else {
            d.items = res.items || [];
            d.count =
              typeof res.count === "number"
                ? res.count
                : Array.isArray(res.items)
                ? res.items.length
                : 0;
            d.status = "succeeded";
            d.error = null;
            d.loadedAt = now;
          }
        });
      })
      .addCase(fetchAllIfNeeded.rejected, (state, action) => {
        const requested =
          Array.isArray(action.meta.arg) && action.meta.arg.length
            ? action.meta.arg
            : ["services", "promotions", "properties", "quotes"];
        requested.forEach((key) => {
          const d = state[key];
          if (!d) return;
          d.status = "error";
          d.error = action.error?.message || "Failed to load";
        });
      });
  },
});

export const { upsertQuote } = managementSlice.actions;

export default managementSlice.reducer;

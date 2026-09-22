export interface AffiliateStore {
  id: string;
  name: string;
  platform: string;
  /** Official store URL. Replace with your affiliate/referral URL once approved. */
  url: string;
  /**
   * False means no legitimate GTA 6 product exists here yet. Pages must render these as
   * "not available", never as a buy button — see the locked honest-framing constraint.
   */
  available: boolean;
  edition?: string;
  price?: string;
  note?: string;
}

export const affiliateStores: AffiliateStore[] = [
  {
    id: "rockstar",
    name: "Rockstar Store",
    platform: "PlayStation 5 · Xbox Series X|S",
    url: "https://www.rockstargames.com/VI/",
    available: true,
    edition: "Standard · Ultimate",
    price: "$79.99 · $99.99",
    note: "Rockstar's own GTA VI page — the clearest statement of what each edition includes.",
  },
  {
    id: "playstation",
    name: "PlayStation Store",
    platform: "PlayStation 5",
    url: "https://store.playstation.com/",
    available: true,
    edition: "Standard · Ultimate",
    price: "$79.99 · $99.99",
    note: "The licence is tied to the account you buy on, so purchase where you actually play.",
  },
  {
    id: "xbox",
    name: "Microsoft Store / Xbox",
    platform: "Xbox Series X|S",
    url: "https://www.xbox.com/en-US/games/store",
    available: true,
    edition: "Standard · Ultimate",
    price: "$79.99 · $99.99",
    note: "Xbox Series X|S listing only — the storefront's PC section has no GTA 6 product.",
  },
  {
    id: "gamestop",
    name: "GameStop",
    platform: "PlayStation 5 · Xbox Series X|S",
    url: "https://www.gamestop.com/",
    available: true,
    edition: "Standard · Ultimate (boxed)",
    price: "from $79.99",
    note: "Boxed physical editions ship as a download code with no disc inside — check the retailer's listing before paying a premium for packaging.",
  },
  {
    id: "bestbuy",
    name: "Best Buy",
    platform: "PlayStation 5 · Xbox Series X|S",
    url: "https://www.bestbuy.com/",
    available: true,
    edition: "Standard (boxed)",
    price: "$79.99",
    note: "Authorised retailer. Stock of the code-only box varies, so confirm before you buy.",
  },
  {
    id: "amazon",
    name: "Amazon",
    platform: "PlayStation 5 · Xbox Series X|S",
    url: "https://www.amazon.com/",
    available: true,
    edition: "Standard (boxed)",
    price: "$79.99",
    note: "Buy the listing sold by the retailer itself. Third-party marketplace 'GTA 6' copies are where fake-key fraud concentrates.",
  },
  {
    id: "steam",
    name: "Steam",
    platform: "PC",
    url: "https://store.steampowered.com/",
    available: false,
    note: "Rockstar has not announced a PC version of GTA 6, so there is no legitimate Steam listing. Any 'GTA 6 Steam download' page or key sold for PC is not genuine.",
  },
  {
    id: "epic",
    name: "Epic Games Store",
    platform: "PC",
    url: "https://store.epicgames.com/",
    available: false,
    note: "No PC version has been announced. There is no legitimate Epic Games Store listing for GTA 6.",
  },
  {
    id: "rockstar-launcher",
    name: "Rockstar Games Launcher",
    platform: "PC",
    url: "https://www.rockstargames.com/",
    available: false,
    note: "The launcher is where a future PC release would be sold, but nothing GTA 6 has been announced for it.",
  },
];

export function getStore(id: string): AffiliateStore | undefined {
  return affiliateStores.find((s) => s.id === id);
}

/** Stores with a real, purchasable product right now. */
export function availableStores(): AffiliateStore[] {
  return affiliateStores.filter((s) => s.available);
}

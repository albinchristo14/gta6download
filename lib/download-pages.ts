export interface DownloadPage {
  slug: string;
  h1: string;
  title: string;
  description: string;
  /**
   * "real" — a legitimate product exists for this term and we route to official stores.
   * "no_product" — nothing legitimate exists; the page must say so plainly before it sells.
   */
  intent: "real" | "no_product";
  storeIds: string[];
  intro: string;
  facts: string[];
  warning?: string;
  relatedSlug?: string;
}

const SCAM_WARNING =
  "Because no copy of GTA 6 exists yet, every file, key or 'early access' link offered for it is necessarily something else. Treat any page with a download button as an attempt to install malware on your machine or take your card details.";

export const downloadPages: DownloadPage[] = [
  {
    slug: "gta-6-download-ps5",
    h1: "GTA 6 on PS5: how the download will actually work",
    title: "GTA 6 Download for PS5 — Pre-order, Preload and Install Date",
    description:
      "GTA 6 releases on PS5 on 19 November 2026. There is no download yet; here is how to pre-order from the PlayStation Store and what to expect on day one.",
    intent: "real",
    storeIds: ["playstation", "rockstar"],
    intro:
      "PlayStation 5 is one of the two platforms Rockstar has confirmed. Pre-orders are live on the PlayStation Store, and the download itself only becomes available when the game unlocks on 19 November 2026.",
    facts: [
      "Digital pre-orders on PS5 download automatically in the background once pre-load is enabled, so the install completes near the unlock time rather than starting from zero.",
      "Rockstar has not published a day-one install size for PS5, so treat any figure quoted elsewhere as a guess.",
      "A PlayStation Plus subscription is not required to download or own a game; it is only needed for most online multiplayer. Sony has not announced GTA Online's successor, so do not budget for it on assumption.",
    ],
    warning:
      "PSN gift cards sold as a 'GTA 6 download unlock' are a scam. There is nothing to unlock — the purchase is a normal game licence.",
    relatedSlug: "gta-6-release-date-november-19-2026",
  },
  {
    slug: "gta-6-download-xbox",
    h1: "GTA 6 on Xbox Series X|S: pre-order and download",
    title: "GTA 6 Download for Xbox Series X and S — Pre-order and Install Guide",
    description:
      "GTA 6 ships for Xbox Series X|S on 19 November 2026. Pre-orders are open, nothing is downloadable yet, and here is how the install will work.",
    intent: "real",
    storeIds: ["xbox", "rockstar"],
    intro:
      "Xbox Series X|S is the other confirmed platform. Pre-orders are live on the Microsoft Store in the same two tiers as PlayStation — $79.99 Standard and $99.99 Ultimate — and the download unlocks at 5pm PT on 18 November 2026.",
    facts: [
      "Older Xbox consoles are not supported: GTA 6 is Series X|S only, so a Series S with a small SSD is the console most likely to need storage management before day one.",
      "Xbox pre-load behaviour depends on the console's install settings, so leave enough free space before the reported 12 November pre-load window.",
      "Boxed Xbox copies ship with a download code and no disc, which matters if you have a data cap or want to resell the game later.",
    ],
    relatedSlug: "where-to-buy-gta-6-legitimately",
  },
  {
    slug: "gta-6-download-pc",
    h1: "There is no GTA 6 PC download — Rockstar has not announced a PC version",
    title: "GTA 6 Download for PC — No PC Version Has Been Announced",
    description:
      "GTA 6 is confirmed only for PS5 and Xbox Series X|S. There is no PC release date, no official system requirements and no legal GTA 6 PC download.",
    intent: "no_product",
    storeIds: ["rockstar", "steam"],
    intro:
      "Every GTA 6 trailer, store page and press release so far names PlayStation 5 and Xbox Series X|S. Rockstar has not announced a PC version, which means there is no legitimate PC download, no listing, and no published system requirements.",
    facts: [
      "A PC version would have to come with its own storefront listing and system requirements. Neither exists today, so a page claiming either is inventing them.",
      "Rockstar's previous titles did eventually reach PC, and fans expect the same pattern here. That is history, not an announcement, and no date has been attached to it.",
      "Pre-ordering a 'PC edition' is impossible. If a checkout page offers one, it is not selling GTA 6.",
    ],
    warning: SCAM_WARNING,
    relatedSlug: "gta-6-system-requirements-no-official-pc-specs",
  },
  {
    slug: "gta-6-download-steam",
    h1: "GTA 6 is not on Steam, because there is no PC version to sell",
    title: "GTA 6 Steam Download — No Listing Exists",
    description:
      "There is no Steam page for GTA 6. No PC version has been announced, so any 'download on Steam' link is not from Valve and is not the game.",
    intent: "no_product",
    storeIds: ["rockstar", "steam"],
    intro:
      "Searching 'GTA 6 Steam' surfaces a lot of results, but none of them can be genuine: Steam only sells software that exists for the platform, and GTA 6 has not been announced for PC at all.",
    facts: [
      "You can create a Steam wishlist for a game only once Valve has a store page for it. No GTA 6 page exists to wishlist.",
      "Fake Steam gift-card and 'library unlock' offers are a recurring scam format around unannounced PC ports.",
      "If a PC version is ever announced, the legitimate routes will be obvious: an official storefront page with a publisher, a price and system requirements.",
    ],
    warning: SCAM_WARNING,
    relatedSlug: "gta-6-system-requirements-no-official-pc-specs",
  },
  {
    slug: "gta-6-download-epic",
    h1: "GTA 6 is not on the Epic Games Store",
    title: "GTA 6 Epic Games Store Download — Not Announced for PC",
    description:
      "No GTA 6 listing exists on the Epic Games Store because no PC version has been announced. Rockstar sells PC titles through its own launcher and Steam.",
    intent: "no_product",
    storeIds: ["rockstar", "epic"],
    intro:
      "The Epic Games Store has never carried a Grand Theft Auto mainline release: Rockstar sells PC copies through its own launcher and, more recently, Steam. With no PC GTA 6 announced, an Epic listing is not coming from Rockstar.",
    facts: [
      "Epic's GTA titles are unrelated stock, not GTA 6.",
      "'Free GTA 6 on Epic' claims reuse Epic's real weekly free-game giveaways as cover for link farms.",
      "A legitimate announcement would appear on Rockstar's own newsroom before any store page.",
    ],
    warning: SCAM_WARNING,
    relatedSlug: "gta-6-release-date-november-19-2026",
  },
  {
    slug: "gta-6-download-rockstar",
    h1: "Downloading GTA 6 from the Rockstar Games Launcher",
    title: "GTA 6 Rockstar Launcher Download — PC Not Announced",
    description:
      "The Rockstar Games Launcher is where a future PC release would live, but no PC GTA 6 has been announced, so there is nothing to download there.",
    intent: "no_product",
    storeIds: ["rockstar"],
    intro:
      "The Rockstar Games Launcher is Rockstar's own PC storefront and the natural home of a future PC port. Today it has no GTA 6 product, because no PC version has been announced.",
    facts: [
      "You can still pre-order GTA 6 for PS5 or Xbox Series X|S from the Rockstar Store — that purchase is a console licence, not a launcher download.",
      "The launcher's real, documented technical quirk matters for any future PC release: the GTA V version requires a CPU with AVX support and fails to launch without it.",
      "Rockstar Support's published guidance on launcher install and error codes applies to games that exist, not to GTA 6.",
    ],
    warning: SCAM_WARNING,
    relatedSlug: "gta-6-download-and-install-errors",
  },
  {
    slug: "gta-6-download-windows-11",
    h1: "GTA 6 does not download on Windows 11 — or any Windows version",
    title: "GTA 6 Download for Windows 11 — No PC Release Exists",
    description:
      "Windows 11 cannot run GTA 6 because the game has not been announced for PC. No installer, file size or requirement has been published.",
    intent: "no_product",
    storeIds: ["rockstar"],
    intro:
      "Windows version is irrelevant while there is no PC game to install. The specific 'Windows 11 64-bit required' language copied around the web is not a Rockstar statement — it is filler text invented by download-claim pages.",
    facts: [
      "Any stated GTA 6 file size for Windows is fabricated: only an actual PC announcement would produce one.",
      "Windows 10 is reaching end of extended support, which is a real reason a future PC release may target Windows 11 — but that is reasoning, not news.",
      "The honest requirement signal today is GTA V's: Rockstar's own PC list for its previous game requires AVX-capable hardware and 8 GB of RAM.",
    ],
    warning: SCAM_WARNING,
    relatedSlug: "gta-6-system-requirements-no-official-pc-specs",
  },
  {
    slug: "gta-6-download-offline",
    h1: "Playing GTA 6 offline is not something you can do yet",
    title: "GTA 6 Offline Download — Nothing Is Downloadable Yet",
    description:
      "Offline or single-player GTA 6 downloads do not exist pre-launch. Here is what Rockstar has and has not said about offline play.",
    intent: "no_product",
    storeIds: ["rockstar", "playstation", "xbox"],
    intro:
      "'Offline' searches usually mean one of two things: downloading the game without a connection, or playing it without one. Neither is possible today, because no copy of the game is available on any platform.",
    facts: [
      "Console games install from the store service, so a day-one install needs a connection even if play afterwards does not.",
      "Rockstar has not published any statement describing GTA 6's offline versus online structure ahead of launch.",
      "GTA Online requires a persistent connection today; that tells you how Rockstar builds services, not what GTA 6 will include.",
    ],
    warning: SCAM_WARNING,
    relatedSlug: "gta-6-release-date-november-19-2026",
  },
  {
    slug: "gta-6-online-download",
    h1: "GTA 6 Online does not exist yet — and GTA Online is a GTA V feature",
    title: "GTA 6 Online Download — Not Announced",
    description:
      "There is no GTA 6 Online to download. GTA Online ships with Grand Theft Auto V on current consoles and is a separate game service, not a GTA 6 component.",
    intent: "no_product",
    storeIds: ["rockstar"],
    intro:
      "Searches for a 'GTA 6 Online download' mix two different things. GTA Online is the multiplayer service bundled with GTA V, which you can buy today. GTA 6 Online has not been announced as a product, separately or bundled.",
    facts: [
      "The Enhanced and Expanded edition of GTA V ships with up to $1,250,000 in GTA Online money as an incentive — that is GTA V, not GTA 6.",
      "Rockstar's last published GTA Online roadmap covers updates to the existing service, not a GTA 6 multiplayer component.",
      "Any 'GTA 6 Online money generator' or mod-credit tool is a credential-harvesting attempt, not a product.",
    ],
    warning: SCAM_WARNING,
    relatedSlug: "gta-6-release-date-november-19-2026",
  },
  {
    slug: "gta-6-download-mobile",
    h1: "There is no GTA 6 for mobile — and never an announced one",
    title: "GTA 6 Mobile Download — No Android or iOS Version Exists",
    description:
      "GTA 6 is not coming to mobile. It is confirmed only for PS5 and Xbox Series X|S, so every GTA 6 APK or App Store listing is a scam.",
    intent: "no_product",
    storeIds: ["rockstar"],
    intro:
      "GTA 6 is a current-generation console release with no announced PC, let alone mobile, version. A mobile download for it cannot exist, and Rockstar's mobile back catalogue is a separate licensing business.",
    facts: [
      "Grand Theft Auto: San Andreas has been re-released on Android and iOS before, which is why mobile GTA searches surface real apps from 2021 and earlier — none of them are GTA 6.",
      "Nothing in Rockstar or Take-Two's announcements mentions mobile, cloud or streaming for GTA 6.",
      "A 'GTA 6 APK' file is not a game build. It is an app of unknown origin asking for device permissions.",
    ],
    warning: SCAM_WARNING,
    relatedSlug: "how-to-avoid-gta-6-download-scams",
  },
  {
    slug: "gta-6-android-download",
    h1: "Any GTA 6 Android APK is malware, because there is no Android version",
    title: "GTA 6 Android Download / APK — Scam Warning",
    description:
      "No GTA 6 Android APK exists. Rockstar has not announced a mobile version, so sideloaded 'GTA 6' files are malware or adware.",
    intent: "no_product",
    storeIds: ["rockstar"],
    intro:
      "Android's sideloading workflow makes it the easiest platform for fake game files, which is exactly why GTA 6 APK pages exist. There is no Android release date, no announcement, and therefore no legitimate file.",
    facts: [
      "Rockstar publishes on Google Play under an identifiable developer entry. Anything outside that is not Rockstar.",
      "APKs distributed by search ad or TikTok link, then asking for a 'human verification' step, are a well-documented pattern for credential theft.",
      "Play Protect does not make a fake GTA 6 APK safe: the file is not a game in the first place.",
    ],
    warning: SCAM_WARNING,
    relatedSlug: "how-to-avoid-gta-6-download-scams",
  },
  {
    slug: "gta-6-ios-download",
    h1: "There is no GTA 6 for iPhone or iPad",
    title: "GTA 6 iOS Download — Nothing on the App Store",
    description:
      "GTA 6 is not on the App Store and has not been announced for iOS. 'TestFlight' and 'beta profile' GTA 6 offers are scams.",
    intent: "no_product",
    storeIds: ["rockstar"],
    intro:
      "Apple's App Store has a defined review process, and no GTA 6 product listing exists in it. Claims about an iOS build usually arrive as TestFlight invitations or configuration-profile 'betas', which are how mobile credential scams present themselves.",
    facts: [
      "Rockstar has announced GTA 6 for PlayStation 5 and Xbox Series X|S only.",
      "iOS 'game betas' that ask for an Apple ID sign-in outside apple.com are harvesting credentials.",
      "Real GTA titles on the App Store are the older re-releases and GTA: San Andreas, not GTA 6.",
    ],
    warning: SCAM_WARNING,
    relatedSlug: "how-to-avoid-gta-6-download-scams",
  },
  {
    slug: "gta-6-apk-download",
    h1: "Do not download a GTA 6 APK",
    title: "GTA 6 APK Download — What These Files Actually Are",
    description:
      "A GTA 6 APK cannot be the game. Here is how the files are distributed, what they actually do, and how to check a device you already opened one on.",
    intent: "no_product",
    storeIds: ["rockstar"],
    intro:
      "This page exists because people have already downloaded one. A GTA 6 APK is not the game under any circumstance — no build of GTA 6 exists for Android — so the file is whatever else it was packaged to be.",
    facts: [
      "Common payloads behind fake game APKs are adware wrappers, SMS-premium routers, banking trojans and credential forms dressed as 'verification'.",
      "Checking a device means reviewing installed apps against install dates, revoking device-admin permissions, and running Play Protect or a reputable scanner.",
      "If you paid for the file with a card, cancel the card rather than chasing a refund from the storefront that sold it.",
    ],
    warning:
      "There is a repeatable shape to these operations: a storefront claims a Rockstar partnership, takes payment for 'early access' that cannot exist, moves to a new domain when called out, and has no refund process. If you have already paid, cancel the card rather than waiting on that merchant.",
    relatedSlug: "how-to-avoid-gta-6-download-scams",
  },
];

export function getDownloadPage(slug: string): DownloadPage | undefined {
  return downloadPages.find((p) => p.slug === slug);
}

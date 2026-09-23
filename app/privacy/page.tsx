import { siteConfig } from "@/site.config";
import { pageMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader, Section, Prose } from "@/components/Layout";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "Privacy Policy — What GTA6Download Collects",
  description:
    "How GTA6Download handles email addresses, analytics, cookies and advertising data, how long we keep it, and how to exercise your rights.",
  path: "/privacy",
});

const crumb = [
  { name: "Home", href: "/" },
  { name: "Privacy", href: "/privacy" },
];

const EFFECTIVE = "22 September 2026";

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumb.map((c) => ({ name: c.name, url: absoluteUrl(c.href) })))} />
      <PageHeader
        crumbs={crumb}
        eyebrow={`Effective ${EFFECTIVE}`}
        title="Privacy policy"
        description="Short version: we collect your email only if you give it to us, we do not sell it, and the analytics and advertising tools we may use are named below rather than buried."
      />

      <Section title="What we collect">
        <Prose>
          <h2>Email address, if you submit it</h2>
          <p>
            The notify forms on this site send the address you type, plus the page it came from, to our
            email provider. We use it to tell you when GTA 6 becomes downloadable and if a PC version is
            ever announced. We do not add you to a newsletter you did not ask for, and we do not sell or
            rent the list. Every message carries a one-click unsubscribe, and unsubscribing deletes the
            address from our sending tool rather than muting it.
          </p>

          <h2>Usage data, if analytics are enabled</h2>
          <p>
            We may use privacy-configured Google Analytics 4 and Microsoft Clarity to see which pages
            answer the question people came for. That means approximate location from IP address,
            device and browser info, referrer, and session behaviour. Clarity records anonymised
            session replays and heatmaps; we configure it to mask anything that looks like personal
            data, and we do not use it to identify individuals.
          </p>

          <h2>Advertising data, if ads are enabled</h2>
          <p>
            Display advertising may be served by Google AdSense once this site is approved. Ad networks
            use cookies to serve ads based on prior visits to this and other sites, and Google's use of
            its advertising cookies enables it and its partners to personalise ads. Opt out at{" "}
            <a
              href="https://www.google.com/settings/ads"
              rel="nofollow noopener"
              target="_blank"
              className="font-semibold text-brand-700 underline underline-offset-2"
            >
              google.com/settings/ads
            </a>
            . While ads are off, this page is exactly as it looks now: no trackers, no third-party
            cookies.
          </p>

          <h2>What we never collect</h2>
          <ul>
            <li>Payment or card details — we take no payments, and storefront purchases happen on the retailer's own site.</li>
            <li>Passwords or accounts — there is no login on this site.</li>
            <li>Precise geolocation, contacts, or anything read from your device beyond standard HTTP headers.</li>
          </ul>
        </Prose>
      </Section>

      <Section title="Cookies and local storage">
        <Prose>
          <p>
            Strictly necessary storage keeps the site working. Analytics and advertising cookies are
            third-party cookies set by those providers, and they are only present when those tools are
            switched on. Nothing here writes a cookie to track you across other websites from our side.
          </p>
        </Prose>
      </Section>

      <Section title="Who else sees this data">
        <Prose>
          <ul>
            <li>Our hosting and deployment provider, which processes IP addresses and request logs to serve the site.</li>
            <li>Our email provider, which stores subscribed addresses until you unsubscribe or we delete them.</li>
            <li>Analytics and, if enabled, advertising providers, under their own policies.</li>
          </ul>
          <p>
            We do not sell personal information, and we do not share it for others' marketing. Legal
            disclosure to an authority under a valid request is the only other route, and we would
            tell you about it unless prohibited.
          </p>
        </Prose>
      </Section>

      <Section title="Retention, rights and children">
        <Prose>
          <p>
            Subscribed addresses are kept while you remain subscribed, and removed on unsubscribe.
            Server logs are short-lived by host default. Under GDPR and UK GDPR you can request access,
            correction, deletion, a portability export, or restriction of processing; under the CCPA/CPRA
            California residents can request disclosure, deletion and opt-out of sale — we do not sell
            personal information, so there is nothing to opt out of. Email{" "}
            <a href={`mailto:${siteConfig.supportEmail}`} className="font-semibold text-brand-700 underline underline-offset-2">
              hello@gta6download.store
            </a>{" "}
            to make a request; we will not ask for more identity than we need to be sure it is your data.
          </p>
          <p>
            This site is not directed at children and we do not knowingly collect data from anyone under
            16. If you believe a child has subscribed, contact us and we will delete the record.
          </p>
          <p>
            If this policy changes materially we will update the effective date above and, for
            subscribers, say so in the next email rather than silently.
          </p>
        </Prose>
      </Section>

      <Section>
        <p className="text-sm text-ink-600">
          Related: <Link href="/disclaimer" className="font-semibold text-brand-700 underline underline-offset-2">disclaimer</Link>,{" "}
          <Link href="/about" className="font-semibold text-brand-700 underline underline-offset-2">how we source content</Link>.
        </p>
      </Section>
    </>
  );
}

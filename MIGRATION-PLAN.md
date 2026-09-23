# WordPress → static migration — Plan

Status: **§8 build work committed as `519c0b3` and live on the Netlify preview · N1 and N2 applied · B4, B5 closed and the privacy copy approved 23 Sep · C3, C4, G2, G4, G6, G7 remain dashboard or cutover steps**
Drafted: 2026-09-22
Updated: 2026-09-22 — blocker answers from Adam; D2 revised to hCaptcha after Turnstile turned out to be Web3Forms PRO; **G7** found while verifying B6; then §8 applied.
Source: Karina, 22 Sep — *"we have spam protection on the old website as well as cookies (a subscription)
and google dashboard — we are migrating from the old site. how can we support spam protection
(recaptcha)? cookies? google dashboard?"*, with the WordPress plugin list
Companion: [CFO-REVIEW-2-PLAN.md](CFO-REVIEW-2-PLAN.md) (content), [BLOCKS-PLAN.md](BLOCKS-PLAN.md) (build).
This plan covers only the **operational** side of cutover — the three things Karina named, plus the
two nobody named that will hurt more. It says nothing about page copy.

---

## 0. Summary

Karina's three questions map onto three plugin stacks that do not exist on the new site. None of them
is hard. But answering them surfaced two problems that are bigger than all three:

| | What WordPress does | What the new site does | Item |
|---|---|---|---|
| Spam protection | reCAPTCHA v3 + Universal Honey Pot (+ Akismet, deactivated) | **nothing** — the Web3Forms access key sits in public HTML, anything can POST to it | S1–S3 |
| Cookies | Cookiebot (Usercentrics) auto-blocking, *and* Complianz — two CMPs at once | no cookies at all, but Google Fonts called on every page | C1–C5 |
| Google dashboard | Site Kit = a WP-admin window onto Search Console + GA4 | no GA4, **no Search Console verification — access is lost at cutover** | G1–G6 |
| *(not asked)* Old URLs | 13 indexed URLs | 1 of 13 redirected. Twelve 404s on cutover day | R1–R4 |
| *(not asked)* Privacy policy | Complianz-generated, describes WordPress | **shipped verbatim in `d4e2f44` — now describes a site that does not exist** | P1–P3 |

The two unasked items are the ones that cost money. Losing Search Console verification locks you out
of the property; twelve unredirected URLs discard whatever ranking they hold; and a privacy policy
claiming ad cookies and LinkedIn sharing on a site that sets no cookies is a compliance problem in
its own right — one that is *created*, not merely inherited, the moment the new site goes live.

**Sequencing that matters:** C4 (force a Cookiebot rescan) must happen **before** C7 (embed the
cookie declaration), or the page renders the WordPress cookie list under the new policy text.

> ### ⚠ The step that must not be skipped
>
> ~~**G2**~~ — **done and verified 23 Sep.** See §2.1.
>
> One silent failure is left. Everything else in this plan announces its own failure; this one looks
> completely normal in a browser and is expensive to discover late.
>
> **G7 — at cutover, make `agree-tech.com` the Netlify *primary domain*, then trigger a fresh
> deploy, then `curl -I` and confirm `x-robots-tag: noindex` is gone.** Adding the domain as an
> *alias*, or changing it without redeploying, leaves the live production site carrying `noindex`.
> The site will look perfect to every human who visits it and will simply never appear in Google.
> Nothing reports this but a line in a build log.

---

## 1. Decisions taken — 22 September 2026

| # | Decision | Chosen | Consequence |
|---|---|---|---|
| D1 | Analytics and cookies | **GA4 + Cookiebot.** Carry `G-J8MP9W1XGZ` and the existing Cookiebot account across | Karina keeps the same dashboard with unbroken history. The site gains a consent banner and a third-party script on every page. Nothing new to buy. |
| D2 | Spam protection | ~~Cloudflare Turnstile~~ → **hCaptcha** (revised 22 Sep) | **Turnstile is a Web3Forms PRO feature**, discovered after the Cloudflare widget was already created. On the free tier hCaptcha is the only captcha that works — and it is zero-config, needing no keys and no dashboard access. It does set cookies, so it must be declared in Cookiebot (C6). See §3.1. |
| D3 | Hosting at cutover | **Netlify** | Not really open — `cms/src/lib/publish.ts:10` already builds the publish pipeline on push-triggers-build, deliberately, *"so the CMS being down can never take the site down"*. See §2.3. |
| D4 | Privacy + cookie copy | **Drafted here → APPROVED by Karina, 23 Sep** | P1–P3 closed. 62 paragraphs across `content/{en,da,pl}/privacy.json`, committed in `519c0b3` and `498e176` and live on the preview. Approval landed before anything reached the public domain, which is what mattered. |

**Rejected, and why it is worth recording:** keeping reCAPTCHA v3 was the only captcha option that
costs money *and* makes the cookie problem worse — reCAPTCHA is a Web3Forms **PRO** feature, and it
sets Google cookies. The Web3Forms honeypot (`botcheck`) is marked deprecated in their own docs, so
it is not a fallback either.

---

## 2. Facts carried over from the live site

Read out of `https://www.agree-tech.com/` on 22 Sep. **These are the values the migration needs; they
are not recoverable once WordPress is gone.** Treat this table as the reason not to decommission the
old install in a hurry.

### 2.1 Identifiers

| What | Value | Where it lives today |
|---|---|---|
| GA4 measurement ID | `G-J8MP9W1XGZ` | Site Kit / gtag |
| Google Tag (container) | `GT-KD7DXG73` | Site Kit |
| Search Console verification | `sys3vnHMWMvZ1TZn-PVWAnu9H2g23P8L4WhxRUI_M6s` | Meta Tag Manager plugin |
| Search Console verification | `-YoCNooMN1yzkB9FCzlLpvmViutkd2bVRROL4R2SsrI` | Site Kit |
| Cookiebot domain group | `d308660e-f6c7-4a86-a313-12360c962166` | `consent.cookiebot.com/uc.js`, `data-blockingmode="auto"` |
| reCAPTCHA v3 site key | `6Lf0wLMqAAAAADVs8PQbK_yHinMDtgKGrkDcgV-z` | Advanced Google reCAPTCHA |
| Web3Forms access key | `07b59940-9095-4781-b372-7adf5cbe4570` | already on the new site, `components/contact-form.html:12` |

Two Search Console verifications exist because two plugins each added one.

**Corrected 23 Sep, after G2.** A DNS lookup showed `sys3vnHMWMvZ...` was *already* published as a TXT
record on the apex as well as being injected as a meta tag — so that verification would probably have
survived WordPress being removed, and the original framing here (that both would vanish) overstated
the risk. G2 was still the right move: a **Domain** property verified by DNS covers every subdomain
and protocol and depends on no plugin. The apex now publishes two verification tokens:

```
google-site-verification=TD-5HnlimAlQ8GCUmGWVAEFpAglln33Wly35dXH6AxU   (Domain property, added 23 Sep)
google-site-verification=sys3vnHMWMvZ1TZn-PVWAnu9H2g23P8L4WhxRUI_M6s   (pre-existing)
```

### 2.2 The 13 indexed URLs

From the live Rank Math `page-sitemap.xml`:

```
/                                                            /hubspot-leads-landing-page/
/contact-3/                                                  /benefits-of-billing-automation/
/subscription-management-platform-b2b/                       /cpq-software-european-businesses/
/process-optimization-tools-agree-technologies-2/            /new-platform/
/about-agree-technologies-b2b-cpq-billing/                   /implementation/
/what-is-subscription-management-for-saas-teams/             /privacy-policy/
/b2b-subscription-management-solutions-agree-technologies-solution/
```

Plus three sitemaps that will 404: `sitemap_index.xml`, `video-sitemap.xml`, `local-sitemap.xml`.

### 2.3 Why Netlify, in the code's own words

`cms/src/lib/publish.ts:10` —

> *"The site is built by Netlify from what is in git, not from this server — deliberately, so the CMS
> being down can never take the site down, and so `git log` keeps answering who changed a line and
> when. Publishing is therefore a commit: clone the branch Netlify builds, run the same export an
> engineer would run by hand, and push whatever changed. Netlify takes it from there."*

Moving to the Hetzner box would re-couple site availability to the machine running the CMS — the
exact failure mode that comment says was designed out — and would mean rewriting `_redirects` into
nginx.

**Re-examined 22 Sep**, on the fair objection that Netlify was a Decap-era choice and the site is now
plain static output that could live anywhere:

| | Netlify (today) | Hetzner dev box | one.com |
|---|---|---|---|
| Cost | **free tier, already covers this** | already paid, but see below | already paid |
| Build on publish | automatic — `publish.ts` pushes, Netlify builds | must build a webhook receiver + build step | none; `publish.ts` would need rewriting to SFTP |
| Redirects | `_redirects`, already generated | rewrite into nginx | `.htaccess`, if permitted |
| TLS | automatic | certbot to install and renew | provided |
| Deploy previews | yes — **this plan's step 9 depends on them** | no | no |
| Rollback | one click to any prior deploy | manual | manual |
| Site survives CMS box failure | yes | **no** | yes |

**Decision: stay on Netlify.** The cost argument does not favour moving — Netlify is already free at
this size, so a move buys nothing and costs nginx config, certificate renewal, a build trigger, and
the loss of deploy previews and one-click rollback. one.com is the weakest option: no build
automation at all, which would mean rewriting the publish pipeline that already works.

Two clarifications worth recording, because they drove the question:

- **The Cookiebot cost is not a Netlify cost.** It comes from the staging domain differing from the
  production domain, which is true on *any* host — and Cookiebot counts subdomains as separate
  domains too, so `staging.agree-tech.com` on the Hetzner box would need an alias just the same.
  Moving hosts would not have saved it. (And per §3.2 we are not buying it anyway.)
- **Netlify was not chosen by Decap.** `publish.ts` was written around push-triggers-build
  deliberately and for a reason that outlives the CMS choice: the site must not go down when the
  box running the CMS does.

One caveat to record and accept: Netlify is a US company, while the site markets *"European HQ,
GDPR-native"*. For static pages with no personal data at rest this is defensible (the exposure is
request logs / IPs), Netlify serves from EU edge nodes and offers a DPA. **Action: countersign the
Netlify DPA and note it in the processor list (P2).** If that ever becomes unacceptable, the answer
is a European static host — not the CMS box.

---

## 3. Work items

### 3.1 Spam protection — hCaptcha

**What the free Web3Forms tier actually offers**, checked 22 Sep against their own documentation:

| Method | Plan | Verdict |
|---|---|---|
| Server-side spam filter | free, already on | keep, but not enough alone |
| `botcheck` honeypot | free | **deprecated in their own docs** — not a foundation |
| **hCaptcha** | **free**, zero-config (Web3Forms' shared sitekey) | **chosen** |
| Cloudflare Turnstile | **PRO** | ruled out on cost |
| Google reCAPTCHA v3 | **PRO** | ruled out on cost *and* cookies |

The Cloudflare widget created on 22 Sep (site key `0x4AAAAAAE_1DbCPMrqi8Wot`) is therefore **parked,
not used**. Leave it; it costs nothing and becomes the better option the moment Web3Forms PRO is
ever justified, because Turnstile sets no tracking cookies and hCaptcha does.

| # | Item |
|---|---|
| **S1** | `components/contact-form.html` — add `<div class="h-captcha" data-captcha="true"></div>` inside the `<form>`, above the submit button. No keys: Web3Forms supplies the sitekey. |
| **S2** | Load `<script src="https://web3forms.com/client/script.js" async defer></script>` from `shell/contact.head.html` — not the shared head partial, since no other page has a form. |
| **S3** | Nothing to configure server-side. The widget posts `h-captcha-response` alongside the access key and Web3Forms verifies it. **No dashboard access needed**, which also closes the open question of who owns the Web3Forms account. |

**Gotcha — unchanged, and now more likely:** once Cookiebot lands (C2), its auto-blocker must not
block the captcha, or the form becomes unsubmittable and fails *silently*. hCaptcha is **more**
exposed to this than Turnstile would have been, precisely because it does set cookies and therefore
looks to an auto-blocker like something worth blocking. See **C6**.

**What this fixes:** the Web3Forms server-side filter is already on, but the access key sits in
public HTML (`components/contact-form.html:12`), so the endpoint can be hit directly. The captcha is
what closes that.

**Consent treatment:** hCaptcha is spam protection on a form the visitor chose to use, so it is
declared **Necessary** rather than consent-gated. That is the standard treatment and it is what
keeps the form working before anyone answers the banner.

### 3.2 Cookies and consent

| # | Item |
|---|---|
| **C1** | **Self-host the fonts first.** Every head shell loads Geist + JetBrains Mono from `fonts.googleapis.com` / `fonts.gstatic.com`. Download the woff2 files to `assets/fonts/`, add `@font-face` to `styles.css`, drop the `<link>`. Faster, removes the last unconsented Google call — and *prevents Cookiebot's auto-blocker from blocking the stylesheet and rendering the whole site in a fallback face until the visitor accepts.* Do this before C2. |
| **C2** | Add Cookiebot to the head, **first script on the page**, before anything it must block: `<script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="d308660e-f6c7-4a86-a313-12360c962166" data-blockingmode="auto"></script>`. Drop `data-implementation="wp"` — that flag is for the WordPress plugin. |
| **C3** | Enable **Google Consent Mode v2** in the Cookiebot dashboard so GA4 (G1) receives `denied` defaults before any consent and upgrades on accept. Without it GA4 fires unconditionally and the banner is theatre. |
| **C4** | **Manually re-scan** the domain in Cookiebot after go-live so the cookie declaration table reflects the *new* site — it currently describes WordPress, listing advertising and LinkedIn cookies that no longer exist. Scan frequency is **Monthly** (seen 23 Sep), so waiting for the automatic scan would leave a declaration contradicting the rewritten policy for weeks. Force it on cutover day. Point the declaration at the privacy page (P1). |
| **C5** | Add a **"Cookie settings"** link to `src/_foot.html` (calling `Cookiebot.renew()`), in all three locales. Withdrawing consent must be as easy as giving it; the old policy already promises this (`content/en/privacy.json:20`) and the new footer has no such link. |
| **C6** | **Classify hCaptcha as *Necessary*** in the Cookiebot cookie declaration, and confirm the auto-blocker does not hold back `hcaptcha.com` / `web3forms.com/client/script.js`. Spam protection on a form the visitor chose to use is necessary, not consent-gated — and if it *were* gated, the form would be dead until someone clicked Accept. This is a **dashboard setting, no redeploy**, which is what makes the free path in §5 viable. |

**Mechanism, not 13 copy-pastes:** `build.js:197` and `:207` already inject shared markup by
`out.replace('</head>', …)` with a partial loaded at `build.js:395`. Add **`src/_head.html`** and load
it the same way, so C2/C3 and G1 are one file across 13 pages × 3 locales. Exclude `index-print.html`
— it is `noindex` and has no business running analytics or showing a banner.

**Danish law note:** Denmark's cookie rules require consent *before* non-essential cookies are set.
`data-blockingmode="auto"` is what delivers that, and it is already how the old site is configured —
so this is continuity, not a new posture.

#### Cookiebot sizing and the staging problem (answers B4)

Published Cookiebot tiers, and what a "subpage" means:

| Tier | Price | Domains | Subpages per domain |
|---|---|---|---|
| Free | €0 | 1 | 50 |
| Premium Lite | €7/mo | 1 | 50 |
| Premium Small | €15/mo per domain | many | 350 |
| Premium Medium | €30/mo per domain | many | 3,500 |
| Premium Large | €50/mo per domain | many | 7,000 |
| Premium XLarge | €90/mo per domain | many | 7,000+ |

**Capacity is a non-issue.** Cookiebot counts *paths* as pages of one domain and only **subdomains**
as separate domains — so `/en/`, `/da/` and `/pl/` are all `agree-tech.com`, totalling 37 subpages.
That fits inside the **free** tier, let alone a paid one. No upgrade is needed for the live site.

**The real constraint is staging, not size.** `agree-tech.netlify.app` is a *different domain*, so
the banner will not render there on an unregistered plan — testing on a staging domain needs
**domain aliases, which are a Premium feature** (the banner then renders marked `TEST`). Cookiebot
also requires the domain group to contain at least one live domain, because auto-blocking is driven
by the scan of the real site.

This forks runbook step 9:

- **On a Premium plan** — add `agree-tech.netlify.app` as a domain alias, and step 9 works as
  written: the banner/captcha interaction is proven before DNS moves. Free to us if the existing
  subscription already covers it.
- **On Free** — Cookiebot cannot be tested before cutover. Verify the captcha on the preview
  *without* Cookiebot (which still proves the form and Web3Forms work), cut over, and re-run step 9
  against production immediately.

**Decision (22 Sep): do not buy a plan for this.** The free path is acceptable because the failure
it exposes us to is **cheap to fix**: if the auto-blocker eats hCaptcha, the symptom is a form that
will not submit, and the remedy is **C6 — a Cookiebot dashboard setting, applied in minutes with no
redeploy and no rollback**. That is a very different risk from one needing a code change under
pressure. Earlier drafts of this plan called post-cutover testing "the worst possible moment"; with
C6 understood as a dashboard toggle, that was overstated.

Still worth asking, because it is free if the answer is yes: **does the existing plan include domain
aliases?** Check `admin.cookiebot.com` → account / subscription. If it does, take the safer path at
no cost.

### 3.3 Analytics and the Google dashboard

Site Kit has no static equivalent and none is needed. It was only a WP-admin *window* onto two
services that are attached to the **domain**, not to WordPress. Karina uses
`analytics.google.com` and `search.google.com/search-console` directly, same properties, same
history — provided G2 happens on time.

| # | Item |
|---|---|
| **G1** | Add the gtag snippet for `G-J8MP9W1XGZ` to `src/_head.html`, **after** the Cookiebot tag. Same measurement ID = unbroken year-on-year history. |
| **G2** | **Before cutover — verify Search Console by DNS TXT** at the registrar (one.com). Both current verifications are meta tags injected by plugins; when WordPress goes, verification goes, and with it access to the property. DNS verification is hosting-independent, survives every future migration, and covers all subdomains and protocols. **This is the highest-consequence item in the plan and it depends on registrar access (B2).** |
| **G3** | Belt and braces: also carry both meta tags from §2.1 into `src/_head.html` for the cutover window. Cheap, removes any gap between DNS propagation and go-live. Can be deleted a month later. |
| **G4** | Submit `https://www.agree-tech.com/sitemap.xml` (37 URLs, already generated by `build.js:308`) in Search Console. |
| **G5** | Remove the four dead Rank Math sitemaps from Search Console, and redirect `/sitemap_index.xml → /sitemap.xml` so any cached reference lands somewhere real. |
| **G6** | Annotate the cutover date in GA4 so the traffic shape change has an explanation attached a year from now. |
| **G7** | **Make `agree-tech.com` the *primary domain* in Netlify — not merely a domain alias — and then trigger a fresh deploy.** See below. This is a cutover step, not a build step. |

#### G7 — the noindex switch (found while verifying B6)

`https://agree-tech.netlify.app/en/` is live and correctly serving `x-robots-tag: noindex`, so the
staging copy is not competing with the real site. That guard is well built and self-cancelling:
`writeStagingHeaders()` (`build.js:379`) writes the header unless `isLiveUrl()` (`build.js:370`)
finds that Netlify's `URL` hostname matches `SITE` with `www.` stripped — so it switches itself off
"the moment the primary domain becomes agree-tech.com — no edit required".

It cancels correctly. But it can fail to cancel in two ways, and both produce the same outcome: a
production site that is invisible to Google, announced by nothing but a build-log line.

1. **Alias instead of primary.** Adding `agree-tech.com` as a domain *alias* while leaving
   `agree-tech.netlify.app` as the primary domain leaves `URL` pointing at netlify.app. `isLiveUrl()`
   returns false, and production ships `noindex`.
2. **No rebuild.** The header is baked into `dist/_headers` at **build time**. Changing the primary
   domain does not rebuild anything, so the old noindex header keeps being served until a fresh
   deploy runs.

**Therefore, at cutover: set the primary domain → trigger a redeploy → `curl -I` the live URL and
confirm `x-robots-tag` is gone.** Apex or `www` both work (the comparison strips `www.`). Verified
today: `/` returns 302 → `/en/`, `/privacy-policy` returns 301 → `/en/privacy.html`, and the other
eleven legacy URLs 404 exactly as R1 predicts.

**Set expectations with Karina:** Search Console *will* show a spike in crawl errors and coverage
changes for a few weeks after any migration — that is normal and is what R1–R4 minimise. It is not a
sign something broke.

### 3.4 Redirects and SEO

| # | Item |
|---|---|
| **R1** | Extend `writeRootRedirect()` in `build.js:323` with the legacy map below. The function already carries one hand-written rule (`/privacy-policy`) with a comment explaining why, so this is an established pattern, not a new mechanism. |
| **R2** | Check the three subscription-themed URLs in Search Console **before** collapsing all three onto `subscription.html`. If one carries real traffic on a distinct query, it may deserve its own page rather than a redirect. Blocked on **B3**. |
| **R3** | Confirm trailing-slash behaviour. Every old URL is indexed *with* a trailing slash; the existing rule is written without one (`/privacy-policy`). Netlify normalises, but verify with `curl -I` against the deploy preview rather than trusting it. |
| **R4** | After go-live, crawl the old URL list and assert every one returns `301` to a `200`. |

```
/hubspot-leads-landing-page/                                          → /en/contact.html
/contact-3/                                                           → /en/contact.html
/benefits-of-billing-automation/                                      → /en/billing.html
/subscription-management-platform-b2b/                                → /en/subscription.html
/what-is-subscription-management-for-saas-teams/                      → /en/subscription.html
/b2b-subscription-management-solutions-agree-technologies-solution/   → /en/subscription.html
/cpq-software-european-businesses/                                    → /en/cpq.html
/process-optimization-tools-agree-technologies-2/                     → /en/process.html
/new-platform/                                                        → /en/platform.html
/about-agree-technologies-b2b-cpq-billing/                            → /en/about.html
/implementation/                                                      → /en/implementation.html
/privacy-policy/                                                      → /en/privacy.html   (exists)
/                                                                     → /en/  302          (exists)
```

`/` stays a **302** deliberately — it is a locale redirect, not a permanent move, and `x-default`
already points at `/en/` (verified in `dist/en/index.html`). Leave it alone.

### 3.5 Privacy and cookie policy

The policy committed in `d4e2f44` is the Complianz output from WordPress, carried over verbatim. On
the new site it is **false in three directions at once**:

| Claim | Where | Reality |
|---|---|---|
| *"cookies to customize our content and ads… analytics partners… social media partners"* | `content/en/privacy.json:18` | The site sets no cookies today. After C2/G1 it sets exactly one category: Google Analytics. |
| *"your visit is shared with **LinkedIn**… to target ads to you"* | `content/en/privacy.json:31` | No LinkedIn tag exists on the new site. |
| *"When you sign up for our **newsletter**…"* | `content/en/privacy.json:53` | There is no newsletter and no signup form. |
| *"Creation of profile"*, *"Marketing"*, retargeting via external partners | `:22`, `:26`, `:57` | None of this happens. |
| **Web3Forms** — receives every lead submitted | *absent* | The one processor that genuinely handles personal data is not named anywhere. |
| **Netlify** — serves every page, logs every request | *absent* | Same. |

| # | Item |
|---|---|
| **P1** | Rewrite the `cookies` section against what the site actually does after C2/G1: one analytics category, Cookiebot as the consent manager, the "Cookie settings" link from C5, and the real retention — see below. |
| **P2** | Rewrite `3. Recipients of personal data` with the real processor list: **Web3Forms** (lead data), **Netlify** (hosting/logs), **Google** (analytics), **hCaptcha / Intuition Machines** (spam protection). Remove LinkedIn. Each needs a DPA on file — Netlify's is the one to chase first (§2.3). |
| **P3** | Delete the newsletter, profiling and retargeting paragraphs. Apply all three across `content/{en,da,pl}/privacy.json` — the da and pl files exist and carry the same false claims. |

#### The "26 months" claim is wrong no matter what the setting says (answers B5)

The policy states data is kept 26 months, twice (`content/en/privacy.json:29`, `:51`). **A standard
GA4 property cannot be set to 26 months** — the only values are **2 months** or **14 months**. 26 was
a *Universal Analytics* option, so this sentence is inherited text describing a product Google
retired. It is wrong today and will still be wrong after cutover.

To read the real number: **GA4 → Admin → Data Settings → Data Retention → "Event data retention"**.
Increasing it applies retroactively to data not yet deleted, and there is a 24-hour delay before a
change takes effect (revertible within that window). Whatever it reads — 2 or 14 — that is the
number P1 writes into all three locales.

Drafts go out for Karina's review before anything merges (**D4**). This is the item most likely to
need a second pair of eyes; it is also the cheapest one to get right.

---

## 4. Blocked — needs an account, an answer, or an asset

| # | Blocker | Status | Blocks |
|---|---|---|---|
| **B1** | Cloudflare account | **Closed — not needed.** Account and widget created (`0x4AAAAAAE_1DbCPMrqi8Wot`), then Turnstile turned out to be Web3Forms PRO. Widget parked, costs nothing; hCaptcha needs no account, no keys, no dashboard. | — |
| **B2** | Registrar (one.com) DNS access | **Closed.** G2 completed and verified 23 Sep. | — |
| **B3** | Which legacy URLs fold onto `subscription.html` | **Answered: all of them.** Note there are **three**, not four — `/subscription-management-platform-b2b/`, `/what-is-subscription-management-for-saas-teams/`, `/b2b-subscription-management-solutions-agree-technologies-solution/`. If a fourth was intended, say which and R1 changes. R2 is closed; no Search Console lookup needed. | R1 |
| **B4** | Cookiebot plan | **Answered 23 Sep — aliases are available.** Karina's Domains & Aliases screen lists `www.agree-tech.com` with an **Aliases** column (currently 0), which the free tier does not offer. So runbook step 9 runs as written, before DNS moves, at no extra cost. Same screen shows **Pages 24** (the WordPress count; the new site is 37, still within limits) and **Scan frequency: Monthly** — which is why C4 must be a *manual* rescan, not a wait. | closed |
| **B5** | GA4 retention | **Answered 23 Sep.** The property has *two* settings, not one: **Event data 2 months** (the default) and **User data 14 months** with *Reset on new user activity* ON — so the user-level clock runs from the visitor's **last** visit. Both are now stated in all three locales. Also caught a second stale claim this exposed: the deletion section said data was kept *1 year*. | closed |
| **B6** | Netlify site | **Exists and is healthy** — `agree-tech.netlify.app`, correctly `noindex`ed, redirects behaving. Raised **G7**: the noindex must be switched off deliberately at cutover. | §5 |

---

## 5. Cutover runbook

Ordered so that nothing irreversible happens before the reversible checks pass.

**T-minus (any time before):**
1. **G2 — DNS TXT verification in Search Console.** Confirm it reports verified *while WordPress is
   still up*. Nothing else in this list is allowed to start until this is green.
2. C1 self-host fonts → build → verify typography is unchanged.
3. S1 + S2 add the hCaptcha widget and script. No keys, no accounts, no dashboard (§3.1).
4. B4 ask Karina whether the Cookiebot plan includes **domain aliases** — not capacity, which fits. If it does, add
   `agree-tech.netlify.app` as an alias now so step 9 can run.

**T-minus (build work, all on the `payload` branch, all verifiable on a deploy preview):**
5. C2 + C3 + G1 + G3 via the new `src/_head.html`; C5 footer link; S2 the widget.
6. R1 the legacy redirect map in `build.js:323`.
7. P1–P3 privacy drafts → **Karina reviews** → merge.
8. `npm run build:blocks`, then `npm run verify:parity` — the repo's existing guard that the src
   build and the blocks build agree. A head-partial change touches every page; this is exactly what
   that check is for.

**On the deploy preview, before touching DNS — the whole point of doing it here:**
9. Submit the contact form in a **fresh incognito window without accepting the banner**. It must
   succeed. (This is the hCaptcha/Cookiebot interaction from §3.1 and C6.) **Needs the Cookiebot domain
   alias from step 4** — without it the banner does not render on netlify.app and this test proves
   only half of what it needs to.
10. Confirm no GA4 request fires before consent, and that one fires after. Network tab, not faith.
11. Confirm fonts render correctly with the banner dismissed *and* unanswered.
12. `curl -I` every URL in §2.2 against the preview.

**Cutover:**
13. Repoint DNS from one.com to Netlify. Keep TTL low beforehand.
13a. **G7 — set `agree-tech.com` as the Netlify site's *primary domain*** (not an alias), then
    **trigger a fresh deploy**, then `curl -I https://www.agree-tech.com/en/` and confirm
    `x-robots-tag: noindex` is **gone**. Skip either half and the production site stays invisible to
    Google with no error anywhere. This is the step most likely to be forgotten, because everything
    will look perfectly fine in a browser.
14. **Do not decommission WordPress.** Leave it reachable until step 18 passes. §2.1 is only
    recoverable from a live install.
15. G4 submit the new sitemap; G5 remove the dead ones.
16. C4 **force** a re-scan in Cookiebot (the schedule is monthly — do not wait for it); point the declaration at the new privacy page.
16a. **S4 — change the Web3Forms delivery address from `ak@agree-tech.com` to `info@agree-tech.com`.**
    Silent if missed: the form still succeeds, the leads just go to one person.
17. G6 annotate the date in GA4.

**T-plus:**
18. R4 crawl the old URLs against production and assert 301 → 200.
19. Watch Search Console coverage weekly for a month. Expect noise; act only on 404s that map to a
    URL in §2.2.
20. Confirm GA4 is receiving data under the same property, with history intact either side of the
    cutover date.
21. Only then retire the WordPress install — and take a full export first.

---

## 6. Rollback

DNS is the switch. If anything in §5 steps 18–20 goes wrong, repoint DNS back to one.com; WordPress
is still there because step 14 said not to touch it. Nothing in this plan writes to the old install,
so rollback costs only DNS propagation.

The one thing that does **not** roll back is Search Console verification — which is why G2 is first,
and why it uses DNS rather than a meta tag.

---

## 7. Deliberately not doing

- **Akismet.** Comment spam protection for a site with no comments.
- **The Web3Forms honeypot (`botcheck`).** Deprecated in their own documentation; hCaptcha replaces it.
- **Complianz.** The old site runs two consent managers simultaneously. One is enough.
- **Rank Math's video and local sitemaps.** The new site has `Organization` + `WebSite` JSON-LD
  (`src/_jsonld.html`) and no video. If local-business rich results were ever earning anything,
  that is a separate question with its own evidence — not a migration item.
- **WP Mail SMTP / Site Mailer.** Transactional mail belongs to the WordPress install, not the site.
  Worth confirming nothing else depends on it before step 21.
- **A Content-Security-Policy header.** `build.js:384` already writes `dist/_headers` for staging
  noindex, so the mechanism exists — but a CSP added in the same change as three new third-party
  scripts is how you spend a day debugging a blank page. Separate change, after cutover is stable.
- **Re-evaluating Web3Forms itself.** Where leads land and under whose DPA is a real question
  (P2 forces naming it), but changing the form backend mid-migration doubles the risk for no
  cutover-day benefit.

---

## 8. Applied — 22 September 2026

All in the working tree on `payload`, **uncommitted and not pushed**. Build after every step:
`en 909/909 · da 796/796 · pl 796/796, all indexed, 37 sitemap URLs`.

| Item | What changed |
|---|---|
| S1–S3 | hCaptcha on the contact form. Widget in `components/contact-form.html` **and** `src/contact.html`; loader + `.h-captcha` CSS in `shell/contact.head.html` **and** `src/contact.html`. Carries `data-cookieconsent="ignore"`. |
| C1 | Fonts self-hosted. 4 woff2 in `assets/fonts/`, `@font-face` at the top of `styles.css`, `<link>` and `preconnect` stripped from all 26 shell/src pages. |
| C2 | Cookiebot in the new `src/_head.html`. |
| C5 | Cookie settings link in `src/_foot.html` + `a-cookie-settings` in all three `foot.json`. |
| C6 | Handled in markup via `data-cookieconsent="ignore"` rather than as a dashboard step. |
| G1, G3 | gtag `G-J8MP9W1XGZ` and both verification meta tags, in `src/_head.html`. |
| R1, G5 | `WORDPRESS_URLS` + `LEGACY_SITEMAPS` in `build.js`; `_redirects` now 29 rules. |
| P1–P3 | 59 values rewritten across `content/{en,da,pl}/privacy.json`. Key sets unchanged. |

**Two decisions taken while applying, both worth knowing:**

**`data-cookieconsent="ignore"` instead of a Cookiebot dashboard rule.** C6 was written as a
dashboard step. It is now an attribute on the captcha loader, which is Cookiebot's own documented
exemption and is also how they mark up Google's consent-mode tags. The form therefore cannot be
broken by a forgotten dashboard setting. The dashboard check in runbook step 9 stays as
verification, not as the mechanism.

**~~No hand-written Consent Mode snippet.~~ REVERSED 23 Sep — the reasoning was wrong.**

The original claim here was that Cookiebot's auto-blocker already stopped gtag before consent, so
Consent Mode would be redundant. Tested in a browser against the deploy preview, it does not:

```
gtag tag   src=https://www.googletagmanager.com/gtag/js?id=G-J8MP9W1XGZ   type=text/javascript
globals    google_tag_manager, google_tag_data, dataLayer(5)
Cookiebot  hasResponse=false   consent.statistics=false
```

GA4 loaded and ran with nobody asked — precisely what the banner exists to prevent. Auto-blocking is
driven by Cookiebot's scan of the live domain, which is still WordPress, so it had no rule for these
tags; and after cutover it would still be one scan away from silently un-blocking.

Fixed in `f4fa98e` with two independent mechanisms, neither depending on a scan:

1. **Consent Mode v2 defaults, all denied**, carrying `data-cookieconsent="ignore"` so the block that
   *denies* consent can never itself be blocked.
2. **Manual blocking** on both gtag tags — `type="text/plain" data-cookieconsent="statistics"`.
   Cookiebot restores them on consent. If Cookiebot never loads they never run, which is the safe
   direction to fail in.

Re-tested on the preview: `type=text/plain`, `google_tag_manager` undefined, defaults denied, while
the captcha still rendered and the banner still showed. **C3 is therefore done in code, not deferred
to a dashboard toggle.**

The general lesson, worth keeping: *auto-blocking was assumed rather than observed.* Everything in
this plan that depends on a third party behaving a certain way needs the same browser check.

### 8.2 One gap the approved copy leaves open — C7

The approved policy describes cookies **in prose**: the categories placed, the two partners, the
retention. What it does not carry is a **list of the actual cookies** — name, provider, purpose,
expiry — which is what regulators and Cookiebot's own guidance expect a cookie policy to show, and
the one part nobody can keep accurate by hand.

Cookiebot generates exactly that table and keeps it current from its scans. It is one script tag on
the privacy page:

```html
<script id="CookieDeclaration"
        src="https://consent.cookiebot.com/d308660e-f6c7-4a86-a313-12360c962166/cd.js"
        type="text/javascript" async></script>
```

| # | Item |
|---|---|
| **C7** | Embed the declaration at the end of the cookies section of `src/privacy.html` and its `shell`/`components` counterparts. It **adds to** the approved text rather than changing it, so it does not reopen D4 — but it does put a third-party script on the page, and it will render the *WordPress* cookie list until **C4** forces a rescan. Sequence it after C4, or on cutover day alongside it. |

Not done unasked: it changes what the approved page renders.

### 8.3 The banner copy still describes WordPress — C8

Seen on the preview, 23 Sep. The consent banner itself reads:

> *"We use cookies to personalise content and ads, to provide social media features and to analyse
> our traffic. We also share information about your use of our site with our social media,
> advertising and analytics partners…"*

and offers four categories: Necessary, **Preferences**, Statistics, **Marketing**.

None of that is true of the new site, and it now contradicts the privacy policy Karina approved on
the same day — the banner would be the *first* thing a visitor reads, asserting exactly the claims
the policy was rewritten to remove.

Two different fixes, and it matters which is which:

| # | Item |
|---|---|
| **C8a** | The **intro text** is configured copy in the Cookiebot dashboard, not scan output — a rescan will not touch it. Someone has to edit it, in each language the banner serves. Suggested English: *"We use cookies to remember your choice, to protect our contact form from automated abuse, and to measure how the site is used. We do not use cookies for advertising and we do not share your browsing data with social media or advertising networks."* |
| **C8b** | The **Preferences and Marketing categories** are scan-derived. **C4**'s rescan should drop them once the scan sees the new site. Verify after the rescan; if they persist, they are configured and need turning off. |

C8a is Karina's to do and can be done today — it does not depend on cutover.

### 8.4 The GA4 property is linked to a Google Ads account — C9

Found in the browser on 23 Sep, immediately after granting consent. Alongside the expected GA4 hit,
the page sent:

```
POST https://www.google.com/ccm/collect?...&tid=AW-17054781647&en=page_view...&npa=0&gcs=G111
```

`AW-17054781647` is a **Google Ads** tag. It appears nowhere in our markup, nowhere in
`window.dataLayer`, and is not a container we load — all three verified in the page. `gtag.js`
fetches it on its own because the GA4 property **G-J8MP9W1XGZ has a linked Google Ads account**,
and that link travelled with the measurement ID we deliberately carried over to preserve history.

It is consent-gated and fired only after *Allow all* (`gcs=G111`), so this is **not** a consent
violation. It is an **accuracy** problem, and it lands on copy approved the same day:

> *"We do not use Google Analytics for advertising, and Google's advertising features are not enabled."*
> — `content/en/privacy.json`, `cookies.p-when-you-visit-agree`

That sentence is false while the Ads link is active. It also means **C8b was wrong**: the Cookiebot
*Marketing* category is justified, not a leftover of the WordPress scan, and must not be switched
off on the assumption that it is stale.

| # | Item |
|---|---|
| **C9** | **Decided 23 Sep: option (a) — Agree does not run Google Ads, so unlink it.** The approved policy sentence then stays true and no copy reopens. Karina to remove the link in GA4, then this must be **re-verified in a browser** — the same check that found it. Until the tag stops firing, the policy is inaccurate. See §8.4a. |

Carrying the measurement ID forward preserved more than the history: it preserved an integration
nobody had mentioned. Worth auditing the property for other links — Google Signals, Search Ads 360,
Merchant Center — before cutover.


#### 8.4a How to unlink it, and why it needs checking twice

`AW-17054781647` is not in our markup, so it is switched off in Google, not in this repository. It
reaches the page through the Google tag that `gtag/js?id=G-J8MP9W1XGZ` loads, and there are two
places that can attach it. Check both — removing one while the other still holds the link leaves the
tag firing, and the symptom is invisible without opening a browser.

1. **GA4 → Admin → Product links → Google Ads links.** Remove the linked account.
2. **GA4 → Admin → Data streams → the web stream → Configure tag settings.** Open the Google tag and
   look for linked destinations / "Configure your domains". Remove `AW-17054781647` if listed.

Then re-verify, because a dashboard saying "unlinked" is not evidence the tag stopped: load a page,
accept statistics, and confirm no request to `google.com/ccm/collect` carrying `tid=AW-...` is made.
That is exactly how the link was found in the first place — the GA4 admin screens never mentioned it.

While in the property, audit for the same class of thing: **Google Signals**, Search Ads 360, and any
other product link. Each one can attach a destination to the same measurement ID without appearing
anywhere in the site's code, and the policy claims none of them are active.


#### 8.4b Located it: a Google tag *destination*, not an account link (23 Sep)

Karina checked **Admin → Product links → Google Ads links** ("no accounts linked to the
organisation") and **Tag Manager → Accounts**, and both were empty. They would be: the link is not an
Ads account link and it is not in any container's tags.

Fetching what Google itself serves for our measurement ID settles it:

```
curl "https://www.googletagmanager.com/gtag/js?id=G-J8MP9W1XGZ"

G-J8MP9W1XGZ    x23    the GA4 property
AW-17054781647   x7    the Google Ads destination
GT-KD7DXG73      x1    known Google tag, also on the WordPress site
GT-WFM3G28J      x1    a fourth tag ID, not previously seen anywhere
```

`AW-17054781647` is a **destination attached to the Google tag**, held in Google's own configuration
and returned with the tag's JavaScript. That is why it appears in no HTML — not on WordPress, not on
the new site — and why the admin screens for *linked accounts* show nothing.

**Where to remove it:** Tag Manager → the **"Google tags"** tab (beside "Accounts") → open the tag
for `agree-tech.com` → **Destinations** → remove `AW-17054781647`. Reachable equivalently via
GA4 → Admin → Data streams → the web stream → *Configure tag settings*.

**If it cannot be removed** — a dormant or agency-held Ads account is plausible — the compliance
position is still sound: our Consent Mode defaults deny `ad_storage`, `ad_user_data` and
`ad_personalization`, and Cookiebot gates the marketing category, so the tag fires only on explicit
marketing consent. What would then be wrong is the *policy sentence*, and the fix moves to amending
it rather than chasing the tag.

**Also surfaced, and not yet accounted for anywhere:**

| ID | Where it lives | Status |
|---|---|---|
| `GTM-KL3J9HVP` | Tag Manager container, loaded by the **WordPress** site; **not** carried to the new site | **Answered — see §8.4c.** Contains only the GA4 tag and Google Ads conversion tracking. Deliberately not carried over. |
| `GT-WFM3G28J` | returned in the gtag config; origin unknown | Worth identifying while in the Google tags screen. |


#### 8.4c What is actually inside GTM-KL3J9HVP, and why it is not on the new site

Fair challenge: it is the only container Agree has, so its absence needed explaining. The honest
answer is that it was **not a decision** — G-J8MP9W1XGZ was carried over to preserve Analytics
history, "the Google dashboard" was read as Analytics plus Search Console, and a separate Tag
Manager container never entered the reasoning. `GT-KD7DXG73` was logged in §2.1 and passed over too.

Its contents are public, so this did not need guessing —
`curl "https://www.googletagmanager.com/gtm.js?id=GTM-KL3J9HVP"`:

| Tag type | Count | What it is |
|---|---|---|
| `__googtag`, `__module_gtag` | 5, 2 | Google tag / GA4 configuration |
| `__awct` | 1 | **Google Ads Conversion Tracking** |
| `__gclidw` | 1 | **Conversion Linker** — stores the Google Ads click ID; required by the above |
| `__html` | **0** | no custom HTML tags, so nothing arbitrary is hiding in it |

The only external ID referenced inside is `G-J8MP9W1XGZ`. No LinkedIn Insight, no Meta pixel, no
Hotjar, no HubSpot.

So the container holds exactly two things: **the GA4 tag the new site already loads directly**, and
**Google Ads conversion tracking** — which also explains the `AW-17054781647` destination in §8.4b.
"Google Ads are not active" is true of the *spend*; the *tracking* was configured.

**Decision: do not carry it over.** Three reasons, in order of weight:

1. Nothing is lost. Its only functioning tag is GA4, loaded directly and with the same measurement
   ID, so history and reporting are unaffected.
2. Its remaining tags are Ads conversion tracking, which D5/C9 decided against — adding the
   container back would reintroduce precisely what Karina is being asked to remove, and would make
   the approved privacy policy false again.
3. A container is a channel for tags to reach production without passing through the repository,
   code review, or the privacy policy. Today produced two separate cases of exactly that
   (`AW-17054781647`, `GT-WFM3G28J`). Re-opening that channel during a migration whose whole theme
   has been *undocumented integrations* is the wrong moment.

**The real cost, stated plainly:** marketing loses the ability to add a tracking tag without a
developer. That is a genuine capability, not a trivial one. If it is wanted later it should be a
deliberate decision — GTM added with Cookiebot blocking designed in from the start, and a rule that
anything added to it gets reflected in the privacy policy.

### 8.5 Netlify Pretty URLs rewrites the served HTML — R5

The bytes Netlify serves are not the bytes `build.js` produces. Its asset optimisation strips
`.html` from internal links and re-quotes attributes: built `href="privacy.html#cookies"` is served
as `href='privacy#cookies'`. Both `/en/privacy` and `/en/privacy.html` return **200**, so nothing is
broken, and canonicals plus the sitemap both name the `.html` form, so search engines resolve it.

| # | Item |
|---|---|
| **R5** | **Done 23 Sep** in `netlify.toml` rather than the dashboard, so the setting travels with the branch like the rest of the build config. `pretty_urls = false` stops the rewriting; the css/js flags are pinned so a future change to Netlify's defaults cannot start bundling stylesheets that are already final. Verified: the served page now carries `href="privacy.html#cookies"` exactly as built, and a diff of served against `dist/` is **6 lines** — all of it Netlify's own injected comment and its `/.netlify/scripts/hud` script. That HUD script loads on every page and was not previously in our inventory of what runs on the site; it is same-origin and functional rather than tracking, so it does not change the consent position. |

### 8.6 What else lives on this domain — D1, and why "point DNS at Netlify" is the wrong instruction

Looked up 23 Sep, because the runbook said "repoint DNS" without ever asking what else that DNS
carries. It carries a great deal:

| Record | Value | What breaks if it is lost |
|---|---|---|
| `NS` | `ns01.one.com`, `ns02.one.com` | everything below |
| `MX` | `smtp.google.com` | **all company email** — Agree is on Google Workspace |
| `TXT` | `google-site-verification=TD-5Hnl…` | the Search Console property just verified (G2) |
| `TXT` | `google-site-verification=sys3vn…` | the legacy Search Console verification |
| `TXT` | `atlassian-domain-verification=…` | Atlassian/Jira domain ownership |
| `TXT` | `brevo-code:229b8166…` | **Brevo** domain authentication |
| `TXT` `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` | DMARC reporting |
| `A` apex / `A` www | `46.30.215.88` | the website — **this is the only thing cutover should touch** |
| `AAAA` www | `2a02:2350:5:111:c0:f076:39ff:71ba` | see below |

**D1 — the instruction must be "edit the A and AAAA records", never "change the nameservers".**
Moving `agree-tech.com` onto Netlify DNS would hand Netlify an empty zone: email stops that minute,
both Search Console verifications die, Atlassian and Brevo lose domain authentication. Website
downtime is recoverable in an afternoon; silently dropping the company's mail is not. The nameservers
stay at one.com and only the website records change.

**D2 — the AAAA record is the trap inside the trap.** `www` answers on both IPv4 and IPv6 today.
Update the `A` and forget the `AAAA` and every IPv6 visitor keeps reaching the WordPress site, while
everyone on IPv4 sees the new one — the same domain serving two different sites depending on the
visitor's network, with nothing in Netlify or Search Console reporting it. Either point the `AAAA` at
Netlify too or delete it.

**D3 — there is no SPF record at all.** No `v=spf1` on the apex, despite Google Workspace sending
mail and Brevo authenticated against the domain. That is a pre-existing deliverability gap, not a
migration one, and it is outside this plan's scope — but it was found while inventorying the zone and
somebody should own it.

**D4 — Brevo is a data processor the approved policy does not name.** `brevo-code` and a DMARC
report address pointing at Brevo say the platform is set up for this domain. Brevo is an email
marketing tool; the contact form carries an opt-in reading *"I consent to receive marketing material
from Agree Technologies"*. If those opt-ins are worked in Brevo, then Brevo processes personal data
collected through this website and belongs in the processor list beside Netlify, Web3Forms, hCaptcha
and Google — the same omission as C9, found the same way. Needs a yes/no from Karina before it is
either added to the policy or dismissed.

### 8.7 Cutover deletes a HubSpot partner page — D5

`/hubspot-leads-landing-page/` was assumed to be a dead campaign slug and redirected to the contact
page. It is not dead. Fetched from the live site on 23 Sep:

- **Title:** *Official HubSpot Solutions Partner for B2B SaaS Success*
- **H1:** *Streamline CPQ & Billing — Seamlessly Inside HubSpot*
- *ATSuite by Agree Technologies, a HubSpot Solution Partner*
- Two lead-capture forms; 30+ mentions of HubSpot

So Agree presents itself as an official HubSpot Solutions Partner, on a dedicated page, targeting
what is plainly a commercial keyword. **The new site does not mention HubSpot anywhere.**

It is absent by decision, not oversight. The CFO review asked (Q3, Q6) which of the 26 named
connectors were real, on the grounds that *"a logo/name list implies production-ready
integrations"*; the HubSpot chip on the integrations page was genericised as a result and now reads
*CRM & sales tools* — the key is still `integration.span-hubspot`, which is how the history shows.

The redirect now points at `integrations.html` as the nearest subject match. That limits the 404 but
does not preserve the page: anyone arriving from a HubSpot-partner search lands somewhere that never
says HubSpot.

**D5 — DECIDED 23 Sep: option (b).** Implemented as a prose sentence, *not* by restoring the
vendor name to the connector chip — that chip sits under *Integrate via API*, whose own caption says
these are patterns and not shipped connectors, and every sibling chip is a category. Naming a vendor
there is precisely what Q3/Q6 removed. `integration.p-anything-else-via-rest` now ends *"Agree
Technologies is an official HubSpot Solutions Partner."* in all three locales; `span-hubspot` still
reads *CRM & sales tools*. Key sets unchanged, so no CMS migration.

**Still needs confirming:** that the partnership is current. The only source is Agree's own
WordPress page. If it has lapsed, the new site now carries exactly the kind of unverified claim the
CFO review existed to remove — the same check the privacy copy got, and it has not been done here.

The options as they stood:

| | |
|---|---|
| (a) | **Rebuild a HubSpot page** on the new site. Needs the partner facts and the real integration tier — the same evidence Q6 asked for and never got. |
| (b) | **Name HubSpot again on the integrations page.** The CFO review genericised it because the *integration tier* was unverified. Official partner status is a different, verifiable claim, and stating it is not the thing the review objected to. Cheapest option that keeps the keyword. |
| (c) | **Accept the loss.** Redirect stands, the partner positioning disappears from the website. |

Nothing has been added to the site: naming HubSpot again would reverse a deliberate CFO-review
decision, and that is not a call to make inside a migration.

### 8.8 Where the leads actually go — S4

Confirmed 23 Sep: the Web3Forms access key in `components/contact-form.html` currently delivers to
**`ak@agree-tech.com`** — one person's address, set for testing. On the live site it must be
**`info@agree-tech.com`**, the shared inbox the contact page already advertises.

| # | Item |
|---|---|
| **S4** | Change the delivery address to `info@agree-tech.com` at `app.web3forms.com` → the form → Settings, **on cutover day**. This is a dashboard setting, not code: nothing in the repository or in a deploy will change it, and nothing will warn anyone it is wrong. |

Two properties of this failure make it worth a runbook line of its own. It is **silent** — the form
keeps returning its success message, so the site looks perfectly healthy. And it is **lossy in the
one direction that matters**: a lead-generation form quietly delivering to a personal mailbox is
how enquiries go unanswered for a fortnight before anybody notices.

Verify after changing it by submitting the form on production and confirming the mail arrives at
`info@` — the same end-to-end check as runbook step 9, which needs a human anyway because the
captcha does.

### 8.1 Left deliberately undone

| # | Item | Why |
|---|---|---|
| **N1** | **The contact form's success redirect is English-only.** `<input name="redirect" value="https://agree-tech.com/contact.html?success=true">` sends every visitor to the English contact page, so a Danish or Polish visitor who submits the form is dropped into English — and via two hops, apex → www → `/en/`. Pre-existing, not caused by this work, but the locale split is what made it wrong. Fixing it means making the value locale-aware in `build.js`. | Needs a decision, and it is a behaviour change rather than a migration step. |
| **N2** | **Three key names now misdescribe their content.** `cookies.h4-linkedin` carries the hCaptcha disclosure; `cookies.li-creation-of-profile` and `cookies.li-marketing` carry the two purposes that replaced profiling and marketing. Values are correct and key names never render — but the CMS derives its field labels from them, so Karina would see a field labelled *LinkedIn* containing hCaptcha text. | Renaming changes the key set, which forces `npm run generate` + a Payload migration on the Hetzner box. That is phase-5 work needing its own go. |
| ~~N3~~ | **Closed 23 Sep.** Both retention periods are now concrete: event data 2 months, user data 14 months from the last visit. Answering B5 also exposed a *second* stale claim — the deletion section still said *1 year* — which named none of the words the earlier sweep grepped for and so had survived it. | — |
| **N4** | Danish and Polish legal copy was written here, not by a translator. | **D4** sends it to Karina for review; the Danish in particular deserves a native read before publish. |

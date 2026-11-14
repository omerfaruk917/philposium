# Philposium SEO review — 14 November 2026

## Prepared locally (not deployed)
- Query-specific Turkish/English homepage and CFP titles; factual descriptions.
- Canonical URLs, reciprocal language alternatives and multilingual XML sitemap.
- Call-page EducationEvent data with 20–21 April 2027 date-only values, Göztepe venue, student organising team and stable entity identifiers.
- Website designer attribution separated from authorship of academic documents.
- Removed “self-described” from existing credit files; no new AI-specific files or keyword stuffing.

## External prerequisites
1. Configure www.philposium.com to redirect permanently to https://philposium.com, preserving path/query. Current www response is 404. Requires Cloudflare domain configuration; do not change email DNS.
2. Verify Search Console ownership, submit https://philposium.com/sitemap.xml and inspect rendered Turkish and English pages after deployment.
3. Browser-language redirects remain as explicitly requested. They can cause a non-Turkish renderer to leave a Turkish URL. Reconcile with stable indexable language URLs before claiming multilingual indexing is solved. Do not serve special content to bots.
4. Check Cloudflare WAF logs for genuine Googlebot/OAI-SearchBot traffic and published IP ranges. Successful User-Agent tests do not prove real crawler access.
5. Seek an official announcement linking the canonical CFP on Marmara Philosophy/faculty sites, plus a genuine PhilEvents listing. Keep event name, dates, location consistent. Suggested anchor: “Philposium 2027 lisans felsefe sempozyumu”.
6. Confirm the venue's current faculty/hall name with organisers: supplied text says Fen-Edebiyat, while the department's current official site uses İnsan ve Toplum Bilimleri. Do not infer a new venue from a faculty rename.

## References
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/appearance/structured-data/event
- https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- https://developers.openai.com/api/docs/bots
- https://flsf-itbf.marmara.edu.tr/allnotices
- https://itbf.marmara.edu.tr/allevents

## Live audit observations
Public sitemap and robots returned 200. All 22 canonical sitemap destinations returned 200; a nonexistent URL returned 404. Googlebot/OAI-SearchBot User-Agent probes returned 200. These observations concern the existing deployment, not the local changes.

## Final local regression checks
- 29 generated HTML files; 1,226 internal links/assets/anchors checked with no missing targets, duplicate IDs or broken ARIA references.
- 22 primary pages pass canonical, reciprocal languages, description and JSON-LD parsing checks.
- Event dates match visible text; language navigation and resource tabs checked.
- Worker API tests use mocks (no production submissions); success and validation/error paths passed.
- Fixed JSON-LD script escaping and redirect-page canonicals.
- Fixed footer animation time jump after returning from a background tab.
- Existing forms store records in D1; outgoing contact emails/newsletter delivery are not implemented.

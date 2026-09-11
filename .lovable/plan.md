# OMNIEL tactile laboratory redesign

## Outcome
Rebuild OMNIEL’s public website around the selected graphite-and-lichen product-laboratory direction: quiet, premium, asymmetric, tactile, and product-led. Preserve the company’s accurate positioning, product descriptions, public URLs, enquiry flow, SEO, and voice assistant while replacing the current visual language.

## Build scope
1. Establish the new visual system in the global stylesheet:
   - Graphite base and raised surfaces, lichen foreground, and restrained lichen accent.
   - Sora display type, Manrope body type, mono labels where useful.
   - Sharper laboratory-style borders, tighter radii, deliberate spacing, focus states, reduced-motion behavior, and reusable motion tokens.
2. Rebuild shared site chrome:
   - Sparse navigation with OMNIEL wordmark, Products, Technology, Research, and Contact access.
   - Intentional mobile menu with the same visual language.
   - Minimal footer with existing company, product, legal, and contact links.
3. Rebuild the homepage from scratch:
   - Asymmetric hero with the real OMNIEL positioning and one primary NOVA action.
   - A meaningful dimensional intelligence visual using generated project imagery, not a generic AI orb or particle field.
   - Large editorial belief statement using only verified OMNIEL principles.
   - NOVA product-laboratory stage with its real summary and capability language, avoiding invented metrics or claims.
   - Spatial, non-repetitive ecosystem presentation for VYREN, ARVO, and KIWI, with clear status and links.
   - Restrained closing contact threshold and minimal footer rhythm.
4. Rework interior public pages to share the new system without changing their information architecture:
   - About, Products, Product detail, Technology, Research, Careers, Contact, Privacy, and Terms.
   - Remove old atmosphere/particle/glass treatments where they conflict with the selected direction.
   - Keep product comparison, capabilities, status notes, team information, and enquiry categories accurate.
5. Preserve and verify behavior:
   - Keep `/api/enquiry`, existing validation, server-side delivery configuration, and the direct-email fallback.
   - Make the redesigned contact forms clear about sent, failed, duplicate, and unavailable-service states.
   - Keep the Vapi widget and its existing product/form actions.
   - Keep existing redirects, route metadata, canonical URLs, structured data, and accessibility behavior.
6. Validate the result in the running preview at desktop and mobile widths, inspect console/runtime/network signals, exercise navigation and contact-form failure/success states where available, and correct any build or visual regressions.

## Technical notes
- Implement in the existing TanStack Start structure; do not introduce another router or a new backend architecture.
- Keep the existing content source of truth in `src/lib/omniel.ts` and update only presentation where possible.
- Generate the selected direction’s dimensional visuals under `src/assets/` and replace all design-direction image placeholders with real imports.
- Use semantic design tokens rather than hardcoded component colors; load Sora and Manrope from the root document head.
- Add or preserve unique route-level metadata for every content route, including title, description, Open Graph, Twitter card, and leaf canonical data.

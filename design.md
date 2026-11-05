# Vibe Coding Book design system

The site teaches practical AI use in English and Korean. All routes share a Furrow-derived visual system: warm near-white paper, strong neutral ink, orange actions, and an equally composed charcoal dark theme. The reference is Replit's product-first hierarchy, not its brand identity.

Tokens live in `src/styles/tokens.css`. Use Red Hat Display for headings, Red Hat Text for the interface and body, and the system monospace stack only for executable or inspectable code. All color and font values must use tokens. The outer container caps at 1440px, with 48px desktop gutters and 24px/16px responsive gutters. Use 24px column gaps.

Shared navigation includes courses, playground, AI News, GitHub, language selection, and a persistent theme toggle. The homepage uses a centered action-led hero with an inspectable workflow demonstration, four course entries, a learning route selector, local practice guidance, and source-linked news. Reading pages use a chapter sidebar, a readable main column, and a secondary table of contents. Sidebar navigation becomes a disclosure on small screens.

Primary actions use orange with dark ink. Secondary actions are typographic or neutral. Panels use the surface ladder, borders only at meaningful seams. Every interactive element has an immediate focus ring, a hover state, and a pressed state. Content is visible without JavaScript; examples disclose that they are local simulations. No entrance animation or autoplay.

Preserve all bilingual content, lesson routes, course selection, pagination, source links, and news metadata. The website needs no account or API credentials to read. Do not add invented metrics, testimonials, or outcomes. New demonstrations must state what they actually execute.

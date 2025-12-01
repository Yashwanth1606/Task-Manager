(# TaskTracker — To-do List)

This small project demonstrates a simple front-end To‑Do list. The header date is now dynamically populated at runtime.

- The header date element in `index.html` is updated automatically by `script.js` using `updateHeaderDate()`.
- The date shows the current weekday name and the date formatted as DD/MM/YYYY.

Open `index.html` in a browser (or a local dev server) to see the current date rendered in the top bar.

Layout changes (updated):
- The page now uses a single unified background (no small dark top strip + white boxed app). This makes the UI feel like one single page rather than a floating white card on a dark header.
- Cards and panels have been softened (semi-transparent / subtle shadows) so the interface blends into the page.

If you'd prefer a flat white card style again — or want the top dark strip restored — tell me which look you want and I can switch it back or provide both variants.

Responsive layout update:
- The app container is now fluid and adapts to the viewport width. On narrow screens the layout collapses into a single column; on very wide screens content will center for readability.

Sidebar & responsiveness details:
- The left sidebar remains visible at all sizes and becomes compact on small screens using CSS clamp() so it scales instead of being hidden.
- Right column and other panels scale using flexible clamped widths for desktop and tablet. On very narrow phones the right column is hidden (to prioritize main content) but the sidebar remains visible.

Icon-only sidebar:
- On very narrow screens (phones) the left sidebar now switches to an icon-only compact mode — navigation text is hidden and each button shows its icon (from the `data-icon` attribute). The avatar and logout are also compacted.
- This keeps the sidebar visible while saving horizontal space.
 - The emoji placeholders were replaced with inline SVG icons for a cleaner, scalable, and theme-able look. SVGs use currentColor so they adapt to active/hover colors.

Sidebar rounded corners:
- The left sidebar now uses the same rounded corner radius as nav buttons so the UI feels consistent (controlled by --nav-radius in `script.css`).

Layout: better use of white space
- The app now fills the viewport height so there's no wasted footer space; left and right columns stretch to match available height.
- The To-Do card and Task Status card stretch to fill their columns on desktop, and the task list becomes scrollable when content overflows.



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

Profile & welcome behaviour:
- The avatar initials are now generated from the profile name automatically and capitalised. The visible welcome message next to the header will also use the first name from the profile.

Avatar styling:
- The avatar now uses a responsive width with aspect-ratio:1/1 and overflow:hidden, so it always renders as a perfect circle (not oval) across breakpoints. Adjust `--nav-radius` or the `width` values in `script.css` to change the avatar size.
 - The avatar now uses explicit equal width + height values per breakpoint (desktop 45px, md 44px, sm 36px). This avoids sub-pixel or zoom rounding issues that could produce an oval when zooming out. You can edit the `--avatar-size-*` variables in `script.css` to tune sizes.

 - The profile email is now hidden in the sidebar for a cleaner look; the email is available via a hover/focus tooltip on the avatar. The tooltip is attached under the profile name (`.profile-info`) so it appears below the name (not to the right), and shows on hover, keyboard focus or a tap on touch devices.
 - The profile email is now hidden in the sidebar for a cleaner look; the email is available via a hover/focus tooltip on the avatar. The tooltip is attached to the `.profile` container to ensure it's not clipped and shows on hover or when the avatar receives keyboard focus or a tap on touch devices.

Auto-dismiss on touch devices:
 - On touch/coarse-pointer devices the tooltip will auto-dismiss after a configurable timeout to avoid leaving the tooltip open after a tap. The timeout is defined by the JavaScript constant `TOOLTIP_AUTO_DISMISS_MS` in `script.js` (default 3000 ms). Change that value if you'd like a shorter or longer duration.

Tooltip wrapping and responsive width:
- The tooltip now supports multi-line content and will wrap text when necessary. On desktop it uses a sensible max width (default 220px) and on small screens it expands up to 70vw (or 300px) so long emails or other content will wrap and remain readable. Change `--avatar-tooltip-max` in `script.css` to customize the desktop max width.

Avatar email tooltip:
- The profile email is now hidden from the sidebar (only the name is visible). Hovering or keyboard focusing the avatar shows a small tooltip popup with the email address.

Layout: better use of white space
- The app now fills the viewport height so there's no wasted footer space; left and right columns stretch to match available height.
- The To-Do card and Task Status card stretch to fill their columns on desktop, and the task list becomes scrollable when content overflows.

Default To-Do behavior:
- The To-Do section now starts empty — only the `To-Do` heading and the `+ Add task` button are visible by default. You can add tasks using the UI (or re-enable sample tasks in `script.js` for demo data).



# Amour Estilo Admin Dashboard

React 18 + TypeScript on Create React App, with Material UI for everything:
`@mui/material`, `@mui/icons-material` and `@mui/x-charts`. Data comes live from Firestore. No Tailwind, no Vite.

```bash
npm install
npm start          # http://localhost:3000  (.env is already filled in for amour-estilo)
npm run build
```

Sign in with Firebase Auth (email/password or Google). A signed-in user needs a `staff/{uid}` doc.
Publish `firestore.rules` in Firebase console, Firestore, Rules.

## Sections

| Section | What it shows |
| --- | --- |
| Dashboard | Metrics, charts, top looks, Privé overview, recent bookings |
| Bookings | Every booking. Search, status filter, View for full details |
| Bespoke Booking | Customised bookings (a curated look is attached, or the service says bespoke) |
| Upcoming Bookings | Confirmed bookings dated today or later, soonest first, with Today / Tomorrow tags |
| Completed Bookings | Bookings whose date has passed, newest first |
| Privé Applications | All applications. View shows the full application and style profile. Approve issues a membership |
| Privé Members | Members with their membership ID, contact details and join date |

Everything updates live, with no refresh needed.

## Automatic booking status

- **New booking, confirmed.** A booking saved as `pending` is treated as `confirmed`, and the dashboard writes `status: "confirmed"` (plus `confirmedAt`) back to Firestore.
- **Past booking, completed.** A confirmed booking whose appointment date is before today becomes `completed` (plus `completedAt`), also written back. The screen moves it from Upcoming to Completed at midnight without a reload.
- Cancelled bookings are never touched.

This runs while a staff member has the dashboard open. To confirm at the moment of booking even when nobody is logged in, change your public booking form to save `status: "confirmed"` instead of `"pending"`. Switch either rule off with `AUTO_CONFIRM_BOOKINGS` / `AUTO_COMPLETE_PAST_BOOKINGS` in `src/firebase/buildDashboardData.ts`.

## Approving a Privé application

Approve runs one transaction (`src/firebase/actions.ts`):

1. Takes the next free ID after the highest existing one (AEPSPRIVE142 gives AEPSPRIVE143; AEPSPRIVE100 when there are none) and creates `priveMembers/AEPSPRIVE143` with `status: "Active"`, `applicationId`, `membershipSince`, `approvedAt`, `approvedBy`.
2. Sets the application to `status: "approved"` and stores the `membershipId` on it.
3. Sets `isPriveMember: true`, `membershipId` and `membershipSince` (as `YYYY-MM-DD`) on the applicant's `users` doc, found by `uid` on the application or by matching email.

`priveMembers` can be fetched by anyone who knows an ID, so it holds no name, email or phone. The Members section reads those from the application and user docs, which only staff can list.

## Where things live

| Need | File |
| --- | --- |
| Colors, fonts, type scale, component styling | `src/theme.ts` |
| Field names, status strings, bespoke and Privé rules | `src/firebase/buildDashboardData.ts` |
| Live listeners | `src/firebase/source.ts` |
| Auto confirm / complete writes | `src/firebase/sync.ts` |
| Approve action | `src/firebase/actions.ts` |
| Sign-in and staff check | `src/firebase/useAuth.ts` |
| Bespoke icon (customised, not scissors) | `src/components/icons.ts` |
| Nav items and page subtitles | `src/components/nav.ts` |
| Firestore rules | `firestore.rules` |

Breakpoints are set in the theme: drawer below 768px, icon rail 768 to 1279px, full sidebar from 1280px. Lists are tables from 1024px and cards below.
Reduced motion is respected in CSS transitions, keyframes, chart drawing and count-up.

# Pass 21 - Organizer Draft Editing

## Goal

Close the organizer workflow gap where the backend supported `PUT /events/:id`, but the UI only allowed create, publish, and cancel.

## Changes

- Added a frontend `PUT` helper and shared event payload normalization for create/update.
- Added draft-to-form conversion so organizers can load existing draft data into the listing form.
- Added `Edit draft`, `Save changes`, and `Cancel` editing states in the organizer workspace.
- Kept editing limited to draft listings so published/cancelled listings remain stable during the demo.
- Added Playwright coverage for editing a draft and verifying the `Bearer` auth header plus normalized payload.
- Added events-service unit tests for organizer update, admin update, customer update rejection, non-owner organizer rejection, and `event.updated` Kafka emission.
- Updated README/demo script to include the edit-before-publish organizer story.

## Verification

- `pnpm exec jest --runInBand apps/events-service/src/events-service.service.spec.ts` - passed, 15 tests.
- `pnpm lint` in `client/` - passed.
- `pnpm exec tsc --noEmit --pretty false` in `client/` - passed.
- `pnpm exec jest --runInBand` - passed, 16 suites / 78 tests.
- `pnpm build` - passed.
- `pnpm exec jest --runInBand --testRegex '.*e2e-spec.ts$'` - passed, 5 suites / 5 tests.
- `pnpm build` in `client/` - passed.
- `pnpm exec playwright test --workers=1` in `client/` - passed, 18 tests.

## Score

98 / 100

Remaining gap: editing is intentionally draft-only in the UI; published event edits can still be added later if needed, but draft editing is the safer demo path.

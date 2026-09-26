---
name: configure-life-event-declaration-form
description: Turn a business-analyst Excel spec into OpenCRVS declaration form config for a life event (birth, death, marriage, adoption, ...), using the Label/Mandatory/Analytics/Field type/Options/Validation/Conditional logic/Secured?/Notes column layout. Edits an existing life event's page files in place, or scaffolds forms/pages/ for a life event that doesn't exist yet, and rewires forms/declaration.ts automatically. Invoke explicitly with /configure-life-event-declaration-form.
disable-model-invocation: true
---

Turns a BA-authored Excel spec into customized declaration form pages for a
given life event (`src/events/<life-event>/forms/pages/*.ts`). Edits files in
place when the life event already has a form (birth, death); scaffolds
`forms/pages/` from scratch when it doesn't (marriage, adoption, ...). Either
way, `forms/declaration.ts` is wired/rewired as part of the same pass — no
`-new.ts` duplicates. `git diff` (or `git status` for new files) is the
review mechanism.

User-invoked only — run it explicitly with
`/configure-life-event-declaration-form`.

## 1. Ask which life event this is for

Ask which life event the Excel spec is for (birth, death, marriage,
adoption, or whatever else) — don't infer it from the filename, sheet title,
or Excel content alone; confirm.

Then check whether `src/events/<life-event>/` exists. Birth and death are
normally already configured in this repo; anything else likely isn't yet,
which means this run scaffolds it fresh rather than editing an existing
form.

Done when: you know the target life event and whether
`src/events/<life-event>/forms/pages/` already exists.

## 2. Read the current form before reading the Excel

Always read `src/events/birth/forms/declaration.ts` and every file in
`src/events/birth/forms/pages/` first, regardless of which life event you're
configuring — it's the most complete template in this repo and the source of
the page/field/conditional conventions every other life event follows (a
`requireXDetails`-style composite conditional gating a whole section; the
`child.birthLocationId` hidden-aggregator field that collapses several
mutually-exclusive address variants into one canonical value; the MPL
license header every file in `src/events/` opens with).

If the target life event already has a form (death today; potentially
others later), also read its `forms/declaration.ts` and every file in its
`forms/pages/` — that's what you'll be editing in place, and its own
established field-ID conventions (e.g. death's `deceased.`/`spouse.` roots)
take precedence over blindly reusing birth's `child.`/`mother.` naming.

If the target life event has no existing form, you're building one from
scratch: birth is your structural template (page shape, `defineFormPage`/
`defineDeclarationForm` export conventions, conditional patterns, shared
helpers), but the field-ID roots (the equivalent of `child`/`mother`/
`father`) must come from the people/entities the Excel actually describes —
an adoption form, for instance, likely needs its own roots like
`adoptee`/`adoptiveParent`, not birth's. Don't guess these; confirm with the
user in step 4 if the Excel doesn't make the entity names obvious.

Don't guess the toolkit's API from a field's name. Grep the real enum:

```
find node_modules/.pnpm -path "*@opencrvs/toolkit/dist/commons/events/FieldType.d.ts"
```

and grep `src/events/` (including `tennis-club-membership.ts` and the
`printForm`/`correctionForm` folders) for working precedent before writing a
config shape you haven't seen used — `SEARCH`, `TIME`, and `DATA` in
particular have configuration shapes that aren't obvious from the type name
alone, and the toolkit's TypeScript types will reject a guessed shape (run
`pnpm test:compilation` early and often, not just at the end).

Also check `git status`. Since this skill edits page files in place (or adds
new ones) with no `-new.ts` safety copy, a clean working tree (or a
dedicated branch) is what makes `git diff`/`git status` a usable
review/rollback mechanism afterward. If the tree is already dirty with
unrelated changes, ask before proceeding.

Done when: you can name every page, every field ID pattern, and every shared
helper the template(s) you read use; you know whether you're editing an
existing life-event form or creating a new one; and the working tree is
clean or the user has confirmed it's fine to proceed anyway.

## 3. Read the Excel

`openpyxl`/`pandas` are typically not installed, and `pip install` usually
fails under PEP 668 (externally-managed environment). Don't fight it, and
don't hand-roll an XML parse either — this skill bundles
`scripts/read_xlsx.py`, which reads an `.xlsx` (a zip of XML) with only the
stdlib and prints the sheet as TSV:

```
python3 scripts/read_xlsx.py <path-to-xlsx> > /path/to/scratchpad/sheet.tsv
```

Defaults to `xl/worksheets/sheet1.xml`; pass a second argument (e.g.
`sheet2.xml`) for a different sheet. Read the resulting TSV back rather than
eyeballing the script's output directly — don't try to count tabs in raw
terminal output; it's easy to miscount and misattribute a value to the wrong
column (e.g. reading a Mandatory flag as belonging to the wrong field).

Expect one row per field, page markers as rows whose first cell starts with
`Page`, and this column layout:

```
# | Label | Mandatory | Analytics | Field type | Options | Validation | Conditional logic | Secured? | Notes
```

Verify the actual header row rather than assuming this order — it drifts
between spec revisions. If it doesn't match, stop and confirm with the user
which column is which before mapping anything.

Done when: you have a per-page, per-field table of label/type/options/
validation/conditional/mandatory/secured pulled programmatically, not
eyeballed.

## 4. Ask before writing any code

Real specs are messy and make assumptions about this codebase that don't
hold. Batch these into one clarifying round rather than asking one at a time:

- **Scope**: relabel/reconfigure existing fields only, or also add, remove,
  and reorder fields and pages?
- **New-life-event scope**: if `forms/pages/` doesn't exist yet for this life
  event, this skill only scaffolds `src/events/<life-event>/forms/pages/*.ts`
  and `src/events/<life-event>/forms/declaration.ts`. It does not create
  `index.ts` (the `defineConfig` event registration), `advancedSearch.ts`,
  `dedupConfig.ts`, `printForm/`, `correctionForm/`, or add the event to
  `src/events/index.ts`'s `eventConfigs` — without those the life event isn't
  actually selectable/usable yet. Say so up front; don't build them unless
  the user explicitly asks.
- **Field-ID roots for a new life event**: confirm the top-level segment
  names (birth's `child`/`mother`/`father`/`informant`; death's
  `deceased`/`spouse`/`informant`) before writing any field — these IDs get
  referenced across every page and are expensive to rename later.
- **Country-level values**: ISO code, phone/ID regex, and other system-wide
  constants are usually out of scope for a form pass — confirm rather than
  assume, especially if the Excel _does_ specify one of these values
  explicitly (that's a signal it might be in scope after all).
- **Shared enums/utils** (`IdType`, `InformantType`, `maritalStatusOptions`,
  etc. under `src/events/utils/`) often need changing too, not just the page
  files. Since output is edit-in-place (step 6), this mostly means: confirm
  it's acceptable to edit shared files directly, since there's no
  parallel-file convention to fall back on for these either.
- **Threshold conflicts**: if the Excel specifies a deadline/threshold (a
  late-registration window, a fee cutoff) that differs from a shared
  constant used elsewhere in the codebase, surface the conflict explicitly
  and ask how to resolve it. Don't silently pick one.
- **Unrecognized columns**: if the Excel has a column beyond the nine listed
  in step 3 (a flow-distinction/visibility column, for instance), don't
  assume what it implies (e.g. a second form/action). Check whether the
  existing template already handles something similar via a role-based
  conditional (e.g. `user.hasRole(...)` gating an option) before assuming
  new structure is needed, and ask either way.

Output mode is not a question here — it's fixed: edit existing page files in
place (or create new ones for a new life event), rewire `declaration.ts`
automatically. Don't ask about it; do mention it up front so the user knows
what to expect.

Done when: scope and every ambiguity you can see up front have answers — not
just the ones above, whatever else the specific spec raises.

## 5. Map Excel rows to field config

The Field type column is unreliable — a BA will type "Freetext" for a row
whose Options column clearly lists an enumerated set (that's a Select), or
swap the type of two adjacent rows. Trust the **Options column and
surrounding context** over a literal type string when they disagree, and
flag the mismatch in your final report rather than transcribing it blindly.
The same applies to conditional-logic text that references the wrong field
(a copy/paste slip) or a question conditioned on its own answer (impossible)
— read the _intent_, apply the sensible fix, and flag it.

| Excel says                       | Toolkit `FieldType`                                                         | Watch for                                                                                                                             |
| -------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Freetext                         | `TEXT`                                                                      | enumerated Options list → it's actually `SELECT`                                                                                      |
| Select                           | `SELECT`                                                                    |                                                                                                                                       |
| Date                             | `DATE`                                                                      |                                                                                                                                       |
| Number / Number input            | `NUMBER`, or `AGE` for an "age in years" DOB-unknown fallback               |                                                                                                                                       |
| Checkbox                         | `CHECKBOX`                                                                  |                                                                                                                                       |
| Radio                            | `RADIO_GROUP`                                                               |                                                                                                                                       |
| H3 / heading text                | `HEADING`                                                                   | pure section labels usually want `DISPLAY_ON_REVIEW: never()`                                                                         |
| Divider                          | `DIVIDER`                                                                   |                                                                                                                                       |
| Facility                         | `LOCATION` with `configuration.locationTypes: ['HEALTH_FACILITY']`          | `FACILITY` type is deprecated                                                                                                         |
| Upload Button                    | `FILE` (no options) or `FILE_WITH_OPTIONS` (Options list of document types) |                                                                                                                                       |
| Record/BRN lookup                | `SEARCH`                                                                    | verify the query clause against how _this_ event is actually indexed — don't port a clause from an unrelated example without checking |
| "Data" (static explanatory text) | `PARAGRAPH` or `HEADING`                                                    | `DATA` itself echoes the value of _other already-collected fields_ (`configuration.data: [{fieldId}]`); it is not free text           |
| Time (hh:mm)                     | `TIME`                                                                      | `configuration.use12HourFormat`                                                                                                       |
| Print/Upload sign-off flow       | no direct equivalent                                                        | flag for a product decision, don't invent one                                                                                         |

The `Secured?` column maps directly to that field's `secured: true` /
`secured: false` — pull it from the Excel per field, the same way `Mandatory`
maps to `required`. Don't infer it from whatever an existing template
happened to set on a same-named field.

Structural conventions to reuse rather than reinvent:

- A person's "Given name(s)" + "Surname" rows are **one** `FieldType.NAME`
  field. Every person in birth's template (`child.name`, `mother.name`, ...)
  bundles them; never split into two `TEXT` fields, in any life event.
- "Country" + admin-hierarchy levels (whatever local terms the Excel uses —
  province/district, island/village, ...) + street-level rows are **one**
  `FieldType.ADDRESS` field. The toolkit already renders country selection,
  the domestic-admin-hierarchy-vs-international branch, and street fields
  as a single unit — don't build separate `SELECT` fields per admin level.
- A `PageConfig` can carry a top-level `conditional` to skip an entire page
  (see `tennis-club-membership.ts`'s `senior-pass` page) — use it instead of
  repeating one SHOW conditional on every field when a whole Excel "page" is
  gated on one thing (e.g. "only relevant for late registration").
- Mutually-exclusive field variants (an "order of birth" question whose
  options depend on an earlier "type of birth" answer) become sibling
  fields, each with its own SHOW conditional keyed off the driving field —
  mirror birth's `child.birthLocation.privateHome` / `.other` pattern (or
  the target life event's own equivalent, if it already has one) rather than
  one field with dynamically-changing options.
- Pull every `required` flag from the Excel's Mandatory column, and every
  `secured` flag from the Secured? column, per field — never assume a field
  keeps an existing template's values. This is the easiest place to silently
  regress behavior, since most fields keep the same id and shape and only
  these flags change.
- Anything explicitly marked out of scope for this pass (see step 4) still
  needs to be _carried over unchanged_, not deleted — e.g. an existing phone
  number regex or ID validator you're not allowed to touch stays exactly as
  it was.

Done when: every Excel row has a mapped field (or an explicit "no mapping,
flagged" note), and every deviation from a literal reading is one you chose
deliberately, not one you missed.

## 6. Write the pages and wire forms/declaration.ts

**If `src/events/<life-event>/forms/pages/` already exists** (editing an
established life-event form, e.g. birth or death):

- Edit the `.ts` files there directly — no `-new.ts` duplication. Field IDs
  and exported identifiers stay as they are; only the field contents change.
  This means sibling pages that import from each other (e.g. `mother.ts` /
  `father.ts` / `documents.ts` importing `InformantType` from
  `informant.ts`) need no import-path juggling — there is only ever one copy
  of each file to keep in sync.
- If the Excel specifies a page with no current equivalent, add a new page
  file for it (same conventions as the existing pages).
- Rewire `src/events/<life-event>/forms/declaration.ts`'s `pages` array to
  match the Excel's page order, adding an import for any newly-created page
  file.

**If it doesn't exist** (scaffolding a life event with no form yet, e.g.
marriage, adoption):

- Create `src/events/<life-event>/forms/pages/`, and write one file per
  Excel page — mirror birth's per-page shape (`defineFormPage`, the MPL
  license header, one `export const <pageId> = ...` per file) rather than
  inventing a new file/export convention.
- Create `src/events/<life-event>/forms/declaration.ts`, mirroring birth's:
  a `defineDeclarationForm` export (`<LIFE_EVENT>_DECLARATION_FORM`) wiring
  the `pages` array in Excel order, plus a review-section export
  (`<LIFE_EVENT>_DECLARATION_REVIEW`, comment + signature fields) analogous
  to `BIRTH_DECLARATION_REVIEW` — adjust labels, message ids, and field ids
  to the new life event; don't copy birth's text verbatim.
- Stop there. Don't create `index.ts`, `advancedSearch.ts`,
  `dedupConfig.ts`, `printForm/`, `correctionForm/`, or touch
  `src/events/index.ts` — out of scope per step 4 unless the user asked for
  it explicitly.

In either case:

- Run `pnpm test:compilation` (`tsc --noEmit`) and check the files you
  touched or created specifically — the full run also reports whatever
  pre-existing errors the repo already has, so diff against a baseline run
  before this skill started rather than assuming every reported error is
  yours.
- Zero type errors in the files you touched is a hard bar, not a
  nice-to-have — fix them, don't report them as follow-up work.
- No comments. Don't add `//` explanations for what a field or conditional
  does — field IDs, labels, and the surrounding code are self-explanatory,
  and the existing page files don't carry comments either. If you catch
  yourself writing one to explain a non-obvious choice, put it in the report
  (step 7) instead, not in the file.

Done when: `tsc --noEmit` reports no errors in any file this skill touched
or created, `forms/declaration.ts` reflects the Excel's page set and order,
and none of the diffs/new files add comments.

## 7. Report back

There's no `-new.ts` diff to point the user at here — `git diff` (for edits)
and `git status` (for newly-created files, which won't show in `git diff`
until staged) are the review artifacts. List, concretely:

- Every file changed or created (`git status` / `git diff --stat` is the
  source of truth for this, not memory of what you touched).
- If a new life event was scaffolded: an explicit reminder that
  `index.ts`/`advancedSearch.ts`/`dedupConfig.ts`/`printForm/`/
  `correctionForm/` and registration in `src/events/index.ts` are still
  needed before the life event is usable end-to-end, since this pass
  deliberately didn't touch them.
- Every spec inconsistency you corrected (typos, self-referential
  conditionals, swapped field types, mismatched Field-type-vs-Options) and
  the fix you applied.
- Every assumption you made where the spec was ambiguous, silent, or
  contradicted itself.
- Every open question still blocking real use: undetermined values
  ("TBC" amounts), unclear field semantics, dependencies outside form
  config entirely (e.g. administrative-area/location seed data that still
  needs migrating before an `ADDRESS` field will show real places).
- Explicitly recommend the user run `git diff` (and `git status` for new
  files) before committing — with edit-in-place/scaffold-in-place there's no
  separate reviewable file, so this is the whole safety net.

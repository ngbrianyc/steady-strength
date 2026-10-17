# Exercise demo image credits

## Source

All images in this directory come from **Go4Life**, the exercise and physical
activity campaign of the **National Institute on Aging (NIA)** at the US
National Institutes of Health. The Go4Life site was retired and folded into
nia.nih.gov; these files were retrieved from Internet Archive captures of
`go4life.nia.nih.gov/wp-content/uploads/2018/07/`.

## Two sources, and why

**National Institute on Aging (NIA)** — the bulk of the demos. Older adults in
ordinary clothes doing the actual movements, mostly already laid out as panels.

**free-exercise-db** (The Unlicense, public domain) — two exercises only:
`dumbbell_goblet_squat` and `incline_push_up`. Its imagery is young male
athletes in commercial gyms. That was initially a reason to reject it outright;
the project owner reviewed the trade-off and judged coverage more valuable than
demographic match for a user they can coach in person. Reasonable call, so the
genuine movement matches were taken.

What did **not** change with that decision is movement accuracy. Several
tempting entries were still rejected after opening the actual photograph:

| Entry | Rejected because |
|---|---|
| "Chair Squat" | A loaded barbell squat in a Smith machine — not standing up from a chair |
| "Farmer's Walk" | A strongman *pickup* of loaded implements off the ground, not a standing carry; models a heavy floor lift |
| "Bent Over Two-Dumbbell Row" | Correct movement, but unsupported — our cues say "rest one hand and knee on a sturdy chair", so the photo would contradict the text |
| "Rickshaw Carry" | A two-handed frame carry, not a one-sided suitcase carry |

A wrong-movement demo is a safety and comprehension problem, not a matter of
taste, and personal use does not change that.

## Licensing

NIA's copyright policy states:

> The public may reproduce without permission information from the National
> Institute of Aging (NIA) Web site, except for documents that state another
> copyright policy applies to them. [...] Information presented on NIA's Web
> site is authored and owned by the Federal government which is in the public
> domain.

> Any information that is reproduced from this site should contain proper
> acknowledgement of NIA as the originator and NIA's Web site as the source.

Hence this file, and the in-app credit on the Learn tab.

### Open caveat — read before any commercial release

The same policy warns that NIA pages may carry third-party material, and puts
the burden of checking on the reuser:

> you may encounter documents, illustrations, photographs, or other information
> resources contributed or licensed by private individuals, companies, or
> organizations that may be protected by U.S. and foreign copyright laws.
> [...] it is the responsibility of the person/agency using or copying the
> information to research whether the information is copyrighted.

No photographer credit or copyright notice appeared on the source pages for
these specific images, which is consistent with federal authorship — but that
is an absence of evidence, not proof.

**Decision on record (2026-10-16):** the project owner reviewed this and
accepted the residual risk, as the app is for personal use. That is a
reasonable call at this scale. It does not carry over to distribution —
**if this app is ever published, sold, or handed to users beyond the owner's
household, confirm image status with NIA first**
(NIAWebsiteFeedback@mail.nih.gov). Nothing here is legal advice.

Separately: **"Go4Life" is a registered trademark of the US Department of
Health and Human Services.** The name and logo are deliberately not used
anywhere in this app; only the photographs are.

## Files

| File | NIA exercise | Used for |
|---|---|---|
| `chair_squat.jpg` | Chair Stand | `chair_squat` |
| `wall_push_up.jpg` | Wall Push-Up | `wall_push_up` |
| `supported_single_leg_stance.jpg` | Stand on One Foot | `supported_single_leg_stance` |
| `tandem_stance_supported.jpg` | Heel-to-Toe Walk | `tandem_stance_supported` |
| `seated_row_band.jpg` | Seated Row with Resistance Band | `seated_row_band` |
| `seated_knee_extension.jpg` | Leg Straightening | `seated_knee_extension` |
| `dumbbell_seated_overhead_press.jpg` | Overhead Arm Raise | `dumbbell_seated_overhead_press` |
| `seated_leg_extension_band.jpg` | Leg Straightening (reused) | `seated_leg_extension_band` |
| `dumbbell_goblet_squat_{0,1}.jpg` | free-exercise-db, Goblet Squat | `dumbbell_goblet_squat` |
| `incline_push_up_{0,1}.jpg` | free-exercise-db, Incline Push-Up | `incline_push_up` |

## Still missing

No demo for the hinge pattern, the carries, seated marching, doorframe row,
the band chest press, or the bodyweight seated push/pull variants.

Seven of twenty-two is the ceiling from this source, and that was checked
rather than assumed. Every remaining NIA image was reviewed individually:

| NIA image | Looks like a match for | Actually is |
|---|---|---|
| `chest.jpg` | `seated_chest_press_band` | A seated chest **stretch**, arms opened wide — not a press |
| `upper_back.jpg` | `seated_scapular_squeeze` | An upper-back **stretch**, rounding forward — the opposite movement |
| `hip.jpg` | the hinge gap | A floor-lying hip **stretch**; also wrong for anyone with fall risk |
| `chair_dip.jpg` | `seated_palm_press` | A triceps dip — a different, harder movement |
| `side_arm_raise.jpg` | `seated_scapular_squeeze` | A lateral raise — different muscle, different movement |

NIA's strength set simply contains no hip hinge and no loaded carry. Mapping
any of the above would reintroduce exactly the mismatch this directory exists
to avoid, so those exercises show cues with no image.

**The hinge is drawn, not photographed.** It is the most jargon-heavy movement
in the app, and no source has a demo for it — notably, neither NIA nor the
NHS programs a hip hinge for sedentary older beginners at all, so the absence
is about the standard repertoire rather than about image licensing.

`src/components/HipHingeAnimation.tsx` draws it instead: a side-view figure
whose spine is a single unbroken straight line pivoting about a marked hip
joint. For this movement a line figure is arguably clearer than a photograph
would be, since the entire teaching point is "the back stays straight and the
fold happens at the hip" — which clothing and body shape tend to obscure in a
photo. Seated and standing variants use matching figures.

# Exercise demo image credits

## Source

All images in this directory come from **Go4Life**, the exercise and physical
activity campaign of the **National Institute on Aging (NIA)** at the US
National Institutes of Health. The Go4Life site was retired and folded into
nia.nih.gov; these files were retrieved from Internet Archive captures of
`go4life.nia.nih.gov/wp-content/uploads/2018/07/`.

## Why these and not a stock exercise library

Open exercise datasets exist and are properly licensed — `free-exercise-db`
(The Unlicense, 873 exercises with start/end frames) is the best of them. They
were rejected on content, not licensing: the imagery is young male athletes in
commercial gyms. Its "Chair Squat" is a loaded barbell squat in a Smith
machine, not standing up from a chair. For a sedentary adult of 55–75 learning
to rise from a chair, that is worse than no image — wrong movement, wrong
difficulty, and a clear signal the app is not for them.

The NIA photographs show older adults in ordinary clothes doing the actual
movements, many already laid out as start/middle/end panels.

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
is an absence of evidence, not proof. **Before distributing this app
commercially, confirm their status with NIA** (NIAWebsiteFeedback@mail.nih.gov).
Nothing here is legal advice.

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

## Still missing

No demo yet for the hinge pattern, the carries, seated marching, doorframe row,
the band chest press, or the bodyweight seated push/pull variants. NIA has no
equivalent for several of these, and the ones it does have (e.g. "Chair Dip",
"Side Arm Raise") are different movements — mapping them would reintroduce
exactly the mismatch this directory exists to avoid. Those exercises show their
cues with no image, which is the honest fallback.

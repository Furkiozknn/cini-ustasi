# 🎨 Çini Ustası · Iznik Tile Puzzle

**[▶ Play in your browser](https://furkiozknn.github.io/cini-ustasi/)** · Türkçe & English · desktop & mobile · free, no install

🏟️ Part of **[Claude Game Arena](https://furkiozknn.github.io/)**: four games, each built by a different Claude model. This is game #3, built by **Claude Fable 5.1**. [See all games and the scorecard →](https://furkiozknn.github.io/)

🎮 **Godot 4 remake (round 2):** [play](https://furkiozknn.github.io/cini-ustasi-godot/) · [code](https://github.com/Furkiozknn/cini-ustasi-godot), rebuilt by the same model in a real game engine.

![Gameplay clip](docs/gameplay.gif)

A calm 3D edge-matching puzzle in a **single `index.html`** (Three.js, no build step) plus a small `assets/` folder of
generated models and textures. The tile motifs themselves are painted in code.
In a warm tile workshop, rotate, swap and flip hand-painted Iznik tiles until every tulip, carnation,
saz leaf and rumi scroll connects across the board. Then watch the finished panel glaze, fire in the kiln
and take its place on your wall.

![Chapter 3: fixed and double-sided tiles, with the gallery wall filling up](docs/chapter3-level22-wall.png)

## Features

- **30 levels in 3 chapters**, each adding one mechanic: rotate tiles (chapter 1), swap tiles (chapter 2),
  then fixed tiles, double-sided tiles you can flip and 6×6 boards (chapter 3). Boards grow from 3×3 to 6×6.
- **Every level is guaranteed solvable:** boards are generated solved and then scrambled, and the built-in
  solver solves all 30 levels from the scrambled state.
- **Readable motifs:** five Iznik motifs in cobalt, turquoise, coral and emerald are drawn in code. Each motif is
  widest at the edge, so a matched pair forms one medallion, and matched edges glow gold.
- **Moves vs par and 1-3 stars**, undo, restart, three hints per level (each fixes one tile), and a
  **daily board** that unlocks after chapter 1.
- **The kiln sequence:** a solved board glazes with a shine sweep, slides into the glowing kiln, fires with
  sparks and comes out framed for your **collection wall** and gallery.
- **A living workshop:** dust motes in the window light, a view of Lake Iznik through the window, a flickering kiln
  that the camera follows during the firing (also on phones), glossy glazed tiles, and a cat that comes to sit on the stool.
- **Matched-edge counter** in the top bar ("Edges 18/24"), so big boards show how close you are.
- **Generated music and sound:** oud-like plucks on a Hicaz scale over a soft drone, plus tile clicks, chimes
  and the kiln's whoosh, all made with Web Audio.
- **Settings:** master / music / effects volume, Turkish / English, Low / High graphics, fullscreen. Saved in your browser.
- **Pause menu** (Resume, Restart, Settings, Levels, Collection, How to play, Title screen) and a level-complete card
  with a new-record badge.
- **Progress is saved** in your browser (stars, unlocked levels, collection); the title offers **Continue**.

| | |
|---|---|
| ![Chapter 1, 5×5 board mid-solve](docs/chapter1-level10.png) | ![The panel sliding into the kiln](docs/kiln-panel-sliding-in.png) |
| ![Level complete](docs/level-complete.png) | ![Collection gallery](docs/collection.png) |
| ![Title screen](docs/title.png) | ![Phone layout](docs/phone-390.png) |
| ![Settings](docs/settings.png) | ![Firing on a phone: the camera follows the kiln](docs/phone-kiln.png) |

## Controls

| Action | Mouse / keyboard | Touch |
|---|---|---|
| Rotate a tile 90° | Click | Tap |
| Swap two tiles (chapter 2+) | Drag one onto the other | Drag |
| Flip a double-sided tile (chapter 3) | Right-click, or `F` on the hovered tile | Long-press |
| Tilt the camera / zoom | Drag on the table / mouse wheel | Drag / pinch |
| Undo / hint / restart | `Z` / `H` / `R` | Top bar |
| Pause / back | `P` or `Esc` | Top bar |
| Music / sound / language | `M` / `X` / `L` | Pause menu, settings |
| Buttons | `Tab`, `Enter` / `Space` | Tap |

Hints plan against the board's own generated solution, so they are instant and never fail; undoing a hint gives it back.

## Run it locally

Serve the folder with `python -m http.server 8766` and open http://127.0.0.1:8766/ (needs internet for Three.js and
the font). Double-clicking `index.html` also works: from `file://` the browser blocks loading the asset files, so the
game uses its original procedural models and textures.

Puzzle-core tests (Node, no dependencies): `node tests/core.test.mjs` checks all 30 levels and 5 daily boards
(deterministic generation, the home solution solves the board, par = its plan length, the solver finds a solution).

### Settings and save

Settings are stored under `localStorage['arena.cini.settings']` (`master`, `music`, `sfx`, `lang`, `quality`, plus the
music/sound toggles), progress under `arena.cini.save`; the round-1 key `cini-ustasi-v1` is migrated once. The first
visit picks the language from the browser and Low graphics on touch devices or CPUs with 4 threads or fewer.
Low = no anti-aliasing (applies on the next visit), pixel ratio 1, no shadows, 128 px tile textures, fewer dust motes.
On High the shadow map is only redrawn on frames where something moved.

### URL flags

| Flag | Effect |
|---|---|
| `?low` | Low graphics for this visit (not saved) |
| `?noassets` | Skip the asset files and use the procedural models and textures |
| `?lang=en` / `?lang=tr` | Interface language |
| `?level=N` / `?level=daily` | Jump to a level |
| `?auto` | The game solves itself (plans to the generated solution) and moves on (self-test bot) |
| `?debug` | Draw calls, fps and any JS errors on screen; `window.ciniSim(seconds)` fast-forwards the game |
| `?sim=N` | Fast-forwards N seconds before the first frame |
| `?fresh` | Starts with empty progress and default settings |
| `?screen=levels` (or `collection`, `howto`, `settings`, `pause`) | Opens that screen (`?ch=N` picks the how-to page) |
| `?fill` | Fills the collection for screenshots (saving disabled) |

## How it was made

Game #3 of a series in which **every game is built by a different AI model**, to compare which one makes the better game.
This one was built by **Claude Fable 5.1** (`claude-fable-5-1`) with [Claude Code](https://claude.com/claude-code), on its own,
from one prompt: [`prompts/cini-ustasi.md`](prompts/cini-ustasi.md). Every model gets the same prompt structure, quality bar and
self-test rule, and none of them sees the other games' code. The orchestrating session (Claude Opus 5.5) wrote the prompt,
re-tested the result independently and published it.

Verification before release: the solver solves all 30 levels and 5 daily boards; an independent bot run in a real browser
cleared all 30 levels with 90/90 stars and zero JS errors; about 25-55 draw calls depending on the board size. Review found one
visual bug (the board dipped into the table at the start of the kiln animation), which the builder fixed before release.

| # | Game | Genre | Model |
|---|---|---|---|
| 1 | [Hisar](https://github.com/Furkiozknn/kale-savunmasi) | Tower defense, 3D | Claude Opus 5.5 |
| 2 | [Çay Ocağı](https://github.com/Furkiozknn/cay-ocagi) | Time management, 3D | Claude Sonnet 5.5 |
| 3 | **Çini Ustası** | Puzzle, 3D | Claude Fable 5.1 |
| 4 | [Martı](https://github.com/Furkiozknn/marti) | Arcade flyer, 3D | Claude Haiku 5.5 |

## Tech

Three.js r170 (ES module from jsDelivr), canvas-generated tile textures, Web Audio API, one Google Font (Nunito).
About 2,300 lines of plain JavaScript, HTML and CSS in one file.

## Assets

Generated with **Higgsfield**: Tripo text-to-3D (kiln, sitting cat, paint set) and GPT Image (table wood, terracotta
floor, plaster, window view, kilim, crest, a small reflection panorama for the glaze), processed with glTF-Transform
(pivot at the base, WebP textures) and sharp. The tile faces stay procedural because the puzzle needs every motif to
meet its twin exactly at the edge. When an asset cannot load (`file://`, `?noassets`, a network error) the original
procedural version is used. Details, prompts and sizes: [`docs/assets.md`](docs/assets.md).
Assets remastered by Claude Opus 5.5 (orchestrator).

## Changelog

### 2026-10-21 overnight pass

Fixes
- Closing Levels / Collection / How to play now returns to where it was opened from (the complete card, the title,
  the pause menu or the game); before, it could drop you onto an invisible solved board or back into an old level.
- Phones: the camera pans to the kiln and follows the finished panel to the wall, so the firing is no longer off-screen.
- The window glass sat inside the wall; it is now in front of it (with a painted lake view).
- A second finger during a tile drag left the tile floating; the drag is now cancelled.
- Top-bar, level and complete-card stars are drawn as SVG (the star glyph rendered grey from a fallback font).
- Brush collars/tips floated off the handles; plate rims sat behind the plates; brushes, pots and the cloth clipped the
  board; the kiln dome cut the right-hand shelf (kiln moved to x 4.55).
- The first wave of kiln sparks never appeared; long sounds (whoosh, fire) were cut at 1 s.
- Hints (and the `?auto` bot) plan against the known solution: instant, and never "the board already looks right".
- The "no swaps in this chapter" toast shows once per drag instead of once per page load; Restart says "Board reset".
- Undoing a hint returns the hint. A replayed panel that had dropped off the wall goes back up as the newest one.
- A daily seed that fails generation moves to the next seed instead of building a partial board (never seen for the
  30 levels, which are unchanged).

New systems
- Settings screen, pause menu with Settings, Continue on the title, keys `P` `M` `X` `L` `F`, focus rings and
  44 px touch targets, phone top bar in two rows, toasts under the top bar with good/bad colours, new-record badge and
  Title-screen button on the complete card, footer credit, loading counter while assets load, `?noassets`.
- Quality tier (Low/High), and the shadow map redrawn only when something moves.
- Generated assets with procedural fallback (see Assets); glaze reflections from an environment map.
- Camera idle drift and a small shake when the kiln fires; matched-edge counter in the top bar.
- `tests/core.test.mjs` for the puzzle core.

Removed
- Unused code: a discarded `findIndex`, an unused frame material, `Sound.click`, `G.intro`, `B.solved`, a `* 0.0` term,
  unused i18n keys (`hint`, `undo`, `menu`, `dailyBest`, `hintNone`) and the wrong "every double-sided tile has a wrong
  face" comment. The backtracking solver is kept for the tests only.

## License

Code: [MIT](LICENSE).

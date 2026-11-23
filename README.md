# ISOBATH 等深線

**ishigaki ocean institute** · 石垣島, okinawa · 24°20′N 124°09′E

> an isobath is a line that joins every point of the same depth.
> we draw them by hand, one dive at a time.

ISOBATH is a concept website for an ocean institute on Ishigaki, at the edge of **Sekisei Lagoon**, Japan's largest coral reef. The institute maps the reef, counts the fish, keeps a public logbook and takes two people out every Saturday to help.

The site is a **dive**. The top of every page is 0 m and the footer is −40 m. A gauge on the right and the cursor read how deep you are, and the deeper you scroll the more the colours behave like the sea.

It is also a small science lesson. Every page teaches one real thing a reef scientist does:
- how a sea chart is drawn
- how fish are counted
- how a reef is measured along a tape
- why 30 °C matters
- how the tide follows the moon

concept, design & code by **ghostly.grl ♥**

---

## contents

- [the idea](#the-idea)
- [design](#design)
- [pages](#pages): [home](#home--indexhtml) · [reef](#reef--reefhtml) · [census](#census--censushtml) · [logbook](#logbook--logbookhtml) · [dive](#dive--divehtml) · [visit](#visit--visithtml)
- [what is real, what is made up](#what-is-real-what-is-made-up)
- [live bits](#live-bits)
- [easter eggs](#easter-eggs)
- [built with](#built-with)
- [run it](#run-it)
- [structure](#structure)
- [images & credits](#images--credits)

---

## the idea

An **isobath** (等深線, *tōshinsen*) is a line of equal depth on a sea chart, the underwater version of a contour line on a mountain map. Nobody prints them: someone has to go out, drop a weight on a line, write the number down, move ten metres and do it again. Then the numbers get joined.

That slow, handmade, slightly obsessive way of knowing a place is the whole site:
- the loader is a sounding
- the background lines are isobaths
- the travel times are isobaths of time
- every page ends deeper than it started

The tone is quiet and a bit funny, like the notes people actually write on a dive slate.

## design

| | |
|---|---|
| **palette** | paper white `#f3f4f5` · fog `#e3e6e9` · one klein blue `#1534ff` · ink `#0b0d12` · a single coral red `#ff5a3c` for warnings (heat, safety stops, the bleaching line) |
| **type** | **Inter Tight** for the big titles · **JetBrains Mono** for codes, labels and data · **Silkscreen** for counters and clocks (the logbook voice) · **Big Shoulders Stencil** for the archive poster · **Noto Sans JP** for the Japanese · **Pinyon Script** for signatures |
| **grid** | six thin columns drawn on most sections, like the lines of a chart |
| **devices** | the **blue strip of codes** that runs across pages · **glass drops** that really magnify what is behind them · **halftone dots** (bigger dot, deeper blue) · **tagged boxes** around things being counted · **contour lines** everywhere |
| **chrome** | the blue tag top-left (24°20′N), a mono nav, a vertical side label, the depth gauge on the right. Over blue sections it all turns white |
| **cursor** | a sounding crosshair. It reads the depth of the page where it points, or what it is over (“−12.4 m · the reef”, “inside the belt · it counts”) |
| **loader** | a sounding: isobaths draw themselves around one point while the depth counts to 40.0 m, then a blue strip wipes the page open. Once per visit |
| **motion** | GSAP + ScrollTrigger, Lenis smooth scroll, magnetic buttons, scramble text, pinned scenes, scrubbed drawings. Everything respects `prefers-reduced-motion` |

## pages

### home · `index.html`

| # | section | what happens |
|---|---|---|
| 01 | **surface** | “ISOBATH” under the blue strip of codes (shiraho st., kuroshio 1.8 kn, spawn 13/05…). A glass drop sits on the strip and magnifies it for real, follows the mouse and is never quite round. Two smaller drops float |
| 02 | **depth** | pinned. Scroll from 0 to −40 m through six zones (surface, reef flat, crest, slope, wall, blue). A wireframe coral turns in the middle, the zone name scrambles, and the background **loses colour the way the sea does**: red goes first, then orange, yellow, until only blue is left |
| 03 | **archive** | a stencil poster, “ARCHIVED: ISLAND OF LOST COLOUR · 白化した島”. The reef is a halftone map; **your cursor bleaches it** and it comes back slowly. A counter tracks how many m² your hand bleached |
| 04 | **census** | every fish in the photo gets a box. Scroll and the boxes fall out of the photo into the blue, where they join into a network of crossing paths |
| 05 | **one litre** | “one litre of the sea off shiraho holds more lives than ishigaki has people.” Six glass drops you can **drag** over the text to read it bigger |
| 06 | **species** | a sentence made of `{ }` with tiny photos inside, then a big photo with **white boxes for the species not seen here since 2016**. Hover a box for its name |
| 07 | **logbook** | a viewfinder, a faded diver, and this year's numbers in pixel type, counting up: 214 dives, 37 m, 1,862 fish, 3 nights |
| 08 | **come down** | “come draw a line with us.” The way to a Saturday dive |

### reef · `reef.html`

The map of Sekisei Lagoon, and how it is made.

| # | section | what happens |
|---|---|---|
| 01 | **the map** | pinned, a lesson in three steps drawn on a real depth field. **Sound**: numbers appear like on a nautical chart. **Join**: the isobaths are drawn through them (coast first, then −2, −5, −10, −20, −30 m), sweeping from the west like a hand would. **Read**: halftone dots fill the water (bigger dot, deeper), land turns grey, the six survey sites get their tags. The cursor reads the depth and the zone under it, and a click drops **your own sounding** on the map (it stays) |
| 02 | **sites** | the six places we go back to every year: Shiraho, Kabira Ishizaki, Yonara Channel, Sekisei Centre, Kuroshima Road, Nagura Amparu. Hover a row and it turns into a blue strip of codes while a glass drop follows the cursor with a photo of the place |
| 03 | **transect** | “fifty metres of tape, a point every fifty centimetres.” A hundred bars, one per point: live coral, bleached, dead with algae, sand, rubble. Scroll and you swim the tape. Switch **2008 · 2016 · 2024** to watch the reef bleach and slowly come back |
| 04 | **spawn** | night blue. “a few nights after the full moon of may, the whole reef lets go at once.” **Press and hold**: pink bundles rise from the coral, snow falling up. The next expected spawning date is worked out from the real moon |
| 05 | **next** | on to census |

### census · `census.html`

How we count the fish.

| # | section | what happens |
|---|---|---|
| 01 | **how many** | a school swims across the page (a boids simulation; the cursor is a diver they swim away from). Guess how many, press **count them**: the fish stop and get a box and a number each, left to right. Then you see how far off you were. Your guesses are kept and averaged (“most people guess about a third too few”) |
| 02 | **the belt** | pinned, on blue. A **belt transect** seen from above: 50 m of tape, 2.5 m each side. You swim along it; only the fish inside the belt count, the rest are “somebody else's”. A white slate fills with **tally marks** in groups of five (big schools are counted in tens) |
| 03 | **who we count** | eight **indicator species**: butterflyfish, parrotfish, humphead wrasse, coral grouper, blue-green chromis, giant clam, crown-of-thorns, green turtle. Each card has the Latin and Japanese name, what the fish tells us about the reef, and its count in May 2026 against May 2008. The photo starts as **blue halftone dots and becomes the fish** on hover. The crown-of-thorns, a coral-eating starfish, is the only one whose number we want to go down |
| 04 | **next** | on to the logbook, or join a survey dive |

### logbook · `logbook.html`

Every dive of 2026, open to anyone.

| # | section | what happens |
|---|---|---|
| 01 | **the year** | “LOGBOOK 2026” and its counters (214 dives, hours under, days the sea was closed). 365 squares fill in week by week. Darker blue means a deeper dive; black is a night dive; hatched means the sea was closed by a typhoon or the north wind; pale grey is a Monday, when we rest; empty is not yet. A red dot marks the days that mattered. Hover a square to read its line, click to open its page |
| 02 | **one page** | the entry on ruled paper, signed in pencil: date, site, time in, max depth, bottom time, visibility, water temperature, current, team, task, and one line about the dive. The **dive profile draws itself**, with the safety stop in red. Previous / next, or the arrow keys |
| 03 | **water** | the temperature at −5 m for the whole year, drawn as you scroll, with the **30 °C line where coral starts to bleach** and the August days above it. Hover any day |
| 04 | **lines** | “the last page is for you.” Write one line in the back of the logbook, next to the lines of past visitors. It stays in your browser only |
| 05 | **next** | on to dive |

The year is generated from a seed, so every day always says the same thing:
- 214 dives up to today
- the spawning nights of 4–6 May (“the reef let go at 21:52”)
- the 37 m isobath drawn on 22 September
- nine days above 30 °C in August

### dive · `dive.html`

Come down with us: every Saturday, two places.

| # | section | what happens |
|---|---|---|
| 01 | **come down** | pinned. **The surface is a line** across the screen. Above it: air, paper, “COME DOWN” in ink. Below it: the sea, and the same words in white, **bent by an SVG refraction filter**, with bubbles rising. The mouse makes ripples, a click splashes, and as you scroll **the water rises** over the whole page (1.0 → 1.8 atm) |
| 02 | **a saturday** | pinned and sideways on blue, the day hour by hour while a **pixel clock** runs with the scroll: 06:45 the port · 07:30 the boat · 08:10 learn eight fish · 08:40 first dive, the belt · 09:50 surface interval · 10:40 second dive, the coral · 12:30 your line goes on the map |
| 03 | **what to bring** | “nothing. ~~almost.~~” Our list ticks itself (boat, tanks, slate, pencil, tea), and yours is short (a licence or a snorkel, a towel, patience with the captain). It costs **¥0**: you pay in fish |
| 04 | **book** | the next eight Saturdays, two places each, some already taken. Choose diver or snorkeler, write your name for the map, and a **boarding slate** falls in with your name written in pencil and your boarding number. You can give the place back. Nothing is sent anywhere |
| 05 | **next** | on to visit |

### visit · `visit.html`

Find us.

| # | section | what happens |
|---|---|---|
| 01 | **find us** | a **compass** points from your city to Ishigaki. The city is guessed from your time zone (no permission needed); a button uses your real position, which never leaves the page. Distance, bearing, and how long it takes by plane, swimming at 3 km/h, or drifting on the Kuroshio current |
| 02 | **isochrones** | “an isochrone is an isobath of time.” On blue, the travel times to the door drawn as nested contour lines: 10 min from the airport, 30 min from town, the Taketomi boat, Kabira Bay, Naha, Osaka, Tokyo. Hover a line or a row |
| 03 | **today** | the time in Shiraho (JST) with an open/closed light, and **today's tide worked out from the moon**: when the sea goes out, when the reef flat is shallow enough to walk to the reef, and whether it's a spring tide or a neap tide |
| 04 | **the house** | three photos that open as you scroll: the house, the map room, the beach across the road |
| 05 | **address** | the address in Japanese and English, five things we ask you (“don't feed the fish. they have a job.”), and **back to the surface**: a slow five-second ascent to 0 m, “never faster than your bubbles” |

## what is real, what is made up

ISOBATH is not a real institute, but the science on the site is.

**Real**
- Sekisei Lagoon (石西礁湖) between Ishigaki and Iriomote is Japan's largest coral reef, about 400 km²
- Shiraho (白保) has one of the largest colonies of blue coral (*Heliopora coerulea*) in the north Pacific
- in 2016 a long marine heatwave bleached most of the lagoon
- coral bleaches when the water stays above about 30 °C for too long
- isobaths, soundings, belt transects, point-intercept transects, tally marks and underwater slates are how reef surveys are really done
- coral spawns a few nights after a full moon in late spring
- tides follow the moon, with spring tides at new and full moon
- the eight species are real indicator species of reef health

**Made up**
- the institute, the people (and the captain), the counts, the logbook entries and the visitor lines
- the depth map is a generated field shaped like the lagoon, not a survey
- the tide is a simple model from the moon phase, not a tide table: don't plan a reef walk with it

## live bits

| what | how |
|---|---|
| the next coral spawning | full moon of May from the synodic month (new moon of 6 Jan 2000 as reference), plus 3–7 nights |
| today's tide | moon age → lunar transit → high water ≈ transit + 7.3 h, a 12.42 h semidiurnal wave plus a small diurnal one; amplitude grows toward new and full moon |
| open / closed | Japan time, Tuesday–Sunday 09:00–17:00 |
| your city | the browser's time zone, mapped to the nearest city; real position only on request |
| the logbook year | seeded, and stops at today |
| the next Saturdays | counted from today |

## easter eggs

- **konami code** (↑ ↑ ↓ ↓ ← → ← → b a): you went too deep. The page floods, counts 3·2·1 and surfaces
- leave the tab and it says `surfacing… ↑ come back down`
- open the console for the ASCII cat (“the cat does not dive. it waits on the boat.”) and try `IB.help()`
- every page ends with an ASCII cat in the source, after `</html>`
- `IB.log` in the console on the logbook lists every dive of the year
- home: `IB.bleach()` tells you how much reef your hand bleached
- dive: click the surface for a splash
- visit: *back to the surface* never goes faster than your bubbles

Things the site remembers, in `localStorage` (prefix `ib-`, nothing is sent anywhere):

| key | what |
|---|---|
| `ib-soundings` | the soundings you added to the reef map |
| `ib-spawned` | how many coral bundles you let go |
| `ib-guesses` | your fish guesses, and the real numbers |
| `ib-lines` | the lines you wrote in the logbook |
| `ib-boarding` | your place on the boat |

## built with

- HTML, CSS, vanilla JavaScript, no build step
- [GSAP 3.12.5](https://gsap.com) + ScrollTrigger: pins, scrubs, timelines
- [Lenis 1.1.13](https://github.com/darkroomengineering/lenis): smooth scroll
- canvas 2D for:
  - the halftone reef you bleach
  - the wireframe coral
  - the lagoon map: a value-noise depth field, isobaths by **marching squares**
  - the boids school, the belt transect, the spawning bundles
  - the halftone species cards
- SVG for the contour lines, the dive profiles, the water chart, the compass, the isochrones and the tide
- an SVG `feDisplacementMap` for the refraction under the surface, and a `clip-path` polygon for the moving waterline
- fonts from Google Fonts

## run it

Open `index.html` in a browser, or serve the folder (better: the halftone cards on census need a server to read the photos' pixels):

```bash
python3 -m http.server 5850
```

then go to `http://localhost:5850`.

## structure

```
index.html        home
reef.html         the map, the sites, the transect, the spawning
census.html       how many, the belt, who we count
logbook.html      the year, one page, the water, your line
dive.html         the surface, a saturday, what to bring, book
visit.html        find us, isochrones, today, the house, address

css/style.css     shared: tokens, chrome, cursor, gauge, strip, drops, slots, footer, loader
css/home.css  css/reef.css  css/census.css  css/logbook.css  css/dive.css  css/visit.css

js/main.js        window.IB: slots, lenis, cursor, depth gauge, scramble, magnetic,
                  marquee strips, glass lens, contour lines, toast, footer, konami, loader
js/home.js        the drop, the six zones, the bleachable reef, the census boxes, the species
js/reef.js        the map (marching squares), sites, transect, spawning
js/census.js      the school (boids), the belt and its slate, the halftone cards
js/logbook.js     the seeded year, the page and its profile, the water, your lines
js/dive.js        the surface (wave + refraction), the saturday, the booking
js/visit.js       the compass, the isochrones, the tide from the moon, the ascent

img/HOME/  img/REEF/  img/CENSUS/  img/LOGBOOK/  img/DIVE/  img/VISIT/
favicon.svg
```

Every image is a slot (`<div class="slot" data-img="HOME/census.jpg">`). If the file is missing, the slot shows its filename and a description of the photo it wants, so the site never looks broken. A slot tries `.jpg`, `.png`, `.webp` and `.jpeg` in that order.

## images & credits

| file | what |
|---|---|
| `HOME/census.png` | a school of fish from above, turquoise water |
| `HOME/sp-school.jpg` | a school of fish in a spiral (small) |
| `HOME/sp-parrot.jpg` | blue parrotfish (small) |
| `HOME/sp-current.jpg` | sunlight in the water (small) |
| `HOME/sp-bluecoral.jpg` | blue coral, *Heliopora coerulea* (small) |
| `HOME/sp-manta.jpg` | reef manta ray (small) |
| `HOME/sp-turtle.jpg` | green turtle (small) |
| `HOME/species.jpg` | a freediver going down past a huge school of fish |
| `HOME/diver.jpg` | a freediver in the blue (faded to pale blue) |
| `HOME/profile.jpg` | a person with a short bob, side view (faded to pale blue) |
| `REEF/shiraho.jpg` | a spiral of lettuce coral |
| `REEF/kabira.jpg` | a manta ray with its pilot fish |
| `REEF/yonara.jpg` | a tornado of fish along the reef wall |
| `REEF/lagoon.jpg` | table corals at the surface |
| `REEF/kuroshima.jpg` | a green turtle resting on sea grass |
| `REEF/nagura.jpg` | mangrove roots full of small fish |
| `REEF/transect.jpg` | a diver among the lines of a coral nursery |
| `CENSUS/butterfly.jpg` | masked butterflyfish |
| `CENSUS/parrot.jpg` | a parrotfish, close up |
| `CENSUS/napoleon.jpg` | a humphead wrasse |
| `CENSUS/grouper.jpg` | a coral grouper |
| `CENSUS/chromis.jpg` | blue-green chromis over a coral head |
| `CENSUS/clam.jpg` | a giant clam |
| `CENSUS/cots.jpg` | crown-of-thorns starfish on coral |
| `CENSUS/turtle.jpg` | a green turtle in the blue |
| `LOGBOOK/l1.jpg` … `l6.jpg` | a diver going down · writing on a slate · a clear kayak from above · a beam of light · night torches (used for night dives) · the reef from above |
| `DIVE/t1.jpg` … `t5.jpg` | the port in the morning · a boat's wake from above · two divers in a cave of light · resting on deck · white branching coral |
| `VISIT/house.jpg` | an Okinawan house, red tiles, coral-stone wall |
| `VISIT/maproom.jpg` | a room of maps and charts by a window |
| `VISIT/shiraho.jpg` | the reef flat in shallow clear water |

**Wikimedia Commons**

- `HOME/sp-parrot.jpg` · *Blue parrotfish in Réunion* · Parchaco · CC0
- `HOME/sp-turtle.jpg` · *Chelonia mydas is going for the air* · Brocken Inaglory · CC BY-SA 3.0
- `HOME/sp-bluecoral.jpg` · *Heliopora coerulea Maldives* · Frédéric Ducarme · CC BY-SA 4.0
- `HOME/sp-manta.jpg` · *Reef manta ray (Manta alfredi)* · Rickard Zerpe · CC BY 2.0

**Everything else** was found on Pinterest. Authors are unknown, and every photo belongs to its author. They are used here only to show the design of a concept site, and will be removed on request.

---

ISOBATH is a concept project, not a real institute. Nothing on the site sends data anywhere.

*the sea is made of lines.* 海は線でできている

made by **ghostly.grl ♥**

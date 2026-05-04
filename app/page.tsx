'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { MODULES, CAT_CLASS, CAT_LABEL } from '@/lib/modules'

interface Technique {
  name: string
  body: string
}

function TechniqueItem({ tech, phaseClass }: { tech: Technique; phaseClass: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`technique${open ? ' open' : ''}`}>
      <button
        className="technique-toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="t-marker"></span>
        <span className="t-name">{tech.name}</span>
        <span className="t-chevron">▶</span>
      </button>
      <div className="technique-body">{tech.body}</div>
    </div>
  )
}

function PhaseSection({
  id,
  phaseClass,
  num,
  title,
  duration,
  goal,
  techniques,
  tipLabel,
  tipBody,
}: {
  id: string
  phaseClass: string
  num: string
  title: string
  duration: string
  goal: string
  techniques: Technique[]
  tipLabel: string
  tipBody: string
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className={`phase-section ${phaseClass}`} id={id} ref={ref}>
      <div className="phase-header">
        <span className="phase-num">{num}</span>
      </div>
      <h2 className="phase-title">{title}</h2>
      <div className="phase-duration">{duration}</div>
      <p className="phase-goal">{goal}</p>
      <div className="techniques">
        {techniques.map((t) => (
          <TechniqueItem key={t.name} tech={t} phaseClass={phaseClass} />
        ))}
      </div>
      <div className="tip-box">
        <div className="tip-label">{tipLabel}</div>
        {tipBody}
      </div>
    </section>
  )
}

function ModuleTable() {
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState('all')

  const filtered = MODULES.filter((m) => {
    const matchCat = activeCat === 'all' || m.cat === activeCat
    const q = query.toLowerCase()
    const matchQ =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.mfr.toLowerCase().includes(q) ||
      m.tags.toLowerCase().includes(q)
    return matchCat && matchQ
  })

  const categories = ['all', 'generative', 'source', 'fx', 'modulation', 'filter', 'utility', 'drum']
  const catLabels: Record<string, string> = {
    all: 'All',
    generative: 'Generative',
    source: 'Sources',
    fx: 'Effects',
    modulation: 'Modulation',
    filter: 'Filters',
    utility: 'Utility',
    drum: 'Drums',
  }

  return (
    <div className="module-section" id="modules">
      <div className="section-title">Module collection — 87 modules</div>
      <div className="module-controls">
        <input
          type="text"
          className="module-search"
          placeholder="Search module or manufacturer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {categories.map((cat) => (
          <button
            key={cat}
            className={`cat-btn${activeCat === cat ? ' active' : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {catLabels[cat]}
          </button>
        ))}
      </div>
      <div className="module-count">
        Showing {filtered.length} of {MODULES.length} modules
      </div>
      <div className="module-table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Module</th>
              <th>Manufacturer</th>
              <th>Category / Tags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--mono)',
                    fontSize: '12px',
                  }}
                >
                  no modules match
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.n}>
                  <td className="td-n">{m.n}</td>
                  <td className="td-name">{m.name}</td>
                  <td className="td-mfr">{m.mfr}</td>
                  <td>
                    <span className={`cat-pill ${CAT_CLASS[m.cat]}`}>{CAT_LABEL[m.cat]}</span>
                    <br />
                    <span className="td-tags">{m.tags}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const PHASES = [
  {
    id: 'phase1',
    phaseClass: 'p1',
    num: 'Phase 01',
    title: 'Constraint practice',
    duration: 'Weeks 1–2',
    goal: 'Break the analysis paralysis habit before introducing new techniques. Work with only 5 modules per session. The goal isn\'t great music — it\'s making something finished.',
    techniques: [
      {
        name: 'The 5-module challenge',
        body: 'Before patching, physically pick 5 modules: one sound source, one filter, one modulation source, one clock/sequencer, one utility. Patch only with those. The constraint forces decisions. Repeat with different 5-module sets each session. Success here isn\'t making something good — it\'s making something finished. Any sound that has a clear beginning, middle, and end counts.',
      },
      {
        name: 'Patch journaling',
        body: 'After each session write 3–5 sentences: what you patched, what worked, what you\'d try next. This externalizes decisions and reduces the feeling that you have to figure everything out at once. Over time it becomes a personal library of starting points.',
      },
      {
        name: 'Map your rack\'s voice',
        body: 'Make a quick map of what each module in your rack does best. Knowing "this VCO tracks well, this one drifts nicely, this filter self-oscillates beautifully" gives you a vocabulary rather than a catalog to search. For ambient work: set your drum-heavy modules physically aside so they don\'t pull your eye — Mutant BD9, LXR, Hatz, uGrids, Seismograf BD, ADDAC103, BIA, Irukandji, and Rample.',
      },
    ],
    tipLabel: 'Session goal',
    tipBody: 'Any sound that has a clear beginning, middle, and end counts as success. You are training decision-making, not music quality.',
  },
  {
    id: 'phase2',
    phaseClass: 'p2',
    num: 'Phase 02',
    title: 'Core generative vocabulary',
    duration: 'Weeks 3–6',
    goal: 'Learn four foundational techniques one at a time. Spend multiple sessions with each before moving on. Resist combining them until you understand each individually.',
    techniques: [
      {
        name: 'Clock division & multiplication',
        body: 'One master clock (Pamela\'s PRO Workout) feeding dividers (÷2, ÷4, ÷8, ÷16) and multipliers creates a web of rhythmically related events. Route different divisions to envelope triggers, sequencer clocks, and LFO resets. The result feels purposeful but not mechanical. Try clocking Mimetic Digitalis at ÷16 or ÷32 of your master — each step becomes a long, slow event.',
      },
      {
        name: 'Probability gates',
        body: 'Run your gate signals through a probability module set to ~40–70%. Events that happen sometimes rather than always immediately break four-on-the-floor patterns. Pamela\'s PRO Workout has built-in gate probability per channel. Try it on a bass drum or melody trigger first — the contrast with a steady kick is revealing. Pachinko and Pet Rock are entirely built around this idea.',
      },
      {
        name: 'Slow random modulation',
        body: 'Sample & Hold clocked at 0.1–0.01Hz, slewed heavily through the Befaco Slew, patched to filter cutoff, reverb mix, or oscillator pitch (with attenuator). The parameter should drift over 2–5 minutes, not seconds. This is the core of the "evolving over time" quality. Use Pamela\'s PRO Workout to generate slow random, Airstreamer or Infinitely Maybe as S&H sources, and always pass through the Slew before the destination.',
      },
      {
        name: 'Feedback loops',
        body: 'Route an audio output back into a CV input (via attenuator + offset), or patch a sequencer\'s output CV into its own reset or direction input. Feedback systems self-modify in ways that feel alive. Start gentle — small amounts of feedback go a long way. The Turing Machine Mk II is essentially a feedback loop by design. Babel is great for creating CV feedback math.',
      },
    ],
    tipLabel: 'Key rule',
    tipBody: 'One technique per session. The interactions between techniques are hard to understand if you\'ve never isolated the parts. Combination comes in Phase 3.',
  },
  {
    id: 'phase3',
    phaseClass: 'p3',
    num: 'Phase 03',
    title: 'Patch archetypes',
    duration: 'Weeks 7–10',
    goal: 'Study canonical generative patch structures and rebuild them from scratch yourself. Reverse-engineering is one of the fastest ways to learn.',
    techniques: [
      {
        name: 'Random voltage garden',
        body: 'Multiple independent slow random sources — each controlling one unrelated parameter: one drifts pitch (into A-156v quantizer), one drifts filter cutoff (into AI024 X Filter), one drifts reverb pre-delay (into Aurora or Milky Way). No shared clock. The independence makes it feel truly organic. Use Infinitely Maybe, 1036, Pico RND, and Airstreamer as your four independent random sources, all slewed separately through the Befaco Slew.',
      },
      {
        name: 'Self-patching oscillator network',
        body: '2–3 oscillators FM-ing each other in a ring or web topology, with slowly drifting modulation depths. The FM ratios change the timbre continuously. Keep oscillators close to harmonic ratios (1:2, 2:3, 3:4) for pitched ambience, or let them drift away for more textural results. Try the SYSTEM 100 Dual VCO and DIY Polivoks VCO FM-ing each other, with Generate 3 controlling the FM depth slowly over time.',
      },
      {
        name: 'Long probabilistic sequencer',
        body: 'A 16–32 step sequencer running slowly (1 step per 2–4 seconds), with each step having independent gate probability. Every cycle through is slightly different. M185 Sequencer is perfect for this with its stage-based logic and variable repeats. Pair with A-156v quantizer set to a pentatonic or whole-tone scale. Feed pitch to Osiris or Surface, with Aurora for reverb.',
      },
      {
        name: 'Subharmonicon as generative engine',
        body: 'The Subharmonicon is a self-contained generative instrument — its subharmonic oscillators and internal sequencers can create slowly evolving polyrhythmic textures without any external patching. Start here for a dedicated ambient session: run its output through Milky Way (granular mode) and Aurora (reverb freeze) and spend an entire session just learning its internal clock relationships and subharmonic ratios.',
      },
    ],
    tipLabel: 'Recommended approach',
    tipBody: 'Find a patch you like in the Eurorack community (YouTube, ModularGrid patches) and rebuild it module-for-module — then swap your modules in one at a time. Always build the archetype completely before customising.',
  },
  {
    id: 'phase4',
    phaseClass: 'p4',
    num: 'Phase 04',
    title: 'Time & space',
    duration: 'Ongoing',
    goal: 'Generative patches live or die by their relationship with time. Focus on the effects chain and how events relate to each other temporally. Think in longer arcs than individual events.',
    techniques: [
      {
        name: 'Modulated reverb',
        body: 'A slowly drifting CV patched to reverb size, decay, or pre-delay turns a static reverb tail into an evolving space. Even 5–10% depth of modulation at 0.05Hz dramatically changes how the reverb feels over time. Aurora has CV-controllable parameters — try patching a Pamela LFO at its slowest rate into the size or decay. Milky Way\'s granular parameters respond beautifully to slow random modulation.',
      },
      {
        name: 'Offset event timing',
        body: 'When two melodic events happen at exactly the same time, they feel mechanical. Offset them by small amounts using a clock delay, Pamela\'s PWM/swing, or by routing gates through different sequential stages. The Muxlicer can create sequential gate routing with small timing offsets between voices. This is the difference between "computer music" and "music played by people who drift."',
      },
      {
        name: 'Macro-scale structure',
        body: 'Plan for something to change over 5, 10, and 20 minutes. A slow envelope running at its absolute slowest can open a filter over 10 minutes, giving the patch a sense of arrival. ForeCastle (Circuit Abbey) is a quad envelope generator — run one channel at its slowest possible rate as a macro shaper. Think about your patch having a sunrise: a long, slow brightening rather than a static state.',
      },
      {
        name: 'The ambient effects chain',
        body: 'A recommended signal chain for ambient: sound source → filter (AI024 or Squawk Dirty To Me, gently open) → Nostalgia 1.0 (tape delay, low mix, ~300ms) → µClouds SE (light granular scatter, freeze engaged) → Aurora (large reverb, slow attack) → Milky Way (granular freeze layer at low mix) → output. Each stage adds time and blur. Modulate at least two parameters in this chain with independent slow random sources.',
      },
      {
        name: 'Looping Delay as memory',
        body: 'The 4ms Looping Delay supports loops up to 90 seconds. Use it as a long memory: record a 30–60 second texture, then let the live patch drift over it. The loop becomes a slowly fading past while the present evolves. This is one of the simplest ways to create a sense of depth and time in a live ambient patch without additional preparation.',
      },
    ],
    tipLabel: 'The most important rule',
    tipBody: 'Record everything. Always. Long generative patches often have one perfect 3-minute window buried in 30 minutes of output. You won\'t catch it if you\'re not recording.',
  },
]

export default function HomePage() {
  return (
    <div className="site-wrap">
      <header>
        <div className="header-eyebrow">Eurorack / Generative Systems</div>
        <h1>
          Learning to make
          <br />
          <em>generative ambient</em>
        </h1>
        <p className="header-sub">
          A structured approach to moving beyond four-on-the-floor patterns and into evolving,
          self-generating systems. Four phases, studied one at a time.
        </p>
        <div className="header-meta">
          <div className="meta-item">
            Phases <span>04</span>
          </div>
          <div className="meta-item">
            Modules <span>87</span>
          </div>
          <div className="meta-item">
            Updated <span>April 2026</span>
          </div>
          <Link href="/journal" className="header-nav-link">
            Journal
          </Link>
        </div>
      </header>

      <nav className="phase-nav" aria-label="Jump to phase">
        <a href="#phase1">
          <span className="nav-num">01</span>Constraints
        </a>
        <a href="#phase2">
          <span className="nav-num">02</span>Vocabulary
        </a>
        <a href="#phase3">
          <span className="nav-num">03</span>Archetypes
        </a>
        <a href="#phase4">
          <span className="nav-num">04</span>Time &amp; Space
        </a>
      </nav>

      <div className="section-title">Core mindset shifts</div>
      <div className="principles">
        <div className="principle">
          <div className="principle-num">01</div>
          <div className="principle-title">Design systems, not performances</div>
          <div className="principle-body">
            Generative ambient is more like building a clock than playing a keyboard. You set up
            relationships and let them unfold.
          </div>
        </div>
        <div className="principle">
          <div className="principle-num">02</div>
          <div className="principle-title">Constraint breaks paralysis</div>
          <div className="principle-body">
            Analysis paralysis comes from too many choices. Artificially shrink the decision space
            before you start patching.
          </div>
        </div>
        <div className="principle">
          <div className="principle-num">03</div>
          <div className="principle-title">Rigidity is the problem</div>
          <div className="principle-body">
            A lot of the &ldquo;techno feel&rdquo; comes from clock rigidity, not the sounds themselves. Add
            probability before you change anything else.
          </div>
        </div>
        <div className="principle">
          <div className="principle-num">04</div>
          <div className="principle-title">Record everything</div>
          <div className="principle-body">
            Long generative patches often have one perfect window buried in 30 minutes of output.
            You won&rsquo;t catch it if you&rsquo;re not recording.
          </div>
        </div>
      </div>

      <div className="section-divider" data-label="Learning phases"></div>

      {PHASES.map((phase) => (
        <PhaseSection key={phase.id} {...phase} />
      ))}

      <div className="section-divider" data-label="Module reference"></div>

      <ModuleTable />

      <footer>
        <span className="footer-text">Generative Ambient — Eurorack Learning Guide</span>
        <a
          className="footer-link"
          href="https://modulargrid.net"
          target="_blank"
          rel="noopener noreferrer"
        >
          modulargrid.net ↗
        </a>
      </footer>
    </div>
  )
}

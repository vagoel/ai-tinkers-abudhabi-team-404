<!-- .slide: class="cover" -->
<div class="cover-grid">
  <div class="cover-copy">
    <p class="eyebrow">VoiceLayer prototype · Team 404</p>
    <h1>Sight<span>Speak</span></h1>
    <p class="tagline">Every webpage, ready to listen and act</p>
  </div>
  <div class="cover-figure" aria-label="A web page with an eye and sound wave">
    <div class="browser-shell cover-browser">
      <div class="browser-top"><i></i><i></i><i></i><b></b></div>
      <div class="browser-lines"><em></em><em></em><em></em><strong></strong><em></em></div>
      <div class="eye-mark"><span></span></div>
      <div class="wave wave-cover"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </div>
    <p class="figure-label">A guide inside the page</p>
  </div>
</div>

Notes:
SightSpeak is a hackathon prototype that gives a webpage a voice interface and an agentic action layer.

---

<!-- .slide: class="why" -->
<div class="slide-head">
  <p class="eyebrow">WHY</p>
  <h2>The web expects sight and touch</h2>
</div>
<div class="intent-scene">
  <div class="voice-intent">
    <p class="spoken">“Book an appointment for Tuesday”</p>
    <div class="wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <p>Voice carries the goal</p>
  </div>
  <div class="intent-path"><span></span><span></span><span></span></div>
  <div class="browser-shell dense-page">
    <div class="browser-top"><i></i><i></i><i></i><b></b></div>
    <div class="dense-layout"><em></em><em></em><strong></strong><em></em><em></em><em></em><u></u><em></em></div>
    <div class="cursor-mark">?</div>
  </div>
</div>
<p class="scene-caption">But the page hides the path in controls, labels, and changing layouts.</p>

Notes:
Set up the core problem: people know what they want to do, but conventional webpages make them visually discover controls and operate them by touch or pointer.

---

<!-- .slide: class="why" -->
<div class="slide-head">
  <p class="eyebrow">WHY</p>
  <h2>Language and layout can both block a task</h2>
</div>
<div class="twin-scenes">
  <div class="scenario accessibility">
    <div class="person-mark" aria-hidden="true"><i></i><b></b></div>
    <div class="scenario-page browser-shell">
      <div class="browser-top"><i></i><i></i><i></i><b></b></div>
      <div class="browser-lines"><em></em><strong></strong><em></em></div>
      <div class="hidden-control">?</div>
    </div>
    <h3>Language</h3>
    <p>Speak naturally in your own language. Voice offers another way to ask when usual controls are hard to use.</p>
  </div>
  <div class="scenario change">
    <div class="mini-pages" aria-hidden="true"><span></span><span></span></div>
    <div class="re-read">re-read</div>
    <h3>Layout</h3>
    <p>A changed interface needs current DOM context, not fixed coordinates.</p>
  </div>
</div>

Notes:
SightSpeak aims to reduce two barriers at once: language should not stop someone from asking for help, and an interface redesign should not leave the agent following stale positions.

---

<!-- .slide: class="how" -->
<div class="slide-head">
  <p class="eyebrow">HOW</p>
  <h2>A guide inside every webpage</h2>
</div>
<div class="guide-scene">
  <div class="launch-points">
    <div class="widget-mark" aria-label="Embedded voice widget"><span></span></div>
    <div class="launch-line"></div>
    <div class="plugin-mark"><span></span><span></span><span></span><span></span></div>
    <p>Embedded widget or Chrome extension</p>
  </div>
  <div class="browser-shell guide-browser">
    <div class="browser-top"><i></i><i></i><i></i><b></b></div>
    <div class="guide-layout"><em></em><strong></strong><em></em><em></em><u></u></div>
    <div class="guide-orb"><div class="wave"><i></i><i></i><i></i><i></i><i></i></div></div>
  </div>
  <div class="action-burst"><span>listen</span><span>understand</span><span>act</span></div>
</div>
<p class="scene-caption">Open the guide on the page you already use. Speak naturally. Keep moving.</p>

Notes:
The working implementation exposes two browser entry points: an injectable widget and a Chrome extension. Users stay on the page they already use.

---

<!-- .slide: class="how flow-slide" -->
<div class="slide-head">
  <p class="eyebrow">HOW</p>
  <h2>Voice to a safe page action</h2>
</div>
<div class="flow-map">
  <div class="flow-step fragment fade-up" data-fragment-index="1"><b>01</b><span>Add the<br>voice layer</span></div>
  <div class="flow-link fragment fade-in" data-fragment-index="1"></div>
  <div class="flow-step live fragment fade-up" data-fragment-index="2"><b>02</b><span>GPT-Live<br>hears the request</span></div>
  <div class="flow-link fragment fade-in" data-fragment-index="2"></div>
  <div class="flow-step terra fragment fade-up" data-fragment-index="3"><b>03</b><span>GPT-5.6 Terra<br>chooses a tool</span></div>
  <div class="flow-link fragment fade-in" data-fragment-index="3"></div>
  <div class="flow-step exa fragment fade-up" data-fragment-index="4"><b>04</b><span>Live DOM or Exa<br>resolves context</span></div>
  <div class="flow-link fragment fade-in" data-fragment-index="4"></div>
  <div class="flow-step action fragment fade-up" data-fragment-index="5"><b>05</b><span>page-agent acts<br>with confirmation</span></div>
</div>
<div class="flow-caption fragment fade-in" data-fragment-index="5">
  <span>Voice request</span><i></i><span>Grounded action</span><i></i><span>Spoken result</span>
</div>

Notes:
GPT-Live handles the real-time voice exchange. GPT-5.6 Terra selects the appropriate tool. The live DOM answers page questions, Exa supports off-page web search, and page-agent performs the DOM action. The agent asks for confirmation before consequential actions such as submitting a form or making a booking.

---

<!-- .slide: class="how" -->
<div class="slide-head">
  <p class="eyebrow">HOW</p>
  <h2>One conversation, clear roles</h2>
</div>
<div class="architecture">
  <div class="arch-input"><div class="wave"><i></i><i></i><i></i><i></i><i></i><i></i></div><p>User speaks</p></div>
  <div class="arch-node live-node"><p class="node-kicker">Voice conversation</p><h3>GPT-Live</h3><span>interprets intent</span></div>
  <div class="arch-context"><p class="node-kicker">Grounded data</p><h3>Live DOM + Exa</h3><span>reads the page · searches the web</span></div>
  <div class="arch-node terra-node"><p class="node-kicker">Tool choice</p><h3>GPT-5.6 Terra</h3><span>uses Responses delegation</span></div>
  <div class="arch-output"><div class="dom-mark"><i></i><i></i><i></i></div><p>page-agent acts</p></div>
  <div class="arch-line l1"></div><div class="arch-line l2"></div><div class="arch-line l3"></div><div class="arch-line l4"></div>
</div>
<p class="scene-caption">The live DOM grounds the page. Exa adds information beyond it.</p>

Notes:
The implementation keeps the roles separate. GPT-Live runs the real-time speech exchange. GPT-5.6 Terra uses the Responses backend to select browser-owned tools. The live DOM grounds the open page, Exa retrieves off-page information, and page-agent operates the page through the server-backed planning loop.

---

<!-- .slide: class="what" -->
<div class="slide-head">
  <p class="eyebrow">WHAT</p>
  <h2>Speak your language. Finish the task.</h2>
</div>
<div class="task-scenes">
  <div class="task fill-task"><div class="task-icon form-icon"><i></i><i></i><i></i><b>✓</b></div><p class="task-ask" lang="ar" dir="rtl">“املأ بياناتي”</p><h3>Complete a form</h3></div>
  <div class="task find-task"><div class="task-icon find-icon"><i></i><b></b></div><p class="task-ask" lang="hi">“पॉलिसी की तारीख ढूँढें”</p><h3>Find a detail</h3></div>
  <div class="task go-task"><div class="task-icon go-icon"><i></i><i></i><b></b></div><p class="task-ask">“Take me to billing”</p><h3>Navigate a page</h3></div>
</div>
<p class="scene-caption">The language can change. The task on the page still gets done.</p>

Notes:
This is the accessibility and inclusion use case. A user should be able to express a goal in the language they are comfortable speaking, then let the assistant turn that goal into a page action. The prototype's voice flow and page agent should be validated with multilingual test prompts before this is presented as a confirmed production capability.

---

<!-- .slide: class="what" -->
<div class="slide-head">
  <p class="eyebrow">WHAT</p>
  <h2>Current context for changing pages</h2>
</div>
<div class="refresh-scene">
  <div class="browser-shell old-page"><div class="browser-top"><i></i><i></i><i></i><b></b></div><div class="old-layout"><em></em><strong></strong><em></em><em></em><u></u></div><p>Yesterday</p></div>
  <div class="context-refresh"><div class="refresh-ring"><span>Live DOM</span></div><p>Re-read the current page</p></div>
  <div class="browser-shell new-page"><div class="browser-top"><i></i><i></i><i></i><b></b></div><div class="new-layout"><strong></strong><em></em><em></em><u></u><em></em></div><p>Today</p></div>
  <div class="dom-route"><span></span><span></span><span></span><b>DOM action</b></div>
</div>

Notes:
The implementation refreshes its readable page context from the current DOM after page actions. That grounds the next request in the version of the interface the user now sees rather than a saved screen position.

---

<!-- .slide: class="closing" -->
<div class="closing-content">
  <p class="eyebrow">SIGHTSPEAK</p>
  <h2>Every webpage, ready<br>to <span>listen and act</span></h2>
  <div class="closing-orbit"><div class="eye-mark"><span></span></div><div class="wave wave-cover"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <p class="closing-note">VoiceLayer prototype · Team 404</p>
  <p class="tech-note">Built around GPT-Live 1, GPT-5.6 Terra, page-agent, live DOM context, and Exa web search.</p>
</div>

Notes:
Close on the product promise. SightSpeak is the VoiceLayer prototype that keeps people on the page while voice, current context, and page actions work together.

<!-- .slide: class="cover" -->
<div class="cover-grid">
  <div class="cover-copy">
    <p class="eyebrow">AI Tinkerers Abu Dhabi · Team 404</p>
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
  <h2>When layouts change, access slips</h2>
</div>
<div class="twin-scenes">
  <div class="scenario accessibility">
    <div class="person-mark" aria-hidden="true"><i></i><b></b></div>
    <div class="scenario-page browser-shell">
      <div class="browser-top"><i></i><i></i><i></i><b></b></div>
      <div class="browser-lines"><em></em><strong></strong><em></em></div>
      <div class="hidden-control">?</div>
    </div>
    <h3>Access</h3>
    <p>A spoken request needs page-aware guidance.</p>
  </div>
  <div class="scenario change">
    <div class="mini-pages" aria-hidden="true"><span></span><span></span></div>
    <div class="re-read">re-read</div>
    <h3>Change</h3>
    <p>A new layout needs fresh context, not fixed coordinates.</p>
  </div>
</div>

Notes:
The first use case helps someone act without visually hunting through a page. The second addresses any product whose layout shifts, rendering old click paths unreliable.

---

<!-- .slide: class="how" -->
<div class="slide-head">
  <p class="eyebrow">HOW</p>
  <h2>A guide inside every webpage</h2>
</div>
<div class="guide-scene">
  <div class="launch-points">
    <div class="bookmark-mark">★</div>
    <div class="launch-line"></div>
    <div class="plugin-mark"><span></span><span></span><span></span><span></span></div>
    <p>Bookmark or Chrome plugin</p>
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
SightSpeak begins from a lightweight browser entry point. It does not ask users to leave the webpage or learn a separate interface.

---

<!-- .slide: class="how flow-slide" -->
<div class="slide-head">
  <p class="eyebrow">HOW</p>
  <h2>The SightSpeak flow</h2>
</div>
<div class="flow-map">
  <div class="flow-step fragment fade-up" data-fragment-index="1"><b>01</b><span>Enable<br>plugin</span></div>
  <div class="flow-link fragment fade-in" data-fragment-index="1"></div>
  <div class="flow-step exa fragment fade-up" data-fragment-index="2"><b>02</b><span>Exa AI<br>captures page context</span></div>
  <div class="flow-link fragment fade-in" data-fragment-index="2"></div>
  <div class="flow-step live fragment fade-up" data-fragment-index="3"><b>03</b><span>GPT-Live<br>hears intent</span></div>
  <div class="flow-link fragment fade-in" data-fragment-index="3"></div>
  <div class="flow-step terra fragment fade-up" data-fragment-index="4"><b>04</b><span>GPT-5.6 Terra<br>plans browser use</span></div>
  <div class="flow-link fragment fade-in" data-fragment-index="4"></div>
  <div class="flow-step action fragment fade-up" data-fragment-index="5"><b>05</b><span>DOM action<br>confirms result</span></div>
</div>
<div class="flow-caption fragment fade-in" data-fragment-index="5">
  <span>Current page</span><i></i><span>Voice request</span><i></i><span>Completed task</span>
</div>

Notes:
Exa AI provides structured context from the open page before the model interprets speech. GPT-Live handles the voice interaction. GPT-5.6 Terra and browser use plan and make the necessary page actions.

---

<!-- .slide: class="how" -->
<div class="slide-head">
  <p class="eyebrow">HOW</p>
  <h2>Two OpenAI roles, one conversation</h2>
</div>
<div class="architecture">
  <div class="arch-input"><div class="wave"><i></i><i></i><i></i><i></i><i></i><i></i></div><p>User speaks</p></div>
  <div class="arch-node live-node"><p class="node-kicker">Voice conversation</p><h3>GPT-Live</h3><span>interprets intent</span></div>
  <div class="arch-context"><p class="node-kicker">Current-page context</p><h3>Exa AI</h3><span>captures and structures</span></div>
  <div class="arch-node terra-node"><p class="node-kicker">Action planning</p><h3>GPT-5.6 Terra</h3><span>uses browser use</span></div>
  <div class="arch-output"><div class="dom-mark"><i></i><i></i><i></i></div><p>Page acts</p></div>
  <div class="arch-line l1"></div><div class="arch-line l2"></div><div class="arch-line l3"></div><div class="arch-line l4"></div>
</div>
<p class="scene-caption">Voice gives the agent a goal. Page context gives the agent a place to act.</p>

Notes:
This shows the division of responsibilities. GPT-Live focuses on the live voice exchange. Exa AI grounds the interaction in the current page. GPT-5.6 Terra with browser use drives the action sequence.

---

<!-- .slide: class="what" -->
<div class="slide-head">
  <p class="eyebrow">WHAT</p>
  <h2>Tasks completed by voice</h2>
</div>
<div class="task-scenes">
  <div class="task fill-task"><div class="task-icon form-icon"><i></i><i></i><i></i><b>✓</b></div><p class="task-ask">“Fill my details”</p><h3>Complete a form</h3></div>
  <div class="task find-task"><div class="task-icon find-icon"><i></i><b></b></div><p class="task-ask">“Find the policy date”</p><h3>Find a detail</h3></div>
  <div class="task go-task"><div class="task-icon go-icon"><i></i><i></i><b></b></div><p class="task-ask">“Take me to billing”</p><h3>Navigate a page</h3></div>
</div>
<p class="scene-caption">The request stays human. The page work becomes explicit.</p>

Notes:
Use cases demonstrate the types of tasks SightSpeak aims to complete during the prototype: filling fields, locating information, and navigating toward a requested section.

---

<!-- .slide: class="what" -->
<div class="slide-head">
  <p class="eyebrow">WHAT</p>
  <h2>Fresh context for changing pages</h2>
</div>
<div class="refresh-scene">
  <div class="browser-shell old-page"><div class="browser-top"><i></i><i></i><i></i><b></b></div><div class="old-layout"><em></em><strong></strong><em></em><em></em><u></u></div><p>Yesterday</p></div>
  <div class="context-refresh"><div class="refresh-ring"><span>Exa AI</span></div><p>Refresh page context</p></div>
  <div class="browser-shell new-page"><div class="browser-top"><i></i><i></i><i></i><b></b></div><div class="new-layout"><strong></strong><em></em><em></em><u></u><em></em></div><p>Today</p></div>
  <div class="dom-route"><span></span><span></span><span></span><b>DOM action</b></div>
</div>

Notes:
The intended behavior is to refresh page context for the version the user sees, then map an action to the present DOM rather than rely on a saved screen position.

---

<!-- .slide: class="closing" -->
<div class="closing-content">
  <p class="eyebrow">SIGHTSPEAK</p>
  <h2>Every webpage, ready<br>to <span>listen and act</span></h2>
  <div class="closing-orbit"><div class="eye-mark"><span></span></div><div class="wave wave-cover"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <p class="closing-note">Hackathon prototype · Team 404</p>
  <p class="tech-note">Built around Exa AI page context, GPT-Live, GPT-5.6 Terra, and browser use.</p>
</div>

Notes:
Close on the product promise. SightSpeak makes the existing page the place where people can speak, understand what is available, and complete an action.

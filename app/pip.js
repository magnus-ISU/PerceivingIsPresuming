//Shared widget library for Perceiving is Presuming examples.
//Each example HTML page declares its layout, a set of media elements,
//and a small piece of sketch-specific JS. This file provides the
//reusable widgets (toggles, sliders, navigation, help banner).

const PIP_EXAMPLES = [
  { n: 1,  title: "Hollow Face" },
  { n: 2,  title: "That Fat Bat" },
  { n: 3,  title: "Da Tha" },
  { n: 4,  title: "Var Var" },
  { n: 5,  title: "Far Far" },
  { n: 6,  title: "Sound Flash Center" },
  { n: 7,  title: "Sound Flash Periphery" },
  { n: 8,  title: "Motion Bounce" },
  { n: 9,  title: "Sine Wave Speech" },
  { n: 10, title: "Noisy Room" },
  { n: 11, title: "Reporter" },
  { n: 12, title: "Ames Room" },
  { n: 14, title: "The Dress" },
  { n: 15, title: "The Dress Revisited" },
  { n: 16, title: "Two Grays" },
  { n: 17, title: "Shepard Tables" },
  { n: 18, title: "Moon Walk" },
  { n: 19, title: "Chess" },
];

//Build the home + example menu DOM into every .pip-nav placeholder.
function pipBuildNav(currentN) {
  const navs = document.querySelectorAll(".pip-nav");
  navs.forEach((nav) => {
    if (nav.dataset.built === "1") return;
    nav.dataset.built = "1";
    const home = document.createElement("a");
    home.className = "pip-home";
    home.href = "../index.html";
    home.textContent = "Home";
    nav.appendChild(home);

    //Walk the curated list so prev/next skip over any removed examples
    //instead of assuming consecutive numbering.
    const idx = PIP_EXAMPLES.findIndex((ex) => ex.n === currentN);
    if (idx > 0) {
      const p = PIP_EXAMPLES[idx - 1];
      const prev = document.createElement("a");
      prev.className = "pip-home";
      prev.href = `${p.n}_html.html`;
      prev.textContent = `← Example ${p.n}`;
      nav.appendChild(prev);
    }
    if (idx >= 0 && idx < PIP_EXAMPLES.length - 1) {
      const nx = PIP_EXAMPLES[idx + 1];
      const next = document.createElement("a");
      next.className = "pip-home";
      next.href = `${nx.n}_html.html`;
      next.textContent = `Example ${nx.n} →`;
      nav.appendChild(next);
    }

    const details = document.createElement("details");
    details.className = "pip-menu";
    const summary = document.createElement("summary");
    summary.textContent = "Show / Hide Example List";
    details.appendChild(summary);
    const ul = document.createElement("ul");
    ul.className = "pip-menu-list";
    for (const ex of PIP_EXAMPLES) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `${ex.n}_html.html`;
      a.textContent = `Example ${ex.n}: ${ex.title}`;
      if (ex.n === currentN) {
        a.style.borderColor = "var(--accent)";
        a.style.background = "var(--accent-soft)";
      }
      li.appendChild(a);
      ul.appendChild(li);
    }
    details.appendChild(ul);
    nav.appendChild(details);
  });
}

//Help banner: shows the descriptive text of whichever widget is currently
//hovered or focused, and stays put for as long as that widget is the cursor
//target. No debouncing — the text persists for the entire hover.
function pipHelp(el, text) {
  const show = () => {
    const help = document.querySelector(".pip-help");
    if (!help) return;
    help.textContent = text;
    help.classList.add("pip-help-visible");
    help.dataset.owner = text;
  };
  const hide = () => {
    const help = document.querySelector(".pip-help");
    if (!help) return;
    //Only clear if no other widget has since taken ownership.
    if (help.dataset.owner === text) {
      help.textContent = "";
      help.classList.remove("pip-help-visible");
      delete help.dataset.owner;
    }
  };
  el.addEventListener("mouseenter", show);
  el.addEventListener("mouseleave", hide);
  el.addEventListener("focus", show, true);
  el.addEventListener("blur", hide, true);
}

//A toggle button with on/off state and aria-pressed.
function pipToggle({ label, defaultOn = false, help, onChange }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "pip-toggle";
  btn.setAttribute("aria-pressed", String(defaultOn));
  const mark = document.createElement("span");
  mark.className = "pip-toggle-mark";
  btn.appendChild(mark);
  const lbl = document.createElement("span");
  lbl.textContent = label;
  btn.appendChild(lbl);
  if (help) pipHelp(btn, help);
  btn.addEventListener("click", () => {
    const next = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", String(next));
    onChange && onChange(next);
  });
  btn._reset = () => {
    btn.setAttribute("aria-pressed", String(defaultOn));
    onChange && onChange(defaultOn);
  };
  Object.defineProperty(btn, "checked", {
    get: () => btn.getAttribute("aria-pressed") === "true",
    set: (v) => {
      btn.setAttribute("aria-pressed", String(!!v));
      onChange && onChange(!!v);
    },
  });
  return btn;
}

//A simple action button.
function pipButton({ label, help, onClick }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "pip-btn";
  btn.textContent = label;
  if (help) pipHelp(btn, help);
  if (onClick) btn.addEventListener("click", onClick);
  return btn;
}

//A rotate button: cycles through a list of labels each click.
//All option labels are rendered in the same grid cell so the button width
//is the max-content of every option, which prevents the button (and every
//element after it on the row) from shifting when the user cycles through.
function pipRotate({ items, defaultIndex = 0, help, onChange }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "pip-rotate";
  const stack = document.createElement("span");
  stack.className = "pip-rotate-stack";
  const labels = items.map((item, i) => {
    const s = document.createElement("span");
    s.className = "pip-rotate-label";
    s.textContent = `▸ ${item}`;
    s.dataset.i = String(i);
    stack.appendChild(s);
    return s;
  });
  btn.appendChild(stack);
  let index = defaultIndex;
  const render = () => {
    labels.forEach((s, i) => s.classList.toggle("pip-rotate-active", i === index));
  };
  render();
  if (help) pipHelp(btn, help);
  btn.addEventListener("click", () => {
    index = (index + 1) % items.length;
    render();
    onChange && onChange(index, items[index]);
  });
  btn._reset = () => {
    index = defaultIndex;
    render();
    onChange && onChange(index, items[index]);
  };
  btn.setIndex = (i) => {
    index = ((i % items.length) + items.length) % items.length;
    render();
    onChange && onChange(index, items[index]);
  };
  Object.defineProperty(btn, "index", { get: () => index });
  return btn;
}

//A labeled range slider with a current-value readout.
function pipSlider({ label, min, max, step = 1, value, help, format, onChange }) {
  const wrap = document.createElement("label");
  wrap.className = "pip-slider";
  const name = document.createElement("span");
  name.textContent = label;
  const range = document.createElement("input");
  range.type = "range";
  range.min = String(min);
  range.max = String(max);
  range.step = String(step);
  range.value = String(value);
  const out = document.createElement("output");
  const fmt = format || ((v) => v);
  const update = () => {
    out.value = String(fmt(Number(range.value)));
    onChange && onChange(Number(range.value));
  };
  range.addEventListener("input", update);
  if (help) pipHelp(wrap, help);
  wrap.append(name, range, out);
  wrap._reset = () => { range.value = String(value); update(); };
  Object.defineProperty(wrap, "value", {
    get: () => Number(range.value),
    set: (v) => { range.value = String(v); update(); },
  });
  update();
  return wrap;
}

//Reset every widget that exposes _reset() under a given root.
function pipResetAll(root) {
  root.querySelectorAll(".pip-toggle, .pip-rotate, .pip-slider, .pip-btn")
    .forEach((el) => el._reset && el._reset());
}

//Useful for sketches that need a steady RAF loop. Returns a stop function.
function pipLoop(fn) {
  let raf = 0;
  const tick = (t) => { fn(t); raf = requestAnimationFrame(tick); };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

//Pause a video and rewind it.
function pipResetMedia(el) {
  if (!el) return;
  try { el.pause(); } catch (_) {}
  try { el.currentTime = 0; } catch (_) {}
}

//Initialize layout on every page: build navigation as soon as DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
  const layout = document.querySelector(".pip-layout");
  const n = layout && Number(layout.dataset.example);
  if (n) pipBuildNav(n);
});

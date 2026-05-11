//Shared Sound-Flash sketch for examples 6 and 7.
//
//Renders a circle that flashes on a loop. While the flash is on, a click
//sound plays. Optionally a second click plays during the flash window with
//an offset (double-click) — example 6 plays the doubled click every other
//cycle; example 7 alternates the flash position left/right and plays the
//double on alternate flashes too.
//
//config:
//  variant: "center" | "periphery"
//  workspace: { width, height }   pixel size of the visual area
//  clickSounds: [ "url0", ... ]   array of 6 primary mp3s
//  doubleClickSounds: [...]       array of 6 secondary mp3s (B-clicks)
//  defaults: optional overrides for slider defaults

function pipFlashSketch(config) {
  const variant = config.variant || "center";
  const ws = config.workspace || { width: 400, height: 400 };
  const stage = document.querySelector(".pip-stage");

  //The flash area — fixed pixel canvas, scales via CSS to fit narrow viewports.
  const canvas = document.createElement("canvas");
  canvas.width = ws.width;
  canvas.height = ws.height;
  const ctx = canvas.getContext("2d");
  stage.appendChild(canvas);

  const controls = document.createElement("div");
  controls.className = "pip-controls";
  stage.appendChild(controls);
  const sliderHost = document.createElement("div");
  stage.appendChild(sliderHost);

  //Audio: pre-create one element per (sound × variant) so play() restarts cleanly.
  const sf = config.clickSounds.map((u) => { const a = new Audio(u); a.preload = "auto"; return a; });
  const sfB = config.doubleClickSounds.map((u) => { const a = new Audio(u); a.preload = "auto"; return a; });

  //Slider defaults differ between the two examples (size in particular).
  const defaults = Object.assign({
    flashSize: variant === "periphery" ? 80 : 200,
    flashColor: 0,             //0-1, mapped to a hue spectrum
    flashAlpha: 0.3,           //0-1 transparency (1 = opaque)
    flashFreqMs: 1000,         //loop period
    flashDurMs: 50,            //how long the flash stays lit
    doubleClickGapMs: 30,      //offset for the second click within the flash
    sizeMin: variant === "periphery" ? 50 : 10,
    sizeMax: variant === "periphery" ? 180 : 400,
  }, config.defaults || {});

  let isRunning = false;
  let isClicking = true;
  let soundIndex = 4;

  //sliders
  const sliders = {};
  sliders.size = pipSlider({
    label: "Flash size", min: defaults.sizeMin, max: defaults.sizeMax, step: 1,
    value: defaults.flashSize, help: "increase flash size (pixels)",
    format: (v) => v + "px",
  });
  sliders.color = pipSlider({
    label: "Flash color", min: 0, max: 1, step: 0.01,
    value: defaults.flashColor, help: "change flash color",
    format: (v) => v.toFixed(2),
  });
  sliders.alpha = pipSlider({
    label: "Flash transparency", min: 0, max: 1, step: 0.01,
    value: defaults.flashAlpha, help: "increase transparency of flash",
    format: (v) => v.toFixed(2),
  });
  sliders.freq = pipSlider({
    label: "Flash frequency", min: 500, max: 4000, step: 10,
    value: defaults.flashFreqMs, help: "time between flashes (ms)",
    format: (v) => v + " ms",
  });
  sliders.dur = pipSlider({
    label: "Flash duration", min: 20, max: 200, step: 10,
    value: defaults.flashDurMs, help: "length of each flash (ms)",
    format: (v) => v + " ms",
  });
  sliders.gap = pipSlider({
    label: "Double-click gap", min: 10, max: 70, step: 10,
    value: defaults.doubleClickGapMs, help: "delay before the second click (ms)",
    format: (v) => v + " ms",
  });
  sliderHost.append(sliders.size, sliders.color, sliders.alpha, sliders.freq, sliders.dur, sliders.gap);

  //Keep the double-click gap below the flash duration so the second click
  //lands while the flash is still visible.
  function reconcileGapAndDuration() {
    if (sliders.gap.value > sliders.dur.value - 10) {
      sliders.dur.value = sliders.gap.value + 10;
    }
  }
  sliders.gap.querySelector("input").addEventListener("input", reconcileGapAndDuration);
  sliders.dur.querySelector("input").addEventListener("input", reconcileGapAndDuration);

  const toggleRun = pipToggle({
    label: "Run", help: "click to start or stop flashing",
    onChange: (on) => { isRunning = on; loopStart = performance.now(); cycleCount = 0; render(0); },
  });
  const toggleSound = pipToggle({
    label: "Sound", defaultOn: true, help: "turn the click sounds on or off",
    onChange: (on) => { isClicking = on; },
  });
  const rotateSound = pipRotate({
    items: ["Click 0", "Click 1", "Click 2", "Click 3", "Click 4", "Click 5"],
    defaultIndex: 4, help: "switch which click sound is played",
    onChange: (i) => { soundIndex = i; },
  });
  const reset = pipButton({
    label: "Reset", help: "restore defaults",
    onClick: () => {
      for (const k in sliders) sliders[k]._reset();
      toggleRun._reset();
      toggleSound._reset();
      rotateSound._reset();
    },
  });
  controls.append(toggleRun, toggleSound, rotateSound, reset);

  function colorFromSliders() {
    //Same hue ramp the original used: stepped piecewise R/G/B over 0..1
    let c = sliders.color.value;
    let r, g, b;
    if (c < 0.25) { r = 255; g = Math.floor((1 - c / 0.25) * 255); b = g; }
    else if (c < 0.5) { r = Math.floor((1 - (c - 0.25) / 0.25) * 255); g = 255 - r; b = 0; }
    else if (c < 0.75) { r = 0; g = Math.floor((1 - (c - 0.5) / 0.25) * 255); b = 255 - g; }
    else { r = Math.floor(((c - 0.75) / 0.25) * 255); g = r; b = 255 - g; }
    return [r, g, b, sliders.alpha.value];
  }

  let loopStart = performance.now();
  let cycleCount = 0;
  let prevInFlash = false;
  let firstClickFiredThisCycle = false;
  let secondClickFiredThisCycle = false;

  function playClick(audio) {
    if (!isClicking) return;
    try { audio.currentTime = 0; audio.play().catch(() => {}); } catch (_) {}
  }

  function render(now) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (variant === "periphery") {
      //Draw the central fixation cross.
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      const cx = canvas.width / 2, cy = canvas.height / 3;
      const s = sliders.size.value / 2;
      ctx.beginPath();
      ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s, cy);
      ctx.moveTo(cx, cy - s); ctx.lineTo(cx, cy + s);
      ctx.stroke();
    }

    if (!isRunning) { return; }

    const t = now - loopStart;
    const period = sliders.freq.value;
    const tInCycle = t % period;
    const nextCycle = Math.floor(t / period);
    if (nextCycle > cycleCount) {
      cycleCount = nextCycle;
      firstClickFiredThisCycle = false;
      secondClickFiredThisCycle = false;
    }

    const inFlash = tInCycle <= sliders.dur.value;
    if (inFlash) {
      const [r, g, b, a] = colorFromSliders();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      let fx, fy;
      if (variant === "periphery") {
        //Alternate left/right each flash cycle.
        const onLeft = cycleCount % 2 === 0;
        fx = onLeft ? canvas.width * 0.15 : canvas.width * 0.85;
        fy = canvas.height / 3;
      } else {
        fx = canvas.width / 2;
        fy = canvas.height / 2;
      }
      ctx.beginPath();
      ctx.arc(fx, fy, sliders.size.value / 2, 0, Math.PI * 2);
      ctx.fill();

      if (!firstClickFiredThisCycle) {
        firstClickFiredThisCycle = true;
        playClick(sf[soundIndex]);
      }
      //Double-click on alternate cycles.
      const doDouble = variant === "periphery" ? (cycleCount % 2 === 1) : (cycleCount % 2 === 1);
      if (doDouble && !secondClickFiredThisCycle && tInCycle >= sliders.gap.value) {
        secondClickFiredThisCycle = true;
        playClick(sfB[soundIndex]);
      }
    }
    prevInFlash = inFlash;
  }

  pipLoop(render);
}

//Shared McGurk-illusion sketch for examples 2, 3, 4, 5.
//
//Each example provides a list of speakers, each with a video, a "correct"
//audio track, and a "wrong" (illusion) audio track, plus the two possible
//word-overlay strings.
//
//Layout invariant: a single <video> element lives inside a sized media
//frame whose dimensions are determined by CSS aspect-ratio. We never
//show/hide or replace the video element itself — we swap its `src` when
//the speaker changes and toggle visibility with opacity when Show Video
//is turned off. Audio for each speaker lives in separate Audio objects so
//the wrong/correct tracks can be cross-faded without retriggering loads.
//
//config:
//  speakers: [{ name, video, correctAudio, wrongAudio }, ...]
//  words:    [wrongLabel, correctLabel]
//  defaultSpeaker: optional index, default 0

function pipMcgurkSketch(config) {
  const stage = document.querySelector(".pip-stage");
  const frame = document.createElement("div");
  frame.className = "pip-media-frame";
  const controls = document.createElement("div");
  controls.className = "pip-controls";

  //One persistent video element. Its src changes when the speaker changes;
  //its visibility (opacity) changes when Show Video is toggled.
  const video = document.createElement("video");
  video.loop = true;
  video.playsInline = true;
  video.preload = "auto";
  video.muted = true;  //audio comes from the separate Audio objects
  frame.appendChild(video);

  const wordsEl = document.createElement("p");
  wordsEl.className = "pip-words pip-words-empty";
  wordsEl.textContent = " ";

  //Pre-create per-speaker audio elements so each pair stays loaded.
  const audios = config.speakers.map((s) => ({
    aCorrect: Object.assign(new Audio(s.correctAudio), { loop: true, preload: "auto" }),
    aWrong:   Object.assign(new Audio(s.wrongAudio),   { loop: true, preload: "auto" }),
  }));

  stage.appendChild(frame);
  stage.appendChild(wordsEl);
  stage.appendChild(controls);

  let isRunning = false;
  let correctAudio = false;  //false → "wrong" (illusion) audio is dominant
  let currentSpeaker = config.defaultSpeaker || 0;

  function setSpeakerSrc(i) {
    const src = config.speakers[i].video;
    if (video.getAttribute("src") !== src) {
      const wasPlaying = !video.paused;
      video.src = src;
      if (wasPlaying) video.play().catch(() => {});
    }
  }
  setSpeakerSrc(currentSpeaker);

  function refreshVolumes() {
    audios.forEach((a, i) => {
      const active = i === currentSpeaker && isRunning;
      a.aCorrect.volume = active && correctAudio ? 1 : 0;
      a.aWrong.volume   = active && !correctAudio ? 1 : 0;
    });
  }
  function refreshVideoVisibility() {
    //Visibility toggles via opacity (not display), so the video element
    //always takes the same space inside the frame.
    video.style.opacity = (isRunning && toggleShowVideo.checked) ? "1" : "0";
  }
  function refreshWords() {
    if (!isRunning || !toggleShowWords.checked) {
      wordsEl.classList.add("pip-words-empty");
      wordsEl.textContent = " ";
      return;
    }
    wordsEl.classList.remove("pip-words-empty");
    wordsEl.textContent = correctAudio ? config.words[1] : config.words[0];
  }
  function startCurrent() {
    video.currentTime = 0;
    const a = audios[currentSpeaker];
    a.aCorrect.currentTime = 0;
    a.aWrong.currentTime = 0;
    Promise.allSettled([video.play(), a.aCorrect.play(), a.aWrong.play()]);
  }
  function stopCurrent() {
    video.pause();
    video.currentTime = 0;
    const a = audios[currentSpeaker];
    a.aCorrect.pause(); a.aCorrect.currentTime = 0;
    a.aWrong.pause();   a.aWrong.currentTime = 0;
  }

  const toggleRun = pipToggle({
    label: "Run", help: "click to start or stop playback",
    onChange: (on) => {
      isRunning = on;
      if (on) startCurrent(); else stopCurrent();
      rotateSpeaker.disabled = on;
      [toggleShowVideo, toggleShowWords, buttonChangeAudio, buttonRestart].forEach((b) => b.disabled = !on);
      refreshVolumes();
      refreshVideoVisibility();
      refreshWords();
    },
  });

  const toggleShowVideo = pipToggle({
    label: "Show Video", defaultOn: config.showVideoDefault !== false,
    help: "show or hide the speaker's video",
    onChange: refreshVideoVisibility,
  });

  const toggleShowWords = pipToggle({
    label: "Show Words", defaultOn: false,
    help: "display the actual word being spoken in the audio",
    onChange: refreshWords,
  });

  const buttonChangeAudio = pipButton({
    label: "Change Audio",
    help: "swap the audio between the two recordings",
    onClick: () => {
      correctAudio = !correctAudio;
      refreshVolumes();
      refreshWords();
    },
  });

  const buttonRestart = pipButton({
    label: "Restart",
    help: "rewind the video and audio if they drift apart",
    onClick: () => { if (isRunning) startCurrent(); },
  });

  const rotateSpeaker = pipRotate({
    items: config.speakers.map((s) => s.name),
    defaultIndex: currentSpeaker,
    help: "click to change which speaker is shown",
    onChange: (i) => {
      stopCurrent();
      currentSpeaker = i;
      setSpeakerSrc(i);
      refreshVolumes();
      refreshVideoVisibility();
    },
  });

  [toggleShowVideo, toggleShowWords, buttonChangeAudio, buttonRestart].forEach((b) => b.disabled = true);
  controls.append(toggleRun, rotateSpeaker, toggleShowVideo, toggleShowWords, buttonChangeAudio, buttonRestart);

  refreshVideoVisibility();
  refreshVolumes();
  refreshWords();
}

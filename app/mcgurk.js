//Shared McGurk-illusion sketch for examples 2, 3, 4, 5.
//
//Each example provides a list of speakers, each with a video, a "correct"
//audio track, and a "wrong" (illusion) audio track, plus the two possible
//word-overlay strings. This module wires up the standard McGurk control
//layout: Run, Show Video, Show Words, Change Audio, Restart, and a
//Speaker selector (only visible when not running).
//
//config:
//  speakers: [{ name, video, correctAudio, wrongAudio }, ...]
//  words:    [wrongLabel, correctLabel]
//  showVideoDefault: boolean (default true)

function pipMcgurkSketch(config) {
  const stage = document.querySelector(".pip-stage");
  const controls = document.createElement("div");
  controls.className = "pip-controls";

  const wordsEl = document.createElement("p");
  wordsEl.className = "pip-words";
  wordsEl.hidden = true;

  //Build a video + audio pair per speaker, all hidden by default.
  const speakers = config.speakers.map((s) => {
    const video = document.createElement("video");
    video.src = s.video;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.muted = true;  //audio comes from the separate audio elements
    video.hidden = true;
    const aCorrect = new Audio(s.correctAudio);
    aCorrect.loop = true;
    aCorrect.preload = "auto";
    const aWrong = new Audio(s.wrongAudio);
    aWrong.loop = true;
    aWrong.preload = "auto";
    return { video, aCorrect, aWrong, name: s.name };
  });
  speakers.forEach((s) => stage.appendChild(s.video));
  stage.appendChild(wordsEl);
  stage.appendChild(controls);

  let isRunning = false;
  let correctAudio = false;       //false → wrong (illusion) audio is dominant
  let currentSpeaker = 0;
  const showVideoDefault = config.showVideoDefault !== false;

  function refreshVolumes() {
    speakers.forEach((s, i) => {
      const active = i === currentSpeaker && isRunning;
      s.aCorrect.volume = active && correctAudio ? 1 : 0;
      s.aWrong.volume = active && !correctAudio ? 1 : 0;
    });
  }
  function refreshVisibility() {
    speakers.forEach((s, i) => {
      const shouldShow = isRunning && i === currentSpeaker && toggleShowVideo.checked;
      s.video.hidden = !shouldShow;
    });
  }
  function refreshWords() {
    if (!isRunning || !toggleShowWords.checked) {
      wordsEl.hidden = true;
      return;
    }
    wordsEl.hidden = false;
    wordsEl.textContent = correctAudio ? config.words[1] : config.words[0];
  }
  function startSpeaker(i) {
    const s = speakers[i];
    s.video.currentTime = 0;
    s.aCorrect.currentTime = 0;
    s.aWrong.currentTime = 0;
    Promise.allSettled([s.video.play(), s.aCorrect.play(), s.aWrong.play()]);
  }
  function stopSpeaker(i) {
    const s = speakers[i];
    s.video.pause();
    s.video.currentTime = 0;
    s.aCorrect.pause();
    s.aCorrect.currentTime = 0;
    s.aWrong.pause();
    s.aWrong.currentTime = 0;
  }

  const toggleRun = pipToggle({
    label: "Run", help: "click to start or stop playback",
    onChange: (on) => {
      isRunning = on;
      if (on) {
        startSpeaker(currentSpeaker);
      } else {
        stopSpeaker(currentSpeaker);
      }
      rotateSpeaker.style.display = on ? "none" : "";
      runOnlyGroup.style.display = on ? "" : "none";
      refreshVolumes();
      refreshVisibility();
      refreshWords();
    },
  });

  const toggleShowVideo = pipToggle({
    label: "Show Video", defaultOn: showVideoDefault,
    help: "show or hide the speaker's video",
    onChange: refreshVisibility,
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
    onClick: () => {
      if (isRunning) startSpeaker(currentSpeaker);
    },
  });

  const rotateSpeaker = pipRotate({
    items: config.speakers.map((s) => s.name),
    defaultIndex: config.defaultSpeaker || 0,
    help: "click to change which speaker is shown",
    onChange: (i) => {
      stopSpeaker(currentSpeaker);
      currentSpeaker = i;
      refreshVisibility();
    },
  });

  const runOnlyGroup = document.createElement("div");
  runOnlyGroup.style.display = "none";
  runOnlyGroup.className = "pip-controls";
  runOnlyGroup.append(toggleShowVideo, toggleShowWords, buttonChangeAudio, buttonRestart);

  controls.append(toggleRun, rotateSpeaker, runOnlyGroup);

  refreshVisibility();
  refreshVolumes();
  refreshWords();
}

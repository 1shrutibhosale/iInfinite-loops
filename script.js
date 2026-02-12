const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");

const blinkEl = document.getElementById("blinks");
const eyeContactEl = document.getElementById("eyecontact");
const fillerEl = document.getElementById("fillers");
const energyEl = document.getElementById("energy");
const nervousEl = document.getElementById("nervous");
const confidenceEl = document.getElementById("confidence");
const coachingEl = document.getElementById("coaching");

// --- STATE ---
let blinkCount = 0;
let fillerCount = 0;
let eyeContactFrames = 0;
let totalFrames = 0;

let eyeClosed = false;
let lastBlinkTime = 0;

let earHistory = [];
let calibratedEAR = null;
let calibrationFrames = 0;
let calibrating = true;

let voiceEnergy = 0;

let audioCtx, analyser;
let lastTranscript = "";

// --- START BUTTON ---
startBtn.addEventListener("click", async () => {
    startBtn.disabled = true;

    // Camera + Mic
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;
    video.startTime = Date.now();

    // Audio analyser
    audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    startAudioLoop();

    // Speech recognition
    setupSpeech();

    // FaceMesh
    setupFaceMesh();
});

// --- FACE MESH ---
function setupFaceMesh() {
    const faceMesh = new FaceMesh({
        locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
    });
    faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true });

    faceMesh.onResults(results => {
        if (!results.multiFaceLandmarks) return;
        const lm = results.multiFaceLandmarks[0];
        totalFrames++;

        // --- BLINK DETECTION ---
        const ear = calcEAR(lm);
        earHistory.push(ear);
        if (earHistory.length > 5) earHistory.shift();
        const smoothEAR = earHistory.reduce((a, b) => a + b) / earHistory.length;

        if(calibrating){
            calibrationFrames++;
            calibratedEAR = calibratedEAR===null ? smoothEAR : calibratedEAR*0.95 + smoothEAR*0.05;
            if(calibrationFrames>150) calibrating=false;
            confidenceEl.innerText="Calibrating...";
            coachingEl.innerText="Calibrating... Keep face visible.";
            return;
        }

        const BLINK_THRESHOLD = calibratedEAR*0.75;
        const now = Date.now();
        if(smoothEAR < BLINK_THRESHOLD && !eyeClosed) eyeClosed=true;
        if(smoothEAR >= BLINK_THRESHOLD && eyeClosed){
            if(now - lastBlinkTime > 300){
                blinkCount++;
                blinkEl.innerText = blinkCount;
                lastBlinkTime = now;
            }
            eyeClosed=false;
        }

        // --- EYE CONTACT ---
        const left = lm[234].x, right = lm[454].x, nose = lm[1].x;
        const faceWidth = Math.abs(right-left);
        const yaw = Math.abs(nose-(left+right)/2)/faceWidth;
        if(yaw<0.18) eyeContactFrames++;
        eyeContactEl.innerText = ((eyeContactFrames/totalFrames)*100).toFixed(0) + "%";

        updateConfidence();
        updateCoaching();
    });

    new Camera(video, {
        onFrame: async () => await faceMesh.send({ image: video }),
        width: 640, height: 480
    }).start();
}

// --- EAR CALC ---
function calcEAR(lm){
    const dist=(a,b)=>Math.hypot(lm[a].x-lm[b].x, lm[a].y-lm[b].y);
    const vertical1 = dist(159,145);
    const vertical2 = dist(158,144);
    const horizontal = dist(33,133);
    return (vertical1+vertical2)/(2*horizontal);
}

// --- AUDIO ENERGY ---
function startAudioLoop(){
    const data = new Uint8Array(analyser.frequencyBinCount);
    setInterval(()=>{
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a,b)=>a+b)/data.length;
        voiceEnergy = avg;
        energyEl.innerText = avg.toFixed(0);
        updateConfidence();
        updateCoaching();
    },500);
}

// --- SPEECH RECOGNITION ---
function setupSpeech(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ alert("SpeechRecognition not supported"); return; }

    const recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onresult = e=>{
        const text = e.results[e.results.length-1][0].transcript.toLowerCase();
        if(text===lastTranscript) return;
        lastTranscript = text;

        ["um","uh","like","you know"].forEach(w=>{
            const matches = text.match(new RegExp(`\\b${w}\\b`, "g"));
            if(matches) fillerCount += matches.length;
        });
        fillerEl.innerText = fillerCount;
        updateConfidence();
        updateCoaching();
    };
    recog.start();
}

// --- CONFIDENCE & NERVOUSNESS ---
function updateConfidence(){
    if(calibrating) return;

    const minutes = (Date.now() - video.startTime)/60000 || 1;
    const blinkRate = blinkCount/minutes;
    const fillerRate = fillerCount/minutes;
    const eyeContactRatio = eyeContactFrames/Math.max(1,totalFrames);

    // Nervousness
    let nervScore = 0;
    if(blinkRate>20)nervScore+=2;
    else if(blinkRate>12)nervScore+=1;
    if(fillerRate>5)nervScore+=2;
    else if(fillerRate>2)nervScore+=1;
    if(voiceEnergy<30)nervScore+=1;
    nervousEl.innerText = nervScore<=1?"Low":nervScore<=3?"Medium":"High";

    // Confidence
    let score=10;
    score -= blinkRate*0.1;
    score -= fillerRate*0.5;
    score += eyeContactRatio*4;
    if(voiceEnergy<30)score-=1;
    if(nervScore==2)score-=1;
    if(nervScore>=3)score-=2;
    score = Math.max(0,Math.min(10,score));
    confidenceEl.innerText = score.toFixed(1);
}

// --- LIVE COACHING ---
function updateCoaching(){
    if(calibrating) return;

    const minutes = (Date.now() - video.startTime)/60000 || 1;
    const blinkRate = blinkCount/minutes;
    const fillerRate = fillerCount/minutes;
    const eyeContactRatio = eyeContactFrames/Math.max(1,totalFrames);

    let messages=[];
    if(blinkRate>25) messages.push("Try to blink less frequently");
    if(fillerRate>5) messages.push("Avoid filler words like 'um', 'uh', 'like'");
    if(eyeContactRatio<0.5) messages.push("Maintain eye contact with camera");
    if(voiceEnergy<30) messages.push("Speak louder / more clearly");

    coachingEl.innerHTML = messages.join("<br>") || "Good so far!";
}
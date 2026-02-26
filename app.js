// 1. Register Service Worker for PWA
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(err => console.log("SW error", err));
    });
}

const imageUpload = document.getElementById('imageUpload');
const canvas = document.getElementById('handCanvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.getElementById('canvasContainer');
const scanner = document.getElementById('scanner');
const loading = document.getElementById('loading');
const predictionResult = document.getElementById('predictionResult');
const predictionText = document.getElementById('predictionText');

let detector;

// 2. Initialize TensorFlow.js HandPose Model
async function loadModel() {
    loading.style.display = 'block';
    loading.innerText = "Loading AI Model...";
    
    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig = {
        runtime: 'tfjs',
        modelType: 'full'
    };
    
    detector = await handPoseDetection.createDetector(model, detectorConfig);
    loading.style.display = 'none';
    console.log("AI Model Loaded!");
}

// Load the model as soon as the app starts
loadModel();

const predictions = [
    "Your Heart line shows great emotional depth. You connect with others on a profound level.",
    "The shape of your palm suggests a highly analytical mind. You are a natural problem solver.",
    "A strong Life line energy is detected! You have the resilience to overcome upcoming obstacles.",
    "Your fate line is aligned. A major positive shift is coming in your career within 6 months."
];

// 3. Handle Image Upload & AI Detection
imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file || !detector) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = async function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            canvasContainer.style.display = 'block';
            predictionResult.style.display = 'none';
            scanner.style.display = 'block';
            loading.style.display = 'block';
            loading.innerText = "Scanning hand structure...";

            // Run TensorFlow.js detection
            const hands = await detector.estimateHands(img);
            
            scanner.style.display = 'none';
            loading.style.display = 'none';

            if (hands.length > 0) {
                drawAstrologyLines(hands[0]); // Pass the detected hand data
                showPrediction();
            } else {
                loading.style.display = 'block';
                loading.innerText = "No hand detected. Please upload a clearer image.";
            }
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
});

// 4. Draw Lines Based on AI Landmarks
function drawAstrologyLines(hand) {
    // MediaPipe provides 21 keypoints. Keypoint 0 is the wrist, 9 is the middle finger base.
    // We use these real coordinates to draw our glowing lines on the actual palm.
    const wrist = hand.keypoints[0];
    const indexBase = hand.keypoints[5];
    const pinkyBase = hand.keypoints[17];

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#00ffcc";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00ffcc";
    ctx.lineCap = "round";

    // Draw Heart Line (Pinky base towards Index base)
    ctx.beginPath();
    ctx.moveTo(pinkyBase.x, pinkyBase.y + 20);
    ctx.quadraticCurveTo(indexBase.x, indexBase.y + 40, indexBase.x - 20, indexBase.y + 10);
    ctx.stroke();

    // Draw Life Line (Between index and thumb, curving down to wrist)
    ctx.beginPath();
    ctx.moveTo(indexBase.x - 30, indexBase.y + 30);
    ctx.quadraticCurveTo(wrist.x + 40, wrist.y - 50, wrist.x + 10, wrist.y - 10);
    ctx.stroke();
}

// 5. Show Prediction
function showPrediction() {
    const randomIndex = Math.floor(Math.random() * predictions.length);
    predictionText.textContent = predictions[randomIndex];
    predictionResult.style.display = 'block';
}

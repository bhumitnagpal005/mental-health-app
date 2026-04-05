// 🔐 Redirect to login
if (!localStorage.getItem("user")) {
  if (!window.location.pathname.endsWith("login.html")) {
    window.location.href = "login.html";
  }
}

// 🔑 LOGIN
function login(){
  let name = document.getElementById("name").value.trim();
  if(name === "") name = "User_" + Math.floor(Math.random()*10000);

  localStorage.setItem("user", name);

  let history = JSON.parse(localStorage.getItem("loginHistory")) || [];
  history.push(new Date().toLocaleString());
  localStorage.setItem("loginHistory", JSON.stringify(history));

  window.location.href = "index.html";
}

// 👋 LOAD
window.onload = function(){
  let user = localStorage.getItem("user");

  if(document.getElementById("welcome")){
    document.getElementById("welcome").innerText = "Welcome, " + user;
  }

  updateStreak();

  // Load chart if data exists
  let saved = JSON.parse(localStorage.getItem("scores")) || [];
  if(saved.length > 0){
    renderChart(saved);
  }
};

// 🔥 STREAK
function updateStreak(){
  let today = new Date().toDateString();
  let last = localStorage.getItem("lastLogin");
  let streak = parseInt(localStorage.getItem("streak")) || 0;

  if(last !== today){
    streak++;
    localStorage.setItem("streak", streak);
    localStorage.setItem("lastLogin", today);
  }

  if(document.getElementById("streak")){
    document.getElementById("streak").innerText =
      "🔥 Streak: " + streak + " days";
  }
}

// 🌗 THEME
function toggleTheme(){
  document.body.classList.toggle("light");

  if(document.body.classList.contains("light")){
    localStorage.setItem("theme","light");
  } else {
    localStorage.setItem("theme","dark");
  }
}

// 🎚️ SLIDER VALUES
function updateValue(id){
  document.getElementById(id+"Val").innerText =
    document.getElementById(id).value;
}

// ============================
// 📊 GRAPH (FINAL FIXED)
// ============================

let chart;

function updateChart(score){
  score = Number(score);

  let scores = JSON.parse(localStorage.getItem("scores")) || [];

  // Remove bad data
  scores = scores.filter(s =>
    typeof s === "object" &&
    /^\d{4}-\d{2}-\d{2}$/.test(s.date)
  );

  let today = new Date().toISOString().split("T")[0];

  let existing = scores.find(s => s.date === today);

  if(existing){
    existing.value = score;
  } else {
    scores.push({ date: today, value: score });
  }

  scores.sort((a,b)=> new Date(a.date) - new Date(b.date));
  scores = scores.slice(-7);

  localStorage.setItem("scores", JSON.stringify(scores));

  renderChart(scores);
}

function renderChart(scores){
  let ctx = document.getElementById("chart")?.getContext("2d");
  if(!ctx) return;

  if(chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: scores.map(s => s.date),
      datasets: [{
        label: "Happiness Score",
        data: scores.map(s => s.value),
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// 🎉 CONFETTI
function launchConfetti(){
  if(typeof confetti === "function"){
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

// 🔊 SOUND
function playSound(type){
  let url = "";

  if(type === "good"){
    url = "https://www.soundjay.com/buttons/sounds/button-3.mp3";
  }
  else if(type === "bad"){
    url = "https://www.soundjay.com/button/sounds/beep-10.mp3";
  }
  else if(type === "perfect"){
    url = "https://www.soundjay.com/human/sounds/applause-8.mp3";
  }

  if(url){
    new Audio(url).play();
  }
}

// 🧠 AI SUGGESTIONS
function getSuggestion(score){
  if(score >= 9){
    return "You are doing amazing. Keep maintaining this balance.";
  }
  else if(score >= 7){
    return "You're in a good state. Continue your healthy habits.";
  }
  else if(score >= 5){
    return "Try improving sleep and reducing stress.";
  }
  else{
    return "Consider talking to someone or taking a break.";
  }
}

// 🧠 CALCULATE
function calculate(){
  let loader = document.getElementById("loader");
  if(loader) loader.style.display = "flex";

  setTimeout(() => {

    let mood = +document.getElementById("mood").value;
    let sleep = +document.getElementById("sleep").value;
    let stress = +document.getElementById("stress").value;
    let social = +document.getElementById("social").value;
    let motivation = +document.getElementById("motivation").value;

    let score = ((mood + sleep + stress + social + motivation)/5).toFixed(2);

    let resultBox = document.getElementById("result");
    resultBox.classList.remove("good","bad","fade");

    let message = "";
    let suggestion = getSuggestion(score);

    if(score == 10){
      message = "Perfect mental state";
      launchConfetti();
      playSound("perfect");
      resultBox.classList.add("good");
    }
    else if(score >= 8){
      message = "Excellent mental state";
      playSound("good");
      resultBox.classList.add("good");
    }
    else if(score >= 5){
      message = "Moderate condition";
    }
    else{
      message = "Needs attention";
      playSound("bad");
      resultBox.classList.add("bad");
    }

    resultBox.innerText =
      "Happiness Score: " + score +
      " → " + message +
      "\nSuggestion: " + suggestion;

    resultBox.classList.add("fade");

    updateChart(score);

    if(loader) loader.style.display = "none";

  }, 800);
}

// 📄 PDF
function downloadPDF(){
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();

  let user = localStorage.getItem("user") || "User";

  let mood = document.getElementById("mood").value;
  let sleep = document.getElementById("sleep").value;
  let stress = document.getElementById("stress").value;
  let social = document.getElementById("social").value;
  let motivation = document.getElementById("motivation").value;

  let score = ((+mood + +sleep + +stress + +social + +motivation)/5).toFixed(2);

  // 🟦 HEADER
  doc.setFillColor(30, 60, 90);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255,255,255);
  doc.setFontSize(18);
  doc.text("Mental Health Report", 20, 20);

  // Reset text color
  doc.setTextColor(0,0,0);

  // 👤 USER INFO
  doc.setFontSize(12);
  doc.text("User: " + user, 20, 40);
  doc.text("Date: " + new Date().toLocaleDateString(), 20, 48);

  // 📊 TABLE HEADER
  let y = 70;

  doc.setFillColor(200, 220, 255);
  doc.rect(20, y-6, 170, 10, "F");

  doc.text("Parameter", 25, y);
  doc.text("Score", 150, y);

  y += 10;

  // 📊 TABLE DATA
  let data = [
    ["Mood", mood],
    ["Sleep", sleep],
    ["Stress", stress],
    ["Social", social],
    ["Motivation", motivation]
  ];

  data.forEach(row => {
    doc.text(row[0], 25, y);
    doc.text(row[1] + "/10", 150, y);
    y += 10;
  });

  // 📈 RESULT BOX
  y += 10;

  doc.setDrawColor(0);
  doc.rect(20, y, 170, 25);

  let message = "";
  let suggestion = "";

  if(score >= 9){
    message = "Excellent mental state";
    suggestion = "You are doing amazing. Keep maintaining this balance.";
  }
  else if(score >= 7){
    message = "Good mental condition";
    suggestion = "You're in a good state. Continue your healthy habits.";
  }
  else if(score >= 5){
    message = "Moderate condition";
    suggestion = "Try improving sleep and reducing stress.";
  }
  else{
    message = "Needs attention";
    suggestion = "Consider talking to someone or taking a break.";
  }

  doc.text("Happiness Score: " + score, 25, y+10);
  doc.text("Status: " + message, 25, y+18);

  // 💡 SUGGESTIONS
  y += 40;

  doc.setFontSize(13);
  doc.text("Suggestions", 20, y);

  doc.setFontSize(11);
  doc.text("- " + suggestion, 25, y+10);
  doc.text("- Maintain a healthy sleep routine", 25, y+20);
  doc.text("- Stay socially connected", 25, y+30);
  doc.text("- Practice relaxation techniques", 25, y+40);

  // 🧾 FOOTER
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("This report is generated by Mental Health Support System", 20, 280);

  doc.save("Mental_Report.pdf");
}
// ============================
// 🤖 SMART NLP CHATBOT
// ============================

let lastUserMessage = "";

function analyzeSentiment(text){
  text = text.toLowerCase();

  let positive = ["happy","good","great","fine","awesome","love"];
  let negative = ["sad","depressed","alone","stress","bad","tired","angry"];
  let anxiety = ["anxious","panic","overthinking"];
  let lonely = ["lonely","alone","ignored"];

  let score = 0;

  positive.forEach(w => { if(text.includes(w)) score++; });
  negative.forEach(w => { if(text.includes(w)) score--; });

  if(score > 0) return "positive";
  if(score < 0) return "negative";

  if(anxiety.some(w => text.includes(w))) return "anxiety";
  if(lonely.some(w => text.includes(w))) return "lonely";

  return "neutral";
}

function getReply(text){
  text = text.toLowerCase().trim();

  // 🧠 Greetings
  if(text.includes("hi") || text.includes("hello") || text.includes("hey")){
    return [
      "Hey there 😊 How are you feeling today?",
      "Hello! I'm here for you 💙",
      "Hi! Tell me what's on your mind."
    ][Math.floor(Math.random()*3)];
  }

  // 💬 How are you
  if(text.includes("how are you")){
    return [
      "I'm always here and ready to listen 😊 What about you?",
      "I'm doing well, thanks for asking! How are you feeling today?",
      "I'm here to help you. How’s your day going?"
    ][Math.floor(Math.random()*3)];
  }

  // 🙏 Thanks
  if(text.includes("thank") || text.includes("thanks")){
    return [
      "You're always welcome 😊",
      "Glad I could help 💙",
      "Anytime! I'm here for you."
    ][Math.floor(Math.random()*3)];
  }

  // 👋 Goodbye
  if(text.includes("bye") || text.includes("see you") || text.includes("later")){
    return [
      "Take care 💙 I'm here whenever you need.",
      "Goodbye! Stay strong 😊",
      "See you later! Don’t hesitate to come back."
    ][Math.floor(Math.random()*3)];
  }

  // ❤️ Emotional support
  if(text.includes("sad") || text.includes("depressed")){
    return "I'm really sorry you're feeling this way. Want to talk about it?";
  }

  if(text.includes("stress") || text.includes("tired")){
    return "That sounds exhausting. Maybe take a short break and breathe.";
  }

  if(text.includes("lonely") || text.includes("alone")){
    return "You're not alone. I'm here with you 💙";
  }

  // 🤖 Default fallback
  return [
    "Tell me more about that.",
    "I'm listening 😊",
    "Go on, I'm here for you.",
    "That sounds important. Want to share more?"
  ][Math.floor(Math.random()*4)];
}
// 💬 CHAT
function sendMsg(){
  let input = document.getElementById("msg");
  let text = input.value.trim();
  if(!text) return;

  let box = document.getElementById("chatBox");
  let typing = document.getElementById("typing");

  box.innerHTML += `<div class="msg user">${text}</div>`;
  input.value = "";

  typing.style.display = "block";

  setTimeout(()=>{
    typing.style.display = "none";

    let reply = getReply(text);

    box.innerHTML += `<div class="msg bot">${reply}</div>`;
    box.scrollTop = box.scrollHeight;

    if(document.getElementById("voiceToggle")?.checked){
      speechSynthesis.speak(new SpeechSynthesisUtterance(reply));
    }

  },1000);
}
function endChat(){
  // Clear chat UI
  document.getElementById("chatBox").innerHTML = "";

  // Clear memory
  localStorage.removeItem("chatMemory");

  // Optional message
  alert("Chat ended. Returning to Home 💙");

  // 🔥 REDIRECT TO HOME
  window.location.href = "index.html";
}

// ⌨️ ENTER
document.addEventListener("DOMContentLoaded", ()=>{
  let input = document.getElementById("msg");
  if(input){
    input.addEventListener("keydown", e=>{
      if(e.key === "Enter"){
        sendMsg();
      }
    });
  }
});

// 🔁 NAV
function goToSurvey(){ window.location.href = "survey.html"; }
function goToChat(){ window.location.href = "chat.html"; }
function goBack(){ window.location.href = "index.html"; }
function goHome(){ window.location.href = "index.html"; }

// 🚨 EMERGENCY
function emergency(){
  alert("📞 9152987821\n📞 1800-599-0019\nYou are not alone.");
}
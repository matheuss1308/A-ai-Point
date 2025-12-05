/* ===============================
   C.I.A – IA Local com Wake Word
   Estrutura limpa e profissional
   =============================== */

// CONFIGURAÇÕES PRINCIPAIS
const config = {
    wakeWord: "cia",
    confidenceThreshold: 0.75,
    listening: false,
};

// ELEMENTOS DA INTERFACE
const ui = {
    status: document.getElementById("status"),
    output: document.getElementById("output"),
    micButton: document.getElementById("micButton"),
};

// --- UTILITÁRIOS ---------------------------------------

function log(msg) {
    console.log("[C.I.A]", msg);
}

function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pt-BR";
    speechSynthesis.speak(utter);
}

// --- RECONHECIMENTO DE VOZ ------------------------------

let recognizer;

async function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognizer = new SpeechRecognition();

    recognizer.lang = "pt-BR";
    recognizer.continuous = true;
    recognizer.interimResults = false;

    recognizer.onresult = (event) => {
        const transcript = event.results[event.resultIndex][0].transcript.toLowerCase().trim();
        handleVoiceInput(transcript);
    };

    recognizer.onerror = (e) => log(`Erro de áudio: ${e.error}`);
}

function startListening() {
    if (!recognizer) return;
    recognizer.start();
    config.listening = true;
    ui.status.textContent = "Ouvindo...";
    ui.micButton.classList.add("active");
}

function stopListening() {
    if (!recognizer) return;
    recognizer.stop();
    config.listening = false;
    ui.status.textContent = "Parado";
    ui.micButton.classList.remove("active");
}

// --- PROCESSAMENTO DE COMANDO ---------------------------

function handleVoiceInput(text) {
    ui.output.textContent = text;
    log("Usuário disse: " + text);

    // só responde depois do wake word "cia"
    if (text.startsWith(config.wakeWord)) {
        const command = text.replace(config.wakeWord, "").trim();
        executeCommand(command);
    }
}

function executeCommand(command) {
    log("Comando: " + command);

    if (command.includes("olá") || command.includes("oi")) {
        speak("Olá! Como posso ajudar?");
        return;
    }

    if (command.includes("horas")) {
        const h = new Date().toLocaleTimeString("pt-BR");
        speak("Agora são " + h);
        return;
    }

    if (command.includes("parar")) {
        speak("Encerrando escuta.");
        stopListening();
        return;
    }

    // comando genérico
    speak("Não entendi o comando, mas posso tentar aprender.");
}

// --- INICIALIZAÇÃO GLOBAL -------------------------------

async function initCIA() {
    await initSpeechRecognition();
    log("Sistema pronto.");
    ui.status.textContent = "Pronto";
}

ui.micButton.addEventListener("click", () => {
    config.listening ? stopListening() : startListening();
});

initCIA();

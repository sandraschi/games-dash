// Tongue Twister Challenge
// **Timestamp**: 2025-12-03

const twisters = {
    en: [
        { text: "She sells seashells by the seashore", translation: "" },
        { text: "Peter Piper picked a peck of pickled peppers", translation: "" },
        { text: "How much wood would a woodchuck chuck if a woodchuck could chuck wood", translation: "" },
        { text: "Red lorry, yellow lorry, red lorry, yellow lorry", translation: "" }
    ],
    de: [
        { text: "Fischers Fritz fischt frische Fische", translation: "Fisherman Fritz fishes fresh fish" },
        { text: "Blaukraut bleibt Blaukraut und Brautkleid bleibt Brautkleid", translation: "Red cabbage stays red cabbage and bridal gown stays bridal gown" },
        { text: "Zwischen zwei Zwetschgenzweigen zwitschern zwei Schwalben", translation: "Between two plum branches two swallows chirp" }
    ],
    ja: [
        { text: "生麦生米生卵", translation: "Raw wheat, raw rice, raw egg" },
        { text: "隣の客はよく柿食う客だ", translation: "The customer next door eats a lot of persimmons" },
        { text: "東京特許許可局", translation: "Tokyo patent approval office" }
    ],
    fr: [
        { text: "Un chasseur sachant chasser doit savoir chasser sans son chien", translation: "A hunter who knows how to hunt must know how to hunt without his dog" },
        { text: "Les chaussettes de l'archiduchesse sont-elles sèches", translation: "Are the archduchess's socks dry" }
    ],
    es: [
        { text: "Tres tristes tigres tragaban trigo en un trigal", translation: "Three sad tigers swallowed wheat in a wheat field" },
        { text: "Pablito clavó un clavito en la calva de un calvito", translation: "Little Pablo nailed a little nail in a little bald man's bald head" }
    ]
};

let currentLang = 'en';
let currentSpeed = 1.0;
let currentTwister = null;
let synth = window.speechSynthesis;
let recognition = null;
let availableVoices = [];

// Load voices when available
function loadVoices() {
    availableVoices = synth.getVoices();
    console.log('Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
}

// Load voices immediately and on voiceschanged event
loadVoices();
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
}

function selectLanguage(lang) {
    currentLang = lang;
    
    // Ensure voices are loaded
    if (availableVoices.length === 0) {
        availableVoices = synth.getVoices();
    }
    
    // Check if we have a voice for this language
    const langMap = {
        de: 'de-DE',
        en: 'en-US',
        fr: 'fr-FR',
        es: 'es-ES',
        ja: 'ja-JP'
    };
    
    const hasVoice = availableVoices.some(v => 
        v.lang === langMap[lang] || v.lang.startsWith(lang)
    );
    
    if (!hasVoice) {
        alert(`Warning: No ${lang.toUpperCase()} voice found on your system. Pronunciation may be incorrect. Install language packs in Windows Settings > Time & Language > Speech.`);
    }
    
    loadRandomTwister();
}

function loadRandomTwister() {
    const list = twisters[currentLang];
    currentTwister = list[Math.floor(Math.random() * list.length)];
    document.getElementById('twisterText').textContent = currentTwister.text;
    document.getElementById('translation').textContent = currentTwister.translation;
    document.getElementById('result').style.display = 'none';
    
    // Show which voice will be used
    if (availableVoices.length === 0) {
        availableVoices = synth.getVoices();
    }
    
    const langMap = {
        de: 'de-DE',
        en: 'en-US',
        fr: 'fr-FR',
        es: 'es-ES',
        ja: 'ja-JP'
    };
    
    const targetLang = langMap[currentLang];
    const voice = availableVoices.find(v => v.lang === targetLang || v.lang.startsWith(currentLang));
    
    const voiceInfo = document.getElementById('voiceInfo');
    if (voice) {
        voiceInfo.textContent = `🔊 Voice: ${voice.name}`;
        voiceInfo.style.color = '#4CAF50';
    } else {
        voiceInfo.textContent = `⚠️ No native ${currentLang.toUpperCase()} voice found - pronunciation may be incorrect`;
        voiceInfo.style.color = '#FF9800';
    }
}

function setSpeed(speed) {
    currentSpeed = speed;
}

function playTwister() {
    if (!currentTwister) {
        alert('Select a language first!');
        return;
    }
    
    synth.cancel();
    
    // Ensure voices are loaded
    if (availableVoices.length === 0) {
        availableVoices = synth.getVoices();
    }
    
    const utterance = new SpeechSynthesisUtterance(currentTwister.text);
    
    const langMap = {
        de: 'de-DE',
        en: 'en-US',
        fr: 'fr-FR',
        es: 'es-ES',
        ja: 'ja-JP'
    };
    
    const targetLang = langMap[currentLang];
    utterance.lang = targetLang;
    utterance.rate = currentSpeed;
    
    // Find the best voice for this language
    // Priority: native voice > Microsoft voice > Google voice > any voice with matching language
    const nativeVoice = availableVoices.find(voice => 
        voice.lang.startsWith(currentLang) && !voice.name.includes('Google') && !voice.name.includes('Microsoft')
    );
    
    const microsoftVoice = availableVoices.find(voice => 
        voice.lang.startsWith(currentLang) && voice.name.includes('Microsoft')
    );
    
    const googleVoice = availableVoices.find(voice => 
        voice.lang.startsWith(currentLang) && voice.name.includes('Google')
    );
    
    const anyMatchingVoice = availableVoices.find(voice => 
        voice.lang === targetLang || voice.lang.startsWith(currentLang)
    );
    
    // Set the best available voice
    const selectedVoice = nativeVoice || microsoftVoice || googleVoice || anyMatchingVoice;
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    } else {
        console.warn(`No voice found for ${currentLang}, using default`);
    }
    
    // Adjust rate for different languages (Japanese is typically faster)
    if (currentLang === 'ja') {
        utterance.rate = currentSpeed * 0.9; // Slightly slower for Japanese
    }
    
    synth.speak(utterance);
}

async function recordAttempt() {
    const btn = document.getElementById('talkBtn');
    
    if (!recognition) {
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition not supported in this browser. Try Chrome!');
            return;
        }
        
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
    }
    
    if (btn.classList.contains('recording')) {
        recognition.stop();
        btn.classList.remove('recording');
        btn.textContent = '🎤 Talk';
        return;
    }
    
    btn.classList.add('recording');
    btn.textContent = '⏺️ Recording...';
    
    const langMap = {
        de: 'de-DE',
        en: 'en-US',
        fr: 'fr-FR',
        es: 'es-ES',
        ja: 'ja-JP'
    };
    
    recognition.lang = langMap[currentLang];
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        btn.classList.remove('recording');
        btn.textContent = '🎤 Talk';
        
        // Score attempt
        const score = calculateScore(currentTwister.text, transcript, confidence);
        displayResult(transcript, score);
    };
    
    recognition.onerror = (event) => {
        btn.classList.remove('recording');
        btn.textContent = '🎤 Talk';
        alert('Error: ' + event.error);
    };
    
    recognition.start();
}

function calculateScore(expected, actual, confidence) {
    // Levenshtein distance (simplified)
    const similarity = calculateSimilarity(expected.toLowerCase(), actual.toLowerCase());
    return Math.round((similarity * 0.7 + confidence * 0.3) * 100);
}

function calculateSimilarity(s1, s2) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(s1, s2) {
    const matrix = [];
    
    for (let i = 0; i <= s2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= s2.length; i++) {
        for (let j = 1; j <= s1.length; j++) {
            if (s2[i - 1] === s1[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[s2.length][s1.length];
}

function displayResult(recognized, score) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    
    let grade = '🤣 HILARIOUS!';
    if (score >= 95) grade = '🌟 PERFECT!';
    else if (score >= 85) grade = '🎉 Excellent!';
    else if (score >= 75) grade = '👍 Good!';
    else if (score >= 60) grade = '😊 Not Bad!';
    else if (score >= 40) grade = '😅 Keep Trying!';
    
    resultDiv.innerHTML = `
        <h2>${grade}</h2>
        <h3>Score: ${score}%</h3>
        <p><strong>You said:</strong> "${recognized}"</p>
        <p><strong>Expected:</strong> "${currentTwister.text}"</p>
    `;
    
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Initialize
loadRandomTwister();


// Tongue Twister Challenge
// **Timestamp**: 2025-12-03

const twisters = {
    en: [
        { text: "She sells seashells by the seashore", translation: "" },
        { text: "Peter Piper picked a peck of pickled peppers", translation: "" },
        { text: "How much wood would a woodchuck chuck if a woodchuck could chuck wood", translation: "" },
        { text: "Red lorry, yellow lorry, red lorry, yellow lorry", translation: "" },
        { text: "Unique New York, unique New York, unique New York", translation: "" },
        { text: "Six thick thistle sticks", translation: "" },
        { text: "Betty Botter bought some butter", translation: "" },
        { text: "A proper copper coffee pot", translation: "" },
        { text: "I scream, you scream, we all scream for ice cream", translation: "" },
        { text: "Toy boat, toy boat, toy boat", translation: "" },
        { text: "Supercalifragilisticexpialidocious", translation: "" },
        { text: "The thirty-three thieves thought that they thrilled the throne throughout Thursday", translation: "" },
        { text: "If a dog chews shoes, whose shoes does he choose", translation: "" },
        { text: "Fresh fried fish, fish fresh fried, fried fish fresh, fish fried fresh", translation: "" },
        { text: "Can you can a can as a canner can can a can", translation: "" }
    ],
    de: [
        { text: "Fischers Fritz fischt frische Fische", translation: "Fisherman Fritz fishes fresh fish" },
        { text: "Blaukraut bleibt Blaukraut und Brautkleid bleibt Brautkleid", translation: "Red cabbage stays red cabbage and bridal gown stays bridal gown" },
        { text: "Zwischen zwei Zwetschgenzweigen zwitschern zwei Schwalben", translation: "Between two plum branches two swallows chirp" },
        { text: "Der dicke Dachshund döst im Dunkeln", translation: "The fat badger sleeps in the dark" },
        { text: "Sieben Schneeschipper schippen sieben Schippen Schnee", translation: "Seven snow shovelers shovel seven shovels of snow" },
        { text: "Der Popcorn-Preis ist hoch", translation: "The popcorn price is high" },
        { text: "Bierbrauer Bauer braut braunes Bier", translation: "Beer brewer farmer brews brown beer" },
        { text: "Vierzehn kleine Veilchen vertrocknen im Verborgenen", translation: "Fourteen little violets wither in hiding" },
        { text: "Der Ziegenbock bockt die Ziege", translation: "The billy goat butts the goat" },
        { text: "Der Wolf heult laut im Wald", translation: "The wolf howls loudly in the forest" },
        { text: "Kleine Kinder kochen Kuchen", translation: "Little children bake cakes" },
        { text: "Schwarze Schafe schleppen schwere Säcke", translation: "Black sheep drag heavy sacks" },
        { text: "Dicke Dackel dösen im Dunkeln", translation: "Fat dachshunds doze in the dark" },
        { text: "Frische Frösche fressen frische Früchte", translation: "Fresh frogs eat fresh fruits" }
    ],
    ja: [
        { text: "生麦生米生卵", translation: "Raw wheat, raw rice, raw egg" },
        { text: "隣の客はよく柿食う客だ", translation: "The customer next door eats a lot of persimmons" },
        { text: "東京特許許可局", translation: "Tokyo patent approval office" },
        { text: "すもももももももものうち", translation: "Japanese plum is also a plum" },
        { text: "坊主が屏風に上手に坊主の絵を描いた", translation: "The priest skillfully drew a priest's picture on the folding screen" },
        { text: "赤パジャマ青パジャマ黄パジャマ", translation: "Red pajamas, blue pajamas, yellow pajamas" },
        { text: "日暮れの街角で少女が微笑んだ", translation: "The girl smiled at the street corner at dusk" },
        { text: "時々刻々人々が集まる", translation: "People gather every moment" },
        { text: "竹やぶ焼けた", translation: "The bamboo grove burned down" },
        { text: "本日は晴天なり", translation: "Today is fine weather" },
        { text: "隣の竹藪に竹立てかけた", translation: "Set up bamboo in the neighboring bamboo grove" },
        { text: "四は死", translation: "Four is death" },
        { text: "色は匂へど散りぬるを", translation: "The color and fragrance have scattered" },
        { text: "七人の侍", translation: "Seven samurai" },
        { text: "机の上に本が三冊ある", translation: "There are three books on the desk" }
    ],
    fr: [
        { text: "Un chasseur sachant chasser doit savoir chasser sans son chien", translation: "A hunter who knows how to hunt must know how to hunt without his dog" },
        { text: "Les chaussettes de l'archiduchesse sont-elles sèches", translation: "Are the archduchess's socks dry" },
        { text: "Six saucisses sèches dans six sachets sales", translation: "Six dry sausages in six dirty bags" },
        { text: "Chasseur sachant chasser sans son chien", translation: "Hunter knowing how to hunt without his dog" },
        { text: "Trois tortues trottent sur trois toits très étroits", translation: "Three turtles trot on three very narrow roofs" },
        { text: "Frère Jacques, frère Jacques, dormez-vous", translation: "Brother Jacques, Brother Jacques, are you sleeping" },
        { text: "Le ver vert va vers le verre vert", translation: "The green worm goes towards the green glass" },
        { text: "Je veux et j'exige d'exquis écureuils", translation: "I want and demand exquisite squirrels" },
        { text: "Sèche chemise sèche sur chère chaise", translation: "Dry shirt dries on expensive chair" },
        { text: "Le chat perchée sur le chêne chante", translation: "The cat perched on the oak sings" },
        { text: "Quatre-vingts-quatre choux", translation: "Eighty-four cabbages" },
        { text: "Le fisc fixe exprès chaque taxe fixe", translation: "The tax office deliberately sets each fixed tax" },
        { text: "Ces six saucisses-ci sont si sèches", translation: "These six sausages here are so dry" },
        { text: "Près d'un bois brun, brun brunet breton", translation: "Near a brown wood, brown Breton brunette" }
    ],
    es: [
        { text: "Tres tristes tigres tragaban trigo en un trigal", translation: "Three sad tigers swallowed wheat in a wheat field" },
        { text: "Pablito clavó un clavito en la calva de un calvito", translation: "Little Pablo nailed a little nail in a little bald man's bald head" },
        { text: "El cielo está enladrillado, ¿quién lo desenladrillará?", translation: "The sky is bricked, who will unbrick it?" },
        { text: "El perro de San Roque no tiene rabo", translation: "The dog of San Roque has no tail" },
        { text: "Tres tramos de trescientos treinta y tres tristes trozos de troncos", translation: "Three sections of three hundred thirty-three sad pieces of logs" },
        { text: "Erre con erre, cigarro, erre con erre, barril", translation: "R with R, cigar, R with R, barrel" },
        { text: "La araña araña la rama de la araña", translation: "The spider scratches the spider's branch" },
        { text: "Comería muchos caramelos si no me dolieran los dientes", translation: "I would eat many candies if my teeth didn't hurt" },
        { text: "Papá pone pan para Pepín", translation: "Dad puts bread for Pepín" },
        { text: "Pablito pintó un pajarito", translation: "Little Pablo painted a little bird" },
        { text: "El zorro zorro zorra", translation: "The fox foxes the vixen" },
        { text: "Tres tigres trigaban trigo en un trigal", translation: "Three tigers threshed wheat in a wheat field" },
        { text: "Juan junta juncos junto al junco", translation: "Juan gathers rushes next to the rush" },
        { text: "El hipopótamo Hipo está con hipo", translation: "The hippopotamus Hipo has hiccups" }
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


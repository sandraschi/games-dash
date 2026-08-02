// JLPT Vocabulary Learning Game
// Loads real per-level vocabulary from the games backend (/api/vocab/jlpt,
// backed by data/kanji.db's jlpt_vocabulary table: 8K+ graded entries) with
// real Tatoeba example sentences (/api/examples/search, 278K pairs).
// The small built-in set below is an OFFLINE FALLBACK (~10 words per level).

const VOCAB_API_BASE = '/api';

// Offline fallback data (~10 words per level)
const FALLBACK_VOCABULARY = {
    N5: [
        { japanese: '勉強', reading: 'benkyou', english: 'study', type: 'noun', examples: [
            { jp: '毎日勉強します', en: 'I study every day' },
            { jp: '勉強が好きです', en: 'I like studying' }
        ]},
        { japanese: '食べる', reading: 'taberu', english: 'eat', type: 'verb', examples: [
            { jp: 'ご飯を食べます', en: 'I eat rice' },
            { jp: '何を食べたいですか', en: 'What do you want to eat?' }
        ]},
        { japanese: '学校', reading: 'gakkou', english: 'school', type: 'noun', examples: [
            { jp: '学校に行きます', en: 'I go to school' },
            { jp: '学校の友達', en: 'school friend' }
        ]},
        { japanese: '時間', reading: 'jikan', english: 'time', type: 'noun', examples: [
            { jp: '時間がありません', en: 'I have no time' },
            { jp: '何時間ですか', en: 'What time is it?' }
        ]},
        { japanese: '見る', reading: 'miru', english: 'see/look/watch', type: 'verb', examples: [
            { jp: 'テレビを見ます', en: 'I watch TV' },
            { jp: '本を見ます', en: 'I look at a book' }
        ]},
        { japanese: '行く', reading: 'iku', english: 'go', type: 'verb', examples: [
            { jp: '学校に行きます', en: 'I go to school' },
            { jp: 'どこに行きますか', en: 'Where are you going?' }
        ]},
        { japanese: '来る', reading: 'kuru', english: 'come', type: 'verb', examples: [
            { jp: '家に来てください', en: 'Please come to my house' },
            { jp: '友達が来ます', en: 'My friend is coming' }
        ]},
        { japanese: 'する', reading: 'suru', english: 'do', type: 'verb', examples: [
            { jp: '宿題をします', en: 'I do homework' },
            { jp: '何をしますか', en: 'What are you doing?' }
        ]},
        { japanese: '学生', reading: 'gakusei', english: 'student', type: 'noun', examples: [
            { jp: '私は学生です', en: 'I am a student' },
            { jp: '大学生', en: 'university student' }
        ]},
        { japanese: '先生', reading: 'sensei', english: 'teacher', type: 'noun', examples: [
            { jp: '英語の先生', en: 'English teacher' },
            { jp: '田中先生', en: 'Teacher Tanaka' }
        ]},
        { japanese: '本', reading: 'hon', english: 'book', type: 'noun', examples: [
            { jp: '本を読みます', en: 'I read a book' },
            { jp: '本屋', en: 'bookstore' }
        ]},
        { japanese: '家', reading: 'ie', english: 'house/home', type: 'noun', examples: [
            { jp: '家にいます', en: 'I am at home' },
            { jp: '私の家', en: 'my house' }
        ]},
        { japanese: '友達', reading: 'tomodachi', english: 'friend', type: 'noun', examples: [
            { jp: '友達と遊びます', en: 'I play with friends' },
            { jp: '親友', en: 'best friend' }
        ]},
        { japanese: '水', reading: 'mizu', english: 'water', type: 'noun', examples: [
            { jp: '水を飲みます', en: 'I drink water' },
            { jp: 'お水', en: 'water (polite)' }
        ]},
        { japanese: '大きい', reading: 'ookii', english: 'big', type: 'adjective', examples: [
            { jp: '大きい家', en: 'big house' },
            { jp: '一番大きい', en: 'the biggest' }
        ]},
        { japanese: '小さい', reading: 'chiisai', english: 'small', type: 'adjective', examples: [
            { jp: '小さい犬', en: 'small dog' },
            { jp: '一番小さい', en: 'the smallest' }
        ]},
        { japanese: '新しい', reading: 'atarashii', english: 'new', type: 'adjective', examples: [
            { jp: '新しい車', en: 'new car' },
            { jp: '新しい学校', en: 'new school' }
        ]},
        { japanese: '古い', reading: 'furui', english: 'old', type: 'adjective', examples: [
            { jp: '古い本', en: 'old book' },
            { jp: '古い家', en: 'old house' }
        ]},
        { japanese: 'いい', reading: 'ii', english: 'good', type: 'adjective', examples: [
            { jp: 'いい天気', en: 'good weather' },
            { jp: 'いい人', en: 'good person' }
        ]},
        { japanese: '悪い', reading: 'warui', english: 'bad', type: 'adjective', examples: [
            { jp: '悪い天気', en: 'bad weather' },
            { jp: '悪い人', en: 'bad person' }
        ]}
    ],
    N4: [
        { japanese: '開発', reading: 'kaihatsu', english: 'development', type: 'noun', examples: [
            { jp: 'ソフトウェア開発', en: 'software development' },
            { jp: '新技術の開発', en: 'new technology development' }
        ]},
        { japanese: '経験', reading: 'keiken', english: 'experience', type: 'noun', examples: [
            { jp: '仕事の経験', en: 'work experience' },
            { jp: '旅行の経験', en: 'travel experience' }
        ]},
        { japanese: '注意', reading: 'chuui', english: 'caution/attention', type: 'noun', examples: [
            { jp: '注意してください', en: 'Please be careful' },
            { jp: '交通注意', en: 'traffic caution' }
        ]},
        { japanese: '説明', reading: 'setsumei', english: 'explanation', type: 'noun', examples: [
            { jp: '説明書', en: 'instruction manual' },
            { jp: '詳しい説明', en: 'detailed explanation' }
        ]},
        { japanese: '調査', reading: 'chousa', english: 'investigation/survey', type: 'noun', examples: [
            { jp: '市場調査', en: 'market research' },
            { jp: '世論調査', en: 'public opinion poll' }
        ]},
        { japanese: '改善', reading: 'kaizen', english: 'improvement', type: 'noun', examples: [
            { jp: '品質改善', en: 'quality improvement' },
            { jp: '生活改善', en: 'life improvement' }
        ]},
        { japanese: '経営', reading: 'keiei', english: 'management', type: 'noun', examples: [
            { jp: '会社経営', en: 'company management' },
            { jp: '経営者', en: 'manager' }
        ]},
        { japanese: '分析', reading: 'bunseki', english: 'analysis', type: 'noun', examples: [
            { jp: 'データ分析', en: 'data analysis' },
            { jp: '市場分析', en: 'market analysis' }
        ]},
        { japanese: '確認', reading: 'kakunin', english: 'confirmation', type: 'noun', examples: [
            { jp: '予約確認', en: 'reservation confirmation' },
            { jp: '身元確認', en: 'identity confirmation' }
        ]},
        { japanese: '影響', reading: 'eikyou', english: 'influence/effect', type: 'noun', examples: [
            { jp: '環境への影響', en: 'environmental impact' },
            { jp: '健康への影響', en: 'health impact' }
        ]},
        { japanese: '参加', reading: 'sanka', english: 'participation', type: 'noun', examples: [
            { jp: '会議に参加する', en: 'participate in the meeting' },
            { jp: 'イベント参加', en: 'event participation' }
        ]},
        { japanese: '決定', reading: 'kettei', english: 'decision', type: 'noun', examples: [
            { jp: '最終決定', en: 'final decision' },
            { jp: '決定する', en: 'to decide' }
        ]},
        { japanese: '理解', reading: 'rikai', english: 'understanding', type: 'noun', examples: [
            { jp: '理解する', en: 'to understand' },
            { jp: '深い理解', en: 'deep understanding' }
        ]},
        { japanese: '準備', reading: 'junbi', english: 'preparation', type: 'noun', examples: [
            { jp: '試験準備', en: 'exam preparation' },
            { jp: '旅行の準備', en: 'travel preparation' }
        ]},
        { japanese: '成功', reading: 'seikou', english: 'success', type: 'noun', examples: [
            { jp: '成功する', en: 'to succeed' },
            { jp: '大成功', en: 'great success' }
        ]},
        { japanese: '失敗', reading: 'shippai', english: 'failure', type: 'noun', examples: [
            { jp: '失敗する', en: 'to fail' },
            { jp: '大失敗', en: 'big failure' }
        ]},
        { japanese: '努力', reading: 'doryoku', english: 'effort', type: 'noun', examples: [
            { jp: '努力する', en: 'to make an effort' },
            { jp: '努力家', en: 'hard worker' }
        ]},
        { japanese: '変化', reading: 'henka', english: 'change', type: 'noun', examples: [
            { jp: '変化する', en: 'to change' },
            { jp: '大きな変化', en: 'big change' }
        ]},
        { japanese: '関係', reading: 'kankei', english: 'relationship', type: 'noun', examples: [
            { jp: '人間関係', en: 'human relationships' },
            { jp: '仕事関係', en: 'work relationship' }
        ]},
        { japanese: '能力', reading: 'nouryoku', english: 'ability', type: 'noun', examples: [
            { jp: '言語能力', en: 'language ability' },
            { jp: '管理能力', en: 'management ability' }
        ]}
    ],
    N3: [
        { japanese: '環境', reading: 'kankyou', english: 'environment', type: 'noun', examples: [
            { jp: '自然環境', en: 'natural environment' },
            { jp: '仕事環境', en: 'work environment' }
        ]},
        { japanese: '効果', reading: 'kouka', english: 'effect/result', type: 'noun', examples: [
            { jp: '効果的', en: 'effective' },
            { jp: '良い効果', en: 'good effect' }
        ]},
        { japanese: '技術', reading: 'gijutsu', english: 'technology/technique', type: 'noun', examples: [
            { jp: '最新技術', en: 'latest technology' },
            { jp: '技術者', en: 'technician' }
        ]},
        { japanese: '資源', reading: 'shigen', english: 'resources', type: 'noun', examples: [
            { jp: '自然資源', en: 'natural resources' },
            { jp: '人材資源', en: 'human resources' }
        ]},
        { japanese: '実現', reading: 'jitsugen', english: 'realization', type: 'noun', examples: [
            { jp: '夢の実現', en: 'realization of a dream' },
            { jp: '計画の実現', en: 'implementation of a plan' }
        ]},
        { japanese: '評価', reading: 'hyouka', english: 'evaluation', type: 'noun', examples: [
            { jp: '自己評価', en: 'self-evaluation' },
            { jp: '性能評価', en: 'performance evaluation' }
        ]},
        { japanese: '貢献', reading: 'kouken', english: 'contribution', type: 'noun', examples: [
            { jp: '社会貢献', en: 'social contribution' },
            { jp: '貢献する', en: 'to contribute' }
        ]},
        { japanese: '維持', reading: 'iji', english: 'maintenance', type: 'noun', examples: [
            { jp: '環境維持', en: 'environmental maintenance' },
            { jp: '品質維持', en: 'quality maintenance' }
        ]},
        { japanese: '実施', reading: 'jisshi', english: 'implementation', type: 'noun', examples: [
            { jp: '計画実施', en: 'plan implementation' },
            { jp: '実施する', en: 'to implement' }
        ]},
        { japanese: '促進', reading: 'sokushin', english: 'promotion', type: 'noun', examples: [
            { jp: '経済促進', en: 'economic promotion' },
            { jp: '促進する', en: 'to promote' }
        ]},
        { japanese: '克服', reading: 'kokufuku', english: 'overcoming', type: 'noun', examples: [
            { jp: '困難克服', en: 'overcoming difficulties' },
            { jp: '克服する', en: 'to overcome' }
        ]},
        { japanese: '解決', reading: 'kaiketsu', english: 'solution', type: 'noun', examples: [
            { jp: '問題解決', en: 'problem solving' },
            { jp: '解決する', en: 'to solve' }
        ]},
        { japanese: '達成', reading: 'tassei', english: 'achievement', type: 'noun', examples: [
            { jp: '目標達成', en: 'goal achievement' },
            { jp: '達成する', en: 'to achieve' }
        ]},
        { japanese: '拡大', reading: 'kakudai', english: 'expansion', type: 'noun', examples: [
            { jp: '市場拡大', en: 'market expansion' },
            { jp: '拡大する', en: 'to expand' }
        ]},
        { japanese: '減少', reading: 'genshou', english: 'decrease', type: 'noun', examples: [
            { jp: '人口減少', en: 'population decrease' },
            { jp: '減少する', en: 'to decrease' }
        ]},
        { japanese: '増加', reading: 'zouka', english: 'increase', type: 'noun', examples: [
            { jp: '生産増加', en: 'production increase' },
            { jp: '増加する', en: 'to increase' }
        ]},
        { japanese: '低下', reading: 'teika', english: 'decline', type: 'noun', examples: [
            { jp: '品質低下', en: 'quality decline' },
            { jp: '低下する', en: 'to decline' }
        ]},
        { japanese: '向上', reading: 'koujou', english: 'improvement', type: 'noun', examples: [
            { jp: '品質向上', en: 'quality improvement' },
            { jp: '向上する', en: 'to improve' }
        ]},
        { japanese: '安定', reading: 'antei', english: 'stability', type: 'noun', examples: [
            { jp: '経済安定', en: 'economic stability' },
            { jp: '安定する', en: 'to stabilize' }
        ]},
        { japanese: '不安定', reading: 'fuantei', english: 'instability', type: 'noun', examples: [
            { jp: '政治的不安定', en: 'political instability' },
            { jp: '不安定な状態', en: 'unstable condition' }
        ]}
    ],
    N2: [
        { japanese: '多様性', reading: 'tayousei', english: 'diversity', type: 'noun', examples: [
            { jp: '文化的多様性', en: 'cultural diversity' },
            { jp: '生物多様性', en: 'biodiversity' }
        ]},
        { japanese: '持続可能性', reading: 'jizokusousei', english: 'sustainability', type: 'noun', examples: [
            { jp: '環境の持続可能性', en: 'environmental sustainability' },
            { jp: '持続可能な発展', en: 'sustainable development' }
        ]},
        { japanese: 'グローバル化', reading: 'guroubaruka', english: 'globalization', type: 'noun', examples: [
            { jp: '経済グローバル化', en: 'economic globalization' },
            { jp: 'グローバル化の影響', en: 'impact of globalization' }
        ]},
        { japanese: 'イノベーション', reading: 'inobeeshon', english: 'innovation', type: 'noun', examples: [
            { jp: '技術イノベーション', en: 'technological innovation' },
            { jp: 'イノベーションを起こす', en: 'to innovate' }
        ]},
        { japanese: '効率性', reading: 'kouritsusei', english: 'efficiency', type: 'noun', examples: [
            { jp: '作業効率', en: 'work efficiency' },
            { jp: 'エネルギー効率', en: 'energy efficiency' }
        ]},
        { japanese: '適応性', reading: 'tekousei', english: 'adaptability', type: 'noun', examples: [
            { jp: '環境適応性', en: 'environmental adaptability' },
            { jp: '適応性が高い', en: 'highly adaptable' }
        ]},
        { japanese: '柔軟性', reading: 'juunansei', english: 'flexibility', type: 'noun', examples: [
            { jp: '思考の柔軟性', en: 'flexibility of thinking' },
            { jp: '柔軟な対応', en: 'flexible response' }
        ]},
        { japanese: '創造性', reading: 'sousousei', english: 'creativity', type: 'noun', examples: [
            { jp: '創造性を発揮する', en: 'to demonstrate creativity' },
            { jp: '創造的な解決', en: 'creative solution' }
        ]},
        { japanese: '生産性', reading: 'seisansei', english: 'productivity', type: 'noun', examples: [
            { jp: '労働生産性', en: 'labor productivity' },
            { jp: '生産性を上げる', en: 'to increase productivity' }
        ]},
        { japanese: '競争力', reading: 'kyousouryoku', english: 'competitiveness', type: 'noun', examples: [
            { jp: '国際競争力', en: 'international competitiveness' },
            { jp: '競争力を強化する', en: 'to strengthen competitiveness' }
        ]},
        { japanese: '信頼性', reading: 'shinraisei', english: 'reliability', type: 'noun', examples: [
            { jp: '製品の信頼性', en: 'product reliability' },
            { jp: '信頼性の高い', en: 'highly reliable' }
        ]},
        { japanese: '有効性', reading: 'yuukousei', english: 'effectiveness', type: 'noun', examples: [
            { jp: '治療の有効性', en: 'treatment effectiveness' },
            { jp: '有効性を検証する', en: 'to verify effectiveness' }
        ]},
        { japanese: '緊急性', reading: 'kinkyusei', english: 'urgency', type: 'noun', examples: [
            { jp: '問題の緊急性', en: 'urgency of the problem' },
            { jp: '緊急性を認識する', en: 'to recognize urgency' }
        ]},
        { japanese: '独自性', reading: 'dokusei', english: 'uniqueness', type: 'noun', examples: [
            { jp: '文化の独自性', en: 'cultural uniqueness' },
            { jp: '独自の視点', en: 'unique perspective' }
        ]},
        { japanese: '普遍性', reading: 'fuhensei', english: 'universality', type: 'noun', examples: [
            { jp: '人間の普遍性', en: 'human universality' },
            { jp: '普遍的な価値', en: 'universal values' }
        ]},
        { japanese: '必然性', reading: 'hitsuzensei', english: 'inevitability', type: 'noun', examples: [
            { jp: '変化の必然性', en: 'inevitability of change' },
            { jp: '必然的な結果', en: 'inevitable result' }
        ]},
        { japanese: '優位性', reading: 'yuisei', english: 'superiority', type: 'noun', examples: [
            { jp: '技術的優位性', en: 'technological superiority' },
            { jp: '優位性を保つ', en: 'to maintain superiority' }
        ]},
        { japanese: '脆弱性', reading: 'zeijakusei', english: 'vulnerability', type: 'noun', examples: [
            { jp: 'システムの脆弱性', en: 'system vulnerability' },
            { jp: '脆弱性を修正する', en: 'to fix vulnerability' }
        ]},
        { japanese: '潜在性', reading: 'senzensei', english: 'potentiality', type: 'noun', examples: [
            { jp: '成長の潜在性', en: 'growth potential' },
            { jp: '潜在的な能力', en: 'latent ability' }
        ]},
        { japanese: '相互作用', reading: 'sougosayou', english: 'interaction', type: 'noun', examples: [
            { jp: '薬物の相互作用', en: 'drug interaction' },
            { jp: '相互作用する', en: 'to interact' }
        ]}
    ],
    N1: [
        { japanese: '共感性', reading: 'kyoukansei', english: 'empathy', type: 'noun', examples: [
            { jp: '共感性を示す', en: 'to show empathy' },
            { jp: '高い共感性', en: 'high empathy' }
        ]},
        { japanese: '自律性', reading: 'jiritsusei', english: 'autonomy', type: 'noun', examples: [
            { jp: '個人の自律性', en: 'personal autonomy' },
            { jp: '自律性を育む', en: 'to foster autonomy' }
        ]},
        { japanese: '客観性', reading: 'kyakkansel', english: 'objectivity', type: 'noun', examples: [
            { jp: '客観性を保つ', en: 'to maintain objectivity' },
            { jp: '客観的な視点', en: 'objective viewpoint' }
        ]},
        { japanese: '主体性', reading: 'shutaisei', english: 'subjectivity', type: 'noun', examples: [
            { jp: '主体性を発揮する', en: 'to demonstrate subjectivity' },
            { jp: '主体的な行動', en: 'subjective action' }
        ]},
        { japanese: '妥当性', reading: 'datousei', english: 'validity', type: 'noun', examples: [
            { jp: '主張の妥当性', en: 'validity of the claim' },
            { jp: '妥当性を検証する', en: 'to verify validity' }
        ]},
        { japanese: '正当性', reading: 'seitousel', english: 'legitimacy', type: 'noun', examples: [
            { jp: '権力の正当性', en: 'legitimacy of power' },
            { jp: '正当性を主張する', en: 'to claim legitimacy' }
        ]},
        { japanese: '不可逆性', reading: 'fukagyakusel', english: 'irreversibility', type: 'noun', examples: [
            { jp: '変化の不可逆性', en: 'irreversibility of change' },
            { jp: '不可逆的な決定', en: 'irreversible decision' }
        ]},
        { japanese: '不可欠性', reading: 'fukaketsusel', english: 'indispensability', type: 'noun', examples: [
            { jp: '要素の不可欠性', en: 'indispensability of elements' },
            { jp: '不可欠な条件', en: 'indispensable condition' }
        ]},
        { japanese: '不可避性', reading: 'fukahisei', english: 'inevitability', type: 'noun', examples: [
            { jp: '運命の不可避性', en: 'inevitability of fate' },
            { jp: '不可避的な結末', en: 'inevitable ending' }
        ]},
        { japanese: '不可分性', reading: 'fukabunsei', english: 'indivisibility', type: 'noun', examples: [
            { jp: '権利の不可分性', en: 'indivisibility of rights' },
            { jp: '不可分な関係', en: 'indivisible relationship' }
        ]},
        { japanese: '無機質性', reading: 'mukishitsusei', english: 'inorganic quality', type: 'noun', examples: [
            { jp: 'デザインの無機質性', en: 'inorganic quality of design' },
            { jp: '無機質的な表現', en: 'inorganic expression' }
        ]},
        { japanese: '有機的結合', reading: 'yuukiteki ketsugou', english: 'organic combination', type: 'noun', examples: [
            { jp: '要素の有機的結合', en: 'organic combination of elements' },
            { jp: '有機的に結びつく', en: 'to organically combine' }
        ]},
        { japanese: '共時性', reading: 'kyoujisei', english: 'synchronicity', type: 'noun', examples: [
            { jp: '出来事の共時性', en: 'synchronicity of events' },
            { jp: '共時的な現象', en: 'synchronous phenomenon' }
        ]},
        { japanese: '通時性', reading: 'tsuujisei', english: 'diachronicity', type: 'noun', examples: [
            { jp: '言語の通時性', en: 'diachronicity of language' },
            { jp: '通時的な変化', en: 'diachronic change' }
        ]},
        { japanese: '同時性', reading: 'doujisei', english: 'simultaneity', type: 'noun', examples: [
            { jp: '出来事の同時性', en: 'simultaneity of events' },
            { jp: '同時的な発生', en: 'simultaneous occurrence' }
        ]},
        { japanese: '異時性', reading: 'ijisei', english: 'asynchronicity', type: 'noun', examples: [
            { jp: '現象の異時性', en: 'asynchronicity of phenomena' },
            { jp: '異時的な関係', en: 'asynchronous relationship' }
        ]},
        { japanese: '不均一性', reading: 'fukinkichisei', english: 'inhomogeneity', type: 'noun', examples: [
            { jp: '分布の不均一性', en: 'inhomogeneity of distribution' },
            { jp: '不均一な状態', en: 'inhomogeneous state' }
        ]},
        { japanese: '不均等性', reading: 'fukintousei', english: 'inequality', type: 'noun', examples: [
            { jp: '所得の不均等性', en: 'income inequality' },
            { jp: '不均等な分配', en: 'unequal distribution' }
        ]},
        { japanese: '不均衡性', reading: 'fukinkousei', english: 'imbalance', type: 'noun', examples: [
            { jp: '力関係の不均衡性', en: 'imbalance of power relations' },
            { jp: '不均衡な状態', en: 'imbalanced state' }
        ]},
        { japanese: '不確定性', reading: 'fukakuteisei', english: 'uncertainty', type: 'noun', examples: [
            { jp: '未来の不確定性', en: 'uncertainty of the future' },
            { jp: '不確定な状況', en: 'uncertain situation' }
        ]}
    ]
};

// Game state
let currentJLPTLevel = 'N5';
let currentPracticeMode = 'recognition';
let currentVocabulary = [];
let currentIndex = 0;
let score = 0;
let totalAttempts = 0;
let correctAnswers = 0;
let currentStreak = 0;

async function initializeGame() {
    setPracticeMode('recognition');
    await setJLPTLevel('N5');
}

function mapApiWord(r) {
    const meaning = r.meaning || '';
    return {
        japanese: r.japanese,
        reading: r.reading || '',
        english: (meaning.split(/[;,]/)[0] || meaning).trim() || meaning,
        englishFull: meaning,
        type: 'word',
        examples: null  // fetched lazily from /api/examples/search
    };
}

async function setJLPTLevel(level, btn) {
    currentJLPTLevel = level;

    // Update button states
    document.querySelectorAll('.level-button').forEach(b => {
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');

    document.getElementById('status').textContent = `Loading JLPT ${level} vocabulary...`;

    let list = null;
    try {
        const resp = await fetch(`${VOCAB_API_BASE}/vocab/jlpt?level=${level}&limit=60`);
        const data = await resp.json();
        if (data.success && data.vocab && data.vocab.length > 0) {
            list = data.vocab.map(mapApiWord);
        } else if (data.error) {
            console.warn('vocab API error:', data.error);
        }
    } catch (err) {
        console.warn('vocab API unreachable:', err);
    }

    if (!list) {
        list = FALLBACK_VOCABULARY[level].map(w => ({ ...w }));
        document.getElementById('status').textContent =
            `Backend unreachable - using small built-in ${level} set (${list.length} words).`;
    } else {
        document.getElementById('status').textContent =
            `JLPT ${level} vocabulary loaded (${list.length} words). Choose practice mode.`;
    }

    currentVocabulary = list;
    shuffleWords();
    updateDisplay();

    if (currentPracticeMode === 'recognition') {
        generateAnswerOptions();
    }
}

function setPracticeMode(mode, btn) {
    currentPracticeMode = mode;

    // Update button states
    document.querySelectorAll('.mode-button').forEach(b => {
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');

    // Update UI visibility
    document.getElementById('recognitionMode').style.display = mode === 'recognition' ? 'block' : 'none';
    document.getElementById('translationMode').style.display = mode === 'translation' ? 'block' : 'none';
    document.getElementById('readingMode').style.display = mode === 'reading' ? 'block' : 'none';
    document.getElementById('examplesSection').style.display = 'none';

    updateDisplay();

    if (mode === 'recognition') {
        generateAnswerOptions();
    }
}

function updateDisplay() {
    if (currentVocabulary.length === 0) return;

    const currentWord = currentVocabulary[currentIndex];

    document.getElementById('currentWord').textContent = currentWord.japanese;
    document.getElementById('reading').textContent = currentWord.reading;
    document.getElementById('english').textContent = currentWord.english;
    document.getElementById('wordInfo').textContent = `${currentJLPTLevel} - ${currentWord.type}`;
    document.getElementById('jlptIndicator').textContent = currentJLPTLevel;

    updateStats();
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = currentStreak;
    const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
}

function generateAnswerOptions() {
    if (currentVocabulary.length === 0) return;
    const currentWord = currentVocabulary[currentIndex];
    const correctAnswer = currentWord.english;

    // Get 3 wrong answers from other words
    const wrongAnswers = [];
    const otherWords = currentVocabulary.filter((_, index) => index !== currentIndex);

    while (wrongAnswers.length < 3 && otherWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        const wrongWord = otherWords.splice(randomIndex, 1)[0];

        if (wrongWord.english !== correctAnswer && !wrongAnswers.includes(wrongWord.english)) {
            wrongAnswers.push(wrongWord.english);
        }
    }

    // Combine and shuffle answers
    const allAnswers = [correctAnswer, ...wrongAnswers];
    for (let i = allAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }

    // Create answer buttons
    const answerOptions = document.getElementById('answerOptions');
    answerOptions.innerHTML = '';

    allAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'answer-button';
        button.textContent = answer;
        button.onclick = () => checkAnswer(answer, correctAnswer, button);
        answerOptions.appendChild(button);
    });
}

function checkAnswer(selectedAnswer, correctAnswer, button) {
    totalAttempts++;

    if (selectedAnswer === correctAnswer) {
        correctAnswers++;
        currentStreak++;
        score += 10;
        button.classList.add('correct');
        document.getElementById('status').textContent = 'Correct! 🎉';

        setTimeout(() => {
            nextWord();
        }, 1000);
    } else {
        currentStreak = 0;
        score = Math.max(0, score - 5);
        button.classList.add('incorrect');
        document.getElementById('status').textContent = `Incorrect. The correct answer is "${correctAnswer}"`;

        // Highlight correct answer
        const buttons = document.querySelectorAll('.answer-button');
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });

        setTimeout(() => {
            generateAnswerOptions();
        }, 2000);
    }

    updateStats();
}

function checkTranslation() {
    const input = document.getElementById('translationInput');
    const userAnswer = input.value.trim().toLowerCase();
    const currentWord = currentVocabulary[currentIndex];
    const correctAnswer = currentWord.english.toLowerCase();

    totalAttempts++;

    if (userAnswer === correctAnswer) {
        correctAnswers++;
        currentStreak++;
        score += 15;
        input.style.borderColor = '#4CAF50';
        document.getElementById('status').textContent = 'Correct! 🎉';

        setTimeout(() => {
            nextWord();
            input.value = '';
            input.style.borderColor = '#4CAF50';
        }, 1500);
    } else {
        currentStreak = 0;
        score = Math.max(0, score - 3);
        input.style.borderColor = '#f44336';
        document.getElementById('status').textContent = `Incorrect. The correct answer is "${currentWord.english}"`;
        updateStats();
    }
}

function checkReading() {
    const input = document.getElementById('readingInput');
    const userAnswer = input.value.trim().toLowerCase();
    const currentWord = currentVocabulary[currentIndex];
    const correctAnswer = currentWord.reading.toLowerCase();

    totalAttempts++;

    if (userAnswer === correctAnswer) {
        correctAnswers++;
        currentStreak++;
        score += 15;
        input.style.borderColor = '#FF6B6B';
        document.getElementById('status').textContent = 'Correct! 🎉';

        setTimeout(() => {
            nextWord();
            input.value = '';
            input.style.borderColor = '#FF6B6B';
        }, 1500);
    } else {
        currentStreak = 0;
        score = Math.max(0, score - 3);
        input.style.borderColor = '#f44336';
        document.getElementById('status').textContent = `Incorrect. The correct reading is "${currentWord.reading}"`;
        updateStats();
    }
}

function nextWord() {
    currentIndex = (currentIndex + 1) % currentVocabulary.length;
    updateDisplay();

    if (currentPracticeMode === 'recognition') {
        generateAnswerOptions();
    } else {
        // Clear input fields
        document.getElementById('translationInput').value = '';
        document.getElementById('readingInput').value = '';
        document.getElementById('translationInput').style.borderColor = '#4CAF50';
        document.getElementById('readingInput').style.borderColor = '#FF6B6B';
    }
}

function shuffleWords() {
    for (let i = currentVocabulary.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentVocabulary[i], currentVocabulary[j]] = [currentVocabulary[j], currentVocabulary[i]];
    }
    currentIndex = 0;
    updateDisplay();
}

async function showExamples() {
    if (currentVocabulary.length === 0) return;
    const currentWord = currentVocabulary[currentIndex];
    const examplesList = document.getElementById('examplesList');

    document.getElementById('examplesSection').style.display = 'block';

    // Lazy-load real Tatoeba examples for API-sourced words
    if (currentWord.examples === null) {
        examplesList.innerHTML = '<div class="example-item">Loading examples...</div>';
        try {
            const resp = await fetch(
                `${VOCAB_API_BASE}/examples/search?word=${encodeURIComponent(currentWord.japanese)}&limit=4`
            );
            const data = await resp.json();
            currentWord.examples = (data.success && data.examples)
                ? data.examples.map(e => ({ jp: e.japanese, en: e.english }))
                : [];
        } catch (err) {
            console.warn('examples fetch failed:', err);
            currentWord.examples = [];
        }
    }

    examplesList.innerHTML = '';
    if (currentWord.examples.length === 0) {
        examplesList.innerHTML =
            '<div class="example-item">No example sentences found (backend offline or none in Tatoeba).</div>';
        return;
    }
    currentWord.examples.forEach(example => {
        const exampleDiv = document.createElement('div');
        exampleDiv.className = 'example-item';

        const japaneseDiv = document.createElement('div');
        japaneseDiv.className = 'example-japanese';
        japaneseDiv.textContent = example.jp;

        const englishDiv = document.createElement('div');
        englishDiv.className = 'example-english';
        englishDiv.textContent = example.en;

        exampleDiv.appendChild(japaneseDiv);
        exampleDiv.appendChild(englishDiv);
        examplesList.appendChild(exampleDiv);
    });
}

function resetProgress() {
    score = 0;
    totalAttempts = 0;
    correctAnswers = 0;
    currentStreak = 0;
    updateStats();
    document.getElementById('status').textContent = 'Progress reset! Keep practicing!';
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initializeGame);


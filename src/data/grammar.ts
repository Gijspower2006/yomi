export type GrammarCategory = 'particles' | 'verb-forms' | 'expressions' | 'sentence-patterns';

export interface GrammarExample {
  japanese: string;
  romaji: string;
  english: string;
}

export interface GrammarPattern {
  id: string;
  title: string;
  subtitle: string;
  category: GrammarCategory;
  formula: string;
  explanation: string;
  examples: GrammarExample[];
}

export const GRAMMAR_PATTERNS: GrammarPattern[] = [
  {
    id: 'particle-wa',
    title: 'は (wa)',
    subtitle: 'Topic marker',
    category: 'particles',
    formula: '[Topic] は [Comment]',
    explanation: 'は marks what the sentence is about. It sets the topic so the listener knows what is being discussed. The topic is often something already known or established in the conversation.',
    examples: [
      { japanese: '私は学生です。', romaji: 'Watashi wa gakusei desu.', english: 'I am a student.' },
      { japanese: '猫はかわいいです。', romaji: 'Neko wa kawaii desu.', english: 'Cats are cute.' },
      { japanese: '今日は月曜日です。', romaji: 'Kyou wa getsuyoubi desu.', english: 'Today is Monday.' },
    ],
  },
  {
    id: 'particle-ga',
    title: 'が (ga)',
    subtitle: 'Subject marker',
    category: 'particles',
    formula: '[Subject] が [Verb / Adjective]',
    explanation: 'が marks the grammatical subject of a sentence, often highlighting new information or the thing doing the action. It is also used with certain verbs and adjectives that describe wants, likes, and abilities. Unlike は, が emphasizes the subject itself.',
    examples: [
      { japanese: '犬が走っています。', romaji: 'Inu ga hashitte imasu.', english: 'A dog is running.' },
      { japanese: '雨が降っています。', romaji: 'Ame ga futte imasu.', english: 'It is raining.' },
      { japanese: '私が田中です。', romaji: 'Watashi ga Tanaka desu.', english: 'I am Tanaka.' },
    ],
  },
  {
    id: 'particle-wo',
    title: 'を (wo)',
    subtitle: 'Object marker',
    category: 'particles',
    formula: '[Object] を [Verb]',
    explanation: 'を marks the direct object of a verb, meaning the thing that receives the action. It is pronounced "o" in modern Japanese. Almost every transitive verb takes を before it.',
    examples: [
      { japanese: 'りんごを食べます。', romaji: 'Ringo wo tabemasu.', english: 'I eat an apple.' },
      { japanese: '本を読みます。', romaji: 'Hon wo yomimasu.', english: 'I read a book.' },
      { japanese: '音楽を聞きます。', romaji: 'Ongaku wo kikimasu.', english: 'I listen to music.' },
    ],
  },
  {
    id: 'particle-ni',
    title: 'に (ni)',
    subtitle: 'Direction / time / location marker',
    category: 'particles',
    formula: '[Place / Time] に [Verb]',
    explanation: 'に marks a destination, a point in time, or the location where something exists. It shows where you are going, when something happens, or where someone or something is. It is one of the most versatile particles in Japanese.',
    examples: [
      { japanese: '学校に行きます。', romaji: 'Gakkou ni ikimasu.', english: 'I go to school.' },
      { japanese: '七時に起きます。', romaji: 'Shichiji ni okimasu.', english: 'I wake up at seven o\'clock.' },
      { japanese: '部屋に猫がいます。', romaji: 'Heya ni neko ga imasu.', english: 'There is a cat in the room.' },
    ],
  },
  {
    id: 'particle-de',
    title: 'で (de)',
    subtitle: 'Location of action / means marker',
    category: 'particles',
    formula: '[Place / Means] で [Verb]',
    explanation: 'で marks the place where an action takes place, or the means by which something is done. Use で when something happens at a location, as opposed to に which marks where something simply exists. It also indicates tools, transport, or methods.',
    examples: [
      { japanese: '図書館で勉強します。', romaji: 'Toshokan de benkyou shimasu.', english: 'I study at the library.' },
      { japanese: 'バスで学校に行きます。', romaji: 'Basu de gakkou ni ikimasu.', english: 'I go to school by bus.' },
      { japanese: '箸でご飯を食べます。', romaji: 'Hashi de gohan wo tabemasu.', english: 'I eat rice with chopsticks.' },
    ],
  },
  {
    id: 'particle-he',
    title: 'へ (he)',
    subtitle: 'Direction marker',
    category: 'particles',
    formula: '[Destination] へ [Movement verb]',
    explanation: 'へ marks the direction of movement and is pronounced "e." It is similar to に but focuses on direction rather than arrival. It is typically used with verbs of movement such as "go," "come," and "return."',
    examples: [
      { japanese: '東京へ行きます。', romaji: 'Toukyou e ikimasu.', english: 'I am going to Tokyo.' },
      { japanese: '家へ帰ります。', romaji: 'Ie e kaerimasu.', english: 'I return home.' },
      { japanese: '日本へようこそ。', romaji: 'Nihon e youkoso.', english: 'Welcome to Japan.' },
    ],
  },
  {
    id: 'particle-no',
    title: 'の (no)',
    subtitle: 'Possessive / noun connector',
    category: 'particles',
    formula: '[Noun A] の [Noun B]',
    explanation: 'の connects two nouns to show possession, belonging, or a descriptive relationship. Think of it like "\'s" in English or the word "of." The first noun modifies or owns the second noun.',
    examples: [
      { japanese: 'これは私の本です。', romaji: 'Kore wa watashi no hon desu.', english: 'This is my book.' },
      { japanese: '日本語の先生です。', romaji: 'Nihongo no sensei desu.', english: 'She is a Japanese teacher.' },
      { japanese: '友達の名前は田中です。', romaji: 'Tomodachi no namae wa Tanaka desu.', english: 'My friend\'s name is Tanaka.' },
    ],
  },
  {
    id: 'particle-to',
    title: 'と (to)',
    subtitle: '"And" / "with" connector',
    category: 'particles',
    formula: '[Noun A] と [Noun B] / [Person] と [Verb]',
    explanation: 'と connects two or more nouns to mean "and," or it shows who you do an action together with, meaning "with." Unlike other connectors, と links nouns exhaustively, listing all items.',
    examples: [
      { japanese: 'パンと牛乳を買います。', romaji: 'Pan to gyuunyuu wo kaimasu.', english: 'I buy bread and milk.' },
      { japanese: '友達と映画を見ます。', romaji: 'Tomodachi to eiga wo mimasu.', english: 'I watch a movie with a friend.' },
      { japanese: '母と父と私が来ました。', romaji: 'Haha to chichi to watashi ga kimashita.', english: 'My mother, father, and I came.' },
    ],
  },
  {
    id: 'particle-mo',
    title: 'も (mo)',
    subtitle: '"Also" / "too" marker',
    category: 'particles',
    formula: '[Noun] も [Comment]',
    explanation: 'も replaces は or が to mean "also" or "too," adding the marked noun to a group. It shows that the same thing applies to this noun as it did to a previously mentioned one. When used with negatives it means "either" or "neither."',
    examples: [
      { japanese: '私も学生です。', romaji: 'Watashi mo gakusei desu.', english: 'I am also a student.' },
      { japanese: '猫も犬も好きです。', romaji: 'Neko mo inu mo suki desu.', english: 'I like both cats and dogs.' },
      { japanese: '何も食べませんでした。', romaji: 'Nani mo tabemasen deshita.', english: 'I did not eat anything.' },
    ],
  },
  {
    id: 'particle-ka',
    title: 'か (ka)',
    subtitle: 'Question marker',
    category: 'particles',
    formula: '[Statement] か',
    explanation: 'か is placed at the end of a sentence to turn it into a question, similar to a question mark in English. In polite speech no question mark is needed when か is used. It can also mean "or" when placed between two options.',
    examples: [
      { japanese: 'これは本ですか。', romaji: 'Kore wa hon desu ka.', english: 'Is this a book?' },
      { japanese: 'お名前は何ですか。', romaji: 'Onamae wa nan desu ka.', english: 'What is your name?' },
      { japanese: 'コーヒーか紅茶はいかがですか。', romaji: 'Koohii ka koucha wa ikaga desu ka.', english: 'Would you like coffee or tea?' },
    ],
  },
  {
    id: 'particle-ne-yo',
    title: 'ね / よ (ne / yo)',
    subtitle: 'Sentence-final particles for nuance',
    category: 'particles',
    formula: '[Statement] ね / [Statement] よ',
    explanation: 'ね is added at the end of a sentence to seek agreement or share a feeling, like "right?" or "isn\'t it?" よ asserts information confidently, as if telling the listener something they may not know. Both soften or add emphasis to statements.',
    examples: [
      { japanese: '今日は暑いですね。', romaji: 'Kyou wa atsui desu ne.', english: 'It\'s hot today, isn\'t it?' },
      { japanese: 'これはおいしいですよ。', romaji: 'Kore wa oishii desu yo.', english: 'This is delicious, I\'m telling you.' },
      { japanese: 'あの映画は面白いですね。', romaji: 'Ano eiga wa omoshiroi desu ne.', english: 'That movie is interesting, right?' },
    ],
  },
  {
    id: 'verb-masu-masen',
    title: 'ます / ません',
    subtitle: 'Polite present / future',
    category: 'verb-forms',
    formula: '[Verb stem] ます / [Verb stem] ません',
    explanation: 'ます is added to a verb stem to make it polite and indicates a present habit, a general truth, or a future plan. ません is the negative form meaning "do not" or "will not." This form is used in most everyday polite conversation.',
    examples: [
      { japanese: '毎日日本語を勉強します。', romaji: 'Mainichi nihongo wo benkyou shimasu.', english: 'I study Japanese every day.' },
      { japanese: 'お酒を飲みません。', romaji: 'Osake wo nomimasen.', english: 'I do not drink alcohol.' },
      { japanese: '明日学校に行きます。', romaji: 'Ashita gakkou ni ikimasu.', english: 'I will go to school tomorrow.' },
    ],
  },
  {
    id: 'verb-mashita-masendeshita',
    title: 'ました / ませんでした',
    subtitle: 'Polite past',
    category: 'verb-forms',
    formula: '[Verb stem] ました / [Verb stem] ませんでした',
    explanation: 'ました is the polite past tense, meaning "did" or "have done." ませんでした is the polite negative past, meaning "did not." These forms are used to talk about completed actions in formal or polite situations.',
    examples: [
      { japanese: '昨日映画を見ました。', romaji: 'Kinou eiga wo mimashita.', english: 'I watched a movie yesterday.' },
      { japanese: '朝ご飯を食べませんでした。', romaji: 'Asagohan wo tabemasen deshita.', english: 'I did not eat breakfast.' },
      { japanese: '先週東京に行きました。', romaji: 'Senshuu Toukyou ni ikimashita.', english: 'I went to Tokyo last week.' },
    ],
  },
  {
    id: 'verb-te-iru',
    title: '～ている',
    subtitle: 'Ongoing action or resulting state',
    category: 'verb-forms',
    formula: '[Verb て-form] いる',
    explanation: 'ている describes an action currently in progress, like the English "-ing" form, or a state that is the result of a past action. Which meaning applies depends on the verb. In polite speech it becomes ています.',
    examples: [
      { japanese: '今、ご飯を食べています。', romaji: 'Ima, gohan wo tabete imasu.', english: 'I am eating now.' },
      { japanese: '彼は結婚しています。', romaji: 'Kare wa kekkon shite imasu.', english: 'He is married.' },
      { japanese: '子供が公園で遊んでいます。', romaji: 'Kodomo ga kouen de asonde imasu.', english: 'The children are playing in the park.' },
    ],
  },
  {
    id: 'verb-tai',
    title: '～たい',
    subtitle: 'Want to do',
    category: 'verb-forms',
    formula: '[Verb stem] たい',
    explanation: 'たい is attached to the verb stem to express the speaker\'s desire to do something, meaning "want to." It behaves like an i-adjective and can be conjugated to past tense or negative. It is only used for the speaker\'s own wishes.',
    examples: [
      { japanese: '日本に行きたいです。', romaji: 'Nihon ni ikitai desu.', english: 'I want to go to Japan.' },
      { japanese: '水を飲みたいです。', romaji: 'Mizu wo nomitai desu.', english: 'I want to drink water.' },
      { japanese: '新しい本を買いたいです。', romaji: 'Atarashii hon wo kaitai desu.', english: 'I want to buy a new book.' },
    ],
  },
  {
    id: 'verb-te-kudasai',
    title: '～てください',
    subtitle: 'Please do',
    category: 'verb-forms',
    formula: '[Verb て-form] ください',
    explanation: 'てください is a polite request meaning "please do." It is formed by adding ください to the て-form of a verb. This is one of the most common ways to make a polite request in everyday Japanese.',
    examples: [
      { japanese: 'ここに座ってください。', romaji: 'Koko ni suwatte kudasai.', english: 'Please sit here.' },
      { japanese: 'ゆっくり話してください。', romaji: 'Yukkuri hanashite kudasai.', english: 'Please speak slowly.' },
      { japanese: 'ドアを閉めてください。', romaji: 'Doa wo shimete kudasai.', english: 'Please close the door.' },
    ],
  },
  {
    id: 'verb-mashou',
    title: '～ましょう',
    subtitle: 'Let\'s do / Shall we',
    category: 'verb-forms',
    formula: '[Verb stem] ましょう',
    explanation: 'ましょう is used to suggest doing something together, like "let\'s" in English, or to respond to a suggestion. It expresses a shared intention or invitation. It is the volitional form of ます.',
    examples: [
      { japanese: '一緒に食べましょう。', romaji: 'Issho ni tabemashou.', english: 'Let\'s eat together.' },
      { japanese: '日本語を勉強しましょう。', romaji: 'Nihongo wo benkyou shimashou.', english: 'Let\'s study Japanese.' },
      { japanese: '少し休みましょう。', romaji: 'Sukoshi yasumimashou.', english: 'Let\'s take a little break.' },
    ],
  },
  {
    id: 'verb-te-mo-ii-desu-ka',
    title: '～てもいいですか',
    subtitle: 'May I / Is it okay to',
    category: 'verb-forms',
    formula: '[Verb て-form] もいいですか',
    explanation: 'てもいいですか is used to ask for permission to do something, meaning "May I?" or "Is it okay if I?" The response いいですよ grants permission, while だめです or ちょっと… politely refuses it.',
    examples: [
      { japanese: 'ここに座ってもいいですか。', romaji: 'Koko ni suwatte mo ii desu ka.', english: 'May I sit here?' },
      { japanese: '写真を撮ってもいいですか。', romaji: 'Shashin wo totte mo ii desu ka.', english: 'May I take a photo?' },
      { japanese: '窓を開けてもいいですか。', romaji: 'Mado wo akete mo ii desu ka.', english: 'May I open the window?' },
    ],
  },
  {
    id: 'expression-kara',
    title: '～から',
    subtitle: 'Because / from',
    category: 'expressions',
    formula: '[Reason / Starting point] から [Result / Destination]',
    explanation: 'から has two main uses: it follows a clause to give a reason, meaning "because," and it marks a starting point in time or space, meaning "from." As a reason marker it often comes after the plain or polite form of a verb or adjective.',
    examples: [
      { japanese: '疲れたから、休みます。', romaji: 'Tsukareta kara, yasumimasu.', english: 'Because I am tired, I will rest.' },
      { japanese: '九時から授業があります。', romaji: 'Kuji kara jugyou ga arimasu.', english: 'There is class from nine o\'clock.' },
      { japanese: '雨が降っているから、傘を持っていきます。', romaji: 'Ame ga futte iru kara, kasa wo motte ikimasu.', english: 'Because it is raining, I will bring an umbrella.' },
    ],
  },
  {
    id: 'expression-kedo',
    title: '～けど',
    subtitle: 'But / although',
    category: 'expressions',
    formula: '[Clause A] けど、[Clause B]',
    explanation: 'けど is a conjunction meaning "but" or "although," connecting two clauses that contrast with each other. It is the casual form of けれども and is very common in spoken Japanese. It can also soften a statement before making a request.',
    examples: [
      { japanese: '日本語は難しいけど、楽しいです。', romaji: 'Nihongo wa muzukashii kedo, tanoshii desu.', english: 'Japanese is difficult, but it is fun.' },
      { japanese: '行きたいけど、時間がありません。', romaji: 'Ikitai kedo, jikan ga arimasen.', english: 'I want to go, but I don\'t have time.' },
      { japanese: 'すみませんけど、駅はどこですか。', romaji: 'Sumimasen kedo, eki wa doko desu ka.', english: 'Excuse me, but where is the station?' },
    ],
  },
  {
    id: 'expression-yori',
    title: '～より',
    subtitle: 'Than (comparison)',
    category: 'expressions',
    formula: '[Noun A] より [Noun B] の方が [Adjective]',
    explanation: 'より means "than" and is used in comparisons to indicate the baseline you are comparing against. The item marked with より is the one being compared to, and the item marked with の方が is the one said to have more of the quality.',
    examples: [
      { japanese: '電車はバスより速いです。', romaji: 'Densha wa basu yori hayai desu.', english: 'Trains are faster than buses.' },
      { japanese: '今日は昨日より暑いです。', romaji: 'Kyou wa kinou yori atsui desu.', english: 'Today is hotter than yesterday.' },
      { japanese: '猫より犬が好きです。', romaji: 'Neko yori inu ga suki desu.', english: 'I like dogs more than cats.' },
    ],
  },
  {
    id: 'expression-no-hou-ga',
    title: '～の方が',
    subtitle: 'More than / prefer',
    category: 'expressions',
    formula: '[Noun / Verb plain form] の方が [Adjective / Verb]',
    explanation: 'の方が is used to indicate that one thing has more of a quality than another, or that you prefer one option. It often pairs with より to form a full comparison structure. On its own it can express a preference without an explicit comparison.',
    examples: [
      { japanese: '夏より冬の方が好きです。', romaji: 'Natsu yori fuyu no hou ga suki desu.', english: 'I like winter more than summer.' },
      { japanese: '歩くより電車の方が速いです。', romaji: 'Aruku yori densha no hou ga hayai desu.', english: 'Taking the train is faster than walking.' },
      { japanese: 'コーヒーより紅茶の方がいいです。', romaji: 'Koohii yori koucha no hou ga ii desu.', english: 'Tea is better than coffee.' },
    ],
  },
  {
    id: 'expression-nakereba-narimasen',
    title: '～なければなりません',
    subtitle: 'Must / have to',
    category: 'expressions',
    formula: '[Verb negative stem] なければなりません',
    explanation: 'なければなりません expresses obligation or necessity, meaning "must" or "have to." It is formed by taking the negative stem of a verb and adding なければなりません. In casual speech this is often shortened to なきゃ or なければ.',
    examples: [
      { japanese: '宿題をしなければなりません。', romaji: 'Shukudai wo shinakereba narimasen.', english: 'I must do my homework.' },
      { japanese: '早く起きなければなりません。', romaji: 'Hayaku okinareba narimasen.', english: 'I have to wake up early.' },
      { japanese: '薬を飲まなければなりません。', romaji: 'Kusuri wo nomanakereba narimasen.', english: 'I must take my medicine.' },
    ],
  },
  {
    id: 'pattern-ja-nai-desu',
    title: '[Noun] じゃないです',
    subtitle: 'Is not (noun negation)',
    category: 'sentence-patterns',
    formula: '[Noun] じゃないです / [Noun] ではありません',
    explanation: 'じゃないです is the plain negative of です, meaning "is not." It negates a noun or na-adjective predicate. The more formal version is ではありません. Both are essential for making negative statements in everyday Japanese.',
    examples: [
      { japanese: '私は先生じゃないです。', romaji: 'Watashi wa sensei ja nai desu.', english: 'I am not a teacher.' },
      { japanese: 'これは私の本じゃないです。', romaji: 'Kore wa watashi no hon ja nai desu.', english: 'This is not my book.' },
      { japanese: '彼は日本人じゃないです。', romaji: 'Kare wa nihonjin ja nai desu.', english: 'He is not Japanese.' },
    ],
  },
  {
    id: 'pattern-arimasu-imasu',
    title: '～があります / います',
    subtitle: 'There is / exists',
    category: 'sentence-patterns',
    formula: '[Place] に [Thing / Person] が あります / います',
    explanation: 'あります is used to express the existence of inanimate objects and plants, while います is used for living beings such as people and animals. Both mean "there is" or "there are." The location is marked with に.',
    examples: [
      { japanese: '机の上に本があります。', romaji: 'Tsukue no ue ni hon ga arimasu.', english: 'There is a book on the desk.' },
      { japanese: '公園に子供がいます。', romaji: 'Kouen ni kodomo ga imasu.', english: 'There are children in the park.' },
      { japanese: '冷蔵庫にジュースがあります。', romaji: 'Reizouko ni juusu ga arimasu.', english: 'There is juice in the refrigerator.' },
    ],
  },
  {
    id: 'pattern-wa-dou-desu-ka',
    title: '～はどうですか',
    subtitle: 'How about / what do you think of',
    category: 'sentence-patterns',
    formula: '[Noun] はどうですか',
    explanation: 'はどうですか is used to ask someone\'s opinion or to make a suggestion, similar to "how about" or "what do you think of." It is a polite and common way to offer something or invite feedback on a topic.',
    examples: [
      { japanese: '日本料理はどうですか。', romaji: 'Nihon ryouri wa dou desu ka.', english: 'How do you like Japanese food?' },
      { japanese: 'お茶はどうですか。', romaji: 'Ocha wa dou desu ka.', english: 'How about some tea?' },
      { japanese: '明日はどうですか。', romaji: 'Ashita wa dou desu ka.', english: 'How about tomorrow?' },
    ],
  },
  {
    id: 'pattern-to-omoimasu',
    title: '～と思います',
    subtitle: 'I think that',
    category: 'sentence-patterns',
    formula: '[Plain form clause] と思います',
    explanation: 'と思います expresses the speaker\'s opinion or belief, meaning "I think that." The clause before と must be in plain form. It is a polite and indirect way to share an opinion, which is common in Japanese communication.',
    examples: [
      { japanese: 'この本は面白いと思います。', romaji: 'Kono hon wa omoshiroi to omoimasu.', english: 'I think this book is interesting.' },
      { japanese: '明日は雨だと思います。', romaji: 'Ashita wa ame da to omoimasu.', english: 'I think it will rain tomorrow.' },
      { japanese: '彼は正しいと思います。', romaji: 'Kare wa tadashii to omoimasu.', english: 'I think he is right.' },
    ],
  },
];

export interface ScenarioSentence {
  japanese: string;
  romaji: string;
  english: string;
}

export interface Scenario {
  key: string;
  title: string;        // English
  titleJa: string;      // Japanese
  color: string;
  wordIds: string[];
  sentences: ScenarioSentence[];
}

export const SCENARIOS: Scenario[] = [
  {
    key: 'greetings',
    title: 'Greetings',
    titleJa: '挨拶',
    color: '#FF2D55',
    wordIds: [
      'exp-hajimemashite', 'exp-yoroshiku', 'exp-gomennasai', 'exp-douzo',
      'n-namae', 'n-nihon', 'n-nihongo', 'n-hito', 'n-watashi', 'n-anata',
      'n-tomodachi', 'n-kuni', 'n-gaikoku', 'n-ryuugakusei',
      'v-au', 'v-iu', 'v-hanasu', 'v-iru-be', 'v-wakaru',
      'na-genki', 'na-shiawase', 'na-shinsetsu',
      'adv-totemo', 'adv-sukoshi', 'adv-mada',
    ],
    sentences: [
      {
        japanese: 'はじめまして。わたしはアレックスです。よろしくおねがいします。',
        romaji: 'Hajimemashite. Watashi wa Alex desu. Yoroshiku onegai shimasu.',
        english: 'Nice to meet you. I\'m Alex. Pleased to meet you.',
      },
      {
        japanese: 'にほんごをすこしはなします。',
        romaji: 'Nihongo o sukoshi hanashimasu.',
        english: 'I speak a little Japanese.',
      },
      {
        japanese: 'おなまえはなんですか？',
        romaji: 'Onamae wa nan desu ka?',
        english: 'What is your name?',
      },
    ],
  },
  {
    key: 'food',
    title: 'Food & Eating',
    titleJa: '食事',
    color: '#FF6B00',
    wordIds: [
      'v-taberu', 'v-nomu', 'v-tsukuru', 'v-kau', 'v-ryouri',
      'n-gohan', 'n-pan', 'n-tamago', 'n-niku', 'n-sakana', 'n-yasai',
      'n-kudamono', 'n-mizu', 'n-ocha', 'n-koohii', 'n-juusu',
      'n-biiru', 'n-sake', 'n-resutoran', 'n-shokudou', 'n-obentou',
      'n-sushi', 'n-raamen', 'n-udon', 'n-miso', 'n-satou', 'n-shio',
      'n-asagohan', 'n-hirugohan', 'n-bangohan',
      'a-oishii', 'a-mazui', 'a-amai', 'a-karai', 'a-atsui-hot',
      'exp-itadakimasu', 'exp-gochisousama',
    ],
    sentences: [
      {
        japanese: 'すみません、このラーメンをひとつください。',
        romaji: 'Sumimasen, kono raamen o hitotsu kudasai.',
        english: 'Excuse me, one ramen please.',
      },
      {
        japanese: 'このさかなはとてもおいしいですね！',
        romaji: 'Kono sakana wa totemo oishii desu ne!',
        english: 'This fish is really delicious, isn\'t it!',
      },
      {
        japanese: 'まいあさ、たまごとパンをたべます。',
        romaji: 'Maiasa, tamago to pan o tabemasu.',
        english: 'Every morning I eat eggs and bread.',
      },
    ],
  },
  {
    key: 'shopping',
    title: 'Shopping',
    titleJa: '買い物',
    color: '#F5C518',
    wordIds: [
      'v-kau', 'v-uru', 'v-tsukau', 'v-kaimono', 'v-morau', 'v-ageru',
      'n-okane', 'n-saifu', 'n-depaato', 'n-suupaa', 'n-mise', 'n-mono',
      'n-kaban', 'n-fuku', 'n-kutsu', 'n-youfuku', 'n-shatsu',
      'n-boushi', 'n-kooto', 'n-mafuraa', 'n-tebukuro',
      'n-ten-in', 'n-okyakusan', 'n-omiyage',
      'pron-ikura', 'pron-kore', 'pron-sore', 'pron-are',
      'a-takai', 'a-yasui', 'a-ii', 'a-atarashii', 'a-kawaii',
      'na-benri', 'na-suteki', 'na-tokubetsu',
    ],
    sentences: [
      {
        japanese: 'これはいくらですか？',
        romaji: 'Kore wa ikura desu ka?',
        english: 'How much is this?',
      },
      {
        japanese: 'このかばんはすこしたかいですね。',
        romaji: 'Kono kaban wa sukoshi takai desu ne.',
        english: 'This bag is a little expensive, isn\'t it.',
      },
      {
        japanese: 'このみせはやすくてべんりです。',
        romaji: 'Kono mise wa yasukute benri desu.',
        english: 'This shop is cheap and convenient.',
      },
    ],
  },
  {
    key: 'transport',
    title: 'Getting Around',
    titleJa: '交通',
    color: '#4CC9F0',
    wordIds: [
      'v-iku', 'v-kuru', 'v-kaeru', 'v-noru', 'v-oriru', 'v-aruku',
      'v-tsuku', 'v-magaru', 'v-wataru', 'v-dekakeru', 'v-hashiru',
      'v-kakaru', 'v-matsu', 'v-ryokou',
      'n-eki', 'n-densha', 'n-basu', 'n-takushii', 'n-hikouki',
      'n-fune', 'n-kuruma', 'n-jitensha', 'n-chikatetsu', 'n-shinkansen',
      'n-kuukou', 'n-michi', 'n-kousaten', 'n-basutei',
      'n-hidari', 'n-migi', 'n-mae', 'n-ushiro', 'n-chikaku',
      'n-higashi', 'n-nishi', 'n-kita', 'n-minami', 'n-chizu',
      'pron-doko', 'pron-dochira',
    ],
    sentences: [
      {
        japanese: 'えきはどこですか？',
        romaji: 'Eki wa doko desu ka?',
        english: 'Where is the station?',
      },
      {
        japanese: 'でんしゃでじゅっぷんかかります。',
        romaji: 'Densha de juppun kakarimasu.',
        english: 'It takes ten minutes by train.',
      },
      {
        japanese: 'つぎのかどをみぎにまがってください。',
        romaji: 'Tsugi no kado o migi ni magatte kudasai.',
        english: 'Please turn right at the next corner.',
      },
    ],
  },
  {
    key: 'time',
    title: 'Time & Schedule',
    titleJa: '時間',
    color: '#C77DFF',
    wordIds: [
      'n-ima', 'n-kyou', 'n-kinou', 'n-ashita', 'n-asatte', 'n-ototoi',
      'n-asa', 'n-hiru', 'n-yoru', 'n-gozen', 'n-gogo', 'n-yuugata',
      'n-mainichi', 'n-maiasa', 'n-maiban', 'n-shuumatsu',
      'n-senshuu', 'n-konshuu', 'n-raishuu',
      'n-sengetsu', 'n-kongetsu', 'n-raigetsu',
      'n-kyonen', 'n-kotoshi', 'n-rainen', 'n-tanjoubi',
      'n-jikan', 'n-youbi', 'n-hantoshi',
      'adv-mou', 'adv-mada', 'adv-sugu', 'adv-atode',
      'adv-itsumo', 'adv-tokidoki', 'adv-taitei', 'adv-zutto',
    ],
    sentences: [
      {
        japanese: 'いまなんじですか？',
        romaji: 'Ima nanji desu ka?',
        english: 'What time is it now?',
      },
      {
        japanese: 'あしたのあさ、いっしょにべんきょうしませんか？',
        romaji: 'Ashita no asa, issho ni benkyou shimasen ka?',
        english: 'Shall we study together tomorrow morning?',
      },
      {
        japanese: 'しゅうまつはいつもうちにいます。',
        romaji: 'Shuumatsu wa itsumo uchi ni imasu.',
        english: 'I\'m always at home on weekends.',
      },
    ],
  },
  {
    key: 'school',
    title: 'School & Study',
    titleJa: '学校',
    color: '#06D6A0',
    wordIds: [
      'v-benkyou', 'v-yomu', 'v-kaku', 'v-kiku', 'v-narau', 'v-oshieru',
      'v-oboeru', 'v-wakaru', 'v-shiraberu', 'v-hajimeru', 'v-hajimaru',
      'v-owaru', 'v-renshuu', 'v-kangaeru', 'v-kotaeru',
      'n-gakkou', 'n-daigaku', 'n-koukou', 'n-sensei', 'n-gakusei',
      'n-ryuugakusei', 'n-jugyou', 'n-shukudai', 'n-shiken', 'n-benkyou',
      'n-hon', 'n-nooto', 'n-kyoukasho', 'n-jisho', 'n-enpitsu',
      'n-toshokan', 'n-mondai',
      'na-jouzu', 'na-heta', 'na-tokui', 'na-nigate',
      'a-muzukashii', 'a-yasashii', 'a-tanoshii', 'a-omoshiroi',
    ],
    sentences: [
      {
        japanese: 'にほんごのしゅくだいはむずかしいです。',
        romaji: 'Nihongo no shukudai wa muzukashii desu.',
        english: 'Japanese homework is difficult.',
      },
      {
        japanese: 'まいにちすこしずつれんしゅうするのがいいです。',
        romaji: 'Mainichi sukoshi zutsu renshuu suru no ga ii desu.',
        english: 'It\'s good to practice a little bit every day.',
      },
      {
        japanese: 'わからないことばはじしょでしらべます。',
        romaji: 'Wakaranai kotoba wa jisho de shirabemasu.',
        english: 'I look up words I don\'t understand in the dictionary.',
      },
    ],
  },
  {
    key: 'family',
    title: 'Family & Friends',
    titleJa: '家族',
    color: '#FF2D55',
    wordIds: [
      'n-kazoku', 'n-okaasan', 'n-otousan', 'n-oniisan', 'n-oneesan',
      'n-otouto', 'n-imouto', 'n-ojiisan', 'n-obaasan',
      'n-tomodachi', 'n-kodomo', 'n-hito', 'n-otona',
      'n-watashi', 'n-anata', 'n-kanojo', 'n-kare', 'n-minna',
      'v-au', 'v-hanasu', 'v-kiku', 'v-oshieru', 'v-tetsudau',
      'v-morau', 'v-ageru', 'v-kureru', 'v-asobu', 'v-sumu',
      'na-shinsetsu', 'na-genki', 'na-shiawase', 'na-daisuki', 'na-suki',
      'a-yasashii', 'a-kawaii', 'a-tanoshii',
    ],
    sentences: [
      {
        japanese: 'わたしのかぞくはよにんです。',
        romaji: 'Watashi no kazoku wa yo-nin desu.',
        english: 'My family has four people.',
      },
      {
        japanese: 'しゅうまつはともだちとあそびます。',
        romaji: 'Shuumatsu wa tomodachi to asobimasu.',
        english: 'On weekends I hang out with friends.',
      },
      {
        japanese: 'おかあさんはとてもしんせつです。',
        romaji: 'Okaasan wa totemo shinsetsu desu.',
        english: 'My mother is very kind.',
      },
    ],
  },
  {
    key: 'weather',
    title: 'Weather & Nature',
    titleJa: '天気',
    color: '#4361EE',
    wordIds: [
      'n-tenki', 'n-ame', 'n-hare', 'n-kumori', 'n-yuki', 'n-kaze',
      'n-sora', 'n-hi', 'n-tsuki', 'n-yama', 'n-umi', 'n-kawa',
      'n-hana', 'n-ki', 'n-niwa',
      'v-furu', 'v-fuku', 'v-dekakeru', 'v-sanpo',
      'a-atsui-hot', 'a-samui', 'a-suzushii', 'a-tsumetai',
      'a-ii', 'a-warui', 'a-sugoi', 'a-akai', 'a-aoi',
      'adv-totemo', 'adv-sukoshi', 'adv-chotto', 'adv-yoku', 'adv-amari',
    ],
    sentences: [
      {
        japanese: 'きょうのてんきはどうですか？',
        romaji: 'Kyou no tenki wa dou desu ka?',
        english: 'How\'s the weather today?',
      },
      {
        japanese: 'あしたはあめがふるとおもいます。',
        romaji: 'Ashita wa ame ga furu to omoimasu.',
        english: 'I think it will rain tomorrow.',
      },
      {
        japanese: 'なつはあつくて、ふゆはさむいです。',
        romaji: 'Natsu wa atsukute, fuyu wa samui desu.',
        english: 'Summer is hot, and winter is cold.',
      },
    ],
  },
];

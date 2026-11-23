import type { ExamVisualId } from "../components/ExamVisual";

export type ExamType = "suneung" | "naesin" | "hsk";
export type HskBandFilter = "전체" | "1~2급" | "3~4급" | "5~6급";

export interface ExamOption {
  label: string;
  pinyin?: string;
  reason: string;
}

export interface ExamQuestion {
  id: string;
  examType: ExamType;
  subLabel: string;
  hskBand?: "1~2급" | "3~4급" | "5~6급";
  visualId?: ExamVisualId;
  question: string;
  passage?: string;
  passagePinyin?: string;
  passageKo?: string;
  hidePinyinInitially?: boolean;
  speakText?: string;
  options: ExamOption[];
  correctIndex: number;
  explanation: string;
  isAiGenerated?: boolean;
}

export interface StudyGuidePoint {
  title: string;
  detail: string;
  example: string;
}

export const EXAM_STUDY_GUIDES: Record<ExamType, StudyGuidePoint[]> = {
  suneung: [
    {
      title: "1. ‘一 / 不’ 성조 변조 & 3성+3성",
      detail: "‘不(bù)’는 4성 앞에서 2성(bú)으로, ‘一(yī)’는 4성 앞에서 2성(yí), 1·2·3성 앞에서 4성(yì)으로 바뀝니다.",
      example: "不去(bú qù) · 不忙(bù máng) · 一个(yí gè) · 一起(yì qǐ)",
    },
    {
      title: "2. 수능 단골 비교문 ‘比’ & ‘把’자문",
      detail: "‘A 比 B + 형용사’ 뒤에는 很/非常을 쓰지 않고 차이 수량(三厘米, 一点儿)을 형용사 뒤에 둡니다. 把자문은 ‘把 + 목적어 + 동사 + 결과’ 어순!",
      example: "哥哥比我高三厘米。 · 请把窗户打开。",
    },
    {
      title: "3. 그림·안내문 핵심 (시각·길찾기·할인)",
      detail: "‘差一刻八点’=7:45(8시 15분 전), ‘八折’=20% 할인(정가의 80%), ‘满50减10’=50위안 이상 10위안 차감!",
      example: "往右拐(우회전) · 邮局的对面(우체국 맞은편)",
    },
  ],
  naesin: [
    {
      title: "1. 병음 표기 & 성조 부호 위치",
      detail: "j, q, x 뒤의 ü는 두 점 생략(ju, qu, xu). 성조는 a > o > e > i/u > ü 순이며 iu·ui는 뒤 모음에 표기!",
      example: "liú(iu→u) · guì(ui→i) · quán(a 우선)",
    },
    {
      title: "2. 의문대사 + 吗 중복 금지 & 어순",
      detail: "什么·哪儿·谁·几가 있는 문장 끝에 ‘吗’ 불가! 기본 어순은 ‘주어 + 시간 + 장소 + 동사 + 목적어’.",
      example: "你去哪儿？(⭕) · 我晚上七点在图书馆学习。",
    },
    {
      title: "3. ‘不’ vs ‘没’ & ‘二’ vs ‘两’",
      detail: "과거 행동 부정은 ‘没(没有)’. 수량(两本)·시각(两点) 앞은 ‘两’, 방 번호(二零二)·숫자 세기는 ‘二’.",
      example: "昨天我没去学校。 · 两点 · 二零二室",
    },
  ],
  hsk: [
    {
      title: "1. HSK 1~2급: ‘就’ vs ‘才’ & 동량사 ‘次’",
      detail: "시간이 짧고 빠름은 ‘就’, 늦고 오래 걸림은 ‘才’. 동작 횟수는 ‘次(再看一次)’, 칭찬 응답은 ‘哪里，哪里’.",
      example: "走路就十分钟。 · 因为…所以…",
    },
    {
      title: "2. HSK 3~4급: 결과보어 & 고정 호응",
      detail: "‘听清楚(똑똑히 듣다)’, ‘对…感兴趣(~에 흥미 있다)’, ‘越来越 + 형용사(점점 ~하다)’, ‘不但…而且…’.",
      example: "他对中国历史非常感兴趣。",
    },
    {
      title: "3. HSK 5~6급: 어법 오류(语病) & 성어",
      detail: "‘避免/防止/禁止’ 자체에 부정 뜻이 있어 뒤에 ‘不/不再’를 또 쓰면 이중부정 오류! ‘一丝不苟(매우 꼼꼼함)’ 필수.",
      example: "避免以后再发生(⭕) / 避免不再发生(❌)",
    },
  ],
};

export const EXAM_TYPE_META: Record<
  ExamType,
  { title: string; badge: string; desc: string }
> = {
  suneung: {
    title: "🎓 수능 중국어",
    badge: "대학수학능력시험 중국어Ⅰ 유형 (5지선다)",
    desc: "발음·성조 변조·한자 표기·양사·다의어·어법·독해·문화 실전 문항",
  },
  naesin: {
    title: "🏫 고교 내신",
    badge: "고등학교 중간·기말고사 유형 (5지선다)",
    desc: "병음 표기 규칙·성조 변화·조동사·어순 배열·부정문 등 내신 빈출 문항",
  },
  hsk: {
    title: "🏆 HSK 시험",
    badge: "중국어능력시험 1~6급 실전 유형 (4지선다)",
    desc: "급수별 어휘·보어·접속사 호응·성어·어법 오류(语病) 찾기 문항",
  },
};

export const EXAM_QUESTIONS: ExamQuestion[] = [
  // =========================================================
  // 1. 수능 중국어 (12문항, 5지선다)
  // =========================================================
  {
    id: "sun-1",
    examType: "suneung",
    subLabel: "발음·성조",
    question: "밑줄 친 한자의 성조가 [보기]의 ‘买’와 같은 것은?",
    passage: "[보기] 我想去超市【买】水果。",
    passagePinyin: "Wǒ xiǎng qù chāoshì mǎi shuǐguǒ.",
    passageKo: "나는 슈퍼마켓에 가서 과일을 사고 싶다.",
    hidePinyinInitially: true,
    speakText: "买",
    options: [
      {
        label: "他在网上【卖】二手书。",
        pinyin: "mài (4성 · 팔다)",
        reason: "‘卖(팔다)’는 4성(mài)입니다. ‘买(mǎi, 3성·사다)’와 글자 모양이 비슷하지만 성조와 뜻이 다릅니다.",
      },
      {
        label: "爸爸每天早上【喝】一杯茶。",
        pinyin: "hē (1성 · 마시다)",
        reason: "‘喝(마시다)’는 높고 평평하게 내는 1성(hē)이므로 3성이 아닙니다.",
      },
      {
        label: "服务员忘了【找】我零钱。",
        pinyin: "zhǎo (3성 · 거슬러 주다/찾다)",
        reason: "‘找(zhǎo)’는 [보기]의 ‘买(mǎi)’와 같은 3성입니다.",
      },
      {
        label: "弟弟正在房间里【学】汉语。",
        pinyin: "xué (2성 · 배우다)",
        reason: "‘学(배우다)’는 올라가는 소리인 2성(xué)입니다.",
      },
      {
        label: "周末我喜欢在家【看】电影。",
        pinyin: "kàn (4성 · 보다)",
        reason: "‘看(보다)’는 위에서 아래로 강하게 내리는 4성(kàn)입니다.",
      },
    ],
    correctIndex: 2,
    explanation:
      "[보기]의 ‘买(mǎi, 사다)’는 3성입니다. ③의 ‘找(zhǎo, 거슬러 주다)’ 역시 3성이므로 성조가 같습니다. 특히 ① ‘卖(mài, 팔다, 4성)’는 ‘买’와 모양이 비슷해 수능에서 자주 출제되는 함정입니다.",
  },
  {
    id: "sun-2",
    examType: "suneung",
    subLabel: "성조 변조",
    question: "다음 밑줄 친 ‘不’의 성조가 나머지 넷과 다른 것은?",
    hidePinyinInitially: true,
    options: [
      {
        label: "今天太冷了，我【不】去公园了。",
        pinyin: "bú qù (2성)",
        reason: "뒤에 4성 ‘去(qù)’가 오므로 ‘不’가 2성(bú)으로 변조합니다.",
      },
      {
        label: "这道题的答案【不】对。",
        pinyin: "bú duì (2성)",
        reason: "뒤에 4성 ‘对(duì)’가 오므로 ‘不’가 2성(bú)으로 변조합니다.",
      },
      {
        label: "他【不】是我的哥哥，是我同学。",
        pinyin: "bú shì (2성)",
        reason: "뒤에 4성 ‘是(shì)’가 오므로 ‘不’가 2성(bú)으로 변조합니다.",
      },
      {
        label: "今天周末，妈妈【不】忙。",
        pinyin: "bù máng (4성)",
        reason: "뒤에 2성 ‘忙(máng)’이 오므로 변조하지 않고 본래 성조인 4성(bù)으로 읽습니다.",
      },
      {
        label: "请【不】要在这里大声说话。",
        pinyin: "bú yào (2성)",
        reason: "뒤에 4성 ‘要(yào)’가 오므로 ‘不’가 2성(bú)으로 변조합니다.",
      },
    ],
    correctIndex: 3,
    explanation:
      "부정 부사 ‘不’의 본래 성조는 4성(bù)이지만, 뒤에 4성 글자가 오면 2성(bú)으로 바뀝니다. ①去(qù), ②对(duì), ③是(shì), ⑤要(yào)는 모두 4성이어서 ‘不’가 2성(bú)이 되지만, ④의 ‘忙(máng)’은 2성이므로 ‘不’를 원래대로 4성(bù)으로 발음합니다.",
  },
  {
    id: "sun-3",
    examType: "suneung",
    subLabel: "한자 표기",
    question: "밑줄 친 낱말의 한자 표기가 옳지 않은 것은?",
    options: [
      {
        label: "【明天】是我的生日。",
        pinyin: "míngtiān (내일)",
        reason: "‘내일’을 뜻하는 明天 표기가 정확합니다.",
      },
      {
        label: "我很喜欢吃【水果】。",
        pinyin: "shuǐguǒ (과일)",
        reason: "‘과일’을 뜻하는 水果 표기가 정확합니다.",
      },
      {
        label: "我们在【图书馆】学习吧。",
        pinyin: "túshūguǎn (도서관)",
        reason: "‘도서관’을 뜻하는 图书馆 표기가 정확합니다.",
      },
      {
        label: "这件衣服太【贵】了。",
        pinyin: "guì (비싸다)",
        reason: "‘비싸다’를 뜻하는 贵 표기가 정확합니다.",
      },
      {
        label: "谢谢你的帮助，明天【在见】！",
        pinyin: "zàijiàn (잘못된 표기: 在 → 再)",
        reason: "‘다시 만나요(안녕히 가세요)’는 ‘다시’를 뜻하는 再(zài)를 써서 ‘再见’이라고 표기해야 합니다. ‘在’는 ‘~에 있다’라는 뜻입니다.",
      },
    ],
    correctIndex: 4,
    explanation:
      "⑤의 ‘在见’은 동음이의어 함정입니다. ‘또/다시’를 의미하는 再(zài)를 사용하여 ‘再见’으로 써야 하며, ‘在(zài)’는 장소나 진행을 나타내는 글자입니다.",
  },
  {
    id: "sun-4",
    examType: "suneung",
    subLabel: "어휘·양사",
    question: "다음 문장의 빈칸에 들어갈 양사로 가장 알맞은 것은?",
    passage: "姐姐今天买了一（  ）白色的衬衫。",
    passagePinyin: "Jiějie jīntiān mǎi le yí (  ) báisè de chènshān.",
    passageKo: "언니는 오늘 하얀 셔츠 한 벌을 샀다.",
    speakText: "姐姐今天买了一件白色的衬衫。",
    options: [
      {
        label: "本 (běn)",
        reason: "‘本’은 책·공책·사전 등 묶여 있는 서적을 세는 양사입니다.",
      },
      {
        label: "张 (zhāng)",
        reason: "‘张’은 종이·표·사진·책상처럼 넓적하고 평평한 것을 셉니다.",
      },
      {
        label: "件 (jiàn)",
        reason: "‘件’은 셔츠(衬衫)·코트·스웨터 같은 상의류나 일·사건을 세는 정확한 양사입니다.",
      },
      {
        label: "双 (shuāng)",
        reason: "‘双’은 신발·양말·젓가락처럼 둘이 한 짝을 이루는 물건에 씁니다.",
      },
      {
        label: "杯 (bēi)",
        reason: "‘杯’는 물·차·커피 등 컵에 담긴 음료를 세는 양사입니다.",
      },
    ],
    correctIndex: 2,
    explanation:
      "상의(衬衫 셔츠, 毛衣 스웨터, 外套 외투)를 셀 때는 양사 ‘件(jiàn)’을 사용합니다. 참고로 바지(裤子)·치마(裙子)처럼 길거나 하의류에는 ‘条(tiáo)’를 씁니다.",
  },
  {
    id: "sun-5",
    examType: "suneung",
    subLabel: "다의어",
    question: "밑줄 친 ‘开’가 [보기]와 같은 의미(‘열다’)로 쓰인 것은?",
    passage: "[보기] 房间里有点儿闷，请帮我【开】一下门。",
    passagePinyin: "Fángjiān lǐ yǒudiǎnr mēn, qǐng bāng wǒ kāi yíxià mén.",
    passageKo: "방 안이 좀 답답하네요, 문 좀 열어 주세요.",
    speakText: "请帮我开一下窗户。",
    options: [
      {
        label: "爸爸每天【开】车去公司上班。",
        pinyin: "kāi chē (운전하다)",
        reason: "여기서의 ‘开’는 자동차·비행기 등을 ‘운전(조종)하다’라는 뜻입니다.",
      },
      {
        label: "明天下午两点在会议室【开】会。",
        pinyin: "kāi huì (회의를 열다/하다)",
        reason: "‘开会’는 ‘회의를 개최하다/회의하다’라는 의미로 쓰입니다.",
      },
      {
        label: "天黑了，快把灯【开】开吧。",
        pinyin: "kāi dēng (불을 켜다)",
        reason: "전등·에어컨 등 전기 기기 앞에서의 ‘开’는 ‘켜다’를 뜻합니다.",
      },
      {
        label: "太热了，我们【开】窗户透透气吧。",
        pinyin: "kāi chuānghu (창문을 열다)",
        reason: "창문(窗户)을 ‘열다’라는 뜻으로, [보기]의 ‘문을 열다(开门)’와 같은 의미입니다.",
      },
      {
        label: "他只是跟你【开】个玩笑，别生气。",
        pinyin: "kāi wánxiào (농담하다)",
        reason: "‘开玩笑’는 관용적으로 ‘농담하다’라는 뜻입니다.",
      },
    ],
    correctIndex: 3,
    explanation:
      "동사 ‘开(kāi)’는 목적어에 따라 ‘열다(开门/开窗户)’, ‘운전하다(开车)’, ‘켜다(开灯)’, ‘개최하다(开会)’, ‘농담하다(开玩笑)’ 등 다양한 뜻을 갖는 핵심 다의어입니다.",
  },
  {
    id: "sun-6",
    examType: "suneung",
    subLabel: "대화 추론",
    question: "대화의 빈칸에 들어갈 말로 가장 알맞은 것은?",
    passage:
      "A: 小明，星期天我们一起去打羽毛球，怎么样？\nB: 抱歉，这个星期天我要准备汉语考试，________。",
    passagePinyin:
      "A: Xiǎomíng, xīngqītiān wǒmen yìqǐ qù dǎ yǔmáoqiú, zěnmeyàng?\nB: Bàoqiàn, zhège xīngqītiān wǒ yào zhǔnbèi Hànyǔ kǎoshì, ________.",
    passageKo:
      "A: 샤오밍, 일요일에 우리 같이 배드민턴 치러 갈래?\nB: 미안해, 이번 일요일엔 중국어 시험 준비를 해야 해서 ________.",
    speakText: "抱歉，这个星期天我要准备汉语考试，恐怕去不了了。",
    options: [
      {
        label: "没问题，一定去",
        pinyin: "méi wèntí, yídìng qù",
        reason: "앞에서 ‘미안하다(抱歉)’며 시험 준비가 있다고 거절의 이유를 말했으므로 ‘문제없어, 꼭 갈게’는 모순입니다.",
      },
      {
        label: "真是太好了",
        pinyin: "zhēn shì tài hǎo le",
        reason: "‘정말 잘됐네’는 반가움이나 긍정적인 반응으로, 거절하는 맥락에 맞지 않습니다.",
      },
      {
        label: "恐怕去不了了",
        pinyin: "kǒngpà qù bu liǎo le",
        reason: "‘아마 못 갈 것 같아’라는 정중한 거절 표현으로 문맥상 가장 자연스럽습니다.",
      },
      {
        label: "当然可以",
        pinyin: "dāngrán kěyǐ",
        reason: "‘당연히 되지’는 승낙 표현이므로 ‘抱歉(미안해)’와 어울리지 않습니다.",
      },
      {
        label: "不用客气",
        pinyin: "búyòng kèqi",
        reason: "‘천만에요’는 상대의 감사 인사에 답할 때 쓰는 표현입니다.",
      },
    ],
    correctIndex: 2,
    explanation:
      "B가 ‘抱歉(미안해)’으로 시작하며 시험 준비라는 거절 사유를 밝혔으므로, ③ ‘恐怕去不了了(아마 못 갈 것 같아)’가 정답입니다. ‘V+不了(bu liǎo)’는 ‘~할 수 없다’를 뜻하는 가능보어 구문입니다.",
  },
  {
    id: "sun-7",
    examType: "suneung",
    subLabel: "상황·수 계산",
    question: "식당 계산 대화의 빈칸에 들어갈 말로 가장 알맞은 것은?",
    passage:
      "顾客：服务员，一共多少钱？\n服务员：一共九十八块。\n顾客：给您一百块。\n服务员：________。",
    passagePinyin:
      "Gùkè: Fúwùyuán, yígòng duōshao qián?\nFúwùyuán: Yígòng jiǔshíbā kuài.\nGùkè: Gěi nín yìbǎi kuài.\nFúwùyuán: ________.",
    passageKo:
      "손님: 직원분, 모두 얼마인가요?\n직원: 총 98위안입니다.\n손님: 여기 100위안 드립니다.\n직원: ________.",
    speakText: "一共九十八块。给您一百块。找您两块。",
    options: [
      {
        label: "给您八块",
        pinyin: "gěi nín bā kuài",
        reason: "100위안에서 98위안을 빼면 거스름돈은 8위안이 아니라 2위안입니다.",
      },
      {
        label: "找您两块",
        pinyin: "zhǎo nín liǎng kuài",
        reason: "‘找(거슬러 주다)’를 써서 ‘2위안 거슬러 드립니다’라는 정확한 응대입니다.",
      },
      {
        label: "再来一碗",
        pinyin: "zài lái yì wǎn",
        reason: "‘한 그릇 더 주세요’는 손님이 추가 주문할 때 쓰는 말입니다.",
      },
      {
        label: "您点什么菜",
        pinyin: "nín diǎn shénme cài",
        reason: "‘무슨 요리를 주문하시겠어요?’는 식사 전에 묻는 말입니다.",
      },
      {
        label: "便宜一点儿吧",
        pinyin: "piányi yìdiǎnr ba",
        reason: "‘좀 깎아 주세요’는 손님이 흥정할 때 쓰는 말입니다.",
      },
    ],
    correctIndex: 1,
    explanation:
      "총액 98위안(九十八块)에 손님이 100위안(一百块)을 냈으므로, 직원은 거스름돈 2위안을 돌려주며 ② ‘找您两块(2위안 거슬러 드립니다)’라고 말해야 합니다.",
  },
  {
    id: "sun-8",
    examType: "suneung",
    subLabel: "어법·비교문",
    question: "다음 중 어법상 옳은 문장은?",
    options: [
      {
        label: "今天比昨天很冷。",
        pinyin: "Jīntiān bǐ zuótiān hěn lěng.",
        reason: "‘A 比 B + 형용사’ 비교문에서는 ‘很, 非常, 真’ 같은 정도부사를 형용사 앞에 직접 쓸 수 없습니다. ‘冷得多’나 ‘更冷’을 써야 합니다.",
      },
      {
        label: "哥哥比我高三厘米。",
        pinyin: "Gēge bǐ wǒ gāo sān límǐ.",
        reason: "비교문에서 구체적 차이 수량(‘三厘米’ 3cm)은 형용사 ‘高’ 뒤에 바로 놓이므로 어법상 완벽합니다.",
      },
      {
        label: "苹果没有西瓜那么更甜。",
        pinyin: "Píngguǒ méiyǒu xīguā nàme gèng tián.",
        reason: "부정 비교문 ‘A 没有 B (那么) + 형용사’에는 부사 ‘更(더)’을 함께 쓸 수 없습니다.",
      },
      {
        label: "他跑得比我非常快。",
        pinyin: "Tā pǎo de bǐ wǒ fēicháng kuài.",
        reason: "‘比’ 비교문에서는 ‘非常’을 사용할 수 없습니다.",
      },
      {
        label: "我的汉语比他一点儿好。",
        pinyin: "Wǒ de Hànyǔ bǐ tā yìdiǎnr hǎo.",
        reason: "정도의 작은 차이를 나타내는 ‘一点儿’은 형용사 앞이 아니라 뒤(‘好一点儿’)에 와야 합니다.",
      },
    ],
    correctIndex: 1,
    explanation:
      "‘A 比 B + 형용사’ 구문에서는 ① 很·非常 등 정도부사를 쓸 수 없고, ② 구체적 차이(三厘米, 一点儿, 得多)는 반드시 형용사 뒤에 배치해야 합니다. 따라서 ② ‘哥哥比我高三厘米’가 정답입니다.",
  },
  {
    id: "sun-9",
    examType: "suneung",
    subLabel: "어법·동태조사",
    question: "대화의 빈칸에 들어갈 말로 바르게 짝지어진 것은?",
    passage: "A: 你以前去（  ）长城吗？\nB: 去（  ），那是三年前的事了。",
    passagePinyin: "A: Nǐ yǐqián qù (  ) Chángchéng ma?\nB: Qù (  ), nà shì sān nián qián de shì le.",
    passageKo: "A: 너 예전에 만리장성에 가 본 적 있니?\nB: 가 봤어, 그건 3년 전 일이야.",
    speakText: "你以前去过长城吗？去过，那是三年前的事了。",
    options: [
      {
        label: "过 / 过",
        reason: "‘以前(예전에)’과 함께 과거 경험을 묻고 답할 때는 동태조사 ‘过(guo)’를 씁니다.",
      },
      {
        label: "了 / 过",
        reason: "‘以前 ~한 적이 있니?’라는 경험 질문에는 완료의 ‘了’보다 경험의 ‘过’가 쓰입니다.",
      },
      {
        label: "着 / 了",
        reason: "‘着(zhe)’는 상태의 지속을 나타내므로 ‘가 본 적 있다’의 의미가 되지 않습니다.",
      },
      {
        label: "过 / 着",
        reason: "B의 대답도 경험 유무를 확인하는 것이므로 ‘去着’는 비문입니다.",
      },
      {
        label: "在 / 了",
        reason: "‘在’는 동작의 진행을 나타내며 동사 뒤에 붙는 조사가 아닙니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "과거의 경험(‘~한 적이 있다’)을 묻고 답할 때는 동사 뒤에 동태조사 ‘过(guo)’를 붙입니다. 질문 ‘去过…吗？’에 대한 긍정 대답 역시 ‘去过’입니다.",
  },
  {
    id: "sun-10",
    examType: "suneung",
    subLabel: "어법·把자문",
    question: "다음 빈칸에 들어갈 표현으로 어순과 어법이 옳은 것은?",
    passage: "屋里太热了，请 ________。",
    passagePinyin: "Wū lǐ tài rè le, qǐng ________.",
    passageKo: "방 안이 너무 더우니 창문 좀 열어 주세요.",
    speakText: "屋里太热了，请把窗户打开。",
    options: [
      {
        label: "把窗户打开",
        pinyin: "bǎ chuānghu dǎkāi",
        reason: "‘把 + 목적어(窗户) + 동사·결과보어(打开)’의 정확한 把자문 어순입니다.",
      },
      {
        label: "打开把窗户",
        pinyin: "dǎkāi bǎ chuānghu",
        reason: "‘把 + 목적어’는 반드시 술어 동사 ‘打开’ 앞에 위치해야 합니다.",
      },
      {
        label: "把打开窗户",
        pinyin: "bǎ dǎkāi chuānghu",
        reason: "‘把’ 바로 뒤에는 동사가 아니라 처치 대상인 목적어(窗户)가 와야 합니다.",
      },
      {
        label: "窗户把打开",
        pinyin: "chuānghu bǎ dǎkāi",
        reason: "목적어 ‘窗户’는 ‘把’ 뒤에 놓아야 합니다.",
      },
      {
        label: "把窗户打不开",
        pinyin: "bǎ chuānghu dǎ bu kāi",
        reason: "把자문은 동작의 처치·결과가 있어야 하므로 가능보어 부정형(‘打不开’)과는 결합할 수 없습니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "‘把’자문은 ‘주어 + 把 + 목적어 + 동사 + 기타 성분(보어/了 등)’의 어순을 따릅니다. 따라서 ‘把窗户打开’가 올바른 형태입니다.",
  },
  {
    id: "sun-11",
    examType: "suneung",
    subLabel: "독해·안내문",
    question: "다음 안내문을 읽고 내용과 일치하지 않는 것은?",
    passage:
      "【校园书店通知】 本周六、周日举办图书打折活动。所有中文小说一律八折，词典九折。另外，消费满一百元还送一个漂亮的笔记本。营业时间：上午九点到晚上八点。",
    passagePinyin:
      "[Xiàoyuán shūdiàn tōngzhī] Běn zhōuliù, zhōurì jǔbàn túshū dǎzhé huódòng. Suǒyǒu Zhōngwén xiǎoshuō yílǜ bāzhé, cídiǎn jiǔzhé. Lìngwài, xiāofèi mǎn yìbǎi yuán hái sòng yígè piàoliang de bǐjìběn. Yíngyè shíjiān: shàngwǔ jiǔdiǎn dào wǎnshang bādiǎn.",
    passageKo:
      "【교내 서점 공지】 이번 토·일요일 도서 할인 행사를 진행합니다. 모든 중국어 소설은 일괄 20% 할인(8折), 사전은 10% 할인(9折)됩니다. 또한 100위안 이상 구매 시 예쁜 노트를 한 권 드립니다. 영업시간: 오전 9시부터 저녁 8시까지.",
    speakText: "营业时间：上午九点到晚上八点。",
    options: [
      {
        label: "토요일과 일요일 주말 동안 할인 행사를 연다.",
        reason: "‘本周六、周日(이번 주 토·일요일)’과 일치합니다.",
      },
      {
        label: "중국어 소설은 모두 정가보다 20% 할인된다.",
        reason: "중국어의 ‘八折(bāzhé)’는 정가의 80% 가격, 즉 20% 할인을 뜻하므로 일치합니다.",
      },
      {
        label: "사전은 10% 할인된 가격으로 구매할 수 있다.",
        reason: "‘词典九折’는 정가의 90%(10% 할인)이므로 일치합니다.",
      },
      {
        label: "100위안 이상 구매하면 노트 한 권을 증정한다.",
        reason: "‘消费满一百元还送一个漂亮的笔记本’과 일치합니다.",
      },
      {
        label: "서점 영업은 저녁 6시에 마감한다.",
        reason: "안내문에는 ‘上午九点到晚上八点(오전 9시~저녁 8시)’이라고 되어 있으므로 6시 마감은 틀립니다.",
      },
    ],
    correctIndex: 4,
    explanation:
      "지문 마지막 문장에서 영업시간이 ‘오전 9시~저녁 8시(晚上八点)’라고 명시되어 있으므로 ⑤는 내용과 일치하지 않습니다. 참고로 중국식 할인 ‘八折’는 ‘20% 할인(정가의 80%)’임에 주의하세요.",
  },
  {
    id: "sun-12",
    examType: "suneung",
    subLabel: "중국 문화",
    question: "중국 문화에 대한 설명으로 옳지 않은 것은?",
    options: [
      {
        label: "춘절(春节)에 ‘福’ 자를 거꾸로 붙이는 것은 ‘복이 온다’는 뜻이다.",
        reason: "‘거꾸로(倒 dào)’와 ‘도착하다(到 dào)’의 발음이 같아 복이 도착한다는 해음 문화입니다.",
      },
      {
        label: "숫자 ‘8(八)’은 돈을 번다는 ‘发(fā)’와 발음이 비슷해 선호한다.",
        reason: "‘发财(부자가 되다)’의 发와 발음이 비슷해 최고의 행운 숫자로 여깁니다.",
      },
      {
        label: "중추절(中秋节)에는 보름달을 감상하며 월병(月饼)을 먹는다.",
        reason: "둥근 월병은 가족이 한자리에 모이는 단원(团圆)을 상징합니다.",
      },
      {
        label: "손님에게 차를 따를 때는 찻잔 끝까지 가득 채우는 것이 예의이다.",
        reason: "중국에서는 찻잔의 70~80%(七分满)만 따르는 것이 예의입니다. 가득 채우면 뜨거워 들 수 없고 ‘어서 가라’는 의미로 오해받을 수 있습니다.",
      },
      {
        label: "식사 중 밥그릇에 젓가락을 수직으로 꽂아 두면 예의에 어긋난다.",
        reason: "제사상의 향을 피우는 모습과 닮아 식탁에서 금기시됩니다.",
      },
    ],
    correctIndex: 3,
    explanation:
      "중국의 차 예절에서는 찻잔을 가득 채우지 않고 7~80% 정도만 채워(七分满) 차의 향을 즐기고 손님이 잔을 잡기 편하게 배려하는 것이 예의입니다.",
  },

  // =========================================================
  // 2. 고교 내신 중국어 (12문항, 5지선다)
  // =========================================================
  {
    id: "nae-1",
    examType: "naesin",
    subLabel: "병음 표기 규칙",
    question: "다음 중 한어병음 표기법이 옳은 것은?",
    hidePinyinInitially: true,
    options: [
      {
        label: "jǜ (거주하다 居)",
        reason: "‘j, q, x’ 뒤에 ‘ü’가 올 때는 위의 두 점(¨)을 생략하여 ‘jù’로 써야 합니다.",
      },
      {
        label: "qüán (전부 全)",
        reason: "‘q’ 뒤에 ‘ü’가 오므로 두 점을 빼고, 성조 부호는 모음 우선순위(a>o>e>i>u>ü)에 따라 ‘a’ 위에 붙여 ‘quán’으로 씁니다.",
      },
      {
        label: "liú (머무르다 留)",
        reason: "‘i’와 ‘u’가 결합한 ‘iu’에서는 성조 부호를 뒤에 오는 모음인 ‘u’ 위에 표기하므로 ‘liú’가 맞습니다.",
      },
      {
        label: "gùi (비싸다 贵)",
        reason: "‘u’와 ‘i’가 결합한 ‘ui’에서는 성조 부호를 뒤 모음 ‘i’ 위에 붙여 ‘guì’로 표기해야 합니다.",
      },
      {
        label: "xǚ (허락하다 许)",
        reason: "‘x’ 뒤에서도 ‘ü’의 두 점을 생략하여 ‘xǔ’로 표기해야 합니다.",
      },
    ],
    correctIndex: 2,
    explanation:
      "① ‘j, q, x’ 뒤의 ‘ü’는 두 점을 생략합니다(ju, qu, xu). ② ‘iu’와 ‘ui’가 결합할 때는 항상 뒤에 오는 모음 위에 성조를 표기합니다(liú, guì). 따라서 ③ ‘liú’만 올바른 표기입니다.",
  },
  {
    id: "nae-2",
    examType: "naesin",
    subLabel: "성조 부호 위치",
    question: "한어병음의 성조 부호 위치가 잘못된 것은?",
    hidePinyinInitially: true,
    options: [
      {
        label: "hǎo (좋다 好)",
        reason: "모음 ‘a, o’ 중 ‘a’의 우선순위가 가장 높으므로 ‘a’ 위에 표기한 것이 맞습니다.",
      },
      {
        label: "duì (맞다 对)",
        reason: "‘ui’ 결합에서는 뒤 모음인 ‘i’ 위에 표기하며 이때 ‘i’ 위의 점은 지웁니다. 올바른 표기입니다.",
      },
      {
        label: "jiāo (가르치다 教)",
        reason: "‘i, a, o’ 중 ‘a’가 최우선 순위이므로 ‘a’ 위에 표기한 것이 맞습니다.",
      },
      {
        label: "xiè (감사하다 谢)",
        reason: "‘i, e’ 중 ‘e’가 우선순위가 높으므로 ‘e’ 위에 표기한 것이 맞습니다.",
      },
      {
        label: "mìao (절 庙)",
        reason: "‘i, a, o’가 함께 있을 때는 모음 우선순위(a > o > e > i > u > ü)에 따라 ‘a’ 위에 표기해 ‘miào’라고 써야 합니다.",
      },
    ],
    correctIndex: 4,
    explanation:
      "성조 부호는 ‘a → o → e → i/u(뒤쪽 모음) → ü’ 순서로 표기합니다. ⑤의 ‘mìao’는 ‘i’가 아니라 ‘a’ 위에 4성을 표기해 ‘miào’로 써야 합니다.",
  },
  {
    id: "nae-3",
    examType: "naesin",
    subLabel: "‘一’의 성조 변화",
    question: "밑줄 친 ‘一’의 성조가 나머지 넷과 다른 것은?",
    hidePinyinInitially: true,
    options: [
      {
        label: "桌子上放着【一】个苹果。",
        pinyin: "yí gè (2성)",
        reason: "뒤에 4성 ‘个(gè)’가 오므로 ‘一’가 2성(yí)으로 변조합니다.",
      },
      {
        label: "我只吃完了【一】半。",
        pinyin: "yí bàn (2성)",
        reason: "뒤에 4성 ‘半(bàn)’이 오므로 ‘一’가 2성(yí)으로 변조합니다.",
      },
      {
        label: "明天我【一】定早点儿来。",
        pinyin: "yí dìng (2성)",
        reason: "뒤에 4성 ‘定(dìng)’이 오므로 ‘一’가 2성(yí)으로 변조합니다.",
      },
      {
        label: "我们【一】起去图书馆吧。",
        pinyin: "yì qǐ (4성)",
        reason: "뒤에 3성 ‘起(qǐ)’가 오므로 ‘一’가 4성(yì)으로 변조합니다.",
      },
      {
        label: "这件和那件颜色【一】样。",
        pinyin: "yí yàng (2성)",
        reason: "뒤에 4성 ‘样(yàng)’이 오므로 ‘一’가 2성(yí)으로 변조합니다.",
      },
    ],
    correctIndex: 3,
    explanation:
      "‘一(yī)’는 4성 앞에서는 2성(yí), 1·2·3성 앞에서는 4성(yì)으로 바뀝니다. ④ ‘一起’는 뒤의 ‘起(qǐ)’가 3성이므로 ‘yì qǐ’(4성)가 되고, 나머지는 모두 뒤가 4성이어서 2성(yí)으로 읽습니다.",
  },
  {
    id: "nae-4",
    examType: "naesin",
    subLabel: "조동사",
    question: "빈칸에 들어갈 조동사로 가장 알맞은 것은?",
    passage: "我哥哥学过三年汉语，他（  ）说一点儿汉语。",
    passagePinyin: "Wǒ gēge xué guo sān nián Hànyǔ, tā (  ) shuō yìdiǎnr Hànyǔ.",
    passageKo: "우리 형은 중국어를 3년 배워서 중국어를 조금 말할 줄 안다.",
    speakText: "我哥哥学过三年汉语，他会说一点儿汉语。",
    options: [
      {
        label: "会 (huì)",
        reason: "‘会’는 학습·연습을 통해 익힌 능력(‘~할 줄 알다’)을 나타내므로 ‘3년간 배워 할 줄 안다’와 가장 어울립니다.",
      },
      {
        label: "要 (yào)",
        reason: "‘要’는 ‘~하려고 하다, 필요하다’라는 뜻으로, 배워서 얻은 능력을 뜻하지 않습니다.",
      },
      {
        label: "必须 (bìxū)",
        reason: "‘必须’는 ‘반드시 ~해야 한다’라는 의무 표현입니다.",
      },
      {
        label: "应该 (yīnggāi)",
        reason: "‘应该’은 ‘마땅히 ~해야 한다’라는 조언·당위를 나타냅니다.",
      },
      {
        label: "愿意 (yuànyì)",
        reason: "‘愿意’는 ‘기꺼이 ~하고자 한다’라는 의향 표현입니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "배워서 습득한 기술이나 언어 능력을 말할 때는 조동사 ‘会(huì)’를 씁니다. 따라서 ‘会说汉语(중국어를 말할 줄 안다)’가 정답입니다.",
  },
  {
    id: "nae-5",
    examType: "naesin",
    subLabel: "의문문 어법",
    question: "다음 중 어법상 틀린 문장은?",
    options: [
      {
        label: "你叫什么名字？",
        pinyin: "Nǐ jiào shénme míngzi?",
        reason: "의문대사 ‘什么(무엇)’을 쓴 바른 특수의문문입니다.",
      },
      {
        label: "今天星期几？",
        pinyin: "Jīntiān xīngqī jǐ?",
        reason: "의문대사 ‘几(몇)’을 사용해 요일을 묻는 바른 문장입니다.",
      },
      {
        label: "周末你想去哪儿吗？",
        pinyin: "Zhōumò nǐ xiǎng qù nǎr ma?",
        reason: "의문대사(‘哪儿 어디’)가 들어간 문장 끝에는 의문 조사 ‘吗’를 중복해서 쓸 수 없습니다! ‘你想去哪儿？’로 써야 합니다.",
      },
      {
        label: "你妹妹是高中生吗？",
        pinyin: "Nǐ mèimei shì gāozhōngshēng ma?",
        reason: "의문대사가 없으므로 문장 끝에 ‘吗’를 붙여 예/아니오 의문문을 만든 바른 문장입니다.",
      },
      {
        label: "这本词典多少钱？",
        pinyin: "Zhè běn cídiǎn duōshao qián?",
        reason: "의문대사 ‘多少(얼마)’를 쓴 바른 의문문입니다.",
      },
    ],
    correctIndex: 2,
    explanation:
      "‘什么(무엇), 谁(누구), 哪儿(어디), 几(몇), 怎么(어떻게)’ 같은 의문대사가 포함된 문장에는 문장 끝에 ‘吗’를 붙이지 않는 것이 내신 필수 어법입니다.",
  },
  {
    id: "nae-6",
    examType: "naesin",
    subLabel: "‘二’와 ‘两’ 구별",
    question: "빈칸에 들어갈 말이 순서대로 바르게 짝지어진 것은?",
    passage: "现在（  ）点钟，我买了（  ）本中文书，住在（  ）零二室。",
    passagePinyin:
      "Xiànzài (  ) diǎnzhōng, wǒ mǎi le (  ) běn Zhōngwén shū, zhù zài (  ) líng èr shì.",
    passageKo: "지금 2시이고, 나는 중국어 책 2권을 샀으며, 202호에 산다.",
    speakText: "现在两点钟，我买了两本中文书，住在二零二室。",
    options: [
      {
        label: "两 - 两 - 二",
        reason: "시각(‘两点’ 2시)과 양사 앞 수량(‘两本’ 2권)은 ‘两’, 방 호수 숫자를 하나씩 읽는 ‘202호(二零二室)’는 ‘二’를 씁니다.",
      },
      {
        label: "二 - 两 - 二",
        reason: "시각 ‘2시’는 ‘二点’이 아니라 ‘两点’이라고 말합니다.",
      },
      {
        label: "两 - 二 - 二",
        reason: "양사 ‘本’ 앞에서 수량 ‘2’를 나타낼 때는 ‘二本’이 아니라 ‘两本’을 씁니다.",
      },
      {
        label: "二 - 二 - 两",
        reason: "시각과 양사 앞에는 ‘两’, 번호 읽기에는 ‘二’를 쓰므로 정반대입니다.",
      },
      {
        label: "两 - 两 - 两",
        reason: "호수나 전화번호처럼 숫자를 차례로 읽을 때는 ‘两’ 대신 ‘二’를 씁니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "‘两(liǎng)’은 시각(两点)과 양사 앞 수량(两本, 两个人)에 쓰이고, ‘二(èr)’는 1·2·3 순서 세기, 전화번호·방 번호(二零二室), 소수·분수에 쓰입니다.",
  },
  {
    id: "nae-7",
    examType: "naesin",
    subLabel: "어순 배열",
    question: "“나는 오늘 저녁 7시에 도서관에서 중국어를 공부할 것이다.”를 바르게 옮긴 것은?",
    options: [
      {
        label: "我学习汉语今天晚上七点在图书馆。",
        reason: "시간과 장소 부사어는 동사(‘学习’) 뒤에 놓을 수 없습니다.",
      },
      {
        label: "我在图书馆今天晚上七点学习汉语。",
        reason: "시간 표현(‘今天晚上七点’)은 보통 장소 표현(‘在图书馆’)보다 앞에 옵니다.",
      },
      {
        label: "我今天晚上七点在图书馆学习汉语。",
        pinyin: "Wǒ jīntiān wǎnshang qīdiǎn zài túshūguǎn xuéxí Hànyǔ.",
        reason: "‘주어(我) + 시간(今天晚上七点) + 장소(在图书馆) + 동사(学习) + 목적어(汉语)’의 표준 어순입니다.",
      },
      {
        label: "今天晚上七点在图书馆学习汉语我。",
        reason: "주어 ‘我’가 문장 맨 끝에 놓여 비문입니다.",
      },
      {
        label: "我今天晚上七点学习汉语在图书馆。",
        reason: "장소 전치사구(‘在图书馆’)는 반드시 동사 앞에 위치해야 합니다.",
      },
    ],
    correctIndex: 2,
    explanation:
      "중국어 기본 어순은 ‘주어 + 시간 + 장소 + 동사 + 목적어’입니다. 한국어와 달리 동사가 목적어 앞에 오고, 시간·장소는 동사 앞에 배치됩니다.",
  },
  {
    id: "nae-8",
    examType: "naesin",
    subLabel: "어기조사",
    question: "빈칸에 들어갈 어기조사로 가장 알맞은 것은?",
    passage: "A: 我是高中生，你（  ）？\nB: 我也是高中生。",
    passagePinyin: "A: Wǒ shì gāozhōngshēng, nǐ (  )?\nB: Wǒ yě shì gāozhōngshēng.",
    passageKo: "A: 나는 고등학생이야, 너는?\nB: 나도 고등학생이야.",
    speakText: "我是高中生，你呢？",
    options: [
      {
        label: "吗 (ma)",
        reason: "‘吗’는 문장 전체의 참/거짓을 묻는 말로, ‘너는?’처럼 생략해 되묻는 데는 쓰지 않습니다.",
      },
      {
        label: "呢 (ne)",
        reason: "앞 문장의 맥락을 받아 ‘너는 어때?(你呢？)’라고 간략히 되묻는 조사입니다.",
      },
      {
        label: "吧 (ba)",
        reason: "‘吧’는 권유(‘~하자’)나 추측(‘~겠지’)을 나타냅니다.",
      },
      {
        label: "了 (le)",
        reason: "‘了’는 변화나 완료를 나타내는 조사로 의문 되묻기에 쓰이지 않습니다.",
      },
      {
        label: "的 (de)",
        reason: "‘的’는 주로 관형어나 소유 관계를 연결하는 구조조사입니다.",
      },
    ],
    correctIndex: 1,
    explanation:
      "앞선 내용과 연결해 명사나 대명사 뒤에 붙여 ‘~는(은)요?’라고 되물을 때는 어기조사 ‘呢(ne)’를 씁니다.",
  },
  {
    id: "nae-9",
    examType: "naesin",
    subLabel: "시간 표현",
    question: "질문과 대답의 짝이 가장 어색한 것은?",
    options: [
      {
        label: "A: 现在几点？  B: 现在八点半。",
        pinyin: "지금 몇 시야? / 지금 8시 반이야.",
        reason: "시각을 묻고 답하는 자연스러운 대화입니다.",
      },
      {
        label: "A: 你每天运动多长时间？  B: 两个小时。",
        pinyin: "매일 운동을 얼마나 오래 해? / 2시간 해.",
        reason: "시간의 길이(‘多长时间’)에 대해 ‘2시간(两个小时)’으로 알맞게 답했습니다.",
      },
      {
        label: "A: 今天几月几号？  B: 今天五月五号。",
        pinyin: "오늘 몇 월 며칠이야? / 5월 5일이야.",
        reason: "날짜를 묻고 답하는 자연스러운 대화입니다.",
      },
      {
        label: "A: 你早上几点起床？  B: 我六个半小时起床。",
        pinyin: "아침 몇 시에 일어나? / 나는 6시간 반에 일어나.",
        reason: "‘几点(몇 시)’은 시각(点)을 묻는 말이므로 ‘六点半(6시 반)’으로 답해야 합니다. ‘六个半小时(6시간 반)’는 시간의 양(동안)이므로 틀렸습니다.",
      },
      {
        label: "A: 明天星期几？  B: 明天星期三。",
        pinyin: "내일 무슨 요일이야? / 수요일이야.",
        reason: "요일을 묻고 답하는 자연스러운 대화입니다.",
      },
    ],
    correctIndex: 3,
    explanation:
      "중국어에서 시각(‘~시’)은 ‘点(diǎn)’을 쓰고, 경과한 시간의 양(‘~시간’)은 ‘个小时(ge xiǎoshí)’를 씁니다. 따라서 ‘几点’에 ‘小时’로 답한 ④가 어색합니다.",
  },
  {
    id: "nae-10",
    examType: "naesin",
    subLabel: "부정 부사 不·没",
    question: "빈칸에 들어갈 부정 부사로 가장 알맞은 것은?",
    passage: "昨天我（  ）去学校，因为身体不太舒服。",
    passagePinyin: "Zuótiān wǒ (  ) qù xuéxiào, yīnwèi shēntǐ bú tài shūfu.",
    passageKo: "어제 몸이 별로 좋지 않아서 학교에 가지 않았다.",
    speakText: "昨天我没去学校，因为身体不太舒服。",
    options: [
      {
        label: "没 (méi)",
        reason: "‘昨天(어제)’처럼 과거에 어떤 동작을 하지 않았음을 부정할 때는 ‘没(没有)’를 써야 합니다.",
      },
      {
        label: "不 (bù)",
        reason: "‘不’는 현재·미래의 의지나 일반적인 습관을 부정할 때 쓰며, 과거 사실의 부정에는 ‘没’를 씁니다.",
      },
      {
        label: "别 (bié)",
        reason: "‘别’은 ‘~하지 마라’라는 금지 명령에 쓰입니다.",
      },
      {
        label: "无 (wú)",
        reason: "‘无’는 서면어 한자어에서 ‘없다’로 쓰이며 일반 동사 부정에 단독으로 쓰이지 않습니다.",
      },
      {
        label: "非 (fēi)",
        reason: "‘非’는 부정 접두사로 일반 동사 과거 부정에는 쓰지 않습니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "과거의 동작이나 사건이 실현되지 않았음(‘~하지 않았다’)을 부정할 때는 항상 ‘没(没有)’를 사용합니다.",
  },
  {
    id: "nae-11",
    examType: "naesin",
    subLabel: "형용사 술어문",
    question: "“오늘 날씨가 매우 춥습니다.”를 가장 자연스럽게 옮긴 것은?",
    options: [
      {
        label: "今天天气很冷。",
        pinyin: "Jīntiān tiānqì hěn lěng.",
        reason: "형용사 술어문에서는 대조·비교가 아니면 형용사 앞에 ‘很’을 붙여 ‘주어 + 很 + 형용사’ 형태로 말합니다.",
      },
      {
        label: "今天天气是冷。",
        reason: "중국어 형용사는 그 자체로 술어가 될 수 있으므로 동사 ‘是’를 붙이지 않습니다.",
      },
      {
        label: "今天天气有冷。",
        reason: "‘有’는 소유나 존재(‘있다’)를 나타내는 동사이므로 형용사 앞에 쓸 수 없습니다.",
      },
      {
        label: "今天天气在冷。",
        reason: "‘在’는 장소나 진행을 나타내며 형용사 술어문에는 쓰지 않습니다.",
      },
      {
        label: "今天很天气冷。",
        reason: "정도부사 ‘很’은 명사(‘天气’) 앞이 아니라 형용사(‘冷’) 바로 앞에 와야 합니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "중국어 형용사 술어문에는 ‘是’를 쓰지 않으며, 문장의 균형을 위해 보통 형용사 앞에 ‘很’을 붙입니다(오늘 날씨 매우 춥다 → 今天天气很冷).",
  },
  {
    id: "nae-12",
    examType: "naesin",
    subLabel: "길 묻기 회화",
    question: "다음 대화의 빈칸에 가장 알맞은 응답은?",
    passage: "A: 请问，洗手间在哪儿？\nB: 一直往前走，________。",
    passagePinyin: "A: Qǐngwèn, xǐshǒujiān zài nǎr?\nB: Yìzhí wǎng qián zǒu, ________.",
    passageKo: "A: 실례지만 화장실이 어디에 있나요?\nB: 쭉 앞으로 가다가 ________.",
    speakText: "一直往前走，往左拐就到了。",
    options: [
      {
        label: "往左拐就到了",
        pinyin: "wǎng zuǒ guǎi jiù dào le",
        reason: "‘왼쪽으로 도시면 바로 나와요’라는 길 안내 이어짐으로 가장 자연스럽습니다.",
      },
      {
        label: "我也不知道你是谁",
        pinyin: "wǒ yě bù zhīdào nǐ shì shéi",
        reason: "‘나도 네가 누군지 몰라’는 상황과 무관한 엉뚱한 대답입니다.",
      },
      {
        label: "洗手间很干净",
        pinyin: "xǐshǒujiān hěn gānjìng",
        reason: "‘화장실이 매우 깨끗해요’는 위치를 묻는 질문(‘在哪儿’)에 대한 답이 아닙니다.",
      },
      {
        label: "请给我一杯水",
        pinyin: "qǐng gěi wǒ yì bēi shuǐ",
        reason: "‘물 한 잔 주세요’는 식당 주문 표현입니다.",
      },
      {
        label: "坐地铁大概十分钟",
        pinyin: "zuò dìtiě dàgài shí fēnzhōng",
        reason: "앞에서 ‘쭉 걸어가다가(一直往前走)’라고 안내했으므로 갑자기 지하철 10분은 어색합니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "‘一直往前走(쭉 앞으로 가다가)’ 뒤에는 방향 전환이나 도착 표현인 ‘往左/右拐就到了(왼쪽/오른쪽으로 돌면 바로 도착해요)’가 이어집니다.",
  },

  // =========================================================
  // 3. HSK 시험 (12문항, 4지선다: 1~2급 / 3~4급 / 5~6급)
  // =========================================================
  {
    id: "hsk-1",
    examType: "hsk",
    subLabel: "HSK 1~2급 · 동량사",
    hskBand: "1~2급",
    question: "[HSK 2급] 빈칸에 들어갈 말로 가장 알맞은 것은?",
    passage: "这本书很有意思，我想再看一（  ）。",
    passagePinyin: "Zhè běn shū hěn yǒuyìsi, wǒ xiǎng zài kàn yí (  ).",
    passageKo: "이 책은 정말 재미있어서 한 번 더 보고 싶다.",
    speakText: "这本书很有意思，我想再看一次。",
    options: [
      {
        label: "次 (cì)",
        reason: "‘次’는 동작의 횟수(‘한 번, 두 번’)를 세는 동량사로 ‘再看一次(한 번 더 보다)’가 자연스럽습니다.",
      },
      {
        label: "个 (gè)",
        reason: "‘个’는 사람이나 일반 사물을 세는 명량사로, 동작 횟수 ‘보다(看)’ 뒤에는 쓰지 않습니다.",
      },
      {
        label: "岁 (suì)",
        reason: "‘岁’는 나이를 세는 단위(‘~살’)입니다.",
      },
      {
        label: "块 (kuài)",
        reason: "‘块’는 화폐 단위(‘위안’)나 덩어리를 셉니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "동작이 일어난 횟수를 나타낼 때는 동량사 ‘次(cì)’ 또는 ‘遍(biàn)’을 사용합니다. ‘再 + 동사 + 一次’는 ‘다시 한 번 ~하다’라는 HSK 2급 필수 표현입니다.",
  },
  {
    id: "hsk-2",
    examType: "hsk",
    subLabel: "HSK 1~2급 · 부사 就/才",
    hskBand: "1~2급",
    question: "[HSK 2급] 대화의 빈칸에 들어갈 부사로 가장 알맞은 것은?",
    passage: "A: 你家离学校远吗？\nB: 不远，走路（  ）十分钟。",
    passagePinyin: "A: Nǐ jiā lí xuéxiào yuǎn ma?\nB: Bù yuǎn, zǒulù (  ) shí fēnzhōng.",
    passageKo: "A: 네 집은 학교에서 머니?\nB: 멀지 않아, 걸어서 고작 10분 걸려.",
    speakText: "不远，走路就十分钟。",
    options: [
      {
        label: "就 (jiù)",
        reason: "‘不远(멀지 않다)’이라는 맥락이므로 시간·거리가 짧고 빠름을 강조하는 ‘就(고작/겨우 ~밖에)’가 정답입니다.",
      },
      {
        label: "才 (cái)",
        reason: "‘才’는 시간이 예상보다 늦거나 오래 걸렸음을 강조할 때 쓰므로 ‘멀지 않다’와 어울리지 않습니다.",
      },
      {
        label: "都 (dōu)",
        reason: "‘都’는 ‘모두’ 또는 ‘이미’의 뜻으로 여기서 10분의 짧음을 강조하지 못합니다.",
      },
      {
        label: "还 (hái)",
        reason: "‘还’는 ‘아직, 게다가’의 뜻으로 시간량 앞의 어감과 맞지 않습니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "부사 ‘就’는 시간이 짧고 일찍·빨리 이루어짐을 강조하고, ‘才’는 시간이 오래 걸리고 늦게 이루어짐을 강조합니다. 집이 멀지 않다고 했으므로 ‘就’가 맞습니다.",
  },
  {
    id: "hsk-3",
    examType: "hsk",
    subLabel: "HSK 1~2급 · 접속사",
    hskBand: "1~2급",
    question: "[HSK 2급] 뒤의 ‘所以’와 호응하여 빈칸에 들어갈 말은?",
    passage: "（  ）今天下雨，所以我没有去公园。",
    passagePinyin: "(  ) jīntiān xiàyǔ, suǒyǐ wǒ méiyǒu qù gōngyuán.",
    passageKo: "오늘 비가 왔기 때문에 공원에 가지 않았다.",
    speakText: "因为今天下雨，所以我没有去公园。",
    options: [
      {
        label: "因为 (yīnwèi)",
        reason: "원인과 결과를 잇는 고정 구문 ‘因为…所以…(~때문에 …그래서 ~하다)’의 짝입니다.",
      },
      {
        label: "虽然 (suīrán)",
        reason: "‘虽然(비록 ~이지만)’은 뒤에 역접 접속사 ‘但是(그러나)’와 호응합니다.",
      },
      {
        label: "如果 (rúguǒ)",
        reason: "‘如果(만약 ~라면)’는 조건 가정으로 보통 ‘就’와 호응합니다.",
      },
      {
        label: "但是 (dànshì)",
        reason: "‘但是(그러나)’는 뒷절에 오는 역접 접속사입니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "중국어 문장은 접속사끼리 짝을 이루는 호응 관계가 매우 중요합니다. ‘因为(원인) ~ 所以(결과)’, ‘虽然(양보) ~ 但是(전환)’을 반드시 함께 익혀야 합니다.",
  },
  {
    id: "hsk-4",
    examType: "hsk",
    subLabel: "HSK 1~2급 · 겸손 응답",
    hskBand: "1~2급",
    question: "[HSK 2급] 상대의 칭찬에 대한 응답으로 가장 알맞은 것은?",
    passage: "A: 你的汉语说得真好！\nB: ________，我还要继续努力。",
    passagePinyin: "A: Nǐ de Hànyǔ shuō de zhēn hǎo!\nB: ________, wǒ hái yào jìxù nǔlì.",
    passageKo: "A: 중국어를 정말 잘하시네요!\nB: ________, 아직 더 노력해야 해요.",
    speakText: "哪里，哪里，我还要继续努力。",
    options: [
      {
        label: "哪里，哪里 (nǎlǐ, nǎlǐ)",
        reason: "상대의 칭찬에 겸손하게 ‘아니에요, 별말씀을요’라고 답할 때 쓰는 대표 관용 표현입니다.",
      },
      {
        label: "没关系 (méi guānxi)",
        reason: "‘괜찮아요’는 상대가 ‘对不起(미안해요)’라고 사과할 때 답하는 말입니다.",
      },
      {
        label: "不客气 (bú kèqi)",
        reason: "‘천만에요’는 상대가 ‘谢谢(고마워요)’라고 감사할 때 쓰는 응답입니다.",
      },
      {
        label: "没问题 (méi wèntí)",
        reason: "‘문제없어요’는 부탁이나 제안을 수락할 때 씁니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "칭찬에 대한 관용적 겸양 표현은 ‘哪里，哪里(별말씀을요)’입니다. 사과→没关系, 감사→不客气, 칭찬→哪里哪里를 구별하세요.",
  },
  {
    id: "hsk-5",
    examType: "hsk",
    subLabel: "HSK 3~4급 · 결과보어",
    hskBand: "3~4급",
    question: "[HSK 3급] 문맥상 빈칸에 들어갈 결과보어로 가장 알맞은 것은?",
    passage: "声音太小了，我没听（  ），请再说一遍。",
    passagePinyin: "Shēngyīn tài xiǎo le, wǒ méi tīng (  ), qǐng zài shuō yíbiàn.",
    passageKo: "소리가 너무 작아서 잘 못 들었어요, 다시 한 번 말씀해 주세요.",
    speakText: "声音太小了，我没听清楚，请再说一遍。",
    options: [
      {
        label: "清楚 (qīngchu)",
        reason: "‘听清楚’는 ‘똑똑히·분명하게 듣다’라는 결과보어로, 소리가 작아 못 알아들은 맥락과 딱 맞습니다.",
      },
      {
        label: "干净 (gānjìng)",
        reason: "‘干净(깨끗하다)’은 ‘洗干净(깨끗이 씻다)’처럼 청소·세탁 동사 뒤에 씁니다.",
      },
      {
        label: "饱 (bǎo)",
        reason: "‘饱(배부르다)’는 ‘吃饱(배불리 먹다)’처럼 먹다 동사 뒤에 씁니다.",
      },
      {
        label: "完 (wán)",
        reason: "‘听完’은 ‘끝까지 다 듣다’이므로 소리가 작아서 못 알아들었다는 이유와 맞지 않습니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "결과보어는 ‘동사 + 결과(형용사/동사)’로 동작의 결과를 나타냅니다. ‘看清楚(분명히 보다)’, ‘听清楚(똑똑히 듣다)’는 HSK 3·4급 단골 표현입니다.",
  },
  {
    id: "hsk-6",
    examType: "hsk",
    subLabel: "HSK 3~4급 · 전치사 호응",
    hskBand: "3~4급",
    question: "[HSK 3급] 빈칸에 들어갈 전치사(개사)로 알맞은 것은?",
    passage: "他（  ）中国历史非常感兴趣，读了很多相关的书。",
    passagePinyin: "Tā (  ) Zhōngguó lìshǐ fēicháng gǎn xìngqù, dú le hěn duō xiāngguān de shū.",
    passageKo: "그는 중국 역사에 매우 흥미가 있어서 관련 책을 많이 읽었다.",
    speakText: "他对中国历史非常感兴趣。",
    options: [
      {
        label: "对 (duì)",
        reason: "‘对 + 명사 + 感兴趣’는 ‘~에 흥미를 느끼다’를 뜻하는 고정 구문입니다.",
      },
      {
        label: "把 (bǎ)",
        reason: "‘把’는 목적어를 처치·변화시키는 동사구와 쓰며 ‘感兴趣’와 호응하지 않습니다.",
      },
      {
        label: "被 (bèi)",
        reason: "‘被’는 ‘~에게 당하다’라는 피동문 표지입니다.",
      },
      {
        label: "从 (cóng)",
        reason: "‘从’은 출발점(‘~로부터’)을 나타냅니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "‘对 A 感兴趣(A에 흥미가 있다)’, ‘对 A 有帮助(A에 도움이 되다)’처럼 대상을 지정할 때는 전치사 ‘对(duì)’를 사용합니다.",
  },
  {
    id: "hsk-7",
    examType: "hsk",
    subLabel: "HSK 4급 · 복문 접속사",
    hskBand: "3~4급",
    question: "[HSK 4급] 문맥에 맞게 빈칸에 들어갈 접속사 쌍을 고르세요.",
    passage: "这家餐厅的菜（  ）味道好，（  ）价格也很便宜。",
    passagePinyin: "Zhè jiā cāntīng de cài (  ) wèidào hǎo, (  ) jiàgé yě hěn piányi.",
    passageKo: "이 식당 요리는 맛이 좋을 뿐만 아니라 가격도 매우 저렴하다.",
    speakText: "这家餐厅的菜不但味道好，而且价格也很便宜。",
    options: [
      {
        label: "不但…而且",
        reason: "‘맛도 좋고 + 게다가 가격도 저렴하다’라는 점층(추가) 관계이므로 ‘不但…而且(~뿐만 아니라 …도)’가 정답입니다.",
      },
      {
        label: "虽然…但是",
        reason: "‘비록 ~이지만 그러나 ~하다’라는 역접 관계는 앞뒤 내용이 상반될 때 씁니다.",
      },
      {
        label: "只有…才",
        reason: "‘오직 ~해야만 비로소 ~하다’라는 유일 조건 표현입니다.",
      },
      {
        label: "即使…也",
        reason: "‘설령 ~일지라도 또한 ~하다’라는 양보 가정 표현입니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "‘味道好(맛있다)’와 ‘价格便宜(가격이 싸다)’가 모두 긍정적 특징을 덧붙이는 점층 관계이므로 ‘不但…而且…’를 써야 합니다.",
  },
  {
    id: "hsk-8",
    examType: "hsk",
    subLabel: "HSK 4급 · 정도 변화",
    hskBand: "3~4급",
    question: "[HSK 4급] 빈칸에 들어갈 표현으로 가장 알맞은 것은?",
    passage: "最近天气（  ）暖和了，公园里的花都开了。",
    passagePinyin: "Zuìjìn tiānqì (  ) nuǎnhuo le, gōngyuán lǐ de huā dōu kāi le.",
    passageKo: "요즘 날씨가 점점 따뜻해져서 공원의 꽃이 다 피었다.",
    speakText: "最近天气越来越暖和了，公园里的花都开了。",
    options: [
      {
        label: "越来越 (yuèláiyuè)",
        reason: "시간 흐름에 따라 정도가 심화됨(‘점점 더 ~해지다’)을 나타내는 부사 ‘越来越 + 형용사’입니다.",
      },
      {
        label: "越来 (yuèlái)",
        reason: "‘越来’만으로는 사용할 수 없으며 반드시 ‘越来越’ 형태여야 합니다.",
      },
      {
        label: "一边 (yìbiān)",
        reason: "‘一边 A 一边 B’는 두 동작을 동시에 할 때 씁니다.",
      },
      {
        label: "刚才 (gāngcái)",
        reason: "‘刚才(방금)’는 명사성 시간사로 최근 점진적 변화 문맥에 어울리지 않습니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "‘越来越 + 형용사/심리동사’는 ‘점점 더 ~해지다’라는 뜻의 HSK 3·4급 핵심 구문입니다(예: 越来越好 점점 더 좋아지다).",
  },
  {
    id: "hsk-9",
    examType: "hsk",
    subLabel: "HSK 5급 · 고급 어휘",
    hskBand: "5~6급",
    question: "[HSK 5급] 빈칸에 들어갈 명사로 가장 알맞은 것은?",
    passage: "面对激烈的市场竞争，企业必须不断创新，才能保持竞争（  ）。",
    passagePinyin:
      "Miànduì jīliè de shìchǎng jìngzhēng, qǐyè bìxū búduàn chuàngxīn, cái néng bǎochí jìngzhēng (  ).",
    passageKo:
      "치열한 시장 경쟁에 맞서 기업은 끊임없이 혁신해야만 경쟁 우위를 유지할 수 있다.",
    speakText: "面对激烈的市场竞争，企业必须不断创新，才能保持竞争优势。",
    options: [
      {
        label: "优势 (yōushì)",
        reason: "‘保持竞争优势(경쟁 우위를 유지하다)’는 HSK 5급 독해·작문에 매우 자주 나오는 고정 연어(搭配)입니다.",
      },
      {
        label: "趋势 (qūshì)",
        reason: "‘趋势(추세·경향)’는 ‘발전 추세(发展趋势)’ 등에 쓰며 ‘保持竞争趋势’라고는 하지 않습니다.",
      },
      {
        label: "姿势 (zīshì)",
        reason: "‘姿势’는 몸의 ‘자세’를 뜻합니다.",
      },
      {
        label: "形式 (xíngshì)",
        reason: "‘形式’은 겉모습이나 ‘형식’을 뜻해 경쟁력을 유지한다는 문맥과 맞지 않습니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "‘保持(유지하다) + 竞争优势(경쟁 우위)’는 비즈니스·경제 지문에서 필수적으로 결합해 쓰이는 HSK 5급 어휘 짝입니다.",
  },
  {
    id: "hsk-10",
    examType: "hsk",
    subLabel: "HSK 5급 · 사자성어(成语)",
    hskBand: "5~6급",
    question: "[HSK 5급] 문맥에 가장 잘 어울리는 성어(成语)는?",
    passage: "他做事总是十分认真，对每一个细节都要求完美，真是（  ）。",
    passagePinyin:
      "Tā zuòshì zǒngshì shífēn rènzhēn, duì měi yígè xìjié dōu yāoqiú wánměi, zhēn shì (  ).",
    passageKo:
      "그는 일 처리를 항상 매우 성실하게 하고 작은 세부 사항 하나까지 완벽을 추구하니 정말 ____하다.",
    speakText: "他做事总是十分认真，对每一个细节都要求完美，真是一丝不苟。",
    options: [
      {
        label: "一丝不苟 (yìsībùgǒu)",
        reason: "‘조금도 소홀함 없이 극도로 꼼꼼하고 치밀하다’라는 뜻으로 성실·완벽을 추구하는 문맥과 정확히 일치합니다.",
      },
      {
        label: "半途而废 (bàntú'érfèi)",
        reason: "‘중도에 그만두다(작심삼일)’라는 뜻으로 긍정적 성실함과 반대입니다.",
      },
      {
        label: "画蛇添足 (huàshétiānzú)",
        reason: "‘뱀을 그리고 발을 덧붙이다(사족, 쓸데없는 짓을 하다)’라는 부정적 표현입니다.",
      },
      {
        label: "马马虎虎 (mǎmǎhūhū)",
        reason: "‘대충대충, 어물쩍’이라는 뜻으로 ‘十分认真(매우 진지·꼼꼼)’과 정반대입니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "‘一丝不苟’는 ‘실오라기 하나도 소홀히 하지 않는다’에서 유래한 성어로, 일이 매우 꼼꼼하고 철두철미함을 칭찬할 때 씁니다.",
  },
  {
    id: "hsk-11",
    examType: "hsk",
    subLabel: "HSK 6급 · 어법 오류(语病)",
    hskBand: "5~6급",
    question: "[HSK 6급] 다음 중 어법상 틀린 문장(语病)을 고르세요.",
    options: [
      {
        label: "经过老师的耐心辅导，他的成绩有了显著的提高。",
        pinyin: "선생님의 인내심 있는 지도를 거쳐 그의 성적이 뚜렷하게 향상되었다.",
        reason: "주어·술어·수식어 호응이 모두 자연스러운 올바른 문장입니다.",
      },
      {
        label: "为了避免以后不再发生类似的错误，我们制定了新规定。",
        pinyin: "앞으로 비슷한 오류가 다시 발생하지 않기를 피하기(?) 위해 새 규정을 제정했다.",
        reason: "‘避免(피하다)’ 자체가 부정 의미를 갖고 있는데 뒤에 ‘不再(다시 ~하지 않다)’를 또 써서 이중부정 모순(‘다시 발생하지 않는 것을 피한다’)이 되었습니다. ‘避免以后再发生’으로 고쳐야 합니다.",
      },
      {
        label: "无论遇到多大的困难，我们都不应该轻言放弃。",
        pinyin: "아무리 큰 어려움을 만나더라도 우리는 쉽게 포기해서는 안 된다.",
        reason: "‘无论…都…’ 호응이 정확한 올바른 문장입니다.",
      },
      {
        label: "只有充分尊重事实，才能做出客观公正的判断。",
        pinyin: "사실을 충분히 존중해야만 객관적이고 공정한 판단을 내릴 수 있다.",
        reason: "‘只有…才…’ 조건 호응이 정확한 올바른 문장입니다.",
      },
    ],
    correctIndex: 1,
    explanation:
      "HSK 6급 독해 1파트의 핵심 유형인 ‘부정어 오용(否定不当)’ 문제입니다. ‘避免(피하다), 防止(방지하다), 禁止(금지하다)’ 등 자체에 부정 의미가 있는 동사 뒤에는 불필요한 부정어(不/不再)를 중복해 쓰지 않아야 합니다.",
  },
  {
    id: "hsk-12",
    examType: "hsk",
    subLabel: "HSK 5~6급 · 고급 복문",
    hskBand: "5~6급",
    question: "[HSK 5급] 두 문장의 논리 관계에 알맞은 접속사 쌍은?",
    passage: "这项政策（  ）促进了当地经济的发展，（  ）改善了居民的生活环境。",
    passagePinyin:
      "Zhè xiàng zhèngcè (  ) cùjìn le dāngdì jīngjì de fāzhǎn, (  ) gǎishàn le jūmín de shēnghuó huánjìng.",
    passageKo:
      "이 정책은 지역 경제 발전을 촉진했을 뿐만 아니라 주민들의 생활환경도 개선했다.",
    speakText: "这项政策不仅促进了当地经济的发展，而且改善了居民的生活环境。",
    options: [
      {
        label: "不仅…而且",
        reason: "경제 발전 촉진에 더해 생활환경 개선까지 한 단계 더 나아가는 점층 관계이므로 ‘不仅…而且’가 정답입니다.",
      },
      {
        label: "宁可…也不",
        reason: "‘차라리 A할지언정 B하지 않겠다’라는 선택 배제 구문으로 문맥에 맞지 않습니다.",
      },
      {
        label: "与其…不如",
        reason: "‘A하느니 차라리 B하는 편이 낫다’라는 비교 선택 구문입니다.",
      },
      {
        label: "尽管…还是",
        reason: "‘비록 A이지만 여전히 B하다’라는 양보·전환 관계로 앞뒤 긍정 효과가 나열된 문맥과 맞지 않습니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "‘不仅…而且…’는 서면어에서 ‘不但…而且…’처럼 ‘~할 뿐만 아니라 게다가 ~하다’라는 점층 관계를 나타낼 때 자주 쓰입니다.",
  },

  // =========================================================
  // 4. 실전 그림·도표 문항 (수능 4 + 내신 2 + HSK 2 = 8문항)
  // =========================================================
  {
    id: "sun-v1",
    examType: "suneung",
    subLabel: "그림·길찾기",
    visualId: "map_route",
    question: "그림의 ‘我(출발)’ 지점에서 대화를 듣고 찾아갈 목적지는?",
    passage:
      "A: 请问，新开的书店在哪儿？\nB: 一直往前走，在红绿灯往右拐，就在邮局的对面。",
    passagePinyin:
      "A: Qǐngwèn, xīn kāi de shūdiàn zài nǎr?\nB: Yìzhí wǎng qián zǒu, zài hónglǜdēng wǎng yòu guǎi, jiù zài yóujú de duìmiàn.",
    passageKo:
      "A: 실례지만 새로 문을 연 서점이 어디에 있나요?\nB: 쭉 앞으로 가다가 신호등에서 오른쪽으로 돌면, 바로 우체국 맞은편에 있습니다.",
    speakText: "一直往前走，在红绿灯往右拐，就在邮局的对面。",
    options: [
      {
        label: "① (公园 쪽)",
        reason: "①은 신호등에서 왼쪽(북쪽)으로 돌았을 때 위치하며 그림에 ‘公园(공원)’으로 표시되어 있습니다.",
      },
      {
        label: "② (邮局 맞은편)",
        reason: "‘我’에서 직진해 신호등에서 오른쪽(남쪽)으로 돌면 우체국(邮局) 맞은편에 있는 ②가 됩니다.",
      },
      {
        label: "③ (银行 쪽)",
        reason: "③은 신호등에서 왼쪽(북쪽)으로 돌았을 때 보이는 ‘银行(은행)’입니다.",
      },
      {
        label: "④ (超市 쪽)",
        reason: "④는 신호등을 지나 다음 블록까지 더 직진한 뒤 나오는 ‘超市(마트)’입니다.",
      },
      {
        label: "⑤ (医院 쪽)",
        reason: "⑤는 첫 번째 신호등을 지나 더 직진해 왼쪽 위에 있는 ‘医院(병원)’입니다.",
      },
    ],
    correctIndex: 1,
    explanation:
      "지도에서 ‘我(출발)’가 동쪽(오른쪽)을 향해 직진하므로, ‘红绿灯往右拐(신호등에서 우회전)’는 아래(남쪽) 방향입니다. 남쪽 길에서 우체국(邮局)의 맞은편(对面)은 ②입니다.",
  },
  {
    id: "sun-v2",
    examType: "suneung",
    subLabel: "그림·표지판",
    visualId: "signs_5",
    question: "대화의 상황이 일어나는 장소에서 볼 수 있는 표지판으로 가장 알맞은 것은?",
    passage:
      "A: 这里是学校阅览室，请大家保持安静。\nB: 好的，我马上把手机调成静音。",
    passagePinyin:
      "A: Zhèlǐ shì xuéxiào yuèlǎnshì, qǐng dàjiā bǎochí ānjìng.\nB: Hǎo de, wǒ mǎshàng bǎ shǒujī tiáo chéng jìngyīn.",
    passageKo:
      "A: 여기는 학교 열람실입니다. 모두 조용히 해 주세요.\nB: 네, 지금 바로 휴대전화를 무음으로 바꿀게요.",
    speakText: "这里是学校阅览室，请大家保持安静。",
    options: [
      {
        label: "① (사진 촬영 금지)",
        reason: "①은 카메라에 금지선이 있는 ‘사진 촬영 금지(禁止拍照)’ 표지판으로, 박물관이나 미술관에 해당합니다.",
      },
      {
        label: "② (금연)",
        reason: "②는 담배 그림에 금지선이 있는 ‘금연(禁止吸烟)’ 표지판입니다.",
      },
      {
        label: "③ (정숙·조용히)",
        reason: "‘保持安静(조용히 하다)’ 및 ‘静音(무음)’과 정확히 일치하는 ‘정숙(安静)’ 표지판입니다.",
      },
      {
        label: "④ (음식물 반입 금지)",
        reason: "④는 햄버거 모양에 금지선이 있는 ‘음식물 반입 금지(禁止饮食)’ 표지판입니다.",
      },
      {
        label: "⑤ (수영 금지)",
        reason: "⑤는 물속 수영 금지 표지판으로 강·호수·수영장에 해당합니다.",
      },
    ],
    correctIndex: 2,
    explanation:
      "대화 핵심어인 ‘阅览室(열람실)’, ‘保持安静(조용히 유지하다)’, ‘静音(무음)’을 통해 정숙을 안내하는 ③ 표지판이 정답입니다.",
  },
  {
    id: "sun-v3",
    examType: "suneung",
    subLabel: "그림·시각 찾기",
    visualId: "clocks_5",
    question: "대화를 읽고 두 사람이 만나기로 한 시각을 나타낸 시계는?",
    passage: "电影八点半开始，我们【差一刻八点】在电影院门口见面吧。",
    passagePinyin: "Diànyǐng bādiǎn bàn kāishǐ, wǒmen chà yí kè bādiǎn zài diànyǐngyuàn ménkǒu jiànmiàn ba.",
    passageKo: "영화가 8시 반에 시작하니, 우리 7시 45분에 영화관 입구에서 만나자.",
    speakText: "电影八点半开始，我们差一刻八点在电影院门口见面吧。",
    options: [
      {
        label: "① (7시 15분)",
        reason: "①은 7시 15분으로 중국어로 ‘七点一刻(qīdiǎn yíkè)’입니다.",
      },
      {
        label: "② (7시 45분)",
        reason: "‘差一刻八点’은 ‘8시에 15분(一刻)이 모자란다’, 즉 7시 45분이므로 ②번 시계가 정답입니다.",
      },
      {
        label: "③ (8시 15분)",
        reason: "③은 8시 15분으로 ‘八点一刻(bādiǎn yíkè)’입니다. ‘差(모자라다)’가 붙은 점에 주의해야 합니다.",
      },
      {
        label: "④ (8시 45분)",
        reason: "④는 8시 45분(‘八点三刻’ 또는 ‘差一刻九点’)이므로 영화 시작(8시 30분)보다 늦습니다.",
      },
      {
        label: "⑤ (9시 15분)",
        reason: "⑤는 9시 15분(‘九点一刻’)입니다.",
      },
    ],
    correctIndex: 1,
    explanation:
      "‘一刻(yíkè)’는 15분, ‘差(chà)’는 ‘~에 ~분 모자라다(~분 전)’라는 뜻입니다. 따라서 ‘差一刻八点’은 8시 15분 전인 ‘7시 45분’이며 시계 ②에 해당합니다.",
  },
  {
    id: "sun-v4",
    examType: "suneung",
    subLabel: "그림·메뉴판 계산",
    visualId: "menu_discount",
    question: "그림(메뉴판과 할인 안내)을 보고 손님이 실제로 지불해야 할 금액은?",
    passage: "顾客：老板，我要一杯珍珠奶茶和两份小笼包，一共多少钱？",
    passagePinyin:
      "Gùkè: Lǎobǎn, wǒ yào yì bēi zhēnzhū nǎichá hé liǎng fèn xiǎolóngbāo, yígòng duōshao qián?",
    passageKo: "손님: 사장님, 버블티 한 잔이랑 샤오롱바오 두 접시 주세요. 모두 얼마인가요?",
    speakText: "我要一杯珍珠奶茶和两份小笼包，一共多少钱？",
    options: [
      {
        label: "42元",
        reason: "버블티 1잔(18元) + 샤오롱바오 1접시(24元)만 더한 값입니다. 문제에서는 샤오롱바오 ‘两份(2접시)’을 주문했습니다.",
      },
      {
        label: "52元",
        reason: "계산 합계나 할인 계산이 맞지 않는 오답입니다.",
      },
      {
        label: "56元",
        reason: "버블티 18元 + 샤오롱바오 24元×2 = 66元이고, ‘满50元减10元(50위안 이상 10위안 할인)’을 적용하면 56元이 됩니다.",
      },
      {
        label: "60元",
        reason: "牛肉面(26元) 등 다른 메뉴 가격을 잘못 계산한 금액입니다.",
      },
      {
        label: "66元",
        reason: "66元은 할인 적용 전 정가 합계입니다! 메뉴판 하단의 ‘满50元减10元’ 할인을 빼야 합니다.",
      },
    ],
    correctIndex: 2,
    explanation:
      "18元(珍珠奶茶 1잔) + 24元 × 2(小笼包 2접시) = 66元입니다. 메뉴판 하단 조건 ‘满50元减10元(50위안 이상 10위안 할인)’에 해당하므로 66 - 10 = 56元이 정답입니다.",
  },
  {
    id: "nae-v1",
    examType: "naesin",
    subLabel: "그림·일기예보",
    visualId: "weather_week",
    question: "이번 주 베이징 일기예보 그림을 보고 설명이 일치하지 않는 것은?",
    speakText: "星期三下雨，星期五下雪。",
    options: [
      {
        label: "월요일(星期一)은 날씨가 맑고 최고 기온은 25도이다.",
        reason: "표에서 星期一은 ☀️ 晴(맑음), 18℃~25℃이므로 일치합니다.",
      },
      {
        label: "화요일(星期二)은 구름이 많은 흐린(多云) 날씨이다.",
        reason: "표에서 星期二는 ⛅ 多云(구름 많음)이므로 일치합니다.",
      },
      {
        label: "수요일(星期三)은 매우 맑아서 등산하기 좋다.",
        reason: "표에서 星期三은 🌧️ ‘下雨(비가 온다)’로 표시되어 있으므로 맑다는 설명은 일치하지 않습니다.",
      },
      {
        label: "목요일(星期四)에는 바람이 불고(刮风) 기온이 더 내려간다.",
        reason: "표에서 星期四는 🌬️ 刮风, 8℃~14℃로 수요일보다 추워지므로 일치합니다.",
      },
      {
        label: "금요일(星期五)에는 눈이 오고(下雪) 영하까지 내려간다.",
        reason: "표에서 星期五는 ❄️ 下雪, -2℃~3℃이므로 일치합니다.",
      },
    ],
    correctIndex: 2,
    explanation:
      "내신에서 날씨 단어 ‘晴(맑음), 多云(흐림), 下雨(비), 刮风(바람), 下雪(눈)’을 표로 확인하는 유형입니다. 수요일(星期三)은 비(下雨)가 오므로 ③이 틀렸습니다.",
  },
  {
    id: "nae-v2",
    examType: "naesin",
    subLabel: "그림·가족 관계",
    visualId: "family_tree",
    question: "그림(샤오밍의 가족 소개 도표)을 보고 샤오밍(小明)의 소개로 옳지 않은 것은?",
    speakText: "我家有五口人，我有一个姐姐和一个弟弟。",
    options: [
      {
        label: "我家有五口人。(우리 집은 5식구입니다.)",
        reason: "아빠, 엄마, 누나, 샤오밍(나), 남동생 총 5명이므로 맞습니다.",
      },
      {
        label: "我爸爸是医生，妈妈是老师。",
        reason: "표에서 爸爸는 医生(의사), 妈妈는 老师(선생님)이므로 맞습니다.",
      },
      {
        label: "我有一个哥哥和一个妹妹。",
        reason: "표에 따르면 20살 누나(姐姐)와 13살 남동생(弟弟)이 있으므로, 형(哥哥)과 여동생(妹妹)이 있다는 설명은 틀렸습니다.",
      },
      {
        label: "我姐姐今年二十岁，是大学生。",
        reason: "표에서 姐姐는 20岁 · 大学生이므로 맞습니다.",
      },
      {
        label: "我是高中生，弟弟是初中生。",
        reason: "표에서 小明(我)은 17岁 高中生(고등학생), 弟弟는 13岁 初中生(중학생)이므로 맞습니다.",
      },
    ],
    correctIndex: 2,
    explanation:
      "중국어 형제자매 호칭 哥哥(형/오빠), 姐姐(누나/언니), 弟弟(남동생), 妹妹(여동생)를 정확히 구별하는 내신 핵심 유형입니다. 샤오밍에게는 姐姐(누나)와 弟弟(남동생)가 있습니다.",
  },
  {
    id: "hsk-v1",
    examType: "hsk",
    subLabel: "HSK 1~2급 · 그림 묘사",
    hskBand: "1~2급",
    visualId: "scene_library",
    question: "[HSK 2급] 다음 그림의 상황을 가장 정확하게 묘사한 문장은?",
    speakText: "她在图书馆看书呢。",
    options: [
      {
        label: "她在图书馆看书呢。",
        pinyin: "Tā zài túshūguǎn kànshū ne.",
        reason: "‘图书馆(도서관)’ 표지판 아래 책상에 앉아 책을 읽고 있는 모습과 정확히 일치합니다.",
      },
      {
        label: "她在饭店吃米饭呢。",
        pinyin: "Tā zài fàndiàn chī mǐfàn ne.",
        reason: "‘식당에서 쌀밥을 먹고 있다’는 뜻으로, 그림의 도서관·책과 맞지 않습니다.",
      },
      {
        label: "她正在医院看病呢。",
        pinyin: "Tā zhèngzài yīyuàn kànbìng ne.",
        reason: "‘병원에서 진료를 받고 있다’는 뜻으로 그림과 다릅니다.",
      },
      {
        label: "她在操场上踢足球呢。",
        pinyin: "Tā zài cāochǎng shang tī zúqiú ne.",
        reason: "‘운동장에서 축구를 하고 있다’는 뜻으로 그림과 다릅니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "HSK 1·2급 듣기/독해 1파트에서는 그림 속 장소(图书馆)와 진행 중인 동작(‘在…呢’, 看书 책을 읽다)을 문장과 연결하는 문제가 출제됩니다.",
  },
  {
    id: "hsk-v2",
    examType: "hsk",
    subLabel: "HSK 3~4급 · 승차권 독해",
    hskBand: "3~4급",
    visualId: "train_ticket",
    question: "[HSK 3급] 중국 고속철도 승차권 그림을 보고 알 수 있는 내용으로 옳은 것은?",
    speakText: "这趟高铁上午九点半从北京南站出发。",
    options: [
      {
        label: "这趟高铁上午九点半从北京南站出发。",
        pinyin: "Zhè tàng gāotiě shàngwǔ jiǔdiǎn bàn cóng Běijīngnánzhàn chūfā.",
        reason: "승차권에 ‘北京南 → 上海虹桥’, ‘09:30开(오전 9시 30분 출발)’가 명확히 표시되어 있으므로 정답입니다.",
      },
      {
        label: "这趟高铁晚上九点半到达北京南站。",
        pinyin: "Zhè tàng gāotiě wǎnshang jiǔdiǎn bàn dàodá Běijīngnánzhàn.",
        reason: "09:30은 밤이 아닌 ‘오전(上午)’ 출발 시각이며, 베이징남역은 도착지가 아니라 출발역입니다.",
      },
      {
        label: "这张车票是一等座，票价五百五十三元。",
        pinyin: "Zhè zhāng chēpiào shì yīděngzuò, piàojià wǔbǎi wǔshísān yuán.",
        reason: "가격(553元)은 맞지만 좌석 등급은 1등석(一等座)이 아니라 2등석(二等座)입니다.",
      },
      {
        label: "乘客坐在八车四号座位上。",
        pinyin: "Chéngkè zuò zài bā chē sì hào zuòwèi shang.",
        reason: "승차권에는 ‘04车 08A号(4호차 8A석)’로 나와 있으므로 호차와 좌석 번호가 뒤바뀌었습니다.",
      },
    ],
    correctIndex: 0,
    explanation:
      "HSK 3·4급에서는 승차권·영수증·안내문 실물 그림의 세부 정보(출발지 `北京南`, 도착지 `上海虹桥`, 출발시각 `09:30开`, 좌석 `04车 08A号 二等座`)를 정확히 대조해야 합니다.",
  },
];

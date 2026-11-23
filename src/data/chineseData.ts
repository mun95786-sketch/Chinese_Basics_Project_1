export type Level = "초급" | "중급" | "고급";
export type LevelFilter = "전체" | Level;

export interface VocabItem {
  id: number;
  level: Level;
  hanzi: string;
  pinyin: string;
  meaning: string;
  category: string;
}

export interface ConversationItem {
  id: number;
  level: Level;
  category: string;
  zh: string;
  pinyin: string;
  ko: string;
}

export interface CultureItem {
  level: Level;
  icon: string;
  title: string;
  tag: string;
  desc: string;
  zh: string;
  pinyin: string;
  ko: string;
}

// =====================================================
// 1. 단어 데이터: 초급(120) + 중급(45) + 고급(45) = 210개
// =====================================================
export const VOCAB_LIST: VocabItem[] = [
  // --- 초급 (120) ---
  { id: 1, level: "초급", hanzi: "你好", pinyin: "nǐ hǎo", meaning: "안녕하세요", category: "인사·표현" },
  { id: 2, level: "초급", hanzi: "谢谢", pinyin: "xièxie", meaning: "감사합니다, 고맙습니다", category: "인사·표현" },
  { id: 3, level: "초급", hanzi: "不客气", pinyin: "bú kèqi", meaning: "천만에요, 별말씀을요", category: "인사·표현" },
  { id: 4, level: "초급", hanzi: "对不起", pinyin: "duìbuqǐ", meaning: "죄송합니다, 미안해요", category: "인사·표현" },
  { id: 5, level: "초급", hanzi: "没关系", pinyin: "méi guānxi", meaning: "괜찮습니다", category: "인사·표현" },
  { id: 6, level: "초급", hanzi: "再见", pinyin: "zàijiàn", meaning: "안녕히 가세요, 또 만나요", category: "인사·표현" },
  { id: 7, level: "초급", hanzi: "早上好", pinyin: "zǎoshang hǎo", meaning: "좋은 아침이에요", category: "인사·표현" },
  { id: 8, level: "초급", hanzi: "晚安", pinyin: "wǎn'ān", meaning: "안녕히 주무세요, 잘 자요", category: "인사·표현" },
  { id: 9, level: "초급", hanzi: "请", pinyin: "qǐng", meaning: "청하다, ~하세요 (존대)", category: "인사·표현" },
  { id: 10, level: "초급", hanzi: "是", pinyin: "shì", meaning: "~이다, 맞다", category: "인사·표현" },
  { id: 11, level: "초급", hanzi: "不是", pinyin: "bú shì", meaning: "~이 아니다", category: "인사·표현" },
  { id: 12, level: "초급", hanzi: "有", pinyin: "yǒu", meaning: "있다, 가지고 있다", category: "인사·표현" },
  { id: 13, level: "초급", hanzi: "没有", pinyin: "méiyǒu", meaning: "없다", category: "인사·표현" },
  { id: 14, level: "초급", hanzi: "好", pinyin: "hǎo", meaning: "좋다, 안녕하다", category: "인사·표현" },
  { id: 15, level: "초급", hanzi: "没问题", pinyin: "méi wèntí", meaning: "문제없다", category: "인사·표현" },
  { id: 16, level: "초급", hanzi: "我", pinyin: "wǒ", meaning: "나, 저", category: "사람·가족" },
  { id: 17, level: "초급", hanzi: "你", pinyin: "nǐ", meaning: "너, 당신", category: "사람·가족" },
  { id: 18, level: "초급", hanzi: "您", pinyin: "nín", meaning: "당신 (높임말)", category: "사람·가족" },
  { id: 19, level: "초급", hanzi: "他", pinyin: "tā", meaning: "그 (남자)", category: "사람·가족" },
  { id: 20, level: "초급", hanzi: "她", pinyin: "tā", meaning: "그녀 (여자)", category: "사람·가족" },
  { id: 21, level: "초급", hanzi: "我们", pinyin: "wǒmen", meaning: "우리, 저희", category: "사람·가족" },
  { id: 22, level: "초급", hanzi: "大家", pinyin: "dàjiā", meaning: "여러분, 모두", category: "사람·가족" },
  { id: 23, level: "초급", hanzi: "爸爸", pinyin: "bàba", meaning: "아빠, 아버지", category: "사람·가족" },
  { id: 24, level: "초급", hanzi: "妈妈", pinyin: "māma", meaning: "엄마, 어머니", category: "사람·가족" },
  { id: 25, level: "초급", hanzi: "哥哥", pinyin: "gēge", meaning: "형, 오빠", category: "사람·가족" },
  { id: 26, level: "초급", hanzi: "姐姐", pinyin: "jiějie", meaning: "누나, 언니", category: "사람·가족" },
  { id: 27, level: "초급", hanzi: "弟弟", pinyin: "dìdi", meaning: "남동생", category: "사람·가족" },
  { id: 28, level: "초급", hanzi: "妹妹", pinyin: "mèimei", meaning: "여동생", category: "사람·가족" },
  { id: 29, level: "초급", hanzi: "朋友", pinyin: "péngyou", meaning: "친구", category: "사람·가족" },
  { id: 30, level: "초급", hanzi: "同学", pinyin: "tóngxué", meaning: "학우, 같은 반 친구", category: "사람·가족" },
  { id: 31, level: "초급", hanzi: "老师", pinyin: "lǎoshī", meaning: "선생님", category: "사람·가족" },
  { id: 32, level: "초급", hanzi: "学生", pinyin: "xuésheng", meaning: "학생", category: "사람·가족" },
  { id: 33, level: "초급", hanzi: "人", pinyin: "rén", meaning: "사람", category: "사람·가족" },
  { id: 34, level: "초급", hanzi: "一", pinyin: "yī", meaning: "일, 하나 (1)", category: "숫자·시간" },
  { id: 35, level: "초급", hanzi: "二", pinyin: "èr", meaning: "이, 둘 (2)", category: "숫자·시간" },
  { id: 36, level: "초급", hanzi: "三", pinyin: "sān", meaning: "삼, 셋 (3)", category: "숫자·시간" },
  { id: 37, level: "초급", hanzi: "四", pinyin: "sì", meaning: "사, 넷 (4)", category: "숫자·시간" },
  { id: 38, level: "초급", hanzi: "五", pinyin: "wǔ", meaning: "오, 다섯 (5)", category: "숫자·시간" },
  { id: 39, level: "초급", hanzi: "六", pinyin: "liù", meaning: "육, 여섯 (6)", category: "숫자·시간" },
  { id: 40, level: "초급", hanzi: "七", pinyin: "qī", meaning: "칠, 일곱 (7)", category: "숫자·시간" },
  { id: 41, level: "초급", hanzi: "八", pinyin: "bā", meaning: "팔, 여덟 (8)", category: "숫자·시간" },
  { id: 42, level: "초급", hanzi: "九", pinyin: "jiǔ", meaning: "구, 아홉 (9)", category: "숫자·시간" },
  { id: 43, level: "초급", hanzi: "十", pinyin: "shí", meaning: "십, 열 (10)", category: "숫자·시간" },
  { id: 44, level: "초급", hanzi: "百", pinyin: "bǎi", meaning: "백 (100)", category: "숫자·시간" },
  { id: 45, level: "초급", hanzi: "两", pinyin: "liǎng", meaning: "둘 (수량 표현)", category: "숫자·시간" },
  { id: 46, level: "초급", hanzi: "几", pinyin: "jǐ", meaning: "몇, 얼마", category: "숫자·시간" },
  { id: 47, level: "초급", hanzi: "今天", pinyin: "jīntiān", meaning: "오늘", category: "숫자·시간" },
  { id: 48, level: "초급", hanzi: "明天", pinyin: "míngtiān", meaning: "내일", category: "숫자·시간" },
  { id: 49, level: "초급", hanzi: "昨天", pinyin: "zuótiān", meaning: "어제", category: "숫자·시간" },
  { id: 50, level: "초급", hanzi: "现在", pinyin: "xiànzài", meaning: "지금, 현재", category: "숫자·시간" },
  { id: 51, level: "초급", hanzi: "时候", pinyin: "shíhou", meaning: "때, 시간", category: "숫자·시간" },
  { id: 52, level: "초급", hanzi: "年", pinyin: "nián", meaning: "년, 해", category: "숫자·시간" },
  { id: 53, level: "초급", hanzi: "月", pinyin: "yuè", meaning: "월, 달", category: "숫자·시간" },
  { id: 54, level: "초급", hanzi: "日", pinyin: "rì", meaning: "일, 날", category: "숫자·시간" },
  { id: 55, level: "초급", hanzi: "星期", pinyin: "xīngqī", meaning: "주, 요일", category: "숫자·시간" },
  { id: 56, level: "초급", hanzi: "学校", pinyin: "xuéxiào", meaning: "학교", category: "학교·생활" },
  { id: 57, level: "초급", hanzi: "教室", pinyin: "jiàoshì", meaning: "교실", category: "학교·생활" },
  { id: 58, level: "초급", hanzi: "图书馆", pinyin: "túshūguǎn", meaning: "도서관", category: "학교·생활" },
  { id: 59, level: "초급", hanzi: "中文", pinyin: "Zhōngwén", meaning: "중국어", category: "학교·생활" },
  { id: 60, level: "초급", hanzi: "汉语", pinyin: "Hànyǔ", meaning: "중국어 (한어)", category: "학교·생활" },
  { id: 61, level: "초급", hanzi: "韩语", pinyin: "Hányǔ", meaning: "한국어", category: "학교·생활" },
  { id: 62, level: "초급", hanzi: "书", pinyin: "shū", meaning: "책", category: "학교·생활" },
  { id: 63, level: "초급", hanzi: "本子", pinyin: "běnzi", meaning: "공책, 노트", category: "학교·생활" },
  { id: 64, level: "초급", hanzi: "铅笔", pinyin: "qiānbǐ", meaning: "연필", category: "학교·생활" },
  { id: 65, level: "초급", hanzi: "手机", pinyin: "shǒujī", meaning: "휴대전화", category: "학교·생활" },
  { id: 66, level: "초급", hanzi: "电脑", pinyin: "diànnǎo", meaning: "컴퓨터", category: "학교·생활" },
  { id: 67, level: "초급", hanzi: "桌子", pinyin: "zhuōzi", meaning: "책상, 탁자", category: "학교·생활" },
  { id: 68, level: "초급", hanzi: "椅子", pinyin: "yǐzi", meaning: "의자", category: "학교·생활" },
  { id: 69, level: "초급", hanzi: "名字", pinyin: "míngzi", meaning: "이름", category: "학교·생활" },
  { id: 70, level: "초급", hanzi: "钱", pinyin: "qián", meaning: "돈", category: "학교·생활" },
  { id: 71, level: "초급", hanzi: "水", pinyin: "shuǐ", meaning: "물", category: "음식·음료" },
  { id: 72, level: "초급", hanzi: "茶", pinyin: "chá", meaning: "차", category: "음식·음료" },
  { id: 73, level: "초급", hanzi: "咖啡", pinyin: "kāfēi", meaning: "커피", category: "음식·음료" },
  { id: 74, level: "초급", hanzi: "牛奶", pinyin: "niúnǎi", meaning: "우유", category: "음식·음료" },
  { id: 75, level: "초급", hanzi: "饭", pinyin: "fàn", meaning: "밥, 식사", category: "음식·음료" },
  { id: 76, level: "초급", hanzi: "米饭", pinyin: "mǐfàn", meaning: "쌀밥", category: "음식·음료" },
  { id: 77, level: "초급", hanzi: "面条", pinyin: "miàntiáo", meaning: "국수, 면", category: "음식·음료" },
  { id: 78, level: "초급", hanzi: "包子", pinyin: "bāozi", meaning: "중국식 찐빵(만두)", category: "음식·음료" },
  { id: 79, level: "초급", hanzi: "饺子", pinyin: "jiǎozi", meaning: "물만두, 교자", category: "음식·음료" },
  { id: 80, level: "초급", hanzi: "水果", pinyin: "shuǐguǒ", meaning: "과일", category: "음식·음료" },
  { id: 81, level: "초급", hanzi: "苹果", pinyin: "píngguǒ", meaning: "사과", category: "음식·음료" },
  { id: 82, level: "초급", hanzi: "西瓜", pinyin: "xīguā", meaning: "수박", category: "음식·음료" },
  { id: 83, level: "초급", hanzi: "菜", pinyin: "cài", meaning: "요리, 채소, 반찬", category: "음식·음료" },
  { id: 84, level: "초급", hanzi: "鸡蛋", pinyin: "jīdàn", meaning: "달걀, 계란", category: "음식·음료" },
  { id: 85, level: "초급", hanzi: "好吃", pinyin: "hǎochī", meaning: "맛있다", category: "음식·음료" },
  { id: 86, level: "초급", hanzi: "去", pinyin: "qù", meaning: "가다", category: "동사·핵심" },
  { id: 87, level: "초급", hanzi: "来", pinyin: "lái", meaning: "오다", category: "동사·핵심" },
  { id: 88, level: "초급", hanzi: "回", pinyin: "huí", meaning: "돌아가다, 돌아오다", category: "동사·핵심" },
  { id: 89, level: "초급", hanzi: "看", pinyin: "kàn", meaning: "보다, 읽다", category: "동사·핵심" },
  { id: 90, level: "초급", hanzi: "听", pinyin: "tīng", meaning: "듣다", category: "동사·핵심" },
  { id: 91, level: "초급", hanzi: "说", pinyin: "shuō", meaning: "말하다", category: "동사·핵심" },
  { id: 92, level: "초급", hanzi: "读", pinyin: "dú", meaning: "읽다, 소리 내어 읽다", category: "동사·핵심" },
  { id: 93, level: "초급", hanzi: "写", pinyin: "xiě", meaning: "쓰다", category: "동사·핵심" },
  { id: 94, level: "초급", hanzi: "吃", pinyin: "chī", meaning: "먹다", category: "동사·핵심" },
  { id: 95, level: "초급", hanzi: "喝", pinyin: "hē", meaning: "마시다", category: "동사·핵심" },
  { id: 96, level: "초급", hanzi: "买", pinyin: "mǎi", meaning: "사다", category: "동사·핵심" },
  { id: 97, level: "초급", hanzi: "做", pinyin: "zuò", meaning: "하다, 만들다", category: "동사·핵심" },
  { id: 98, level: "초급", hanzi: "学习", pinyin: "xuéxí", meaning: "공부하다, 배우다", category: "동사·핵심" },
  { id: 99, level: "초급", hanzi: "喜欢", pinyin: "xǐhuan", meaning: "좋아하다", category: "동사·핵심" },
  { id: 100, level: "초급", hanzi: "爱", pinyin: "ài", meaning: "사랑하다", category: "동사·핵심" },
  { id: 101, level: "초급", hanzi: "认识", pinyin: "rènshi", meaning: "알다 (사람을 알게 되다)", category: "동사·핵심" },
  { id: 102, level: "초급", hanzi: "知道", pinyin: "zhīdào", meaning: "알다 (사실·정보를 알다)", category: "동사·핵심" },
  { id: 103, level: "초급", hanzi: "想", pinyin: "xiǎng", meaning: "생각하다, ~하고 싶다", category: "동사·핵심" },
  { id: 104, level: "초급", hanzi: "什么", pinyin: "shénme", meaning: "무엇, 무슨", category: "형용사·장소" },
  { id: 105, level: "초급", hanzi: "谁", pinyin: "shéi", meaning: "누구", category: "형용사·장소" },
  { id: 106, level: "초급", hanzi: "哪儿", pinyin: "nǎr", meaning: "어디", category: "형용사·장소" },
  { id: 107, level: "초급", hanzi: "怎么", pinyin: "zěnme", meaning: "어떻게, 왜", category: "형용사·장소" },
  { id: 108, level: "초급", hanzi: "多少", pinyin: "duōshao", meaning: "얼마, 몇", category: "형용사·장소" },
  { id: 109, level: "초급", hanzi: "大", pinyin: "dà", meaning: "크다", category: "형용사·장소" },
  { id: 110, level: "초급", hanzi: "小", pinyin: "xiǎo", meaning: "작다", category: "형용사·장소" },
  { id: 111, level: "초급", hanzi: "多", pinyin: "duō", meaning: "많다", category: "형용사·장소" },
  { id: 112, level: "초급", hanzi: "少", pinyin: "shǎo", meaning: "적다", category: "형용사·장소" },
  { id: 113, level: "초급", hanzi: "高兴", pinyin: "gāoxìng", meaning: "기쁘다, 즐겁다", category: "형용사·장소" },
  { id: 114, level: "초급", hanzi: "漂亮", pinyin: "piàoliang", meaning: "예쁘다, 아름답다", category: "형용사·장소" },
  { id: 115, level: "초급", hanzi: "忙", pinyin: "máng", meaning: "바쁘다", category: "형용사·장소" },
  { id: 116, level: "초급", hanzi: "累", pinyin: "lèi", meaning: "피곤하다, 힘들다", category: "형용사·장소" },
  { id: 117, level: "초급", hanzi: "冷", pinyin: "lěng", meaning: "춥다, 차갑다", category: "형용사·장소" },
  { id: 118, level: "초급", hanzi: "热", pinyin: "rè", meaning: "덥다, 뜨겁다", category: "형용사·장소" },
  { id: 119, level: "초급", hanzi: "家", pinyin: "jiā", meaning: "집, 가족", category: "형용사·장소" },
  { id: 120, level: "초급", hanzi: "中国", pinyin: "Zhōngguó", meaning: "중국", category: "형용사·장소" },

  // --- 중급 (45) ---
  { id: 121, level: "중급", hanzi: "经验", pinyin: "jīngyàn", meaning: "경험", category: "중급·생활" },
  { id: 122, level: "중급", hanzi: "决定", pinyin: "juédìng", meaning: "결정하다, 결정", category: "중급·동사" },
  { id: 123, level: "중급", hanzi: "改变", pinyin: "gǎibiàn", meaning: "바꾸다, 변화하다", category: "중급·동사" },
  { id: 124, level: "중급", hanzi: "办法", pinyin: "bànfǎ", meaning: "방법", category: "중급·생활" },
  { id: 125, level: "중급", hanzi: "保护", pinyin: "bǎohù", meaning: "보호하다", category: "중급·동사" },
  { id: 126, level: "중급", hanzi: "环境", pinyin: "huánjìng", meaning: "환경", category: "중급·생활" },
  { id: 127, level: "중급", hanzi: "成功", pinyin: "chénggōng", meaning: "성공하다, 성공", category: "중급·동사" },
  { id: 128, level: "중급", hanzi: "努力", pinyin: "nǔlì", meaning: "노력하다", category: "중급·동사" },
  { id: 129, level: "중급", hanzi: "机会", pinyin: "jīhuì", meaning: "기회", category: "중급·생활" },
  { id: 130, level: "중급", hanzi: "坚持", pinyin: "jiānchí", meaning: "견지하다, 끝까지 버티다", category: "중급·동사" },
  { id: 131, level: "중급", hanzi: "习惯", pinyin: "xíguàn", meaning: "습관, 익숙하다", category: "중급·생활" },
  { id: 132, level: "중급", hanzi: "比较", pinyin: "bǐjiào", meaning: "비교하다, 비교적", category: "중급·표현" },
  { id: 133, level: "중급", hanzi: "提高", pinyin: "tígāo", meaning: "높이다, 향상시키다", category: "중급·동사" },
  { id: 134, level: "중급", hanzi: "解决", pinyin: "jiějué", meaning: "해결하다", category: "중급·동사" },
  { id: 135, level: "중급", hanzi: "相信", pinyin: "xiāngxìn", meaning: "믿다, 신뢰하다", category: "중급·동사" },
  { id: 136, level: "중급", hanzi: "影响", pinyin: "yǐngxiǎng", meaning: "영향을 주다, 영향", category: "중급·동사" },
  { id: 137, level: "중급", hanzi: "感谢", pinyin: "gǎnxiè", meaning: "감사하다", category: "중급·동사" },
  { id: 138, level: "중급", hanzi: "准备", pinyin: "zhǔnbèi", meaning: "준비하다", category: "중급·동사" },
  { id: 139, level: "중급", hanzi: "发现", pinyin: "fāxiàn", meaning: "발견하다", category: "중급·동사" },
  { id: 140, level: "중급", hanzi: "参加", pinyin: "cānjiā", meaning: "참가하다, 참여하다", category: "중급·동사" },
  { id: 141, level: "중급", hanzi: "介绍", pinyin: "jièshào", meaning: "소개하다", category: "중급·동사" },
  { id: 142, level: "중급", hanzi: "帮助", pinyin: "bāngzhù", meaning: "돕다, 도움", category: "중급·동사" },
  { id: 143, level: "중급", hanzi: "选择", pinyin: "xuǎnzé", meaning: "선택하다, 선택", category: "중급·동사" },
  { id: 144, level: "중급", hanzi: "必须", pinyin: "bìxū", meaning: "반드시 ~해야 한다", category: "중급·표현" },
  { id: 145, level: "중급", hanzi: "应该", pinyin: "yīnggāi", meaning: "~해야 한다, 마땅히", category: "중급·표현" },
  { id: 146, level: "중급", hanzi: "终于", pinyin: "zhōngyú", meaning: "마침내, 드디어", category: "중급·표현" },
  { id: 147, level: "중급", hanzi: "总是", pinyin: "zǒngshì", meaning: "항상, 언제나", category: "중급·표현" },
  { id: 148, level: "중급", hanzi: "刚才", pinyin: "gāngcái", meaning: "방금, 아까", category: "중급·표현" },
  { id: 149, level: "중급", hanzi: "已经", pinyin: "yǐjīng", meaning: "이미, 벌써", category: "중급·표현" },
  { id: 150, level: "중급", hanzi: "马上", pinyin: "mǎshàng", meaning: "곧, 당장", category: "중급·표현" },
  { id: 151, level: "중급", hanzi: "或者", pinyin: "huòzhě", meaning: "또는, 혹은", category: "중급·표현" },
  { id: 152, level: "중급", hanzi: "虽然", pinyin: "suīrán", meaning: "비록 ~이지만", category: "중급·표현" },
  { id: 153, level: "중급", hanzi: "但是", pinyin: "dànshì", meaning: "그러나, 하지만", category: "중급·표현" },
  { id: 154, level: "중급", hanzi: "因为", pinyin: "yīnwèi", meaning: "왜냐하면, ~때문에", category: "중급·표현" },
  { id: 155, level: "중급", hanzi: "所以", pinyin: "suǒyǐ", meaning: "그래서, 그러므로", category: "중급·표현" },
  { id: 156, level: "중급", hanzi: "如果", pinyin: "rúguǒ", meaning: "만약 ~라면", category: "중급·표현" },
  { id: 157, level: "중급", hanzi: "除了", pinyin: "chúle", meaning: "~외에도, ~을 제외하고", category: "중급·표현" },
  { id: 158, level: "중급", hanzi: "关于", pinyin: "guānyú", meaning: "~에 관하여", category: "중급·표현" },
  { id: 159, level: "중급", hanzi: "认真", pinyin: "rènzhēn", meaning: "성실하다, 진지하다", category: "중급·생활" },
  { id: 160, level: "중급", hanzi: "仔细", pinyin: "zǐxì", meaning: "꼼꼼하다, 세심하다", category: "중급·생활" },
  { id: 161, level: "중급", hanzi: "清楚", pinyin: "qīngchu", meaning: "분명하다, 명확하다", category: "중급·생활" },
  { id: 162, level: "중급", hanzi: "方便", pinyin: "fāngbiàn", meaning: "편리하다", category: "중급·생활" },
  { id: 163, level: "중급", hanzi: "重要", pinyin: "zhòngyào", meaning: "중요하다", category: "중급·생활" },
  { id: 164, level: "중급", hanzi: "特别", pinyin: "tèbié", meaning: "특별하다, 특히", category: "중급·생활" },
  { id: 165, level: "중급", hanzi: "简单", pinyin: "jiǎndān", meaning: "간단하다, 단순하다", category: "중급·생활" },

  // --- 고급 (45) ---
  { id: 166, level: "고급", hanzi: "效率", pinyin: "xiàolǜ", meaning: "효율", category: "고급·개념" },
  { id: 167, level: "고급", hanzi: "趋势", pinyin: "qūshì", meaning: "추세, 경향", category: "고급·개념" },
  { id: 168, level: "고급", hanzi: "竞争", pinyin: "jìngzhēng", meaning: "경쟁하다, 경쟁", category: "고급·개념" },
  { id: 169, level: "고급", hanzi: "挑战", pinyin: "tiǎozhàn", meaning: "도전하다, 도전", category: "고급·개념" },
  { id: 170, level: "고급", hanzi: "价值", pinyin: "jiàzhí", meaning: "가치", category: "고급·개념" },
  { id: 171, level: "고급", hanzi: "贡献", pinyin: "gòngxiàn", meaning: "공헌하다, 기여", category: "고급·개념" },
  { id: 172, level: "고급", hanzi: "现象", pinyin: "xiànxiàng", meaning: "현상", category: "고급·개념" },
  { id: 173, level: "고급", hanzi: "本质", pinyin: "běnzhì", meaning: "본질", category: "고급·개념" },
  { id: 174, level: "고급", hanzi: "逻辑", pinyin: "luójí", meaning: "논리", category: "고급·개념" },
  { id: 175, level: "고급", hanzi: "观念", pinyin: "guānniàn", meaning: "관념, 가치관", category: "고급·개념" },
  { id: 176, level: "고급", hanzi: "态度", pinyin: "tàidu", meaning: "태도", category: "고급·개념" },
  { id: 177, level: "고급", hanzi: "责任", pinyin: "zérèn", meaning: "책임", category: "고급·개념" },
  { id: 178, level: "고급", hanzi: "潜力", pinyin: "qiánlì", meaning: "잠재력", category: "고급·개념" },
  { id: 179, level: "고급", hanzi: "克服", pinyin: "kèfú", meaning: "극복하다", category: "고급·동사" },
  { id: 180, level: "고급", hanzi: "促进", pinyin: "cùjìn", meaning: "촉진하다", category: "고급·동사" },
  { id: 181, level: "고급", hanzi: "维持", pinyin: "wéichí", meaning: "유지하다", category: "고급·동사" },
  { id: 182, level: "고급", hanzi: "弥补", pinyin: "míbǔ", meaning: "보충하다, 만회하다", category: "고급·동사" },
  { id: 183, level: "고급", hanzi: "探索", pinyin: "tànsuǒ", meaning: "탐색하다, 탐구하다", category: "고급·동사" },
  { id: 184, level: "고급", hanzi: "发挥", pinyin: "fāhuī", meaning: "발휘하다", category: "고급·동사" },
  { id: 185, level: "고급", hanzi: "体现", pinyin: "tǐxiàn", meaning: "구현하다, 드러내다", category: "고급·동사" },
  { id: 186, level: "고급", hanzi: "象征", pinyin: "xiàngzhēng", meaning: "상징하다, 상징", category: "고급·동사" },
  { id: 187, level: "고급", hanzi: "尊重", pinyin: "zūnzhòng", meaning: "존중하다", category: "고급·동사" },
  { id: 188, level: "고급", hanzi: "珍惜", pinyin: "zhēnxī", meaning: "소중히 여기다", category: "고급·동사" },
  { id: 189, level: "고급", hanzi: "谦虚", pinyin: "qiānxū", meaning: "겸손하다", category: "고급·표현" },
  { id: 190, level: "고급", hanzi: "坦率", pinyin: "tǎnshuài", meaning: "솔직하다", category: "고급·표현" },
  { id: 191, level: "고급", hanzi: "慎重", pinyin: "shènzhòng", meaning: "신중하다", category: "고급·표현" },
  { id: 192, level: "고급", hanzi: "显著", pinyin: "xiǎnzhù", meaning: "뚜렷하다, 현저하다", category: "고급·표현" },
  { id: 193, level: "고급", hanzi: "丰富", pinyin: "fēngfù", meaning: "풍부하다", category: "고급·표현" },
  { id: 194, level: "고급", hanzi: "深刻", pinyin: "shēnkè", meaning: "심오하다, 깊다", category: "고급·표현" },
  { id: 195, level: "고급", hanzi: "普遍", pinyin: "pǔbiàn", meaning: "보편적이다, 널리 퍼지다", category: "고급·표현" },
  { id: 196, level: "고급", hanzi: "究竟", pinyin: "jiūjìng", meaning: "도대체, 결국", category: "고급·표현" },
  { id: 197, level: "고급", hanzi: "简直", pinyin: "jiǎnzhí", meaning: "그야말로, 완전히", category: "고급·표현" },
  { id: 198, level: "고급", hanzi: "居然", pinyin: "jūrán", meaning: "뜻밖에도, 의외로", category: "고급·표현" },
  { id: 199, level: "고급", hanzi: "难免", pinyin: "nánmiǎn", meaning: "피하기 어렵다, 어쩔 수 없다", category: "고급·표현" },
  { id: 200, level: "고급", hanzi: "毕竟", pinyin: "bìjìng", meaning: "결국, 어쨌든", category: "고급·표현" },
  { id: 201, level: "고급", hanzi: "即使", pinyin: "jíshǐ", meaning: "설령 ~일지라도", category: "고급·표현" },
  { id: 202, level: "고급", hanzi: "无论", pinyin: "wúlùn", meaning: "~에 상관없이, 막론하고", category: "고급·표현" },
  { id: 203, level: "고급", hanzi: "与其", pinyin: "yǔqí", meaning: "~하느니 차라리", category: "고급·표현" },
  { id: 204, level: "고급", hanzi: "鼓舞", pinyin: "gǔwǔ", meaning: "고무하다, 격려하다", category: "고급·동사" },
  { id: 205, level: "고급", hanzi: "启发", pinyin: "qǐfā", meaning: "일깨우다, 영감을 주다", category: "고급·동사" },
  { id: 206, level: "고급", hanzi: "借鉴", pinyin: "jièjiàn", meaning: "참고로 삼다, 거울삼다", category: "고급·동사" },
  { id: 207, level: "고급", hanzi: "独立", pinyin: "dúlì", meaning: "독립하다, 독립적이다", category: "고급·동사" },
  { id: 208, level: "고급", hanzi: "合作", pinyin: "hézuò", meaning: "협력하다, 합작하다", category: "고급·동사" },
  { id: 209, level: "고급", hanzi: "平衡", pinyin: "pínghéng", meaning: "균형, 균형을 잡다", category: "고급·개념" },
  { id: 210, level: "고급", hanzi: "创造", pinyin: "chuàngzào", meaning: "창조하다, 만들어 내다", category: "고급·동사" },

  // --- 숫자·사칙연산 확장 (9) ---
  { id: 211, level: "초급", hanzi: "零", pinyin: "líng", meaning: "영, 0 (숫자)", category: "숫자·시간" },
  { id: 212, level: "초급", hanzi: "千", pinyin: "qiān", meaning: "천 (1,000)", category: "숫자·시간" },
  { id: 213, level: "초급", hanzi: "万", pinyin: "wàn", meaning: "만 (10,000)", category: "숫자·시간" },
  { id: 214, level: "초급", hanzi: "亿", pinyin: "yì", meaning: "억 (100,000,000)", category: "숫자·시간" },
  { id: 215, level: "초급", hanzi: "加", pinyin: "jiā", meaning: "더하기 (+), 더하다", category: "숫자·연산" },
  { id: 216, level: "초급", hanzi: "减", pinyin: "jiǎn", meaning: "빼기 (-), 빼다", category: "숫자·연산" },
  { id: 217, level: "초급", hanzi: "乘", pinyin: "chéng", meaning: "곱하기 (×), 곱하다", category: "숫자·연산" },
  { id: 218, level: "초급", hanzi: "除以", pinyin: "chúyǐ", meaning: "나누기 (÷), ~로 나누다", category: "숫자·연산" },
  { id: 219, level: "초급", hanzi: "等于", pinyin: "děngyú", meaning: "~와 같다 (=)", category: "숫자·연산" },
];

// =====================================================
// 2. 실생활 회화 문장: 초급(15) + 중급(12) + 고급(12) = 39문장
// =====================================================
export const CONVERSATION_LIST: ConversationItem[] = [
  // 초급 (15)
  { id: 1, level: "초급", category: "인사·소개", zh: "你好！好久不见。", pinyin: "Nǐ hǎo! Hǎojiǔ bú jiàn.", ko: "안녕하세요! 오랜만이에요." },
  { id: 2, level: "초급", category: "인사·소개", zh: "你叫什么名字？", pinyin: "Nǐ jiào shénme míngzi?", ko: "이름이 무엇인가요?" },
  { id: 3, level: "초급", category: "인사·소개", zh: "我叫金敏俊，很高兴认识你。", pinyin: "Wǒ jiào Jīn Mǐnjùn, hěn gāoxìng rènshi nǐ.", ko: "저는 김민준이라고 해요. 만나서 반갑습니다." },
  { id: 4, level: "초급", category: "식당·음식", zh: "服务员，请给我菜单。", pinyin: "Fúwùyuán, qǐng gěi wǒ càidān.", ko: "직원분, 메뉴판 좀 주세요." },
  { id: 5, level: "초급", category: "식당·음식", zh: "我想点一碗面条和一盘饺子。", pinyin: "Wǒ xiǎng diǎn yì wǎn miàntiáo hé yì pán jiǎozi.", ko: "국수 한 그릇과 물만두 한 접시 주문하고 싶어요." },
  { id: 6, level: "초급", category: "식당·음식", zh: "这个菜太好吃了！", pinyin: "Zhège cài tài hǎochī le!", ko: "이 요리 정말 맛있네요!" },
  { id: 7, level: "초급", category: "식당·음식", zh: "一共多少钱？", pinyin: "Yígòng duōshao qián?", ko: "모두 얼마인가요?" },
  { id: 8, level: "초급", category: "길 묻기", zh: "请问，地铁站在哪儿？", pinyin: "Qǐngwèn, dìtiězhàn zài nǎr?", ko: "실례지만, 지하철역이 어디에 있나요?" },
  { id: 9, level: "초급", category: "길 묻기", zh: "一直往前走，然后往右拐。", pinyin: "Yìzhí wǎng qián zǒu, ránhòu wǎng yòu guǎi.", ko: "쭉 앞으로 가다가 오른쪽으로 도세요." },
  { id: 10, level: "초급", category: "길 묻기", zh: "坐公交车大概十分钟。", pinyin: "Zuò gōngjiāochē dàgài shí fēnzhōng.", ko: "버스를 타면 대략 10분 걸립니다." },
  { id: 11, level: "초급", category: "학교생활", zh: "今天有中文课吗？", pinyin: "Jīntiān yǒu Zhōngwén kè ma?", ko: "오늘 중국어 수업이 있나요?" },
  { id: 12, level: "초급", category: "학교생활", zh: "我们去图书馆学习吧。", pinyin: "Wǒmen qù túshūguǎn xuéxí ba.", ko: "우리 도서관에 공부하러 가자." },
  { id: 13, level: "초급", category: "학교생활", zh: "这个汉字怎么读？", pinyin: "Zhège Hànzì zěnme dú?", ko: "이 한자는 어떻게 읽나요?" },
  { id: 14, level: "초급", category: "쇼핑·일상", zh: "太贵了，可以便宜一点儿吗？", pinyin: "Tài guì le, kěyǐ piányi yìdiǎnr ma?", ko: "너무 비싸요. 조금 깎아 주실 수 있나요?" },
  { id: 15, level: "초급", category: "쇼핑·일상", zh: "可以用手机支付吗？", pinyin: "Kěyǐ yòng shǒujī zhīfù ma?", ko: "스마트폰으로 결제할 수 있나요?" },

  // 중급 (12)
  { id: 16, level: "중급", category: "학교생활", zh: "虽然汉语有点难，但是我觉得很有意思。", pinyin: "Suīrán Hànyǔ yǒudiǎn nán, dànshì wǒ juéde hěn yǒuyìsi.", ko: "중국어가 조금 어렵지만, 저는 아주 재미있다고 생각해요." },
  { id: 17, level: "중급", category: "학교생활", zh: "为了提高汉语水平，我每天练习写汉字。", pinyin: "Wèile tígāo Hànyǔ shuǐpíng, wǒ měitiān liànxí xiě Hànzì.", ko: "중국어 실력을 높이기 위해 매일 한자 쓰기를 연습해요." },
  { id: 18, level: "중급", category: "조언·공감", zh: "别灰心，只要坚持努力，一定会成功的。", pinyin: "Bié huīxīn, zhǐyào jiānchí nǔlì, yídìng huì chénggōng de.", ko: "실망하지 마, 꾸준히 노력하기만 하면 반드시 성공할 거야." },
  { id: 19, level: "중급", category: "조언·공감", zh: "我觉得这件事我们应该再仔细考虑一下。", pinyin: "Wǒ juéde zhè jiàn shì wǒmen yīnggāi zài zǐxì kǎolǜ yíxià.", ko: "이 일은 우리가 다시 꼼꼼하게 고민해 봐야 할 것 같아요." },
  { id: 20, level: "중급", category: "여행·약속", zh: "如果明天不下雨，我们就去爬山吧。", pinyin: "Rúguǒ míngtiān bú xiàyǔ, wǒmen jiù qù páshān ba.", ko: "만약 내일 비가 오지 않으면, 우리 등산하러 가자." },
  { id: 21, level: "중급", category: "여행·약속", zh: "不好意思，路上有堵车，所以我迟到了。", pinyin: "Bù hǎoyìsi, lùshang yǒu dǔchē, suǒyǐ wǒ chídào le.", ko: "죄송합니다, 길에 차가 막혀서 늦었어요." },
  { id: 22, level: "중급", category: "식당·음식", zh: "除了辣的菜以外，其他的我都能吃。", pinyin: "Chúle là de cài yǐwài, qítā de wǒ dōu néng chī.", ko: "매운 요리만 제외하면 다른 것은 다 먹을 수 있어요." },
  { id: 23, level: "중급", category: "취미·문화", zh: "我最近养成了一个每天看新闻的习惯。", pinyin: "Wǒ zuìjìn yǎngchéng le yígè měitiān kàn xīnwén de xíguàn.", ko: "요즘 매일 뉴스를 보는 습관을 들였어요." },
  { id: 24, level: "중급", category: "취미·문화", zh: "你有机会的话，一定要去北京旅游看看。", pinyin: "Nǐ yǒu jīhuì de huà, yídìng yào qù Běijīng lǚyóu kànkan.", ko: "기회가 된다면 꼭 베이징에 여행 가 보세요." },
  { id: 25, level: "중급", category: "조언·공감", zh: "非常感谢你在我困难的时候帮助了我。", pinyin: "Fēicháng gǎnxiè nǐ zài wǒ kùnnan de shíhou bāngzhù le wǒ.", ko: "제가 어려울 때 도와주셔서 정말 감사합니다." },
  { id: 26, level: "중급", category: "학교생활", zh: "关于明天的发表，你准备得怎么样了？", pinyin: "Guānyú míngtiān de fābiǎo, nǐ zhǔnbèi de zěnmeyàng le?", ko: "내일 발표에 대해 준비가 어떻게 되어 가나요?" },
  { id: 27, level: "중급", category: "여행·약속", zh: "坐高铁去上海比坐飞机更方便。", pinyin: "Zuò gāotiě qù Shànghǎi bǐ zuò fēijī gèng fāngbiàn.", ko: "고속열차를 타고 상하이에 가는 것이 비행기보다 더 편리해요." },

  // 고급 (12)
  { id: 28, level: "고급", category: "진로·성장", zh: "面对新的挑战，我们要保持积极的心态去克服。", pinyin: "Miànduì xīn de tiǎozhàn, wǒmen yào bǎochí jījí de xīntài qù kèfú.", ko: "새로운 도전에 맞서 우리는 긍정적인 마음가짐을 유지하며 극복해야 합니다." },
  { id: 29, level: "고급", category: "진로·성장", zh: "只有不断探索，才能充分发挥自己的潜力。", pinyin: "Zhǐyǒu búduàn tànsuǒ, cáinéng chōngfèn fāhuī zìjǐ de qiánlì.", ko: "끊임없이 탐구해야만 자신의 잠재력을 충분히 발휘할 수 있습니다." },
  { id: 30, level: "고급", category: "토론·의견", zh: "从本质上来看，这个问题需要各方共同合作来解决。", pinyin: "Cóng běnzhì shang lái kàn, zhège wèntí xūyào gèfāng gòngtóng hézuò lái jiějué.", ko: "본질적으로 볼 때, 이 문제는 각계가 함께 협력하여 해결해야 합니다." },
  { id: 31, level: "고급", category: "토론·의견", zh: "无论遇到什么困难，我们都应该尊重事实、慎重决定。", pinyin: "Wúlùn yùdào shénme kùnnan, wǒmen dōu yīnggāi zūnzhòng shìshí, shènzhòng juédìng.", ko: "어떤 어려움을 만나든 우리는 사실을 존중하고 신중하게 결정해야 합니다." },
  { id: 32, level: "고급", category: "토론·의견", zh: "与其空谈理想，不如脚踏实地从小事做起。", pinyin: "Yǔqí kōngtán lǐxiǎng, bùrú jiǎotàshídì cóng xiǎoshì zuòqǐ.", ko: "이상만 공허하게 말하느니, 착실하게 작은 일부터 시작하는 편이 낫습니다." },
  { id: 33, level: "고급", category: "사회·환경", zh: "随着科技的发展，人工智能正在显著提高工作效率。", pinyin: "Suízhe kējì de fāzhǎn, réngōng zhìnéng zhèngzài xiǎnzhù tígāo gōngzuò xiàolǜ.", ko: "과학기술의 발전에 따라 인공지능이 업무 효율을 뚜렷하게 높이고 있습니다." },
  { id: 34, level: "고급", category: "사회·환경", zh: "保护环境不仅是个人的责任，也是全社会的共同趋势。", pinyin: "Bǎohù huánjìng bùjǐn shì gèrén de zérèn, yě shì quán shèhuì de gòngtóng qūshì.", ko: "환경 보호는 개인의 책임일 뿐만 아니라 사회 전체의 공통된 추세입니다." },
  { id: 35, level: "고급", category: "소통·태도", zh: "坦率地说，你的建议对我很有启发。", pinyin: "Tǎnshuài de shuō, nǐ de jiànyì duì wǒ hěn yǒu qǐfā.", ko: "솔직히 말해서, 당신의 제안이 제게 큰 영감을 주었습니다." },
  { id: 36, level: "고급", category: "소통·태도", zh: "即使结果不尽如人意，努力的过程依然很有价值。", pinyin: "Jíshǐ jiéguǒ bú jìn rú rényì, nǔlì de guòchéng yīrán hěn yǒu jiàzhí.", ko: "설령 결과가 뜻대로 되지 않더라도 노력의 과정은 여전히 큰 가치가 있습니다." },
  { id: 37, level: "고급", category: "소통·태도", zh: "学无止境，我们应当以谦虚的态度向他人借鉴经验。", pinyin: "Xuéwúzhǐjìng, wǒmen yīngdāng yǐ qiānxū de tàidu xiàng tārén jièjiàn jīngyàn.", ko: "배움에는 끝이 없으니, 겸손한 태도로 타인의 경험을 거울삼아야 합니다." },
  { id: 38, level: "고급", category: "생활·균형", zh: "如何在学业和休息之间保持平衡，是高中生普遍关心的话题。", pinyin: "Rúhé zài xuéyè hé xiūxi zhījiān bǎochí pínghéng, shì gāozhōngshēng pǔbiàn guānxīn de huàtí.", ko: "학업과 휴식 사이에서 어떻게 균형을 유지할 것인가는 고등학생들이 보편적으로 관심을 갖는 주제입니다." },
  { id: 39, level: "고급", category: "생활·균형", zh: "正因为经过深思熟虑，他才做出了如此深刻的判断。", pinyin: "Zhèng yīnwèi jīngguò shēnsīshúlǜ, tā cái zuòchū le rúcǐ shēnkè de pànduàn.", ko: "깊이 심사숙고했기 때문에 비로소 그는 이토록 깊이 있는 판단을 내릴 수 있었습니다." },
];

// =====================================================
// 3. 중국 문화 데이터 (초급·중급·고급 9개 주제)
// =====================================================
export const CULTURE_LIST: CultureItem[] = [
  {
    level: "초급", icon: "🍵", title: "중국의 차(茶) 문화", tag: "전통 음료·예절",
    desc: "중국은 차의 발상지로 기름진 식문화와 어우러져 차를 마시는 전통이 발달했습니다. 녹차(绿茶)·홍차(红茶)·우롱차(乌龙茶)·보이차(普洱茶) 등으로 나뉘며, 손님 찻잔에는 70~80%만 따르는 것이 예의입니다.",
    zh: "中国人喜欢喝茶，茶有很多种类。", pinyin: "Zhōngguórén xǐhuan hē chá, chá yǒu hěn duō zhǒnglèi.", ko: "중국 사람들은 차 마시는 것을 좋아하며, 차에는 많은 종류가 있습니다."
  },
  {
    level: "초급", icon: "🧧", title: "춘절(春节)과 홍바오(红包)", tag: "최대 명절·세뱃돈",
    desc: "음력 1월 1일인 '춘절(春节)'은 중국 최대 명절입니다. 문 앞에 복(福) 자를 거꾸로 붙이는 풍습은 '거꾸로(倒)'와 '도착하다(到)'의 발음이 같아 '복이 온다'는 뜻을 담고 있으며, 어른들은 붉은 봉투 '홍바오(红包)'에 세뱃돈을 담아 줍니다.",
    zh: "春节的时候，长辈会给晚辈红包。", pinyin: "Chūnjié de shíhou, zhǎngbèi huì gěi wǎnbèi hóngbāo.", ko: "춘절이 되면 어른들이 아랫사람에게 붉은 봉투(세뱃돈)를 줍니다."
  },
  {
    level: "초급", icon: "🏮", title: "붉은색(红色)의 의미", tag: "색채 상징·행운",
    desc: "중국에서 붉은색은 기쁨·번영·행운을 상징합니다. 괴물 '녠(年)'이 붉은색과 폭죽 소리를 무서워했다는 전설에서 유래하여, 지금도 명절·결혼식·개업식 등 경사스러운 날에 붉은 홍등과 장식을 사용합니다.",
    zh: "在中国，红色代表喜庆和好运。", pinyin: "Zài Zhōngguó, hóngsè dàibiǎo xǐqìng hé hǎoyùn.", ko: "중국에서 붉은색은 경사와 행운을 상징합니다."
  },
  {
    level: "중급", icon: "🔢", title: "발음에서 비롯된 숫자 문화(谐音)", tag: "언어·길흉 상징",
    desc: "중국인은 발음이 비슷한 것에 의미를 부여하는 '해음(谐音)' 문화를 중시합니다. '8(bā)'은 돈을 번다는 '发(fā)'와 비슷해 최고로 선호되고, '6(liù)'은 순조로움을 뜻합니다. 반면 '4(sì)'는 '죽다(死, sǐ)'와 발음이 비슷해 피하는 편입니다.",
    zh: "中国人非常喜欢数字“八”，不太喜欢“四”。", pinyin: "Zhōngguórén fēicháng xǐhuan shùzì “bā”, bú tài xǐhuan “sì”.", ko: "중국 사람들은 숫자 '8'을 매우 좋아하고, '4'는 별로 좋아하지 않습니다."
  },
  {
    level: "중급", icon: "🥟", title: "물만두(饺子)와 식탁 예절", tag: "음식·식사 예절",
    desc: "북방 지역에서는 춘절 전날 온 가족이 물만두(饺子)를 빚어 먹는데, 반달 모양이 옛 은화폐(원보)를 닮아 재물을 부른다고 믿기 때문입니다. 식사 중 젓가락을 밥그릇에 수직으로 꽂아두면 제사를 연상시켜 큰 실례가 됩니다.",
    zh: "春节吃饺子，意思是辞旧迎新。", pinyin: "Chūnjié chī jiǎozi, yìsi shì cíjiù yíngxīn.", ko: "춘절에 물만두를 먹는 것은 묵은해를 보내고 새해를 맞이한다는 뜻입니다."
  },
  {
    level: "중급", icon: "🥮", title: "중추절(中秋节)과 월병(月饼)", tag: "전통 명절·가족",
    desc: "음력 8월 15일 '중추절'은 보름달을 보며 가족의 화합을 기원하는 명절입니다. 둥근 보름달을 닮은 과자 '월병(月饼)'을 나누어 먹는데, 여기서 둥글다는 뜻의 '원(圆)'은 가족이 한자리에 모이는 '단원(团圆)'을 상징합니다.",
    zh: "中秋节的晚上，大家一边赏月一边吃月饼。", pinyin: "Zhōngqiūjié de wǎnshang, dàjiā yìbiān shǎngyuè yìbiān chī yuèbǐng.", ko: "중추절 저녁에 모두 달을 감상하면서 월병을 먹습니다."
  },
  {
    level: "고급", icon: "🎭", title: "경극(京剧)과 얼굴 분장(脸谱)", tag: "전통 예술·무형유산",
    desc: "중국의 대표 전통극인 경극(京剧)은 노래·대사·연기·무술이 결합된 종합 예술입니다. 특히 배우들의 화려한 얼굴 분장인 '롄푸(脸谱)'는 색깔로 인물의 성격을 드러내는데, 붉은색은 충성·용기, 검은색은 강직함, 흰색은 교활함을 상징합니다.",
    zh: "京剧脸谱通过不同的颜色体现人物的性格。", pinyin: "Jīngjù liǎnpǔ tōngguò bùtóng de yánsè tǐxiàn rénwù de xìnggé.", ko: "경극의 얼굴 분장은 서로 다른 색상을 통해 인물의 성격을 드러냅니다."
  },
  {
    level: "고급", icon: "📱", title: "현대의 모바일 결제와 디지털 생활", tag: "현대 사회·기술",
    desc: "오늘날 중국 도시에서는 현금이나 카드 대신 스마트폰 QR코드를 이용한 모바일 결제(移动支付)가 보편화되어 있습니다. 재래시장, 택시, 공유자전거는 물론 음식 주문까지 스마트폰 하나로 해결하는 디지털 생활 문화가 깊이 자리 잡았습니다.",
    zh: "现在中国人的日常生活中，手机支付已经非常普遍。", pinyin: "Xiànzài Zhōngguórén de rìcháng shēnghuó zhōng, shǒujī zhīfù yǐjīng fēicháng pǔbiàn.", ko: "오늘날 중국인의 일상생활에서 모바일 결제는 이미 매우 보편화되어 있습니다."
  },
  {
    level: "고급", icon: "🐼", title: "국보 판다와 인문 유산 만리장성", tag: "자연·역사 상징",
    desc: "쓰촨성 대나무 숲에 서식하는 자이언트 판다(大熊猫)는 평화와 우호를 상징하는 중국의 국보입니다. 또한 만리장성(万里长城)은 '장성에 가보지 않으면 대장부가 아니다(不到长城非好汉)'라는 말로도 유명한 인류의 대표적 문화유산입니다.",
    zh: "大熊猫是中国的国宝，长城则是中国历史的象征。", pinyin: "Dàxióngmāo shì Zhōngguó de guóbǎo, Chángchéng zé shì Zhōngguó lìshǐ de xiàngzhēng.", ko: "자이언트 판다는 중국의 국보이고, 만리장성은 중국 역사의 상징입니다."
  },
];

export const LEVEL_BADGE_CLASSES: Record<Level, string> = {
  초급: "bg-[#ecfdf5] text-[#059669]",
  중급: "bg-[#eff6ff] text-[#2563eb]",
  고급: "bg-[#faf5ff] text-[#7c3aed]",
};

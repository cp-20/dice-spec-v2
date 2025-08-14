export type ContentArticle = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
} & (Published | Unpublished);

type Published = {
  isPublished: true;
  publishedAt: Date;
  updatedAt: Date;
};

type Unpublished = {
  isPublished: false;
};

export type CategoryContent = {
  category: string;
  name: string;
  description: string;
  articles: ContentArticle[];
};

export const contents: CategoryContent[] = [
  {
    category: 'stats-for-trpg',
    name: 'TRPGプレイヤーのための確率統計',
    description:
      '確率・統計をTRPGプレイヤー向けに全6回でふわっと解説！　読みやすさ第一で書かれてるからサクッと読めちゃう！　なのに今日から役立つ知識がたくさん手に入るかも！',
    articles: [
      {
        slug: '1-introduction',
        title: 'TRPGプレイヤーのための確率統計【第1回：なぜ今回もファンブル！？】',
        shortTitle: '第1回：なぜ今回もファンブル！？',
        description:
          'またファンブル？　運の偏りには理由がある！　TRPGあるあるを確率で解決。数学苦手でも大丈夫！　楽しく学べる実用的な確率講座スタート♪',
        isPublished: true,
        publishedAt: new Date('2025-08-10'),
        updatedAt: new Date('2025-08-10'),
      },
      {
        slug: '2-basic-probability',
        title: 'TRPGプレイヤーのための確率統計【第2回：2d6と1d12は何が違う？】',
        shortTitle: '第2回：2d6と1d12は何が違う？',
        description:
          '2d6と1d12、最大値同じなのになんか違う！？　期待値・分布・成功率を比較してスッキリ解決！　複数ダイスの謎を理解してTRPG上達しちゃおう！！',
        isPublished: true,
        publishedAt: new Date('2025-08-11'),
        updatedAt: new Date('2025-08-11'),
      },
      {
        slug: '3-practical-calc-first',
        title: 'TRPGプレイヤーのための確率統計【第3回：対抗判定を徹底調査！】',
        shortTitle: '第3回：対抗判定を徹底調査！',
        description:
          '対抗判定で勝てる確率って？　CoC・シノビガミ・エモクロア等の勝率を実例で計算！　判定方法の違いによる特色も分かって対戦がもっと楽しくなるよ♪',
        isPublished: true,
        publishedAt: new Date('2025-08-12'),
        updatedAt: new Date('2025-08-12'),
      },
      {
        slug: '4-practical-calc-second',
        title: 'TRPGプレイヤーのための確率統計【第4回：補正値が与える影響】',
        shortTitle: '第4回：補正値が与える影響',
        description:
          '補正値ってどのくらい効くの？　2d6+修正の威力、CoCボーナスダイスの実力を数字で検証！　戦略的な判断ができるようになっちゃう！！',
        isPublished: true,
        publishedAt: new Date('2025-08-13'),
        updatedAt: new Date('2025-08-13'),
      },
      {
        slug: '5-analysis-over-session',
        title: 'TRPGプレイヤーのための確率統計【第5回：10%を10回振ったら出る？】',
        shortTitle: '第5回：10%を10回振ったら出る？',
        description:
          '10%×10回=絶対成功は間違い！？　セッション出目の運を科学的に判定する方法教えちゃう！！　正規化スコア・信頼区間で客観的に分析しよう！！',
        isPublished: true,
        publishedAt: new Date('2025-08-14'),
        updatedAt: new Date('2025-08-14'),
      },
      {
        slug: '6-tool-introduction',
        title: 'TRPGプレイヤーのための確率統計【第6回：ツールを使いこなせ！】',
        shortTitle: '第6回：ツールを使いこなせ！',
        description:
          'ダイススペック使いこなし術！　期待値計算・ダイスロール・ログ解析・ココフォリア連携まで全部紹介！　これでTRPGがもっと楽しくなる♪',
        isPublished: false,
        // publishedAt: new Date('2025-08-15'),
        // updatedAt: new Date('2025-08-15'),
      },
    ],
  },
];

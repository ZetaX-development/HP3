import { type teamMember } from "@config/types/configDataTypes";

export const teamData: teamMember[] = [
  // CEOs
  {
    image: {
      src: "/people/team1.png",
      width: 400,
      height: 400,
      format: "png" as const,
    },
    name: "柳澤京佐",
    title: "Co-CEO",
    bio: `東京大学工学部推薦入学

高校では日経stockリーグ、マイナビキャリア甲子園、cyber sakuraなどの大会で入賞。東大発AIスタートアップでエンジニアを勤めると共にPMとしてチームを牽引。有名ホテルや倉庫の業務効率化を成し遂げた。`,
  },
  {
    image: {
      src: "/people/team2.jpg",
      width: 400,
      height: 400,
      format: "jpg" as const,
    },
    name: "佐藤陽",
    title: "Co-CEO",
    bio: `東京大学理科２類

中学・高校では全国模擬国連大会で優秀賞、ブラジルや日本で数学オリンピック受賞。東大発スタートアップ・VCでPMとして大規模プロジェクトの経験を積む。海外在住歴１０年以上。４ヶ国語を操る。`,
  },
  // Engineers
  {
    image: {
      src: "/people/team3.png",
      width: 400,
      height: 400,
      format: "png" as const,
    },
    name: "郷由紀斗",
    title: "Engineer",
    bio: `筑波大学情報学群

１０歳から開発経験のあるフルスタックエンジニア。日本トップレベルの技術力と行政や上場企業をはじめとする場での業務経験を活かす。`,
  },
  {
    image: {
      src: "/people/team4.jpg",
      width: 400,
      height: 400,
      format: "jpg" as const,
    },
    name: "坂口太朗",
    title: "Engineer",
    bio: `東京科学大学物質理工学院

研究分野は電池や半導体材料の理論計算。実務のみならず研究においてもスパコンや深層学習を用いるエンジニア。現在、国と企業プロジェクトに参画。`,
  },
  {
    image: {
      src: "/people/team8.jpg",
      width: 400,
      height: 400,
      format: "jpg" as const,
    },
    name: "杉浦雛姫",
    title: "Engineer",
    bio: `上智大学理工学研究科

研究分野は半導体・ナノ物理・フォトニクス。データサイエンス技術にも興味があり、LLMや時系列データの基盤モデルの開発経験・論文寄稿実績あり。ビジネス面の知識を生かして会社に寄り添った開発を行う。`,
  },
  {
    image: {
      src: "/people/team5.png",
      width: 400,
      height: 400,
      format: "png" as const,
    },
    name: "塚本一稀",
    title: "Engineer",
    bio: `東京大学理科１類

ECサイトを一人で実装した経験のあるフルスタックエンジニア。ブロックチェーンなどの技術にも精通。TS, Go, python,torch,Solidityも実装可能。`,
  },
  {
    image: {
      src: "/people/team6.jpg",
      width: 400,
      height: 400,
      format: "jpg" as const,
    },
    name: "松本 佳晟",
    title: "Engineer",
    bio: `東京科学大学生命理工学院

研究内容はDeepLearningを用いた遺伝子構造アノテーションツール開発。

大手企業でwebアプリ開発やフロントエンド、バックエンドの開発エンジニアとして豊富な実務経験`,
  },
  {
    image: {
      src: "/people/team7.jpg",
      width: 400,
      height: 400,
      format: "jpg" as const,
    },
    name: "鈴木 崇博",
    title: "Engineer",
    bio: `東京国際工科専門職大学

高校生で開発したStable Diffusion拡張ライブラリauto_diffusersが、米Hugging Face社の公式ドキュメントに掲載された実績を持つ。OSSへの直接貢献、DevFest 2025でのMediaPipeを用いた技術登壇経験あり。`,
  },
];

export default teamData;

// llms.txt — AI検索エンジン/LLMクローラー向けのサイト案内（https://llmstxt.org/ 準拠）
// ビルドごとにコンテンツコレクションから自動生成されるため、記事が増えると自動で更新される。
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async () => {
  const columns = (
    await getCollection(
      "news",
      ({ data }) => data.draft !== true && data.category === "技術コラム",
    )
  ).sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  const news = (
    await getCollection(
      "news",
      ({ data }) => data.draft !== true && data.category !== "技術コラム",
    )
  )
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .slice(0, 10);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const body = `# ZetaX（株式会社ZetaX）

> 東京大学のエンジニアを中心とするAI・ITプロフェッショナル集団。AI/ITコンサルティング・開発、セキュリティコンサルティング、法人向けAI研修、ハードウェア開発（エッジAI異常検知）を完全内製・一気通貫で提供。東京都渋谷区。上場企業・銀行・製造業など30社以上の支援実績。

## 主要サービス

- [法人向けAI研修](https://zetax.jp/ai-training/): 現役AI開発エンジニアが現場ヒアリングをもとに実業務を題材とした研修を設計。各回20名までの少人数制。研修と要件定義書のセット提供が特徴。製造業（プライム上場・70名）、商社（50名・受講者満足度98%）などの実績。資料請求は https://zetax.jp/ai-training/#request
- [AI/ITコンサルティング・開発](https://zetax.jp/ai-dx/): 戦略立案から設計・開発・保守まで一気通貫、完全内製
- [セキュリティコンサルティング](https://zetax.jp/security/): 都内銀行等の金融機関実績、耐量子暗号（PQC）対応
- [ハードウェア開発](https://zetax.jp/hardware/): 製造業向け予兆保全・エッジAI異常検知（クラウド・Wi-Fi不要）
- [Factory Hub](https://zetax.jp/factory-hub/): 製造業向けプロダクト

## 技術コラム（AI研修・AI活用の実務ノウハウ）

${columns.map((p) => `- [${p.data.title}](https://zetax.jp/news/${p.id}/): ${p.data.description}（${fmt(p.data.pubDate)}）`).join("\n")}

## 最近のニュース

${news.map((p) => `- [${p.data.title}](https://zetax.jp/news/${p.id}/)（${fmt(p.data.pubDate)}）`).join("\n")}

## 会社情報

- [会社紹介](https://zetax.jp/about/)
- [サービス一覧](https://zetax.jp/services/)
- お問い合わせ: https://zetax.jp/#contact
- AI研修の資料請求: https://zetax.jp/ai-training/#request
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};

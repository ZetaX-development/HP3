# ZetaX コーポレートサイト（HP3）

ZetaX の公式サイト。Astro v5 + Tailwind CSS v4 で構築し、ニュース／オウンドメディアは Keystatic CMS で管理します。

- 本番URL: https://zetax.jp
- デプロイ: Cloudflare（`@astrojs/cloudflare` アダプタ / `wrangler.jsonc`）

## セットアップ

```bash
npm install
npm run dev      # http://localhost:4321
```

主なスクリプト:

- `npm run dev` — 開発サーバー
- `npm run build` — 本番ビルド（`dist/`）
- `npm run preview` — ビルド成果物のプレビュー
- `npm run lint` / `npm run format` — Lint / 整形

## ニュース / オウンドメディア

- 記事の追加・編集は CMS から: `/admin`（= `/keystatic`）
- 記事の実体: `src/data/news/<slug>/index.mdx`（ヒーロー画像を同フォルダに同梱）
- 一覧: `/news`、記事: `/news/<slug>`、トップの「最新情報」は最新3件を自動表示
- カテゴリ: お知らせ / 実績 / サービス / 技術コラム / 事例
- SEO/AEO: `NewsLayout` + `NewsSeo` が canonical・OGP・Twitter Card・構造化データ（NewsArticle / BreadcrumbList / Organization、FAQあり記事は FAQPage）を出力。サイトマップにも自動掲載。

設計・実装の記録:

- 仕様: `docs/superpowers/specs/2026-06-20-news-portal-design.md`
- 実装計画: `docs/superpowers/plans/2026-06-20-news-portal.md`
- 本番デプロイ準備チェックリスト: `docs/deploy-readiness.md`

## 技術スタック

Astro 5 / Tailwind CSS 4 / Keystatic / MDX / React（一部島） / Cloudflare アダプタ

> 本サイトは Cosmic Themes の「Amplify」テンプレートをベースに構築しています。

# ZetaX ニュースポータル／オウンドメディア土台 — 設計仕様

- 日付: 2026-06-20
- ステータス: 承認済み（実装計画フェーズへ）
- スコープ: CMS基盤 ＋ ポータル一覧 ＋ 記事詳細 ＋ トップ連動 ＋ SEO/AEO

## 1. 背景と目的

現状、トップページ `src/pages/index.astro` の `#news` セクションは HTML 直書きで2件のみ。追加のたびにコード編集が必要。テーマ由来のブログ機構（`src/data/blog` ＋ Keystatic）は存在するが ZetaX のニュースには未使用。

本件のゴールは「コードを触らず記事を追加できるニュースポータル」を作り、将来「ZetaX オウンドメディア」へ育てられる土台にすること。

### 確定方針（ブレストでの決定事項）
- 記事の管理方法: **Keystatic CMS**（`/admin`）からブラウザ入力で公開。
- コンテンツの種類: **記事1種類に統一**（短いお知らせも本文を持つ記事として扱う）。
- 言語: **日本語のみ**（将来拡張可能な形は残すが、初期は単一言語）。
- ポータル一覧レイアウト: **ハイブリッド型**（最新/特集1本を大きく＋下にカードグリッド）。
- 記事詳細: 全部入り（パンくず／カテゴリ＋タイトル＋日付／著者バイライン／ヒーロー／本文／関連記事／戻る＋SNS共有）。
- カテゴリ初期セット: `お知らせ / 実績 / サービス / 技術コラム / 事例`（CMSで増減可）。
- トップ連動: トップは最新記事を**自動表示**。
- SEO/AEO: 全面的に組み込む（後述）。

## 2. コンテンツ基盤（Astro Content Collection）

既存 `blog` コレクションは温存し、**新規 `news` コレクション**を追加する。

- 保存先: `src/data/news/<slug>/index.mdx`（ヒーロー画像は同フォルダに同梱）。
- `src/content.config.ts` に `news` コレクションを追加。
- スキーマ（frontmatter）:

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `title` | string | ✓ | 記事タイトル（`<h1>`・`og:title`） |
| `description` | string | ✓ | 一覧・OGP・meta description 用要約（〜120字目安） |
| `pubDate` | date | ✓ | 公開日 |
| `updatedDate` | date | – | 更新日（`dateModified`に使用） |
| `category` | enum(1つ) | ✓ | `お知らせ/実績/サービス/技術コラム/事例` |
| `heroImage` | image | ✓ | ヒーロー画像（カード・OGP・記事冒頭） |
| `author` | string | ✓ | 著者名 |
| `authorRole` | string | ✓ | 肩書き（例: ZetaX FDE） |
| `authorAvatar` | image | – | 著者の顔写真（任意） |
| `featured` | boolean | – | ポータル先頭の特集に固定。未指定時は最新を自動採用 |
| `summary` | string | – | 冒頭「要点/TL;DR」ブロック＆AEO用の簡潔な答え |
| `faq` | array<{question, answer}> | – | 任意のFAQ。`FAQPage` JSON-LD を出力 |
| `draft` | boolean | – | true でビルド除外 |
| 本文 | MDX | ✓ | 見出し・箇条書き・画像・コード・引用など自由 |

- 著者は**frontmatterに直接記述**する（既存blogのような別 `authors` コレクション参照は使わない＝運用を軽くするため）。

## 3. CMS（Keystatic）

- `src/components/KeystaticComponents/Collections.tsx` に **`News` コレクション定義**を追加（既存 `Blog` を踏襲、ロケール引数なし）。
  - `category` は `fields.select` で5つの初期選択肢を提供。
  - `faq` は `fields.array`（question / answer）。
  - `summary` は `fields.text`（任意）。
  - 本文は `fields.mdx`。
- `keystatic.config.ts` の `collections` に `news` を登録 → `/admin`（=`/keystatic`）に「News」が出現。
- dev はローカル保存、本番は既存の Keystatic Cloud 設定のまま。
- 注意: content.config.ts のスキーマと Collections.tsx の定義は**両方を同期**させること。

## 4. ページ構成

既存ページは各々独立HTMLで CSS・ナビ・フッターを重複保持しているが、ニュース記事は動的生成のため**共有レイアウトを新設**してここだけ整理する。

### 4.1 `src/layouts/NewsLayout.astro`（新設）
- 既存サイトと同一の見た目を内包: CSS変数（`--bg`〜`--accent`等）、Noto Sans JP / Inter フォント、グローバルナビ、フッター、スクロール演出。
- props で `<head>` 情報（title / description / canonical / OGP / JSON-LD）を受け取り出力（§6参照）。
- ナビ／フッターの体裁は既存ページ（index/about）と一致させる。ニュースは日本語のみのため、`data-en` には日本語と同値を入れて言語トグル時の表示崩れを防ぐ。

### 4.2 `/news`（ポータル一覧）— `src/pages/news/index.astro`
- **ハイブリッド型**: `featured: true` の記事（なければ最新1本）を大きな特集枠で表示。その下に残り記事をカードグリッド（ヒーロー画像＋カテゴリ＋タイトル＋日付）。
- カテゴリで絞り込み（クライアントサイドのフィルタ or カテゴリ別表示）。
- `draft` 記事は除外。`pubDate` 降順。
- `NewsLayout` を使用。

### 4.3 `/news/[slug]`（記事詳細）— `src/pages/news/[...slug].astro`
- `getStaticPaths` で `news` コレクションから全記事を静的生成。
- 構成（確定済み・全部入り）:
  1. パンくず（ニュース ＞ カテゴリ）
  2. カテゴリバッジ ＋ `<h1>`タイトル ＋ `<time>`公開日
  3. 著者バイライン（avatar＋name＋role）
  4. ヒーロー画像
  5. `summary` がある場合は「要点」ブロック → 本文（MDXレンダリング）
  6. FAQ があれば FAQ セクション表示
  7. 関連記事（同カテゴリ優先で最大2件）
  8. 一覧へ戻る ＋ SNS共有（X・LinkedIn）
- `NewsLayout` を使用。

## 5. トップページ連動・配線

- `index.astro` の `#news` セクションを **`getCollection("news")` の最新3件を自動表示**に置換。リスト体裁（日付・カテゴリ・見出し）は現状維持。
- 「すべて見る →」を `/news` に接続（現状 `#` のダミーを修正）。
- ナビ／フッターの「ニュース」リンク（`/#news`・`/#news-section` 等）を `/news` に向ける。対象: `src/config/{ja,en,fr}/navData.json.ts`、`src/pages/about.astro`、`src/pages/anomaly-detection.astro`、`index.astro` 内のナビ/フッター。
- トップのニュース項目の `data-en` には日本語と同値を入れる（英語表示時の崩れ防止）。

## 6. SEO・AEO

### 6.1 SEO（`NewsLayout` の `<head>` で自動出力）
- `<title>` / meta `description`（frontmatter から）。
- `<link rel="canonical">`（`https://zetax.jp` 基準の絶対URL）。
- Open Graph: `og:title` / `og:description` / `og:type=article` / `og:url` / `og:image`（ヒーロー画像の絶対URL）。
- Twitter Card: `summary_large_image`。
- セマンティックHTML: `<article>` / `<h1>` / `<time datetime>`。
- サイトマップ: 既存の `@astrojs/sitemap`（`site: https://zetax.jp`）に自動的に乗る。`draft` はビルド除外のため非掲載。

### 6.2 AEO（構造化データ JSON-LD ＋ 編集パターン）
- 記事ごとに **`NewsArticle`** JSON-LD（全記事この型で統一）:
  `headline` / `image` / `datePublished` / `dateModified`(=updatedDate or pubDate) / `author`(Person: name＋jobTitle) / `publisher`(Organization「ZetaX」＋logo) / `description` / `mainEntityOfPage`。
- **`BreadcrumbList`** JSON-LD（パンくずUIと一致）。
- **`Organization`** JSON-LD（発行者の権威性／E-E-A-T。ニュース系ページに出力）。
- **`FAQPage`** JSON-LD（`faq` がある記事のみ出力）。
- 編集パターン: 冒頭「要点/TL;DR」ブロック（`summary`）＝AIが抽出しやすい簡潔な答え。質問形の見出し利用を推奨（編集ガイド、強制はしない）。

## 7. 初期データ移行

- 現在 `index.astro` に直書きされている2件（2025.05.20 実績 / 2025.04.15 サービス）を `news` コレクションへ移行。
- 移行後、トップは自動表示に切替。
- デモ用にサンプル記事を追加するかは実装時に確認する。

## 8. スコープ外（将来段階）

- ニュース専用 RSS フィード（土台は残す）。
- 多言語（英語）記事。
- コメント機能、ニュースレター連携。

## 9. 受け入れ基準

- `/admin` に「News」コレクションが表示され、ブラウザから記事を新規作成・公開できる。
- `pnpm build` が成功する。
- `/news` がハイブリッド型で描画され、カテゴリ絞り込みが動作する。
- 代表記事 `/news/<slug>` が全構成要素（パンくず〜SNS共有）込みで描画される。
- トップ `#news` が最新記事を自動表示し、「すべて見る」が `/news` に遷移する。
- 記事ページに `NewsArticle` / `BreadcrumbList` / `Organization`（および faq があれば `FAQPage`）の JSON-LD、canonical、OGP/Twitter Card が出力される（ビルド出力 or Rich Results 的観点で確認）。

## 10. 留意事項

- 実装前にローカルディスク空き容量を確保すること（ブレスト時点で空き約177MB／100%使用。`pnpm build` が失敗する恐れ）。
- `content.config.ts` と `Collections.tsx` のスキーマ二重管理を常に同期する。

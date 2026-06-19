# ZetaX ニュースポータル／オウンドメディア土台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keystatic CMS で管理する日本語ニュースポータル（一覧＋記事詳細）を新設し、トップページと連動させ、SEO/AEO（構造化データ）を組み込む。

**Architecture:** 既存 `blog` コレクションは温存し、新規 `news` コレクションを追加。記事ページは動的生成のため共有レイアウト `NewsLayout.astro`（既存サイトのナビ・フッター・CSSを内包）を新設し、SEO/AEO を `NewsSeo.astro` コンポーネントに集約。ポータルはハイブリッド型（特集＋カードグリッド）。トップの `#news` は `getCollection("news")` で自動表示。

**Tech Stack:** Astro 5（Content Collections / glob loader / MDX）、Keystatic（`@keystatic/astro`、`/admin`）、`@astrojs/sitemap`、npm。

**Spec:** `docs/superpowers/specs/2026-06-20-news-portal-design.md`

---

## 前提条件（着手前に必ず）

- **ディスク空き容量を確保する。** 計画作成時点で空き約177MB／使用100%。`npm run build` はこれでは失敗する。最低数GB空けてから着手すること。
- 本リポジトリにはユニットテストのフレームワークが無い（package.json に vitest/jest 等なし）。各タスクの検証は **`npm run build` の成功** と **生成された `dist/` の内容確認**で行う。`npm run dev` での目視確認も可。
- パッケージマネージャは **npm**（`package-lock.json`）。`pnpm` ではない。
- グローバルなコミット規約: メッセージ末尾に `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` を付ける。

## File Structure

新規作成:
- `src/data/news/<slug>/index.mdx` … 記事本文（フォルダ単位、ヒーロー画像を同梱）
- `src/components/Seo/NewsSeo.astro` … `<head>` 内のメタタグ＋JSON-LD（NewsArticle / BreadcrumbList / Organization / FAQPage）を出力する単一責務コンポーネント
- `src/layouts/NewsLayout.astro` … ニュース系ページ共有レイアウト（既存ナビ・フッター・CSS・JS を内包し、`NewsSeo` を `<head>` で呼ぶ）
- `src/pages/news/index.astro` … ポータル一覧（ハイブリッド型＋カテゴリ絞り込み）
- `src/pages/news/[slug].astro` … 記事詳細（全構成要素＋JSON-LD）

変更:
- `src/content.config.ts` … `news` コレクション追加
- `src/components/KeystaticComponents/Collections.tsx` … `News` 定義追加
- `keystatic.config.ts` … `news` 登録
- `src/pages/index.astro:1-1,1676-1700` … `#news` を自動表示化、「すべて見る」リンク修正
- `src/config/ja/navData.json.ts:31` / `src/config/en/navData.json.ts:31` / `src/config/fr/navData.json.ts:31` … ニュースリンクを `/news` へ
- `src/pages/about.astro:225` / `src/pages/anomaly-detection.astro:108` … ニュースリンクを `/news` へ

---

## Task 1: `news` コレクションのスキーマ追加

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: スキーマ定義を追加**

`src/content.config.ts` の `otherPagesCollection` 定義の直後（`codeToggleCollection` の前）に以下を追加する:

```ts
// ZetaX news / owned-media articles (Japanese only)
const newsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/news" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(160),
      pubDate: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val)),
      updatedDate: z
        .string()
        .optional()
        .transform((str) => (str ? new Date(str) : undefined)),
      category: z.enum(["お知らせ", "実績", "サービス", "技術コラム", "事例"]),
      heroImage: image(),
      author: z.string(),
      authorRole: z.string(),
      authorAvatar: image().optional(),
      featured: z.boolean().optional(),
      summary: z.string().optional(),
      faq: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .optional(),
      draft: z.boolean().optional(),
    }),
});
```

- [ ] **Step 2: `collections` エクスポートに登録**

同ファイル末尾の `export const collections = { ... }` に `news: newsCollection,` を追加する:

```ts
export const collections = {
  blog: blogCollection,
  authors: authorsCollection,
  otherPages: otherPagesCollection,
  codeToggles: codeToggleCollection,
  news: newsCollection,
};
```

- [ ] **Step 3: 型生成が通ることを確認**

Run: `npm run build`
Expected: ビルドは「`src/data/news` に該当ファイルなし」でも成功する（空コレクションは許容）。エラー無くビルドが完了すること。スキーマの構文エラーがあればここで失敗する。

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts
git commit -m "feat(news): add news content collection schema

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Keystatic に News コレクションを追加

**Files:**
- Modify: `src/components/KeystaticComponents/Collections.tsx`
- Modify: `keystatic.config.ts`

- [ ] **Step 1: `News` コレクション定義を追加**

`src/components/KeystaticComponents/Collections.tsx` の既存 `Blog` 定義を参考に、ファイル末尾の `export default { ... }`（もしあれば）より前に、ロケール引数を取らない `News` を追加する。`content.config.ts` のスキーマと完全に一致させること（カテゴリは `select`、faq は `array`）:

```tsx
/**
 * * News / owned-media collection (Japanese only)
 * Keep this in sync with the `news` schema in src/content.config.ts
 */
const News = () =>
  collection({
    label: "News",
    slugField: "title",
    path: "src/data/news/*/",
    columns: ["title", "pubDate"],
    entryLayout: "content",
    format: { contentField: "content" },
    schema: {
      title: fields.slug({
        name: { label: "タイトル" },
        slug: {
          label: "SEO用スラッグ",
          description: "公開後はスラッグを変更しないこと",
        },
      }),
      description: fields.text({
        label: "説明（一覧・OGP・meta description用）",
        multiline: true,
        validation: { isRequired: true, length: { min: 1, max: 160 } },
      }),
      pubDate: fields.date({ label: "公開日", validation: { isRequired: true } }),
      updatedDate: fields.date({ label: "更新日" }),
      category: fields.select({
        label: "カテゴリ",
        options: [
          { label: "お知らせ", value: "お知らせ" },
          { label: "実績", value: "実績" },
          { label: "サービス", value: "サービス" },
          { label: "技術コラム", value: "技術コラム" },
          { label: "事例", value: "事例" },
        ],
        defaultValue: "お知らせ",
      }),
      heroImage: fields.image({
        label: "ヒーロー画像",
        publicPath: "../",
        validation: { isRequired: true },
      }),
      author: fields.text({ label: "著者名", validation: { isRequired: true } }),
      authorRole: fields.text({
        label: "著者の肩書き",
        validation: { isRequired: true },
      }),
      authorAvatar: fields.image({
        label: "著者の顔写真（任意）",
        publicPath: "../",
      }),
      featured: fields.checkbox({
        label: "特集（ポータル先頭に固定）",
        defaultValue: false,
      }),
      summary: fields.text({
        label: "要点 / TL;DR（任意・AEO用）",
        multiline: true,
      }),
      faq: fields.array(
        fields.object({
          question: fields.text({ label: "質問" }),
          answer: fields.text({ label: "回答", multiline: true }),
        }),
        {
          label: "FAQ（任意・FAQ構造化データを出力）",
          itemLabel: (props) => props.fields.question.value || "FAQ項目",
        },
      ),
      draft: fields.checkbox({
        label: "下書き（ON で非公開）",
        defaultValue: false,
      }),
      content: fields.mdx({
        label: "本文",
        options: {
          bold: true,
          italic: true,
          strikethrough: true,
          code: true,
          heading: [2, 3, 4],
          blockquote: true,
          orderedList: true,
          unorderedList: true,
          table: true,
          link: true,
          image: { directory: "src/data/news/", publicPath: "../" },
        },
      }),
    },
  });
```

- [ ] **Step 2: `News` を default export に含める**

同ファイルの `export default { Blog, Authors, OtherPages };` 形式の集約オブジェクトに `News` を追加する（既存の集約名・形式に合わせること）。例:

```tsx
export default { Blog, Authors, OtherPages, News };
```

- [ ] **Step 3: `keystatic.config.ts` に登録**

`keystatic.config.ts` の `collections` に `news` を追加する:

```ts
collections: {
  blogEN: Collections.Blog("en"),
  authors: Collections.Authors(""),
  otherPagesEN: Collections.OtherPages("en"),
  news: Collections.News(),
},
```

- [ ] **Step 4: 管理画面に出ることを確認**

Run: `npm run dev`
ブラウザで `http://localhost:4321/admin`（=`/keystatic`）を開く。
Expected: 左メニューに「News」が表示され、「Create」から各フィールド（タイトル/カテゴリ select/FAQ array 等）が入力できる。`npm run build` も成功すること。

- [ ] **Step 5: Commit**

```bash
git add src/components/KeystaticComponents/Collections.tsx keystatic.config.ts
git commit -m "feat(news): add News collection to Keystatic CMS

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: 初期記事データの移行・作成

現在 `src/pages/index.astro` に直書きされている2件を `news` コレクションへ移す。ページ実装の検証に実データが必要なため先に作る。

**Files:**
- Create: `src/data/news/bank-security-consulting/index.mdx`
- Create: `src/data/news/bank-security-consulting/heroImage.jpg`（任意の既存画像を流用可）
- Create: `src/data/news/ai-training-launch/index.mdx`
- Create: `src/data/news/ai-training-launch/heroImage.jpg`

- [ ] **Step 1: ヒーロー画像を配置**

各記事フォルダに `heroImage.jpg` を置く。手元に専用画像が無ければ、既存の `src/assets/images/storm-1.webp` などを各フォルダに `heroImage.jpg`（またはコピー元の拡張子に合わせ `heroImage.webp` とし、mdx の参照も合わせる）としてコピーする:

```bash
mkdir -p src/data/news/bank-security-consulting src/data/news/ai-training-launch
cp src/assets/images/storm-1.webp src/data/news/bank-security-consulting/heroImage.webp
cp src/assets/images/storm-2.webp src/data/news/ai-training-launch/heroImage.webp
```

- [ ] **Step 2: 記事1（実績）を作成**

`src/data/news/bank-security-consulting/index.mdx`:

```mdx
---
title: 大手銀行2社へのセキュリティコンサルティングを開始しました
description: 金融機関向けに、現場運用に踏み込んだセキュリティコンサルティングの提供を開始しました。
pubDate: 2025-05-20
category: 実績
heroImage: ./heroImage.webp
author: ZetaX
authorRole: セキュリティコンサルティングチーム
featured: true
summary: 大手銀行2社に対し、現場運用に即したセキュリティコンサルティングを開始しました。
---

このたび ZetaX は、大手銀行2社に対してセキュリティコンサルティングの提供を開始しました。

## 取り組みの概要

現場の運用実態を踏まえた、実装可能なセキュリティ施策の立案から支援します。
```

- [ ] **Step 3: 記事2（サービス）を作成**

`src/data/news/ai-training-launch/index.mdx`:

```mdx
---
title: AI研修プログラムの提供を開始しました
description: 経営層から現場社員まで幅広く対応するAI研修プログラムの提供を開始しました。
pubDate: 2025-04-15
category: サービス
heroImage: ./heroImage.webp
author: ZetaX
authorRole: AI研修チーム
summary: 経営層から現場社員まで対応するAI研修プログラムを開始しました。
---

ZetaX は、経営層から現場社員まで幅広く対応する AI 研修プログラムの提供を開始しました。

## プログラムの特徴

対象者のレベルに応じて、実務に直結する内容を提供します。
```

- [ ] **Step 4: ビルドでコレクションが読めることを確認**

Run: `npm run build`
Expected: ビルド成功。`news` コレクションに2件が読み込まれる（この時点で参照するページはまだ無いが、スキーマ検証は通る）。frontmatter がスキーマに合わないとここで失敗するので、カテゴリ値・日付・必須項目を確認すること。

- [ ] **Step 5: Commit**

```bash
git add src/data/news
git commit -m "feat(news): migrate initial news items into collection

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: SEO/AEO コンポーネント `NewsSeo.astro`

`<head>` 用のメタタグと JSON-LD をまとめて出力する。記事ページとポータルの両方から使う（JSON-LD の種類は props で切替）。

**Files:**
- Create: `src/components/Seo/NewsSeo.astro`

- [ ] **Step 1: コンポーネントを作成**

`src/components/Seo/NewsSeo.astro`:

```astro
---
interface FaqItem {
  question: string;
  answer: string;
}
interface Breadcrumb {
  name: string;
  url: string; // 絶対 or サイト相対パス
}
interface Props {
  title: string;
  description: string;
  /** og:image に使う絶対URL。未指定可 */
  imageUrl?: string;
  /** "article" | "website" */
  ogType?: "article" | "website";
  publishDate?: Date;
  modifiedDate?: Date;
  author?: string;
  authorRole?: string;
  faq?: FaqItem[];
  breadcrumbs?: Breadcrumb[];
}

const {
  title,
  description,
  imageUrl,
  ogType = "website",
  publishDate,
  modifiedDate,
  author,
  authorRole,
  faq,
  breadcrumbs,
} = Astro.props as Props;

const site = Astro.site ?? new URL("https://zetax.jp");
const canonicalURL = new URL(Astro.url.pathname, site).href;
const abs = (path: string) =>
  path.startsWith("http") ? path : new URL(path, site).href;

const publisher = {
  "@type": "Organization",
  name: "ZetaX",
  url: site.href,
  logo: {
    "@type": "ImageObject",
    url: abs("/icon_image/ロゴ背景白正方形.png"),
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ZetaX",
  url: site.href,
  logo: abs("/icon_image/ロゴ背景白正方形.png"),
};

const articleLd =
  ogType === "article"
    ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: title,
        description,
        image: imageUrl ? [imageUrl] : undefined,
        datePublished: publishDate?.toISOString(),
        dateModified: (modifiedDate ?? publishDate)?.toISOString(),
        author: author
          ? { "@type": "Person", name: author, jobTitle: authorRole }
          : undefined,
        publisher,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonicalURL },
      }
    : null;

const breadcrumbLd =
  breadcrumbs && breadcrumbs.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: abs(b.url),
        })),
      }
    : null;

const faqLd =
  faq && faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;
---

<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />

<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content={ogType} />
<meta property="og:url" content={canonicalURL} />
{imageUrl && <meta property="og:image" content={imageUrl} />}

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
{imageUrl && <meta name="twitter:image" content={imageUrl} />}

<script type="application/ld+json" set:html={JSON.stringify(organizationLd)} />
{articleLd && <script type="application/ld+json" set:html={JSON.stringify(articleLd)} />}
{breadcrumbLd && <script type="application/ld+json" set:html={JSON.stringify(breadcrumbLd)} />}
{faqLd && <script type="application/ld+json" set:html={JSON.stringify(faqLd)} />}
```

注: `JSON.stringify` は `undefined` のキーを自動で除外するため、未設定フィールドは出力されない。

- [ ] **Step 2: ビルドで構文確認**

Run: `npm run build`
Expected: 成功（まだ誰も import していないので影響なし。構文・型エラーが無いことの確認）。

- [ ] **Step 3: Commit**

```bash
git add src/components/Seo/NewsSeo.astro
git commit -m "feat(news): add NewsSeo component for SEO/AEO structured data

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: 共有レイアウト `NewsLayout.astro`

既存サイトと同一の見た目（CSS変数・フォント・ナビ・フッター・言語トグル/reveal演出）を内包し、`NewsSeo` を `<head>` で呼ぶ。既存 `src/pages/index.astro` から該当部分を**そのまま移植**する（独自に作り直さない）。

**Files:**
- Create: `src/layouts/NewsLayout.astro`
- Reference (コピー元): `src/pages/index.astro`

- [ ] **Step 1: レイアウトの骨格を作成**

`src/layouts/NewsLayout.astro` を次の骨格で作る。`<!-- COPY: ... -->` の各箇所に、後続ステップで `index.astro` の指定行範囲を貼り付ける:

```astro
---
import NewsSeo from "@components/Seo/NewsSeo.astro";

interface Props {
  title: string;
  description: string;
  imageUrl?: string;
  ogType?: "article" | "website";
  publishDate?: Date;
  modifiedDate?: Date;
  author?: string;
  authorRole?: string;
  faq?: { question: string; answer: string }[];
  breadcrumbs?: { name: string; url: string }[];
}
const props = Astro.props as Props;
---

<!DOCTYPE html>
<html lang="ja" data-lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@200;300;400;500;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <NewsSeo {...props} />
  <style is:global>
    /* COPY: src/pages/index.astro lines 15-960 (the entire <style is:global> body, WITHOUT the opening <style> tag at line 14 and closing </style> at line 961) */
  </style>
</head>
<body>
  <!-- COPY: src/pages/index.astro lines 980-1039 (<nav class="nav" id="nav"> ... </nav>) -->

  <main>
    <slot />
  </main>

  <!-- COPY: src/pages/index.astro lines 1806-1843 (<footer class="footer"> ... </footer>) -->

  <script>
    // COPY: src/pages/index.astro lines 1846-1861 (setLang language-toggle logic) AND the reveal IntersectionObserver block around lines 1865-1900.
    // 必要なのは「言語トグル(setLang/langBtns)」と「.reveal の IntersectionObserver」のみ。
    // カウントアップ・文字アニメ・ヒーロー専用など index 固有の演出ブロックは移植しない。
  </script>
</body>
</html>
```

- [ ] **Step 2: CSS を移植**

`src/pages/index.astro` の `<style is:global>` の中身（開始タグ次行〜終了タグ前、概ね 15〜960 行）を、Step1 の `<style is:global>` 内にそのままコピーする。CSS変数・`.nav`・`.footer`・`.section`・`.reveal`・`.btn-sm`・`.news-*`・`.lang-toggle`・各種レスポンシブ（`@media`）を含む全体を入れること。

- [ ] **Step 3: ナビ・フッターを移植**

- `index.astro` 980〜1039 行の `<nav class="nav" id="nav">…</nav>` を `<main>` の直前に貼る。
- `index.astro` 1806〜1843 行の `<footer class="footer">…</footer>` を `<main>` の直後に貼る。
- ナビ内のロゴ/メニューのリンクはそのまま（絶対パス `/` 始まり）。ニュースへのリンクがあれば `/news` を指すこと（Task 8 と整合）。

- [ ] **Step 4: 必要な JS のみ移植**

`index.astro` の最初の `<script>`（1845〜2100 行）から、**言語トグル**（`setLang` と `langBtns` のイベント登録、概ね 1849〜1861 行）と **`.reveal` 用 IntersectionObserver**（概ね 1865〜1900 行）だけを抜き出して Step1 の `<script>` に入れる。カウントアップ（`countObserver`）・文字アニメ（`charObserver`）・ヒーロー固有処理は **入れない**（ニュースページに該当要素が無くエラーや無駄になるため）。

- [ ] **Step 5: 仮ページで描画確認**

一時的に `src/pages/news-layout-check.astro` を作成して描画を確認する:

```astro
---
import NewsLayout from "@layouts/NewsLayout.astro";
---
<NewsLayout title="レイアウト確認 — ZetaX" description="レイアウト確認用ページ">
  <section class="section"><div class="container"><h1>NewsLayout OK</h1></div></section>
</NewsLayout>
```

Run: `npm run build` の後 `npm run preview`、ブラウザで `/news-layout-check` を開く。
Expected: 既存サイトと同じナビ・フッター・フォント・配色で「NewsLayout OK」が表示される。言語トグルが動作する。確認できたら確認用ページを削除する: `rm src/pages/news-layout-check.astro`

- [ ] **Step 6: Commit**

```bash
git add src/layouts/NewsLayout.astro
git commit -m "feat(news): add shared NewsLayout matching site chrome

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: ポータル一覧 `/news`

ハイブリッド型: `featured` 記事（無ければ最新1本）を特集枠で大きく表示し、残りをカードグリッド。カテゴリ絞り込みはクライアントサイド（`data-category` ＋ ボタン）。

**Files:**
- Create: `src/pages/news/index.astro`

- [ ] **Step 1: ページを作成**

`src/pages/news/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import NewsLayout from "@layouts/NewsLayout.astro";

const CATEGORIES = ["お知らせ", "実績", "サービス", "技術コラム", "事例"] as const;

const all = (await getCollection("news", ({ data }) => data.draft !== true)).sort(
  (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
);

const featured = all.find((p) => p.data.featured) ?? all[0];
const rest = all.filter((p) => p.id !== featured?.id);

const fmtDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
---

<NewsLayout
  title="ニュース — ZetaX"
  description="ZetaXの最新ニュース・実績・技術コラム。"
  ogType="website"
>
  <section class="section">
    <div class="container">
      <span class="section-label">News</span>
      <h1 class="section-heading">ニュース</h1>

      {/* カテゴリ絞り込み */}
      <div class="news-filter" role="tablist">
        <button class="news-filter-btn active" data-filter="all">すべて</button>
        {CATEGORIES.map((c) => (
          <button class="news-filter-btn" data-filter={c}>{c}</button>
        ))}
      </div>

      {/* 特集 */}
      {featured && (
        <a class="news-featured" href={`/news/${featured.id}/`} data-category={featured.data.category}>
          <img src={featured.data.heroImage.src} alt={featured.data.title} class="news-featured-img" />
          <div class="news-featured-body">
            <span class="news-cat">{featured.data.category}</span>
            <h2 class="news-featured-title">{featured.data.title}</h2>
            <p class="news-featured-desc">{featured.data.description}</p>
            <span class="news-date">{fmtDate(featured.data.pubDate)}</span>
          </div>
        </a>
      )}

      {/* カードグリッド */}
      <div class="news-grid">
        {rest.map((p) => (
          <a class="news-card" href={`/news/${p.id}/`} data-category={p.data.category}>
            <img src={p.data.heroImage.src} alt={p.data.title} class="news-card-img" />
            <div class="news-card-body">
              <span class="news-cat">{p.data.category}</span>
              <h3 class="news-card-title">{p.data.title}</h3>
              <span class="news-date">{fmtDate(p.data.pubDate)}</span>
            </div>
          </a>
        ))}
      </div>

      {all.length === 0 && <p class="section-sub">まだ記事がありません。</p>}
    </div>
  </section>
</NewsLayout>

<style>
  .news-filter { display: flex; flex-wrap: wrap; gap: 0.6rem; margin: 1.5rem 0 2.5rem; }
  .news-filter-btn { font-family: var(--font-jp); font-size: 0.8rem; padding: 6px 16px; border: 1px solid var(--border); border-radius: 20px; background: var(--bg); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
  .news-filter-btn.active, .news-filter-btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

  .news-featured { display: grid; grid-template-columns: 1.3fr 1fr; gap: 2rem; align-items: stretch; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; margin-bottom: 3rem; transition: box-shadow 0.2s; }
  .news-featured:hover { box-shadow: var(--shadow-md); }
  .news-featured-img { width: 100%; height: 100%; min-height: 260px; object-fit: cover; }
  .news-featured-body { padding: 2rem 2rem 2rem 0; display: flex; flex-direction: column; gap: 0.8rem; align-self: center; }
  .news-featured-title { font-size: 1.6rem; line-height: 1.5; color: var(--text-primary); }
  .news-featured-desc { color: var(--text-secondary); font-size: 0.95rem; }

  .news-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
  .news-card { border: 1px solid var(--border); border-radius: 6px; overflow: hidden; background: var(--bg-card); transition: transform 0.2s, box-shadow 0.2s; }
  .news-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .news-card-img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
  .news-card-body { padding: 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; }
  .news-card-title { font-size: 1rem; line-height: 1.6; color: var(--text-primary); }

  .news-cat { align-self: flex-start; font-family: var(--font-jp); font-size: 0.68rem; font-weight: 600; padding: 3px 10px; border-radius: 2px; background: var(--accent-pale); color: var(--accent); }
  .news-date { font-family: var(--font-en); font-size: 0.76rem; color: var(--text-dim); }
  .news-hidden { display: none !important; }

  @media (max-width: 900px) {
    .news-featured { grid-template-columns: 1fr; }
    .news-featured-img { min-height: 200px; }
    .news-featured-body { padding: 1.5rem; }
    .news-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 600px) {
    .news-grid { grid-template-columns: 1fr; }
  }
</style>

<script>
  const btns = document.querySelectorAll<HTMLButtonElement>(".news-filter-btn");
  const items = document.querySelectorAll<HTMLElement>("[data-category]");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      btns.forEach((b) => b.classList.toggle("active", b === btn));
      items.forEach((el) => {
        const show = filter === "all" || el.dataset.category === filter;
        el.classList.toggle("news-hidden", !show);
      });
    });
  });
</script>
```

- [ ] **Step 2: 描画確認**

Run: `npm run build` → `npm run preview`、ブラウザで `/news` を開く。
Expected: 特集（実績の記事＝`featured: true`）が大きく表示され、下にもう1件がカード表示される。カテゴリボタンで絞り込みが効く。サイトのナビ・フッターが付く。

- [ ] **Step 3: Commit**

```bash
git add src/pages/news/index.astro
git commit -m "feat(news): add news portal index page (hybrid layout + filter)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: 記事詳細 `/news/[slug]`

全構成要素（パンくず／カテゴリ＋タイトル＋日付／著者バイライン／ヒーロー／要点／本文／FAQ／関連記事／戻る＋SNS共有）と JSON-LD（NewsArticle / BreadcrumbList / Organization、faq があれば FAQPage）を出力。

**Files:**
- Create: `src/pages/news/[slug].astro`

- [ ] **Step 1: ページを作成**

`src/pages/news/[slug].astro`:

```astro
---
import { getCollection, render } from "astro:content";
import NewsLayout from "@layouts/NewsLayout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("news", ({ data }) => data.draft !== true);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post, posts },
  }));
}

const { post, posts } = Astro.props;
const { data } = post;
const { Content } = await render(post);

const site = Astro.site ?? new URL("https://zetax.jp");
const heroAbs = new URL(data.heroImage.src, site).href;

// 関連記事: 同カテゴリ優先、自分以外、最大2件。足りなければ最新で補完
const related = [
  ...posts.filter((p) => p.id !== post.id && p.data.category === data.category),
  ...posts.filter((p) => p.id !== post.id && p.data.category !== data.category),
]
  .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
  .slice(0, 2);

const fmtDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;

const breadcrumbs = [
  { name: "ニュース", url: "/news/" },
  { name: data.category, url: `/news/?cat=${encodeURIComponent(data.category)}` },
];

const shareUrl = new URL(`/news/${post.id}/`, site).href;
---

<NewsLayout
  title={`${data.title} — ZetaX`}
  description={data.description}
  imageUrl={heroAbs}
  ogType="article"
  publishDate={data.pubDate}
  modifiedDate={data.updatedDate}
  author={data.author}
  authorRole={data.authorRole}
  faq={data.faq}
  breadcrumbs={breadcrumbs}
>
  <article class="section">
    <div class="container news-article">
      <nav class="news-breadcrumb">
        <a href="/news/">ニュース</a> <span>›</span> <span>{data.category}</span>
      </nav>

      <span class="news-cat">{data.category}</span>
      <h1 class="news-article-title">{data.title}</h1>
      <time class="news-date" datetime={data.pubDate.toISOString()}>{fmtDate(data.pubDate)}</time>

      <div class="news-author">
        {data.authorAvatar && <img src={data.authorAvatar.src} alt={data.author} class="news-author-avatar" />}
        <div>
          <span class="news-author-name">{data.author}</span>
          <span class="news-author-role">{data.authorRole}</span>
        </div>
      </div>

      <img src={data.heroImage.src} alt={data.title} class="news-hero" />

      {data.summary && (
        <div class="news-summary">
          <span class="news-summary-label">要点</span>
          <p>{data.summary}</p>
        </div>
      )}

      <div class="news-body">
        <Content />
      </div>

      {data.faq && data.faq.length > 0 && (
        <section class="news-faq">
          <h2>よくある質問</h2>
          {data.faq.map((f) => (
            <div class="news-faq-item">
              <h3>{f.question}</h3>
              <p>{f.answer}</p>
            </div>
          ))}
        </section>
      )}

      {related.length > 0 && (
        <section class="news-related">
          <span class="section-label">関連記事</span>
          <div class="news-related-grid">
            {related.map((p) => (
              <a class="news-card" href={`/news/${p.id}/`}>
                <img src={p.data.heroImage.src} alt={p.data.title} class="news-card-img" />
                <div class="news-card-body">
                  <span class="news-cat">{p.data.category}</span>
                  <h3 class="news-card-title">{p.data.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <div class="news-foot">
        <a href="/news/" class="btn-sm">← ニュース一覧へ戻る</a>
        <div class="news-share">
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(data.title)}`} target="_blank" rel="noopener">Xで共有</a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener">LinkedInで共有</a>
        </div>
      </div>
    </div>
  </article>
</NewsLayout>

<style>
  .news-article { max-width: 760px; }
  .news-breadcrumb { font-family: var(--font-en); font-size: 0.78rem; color: var(--text-dim); margin-bottom: 1.5rem; }
  .news-breadcrumb a { color: var(--accent); }
  .news-breadcrumb span { margin: 0 0.4rem; }
  .news-cat { display: inline-block; font-family: var(--font-jp); font-size: 0.68rem; font-weight: 600; padding: 3px 10px; border-radius: 2px; background: var(--accent-pale); color: var(--accent); }
  .news-article-title { font-size: 2rem; line-height: 1.5; color: var(--text-primary); margin: 0.8rem 0 0.5rem; }
  .news-date { font-family: var(--font-en); font-size: 0.8rem; color: var(--text-dim); }

  .news-author { display: flex; align-items: center; gap: 0.7rem; margin: 1.2rem 0 1.8rem; }
  .news-author-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
  .news-author-name { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
  .news-author-role { display: block; font-size: 0.78rem; color: var(--text-secondary); }

  .news-hero { width: 100%; border-radius: 6px; margin-bottom: 1.8rem; }

  .news-summary { border-left: 3px solid var(--accent); background: var(--accent-pale); padding: 1rem 1.2rem; border-radius: 0 4px 4px 0; margin-bottom: 2rem; }
  .news-summary-label { font-size: 0.7rem; font-weight: 700; color: var(--accent); letter-spacing: 0.05em; }
  .news-summary p { margin-top: 0.3rem; color: var(--text-primary); }

  .news-body { font-size: 1rem; line-height: 1.95; color: var(--text-primary); }
  .news-body :global(h2) { font-size: 1.4rem; margin: 2.2rem 0 0.8rem; }
  .news-body :global(h3) { font-size: 1.15rem; margin: 1.6rem 0 0.6rem; }
  .news-body :global(p) { margin-bottom: 1.1rem; }
  .news-body :global(ul), .news-body :global(ol) { margin: 0 0 1.1rem 1.4rem; }
  .news-body :global(img) { max-width: 100%; border-radius: 4px; margin: 1.2rem 0; }
  .news-body :global(blockquote) { border-left: 3px solid var(--border); padding-left: 1rem; color: var(--text-secondary); margin: 1.2rem 0; }

  .news-faq { margin-top: 3rem; border-top: 1px solid var(--border); padding-top: 1.5rem; }
  .news-faq h2 { font-size: 1.3rem; margin-bottom: 1rem; }
  .news-faq-item { margin-bottom: 1.2rem; }
  .news-faq-item h3 { font-size: 1rem; color: var(--text-primary); margin-bottom: 0.3rem; }
  .news-faq-item p { color: var(--text-secondary); }

  .news-related { margin-top: 3rem; border-top: 1px solid var(--border); padding-top: 1.5rem; }
  .news-related-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
  .news-card { border: 1px solid var(--border); border-radius: 6px; overflow: hidden; background: var(--bg-card); transition: transform 0.2s; }
  .news-card:hover { transform: translateY(-4px); }
  .news-card-img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
  .news-card-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .news-card-title { font-size: 0.92rem; line-height: 1.6; color: var(--text-primary); }

  .news-foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-top: 3rem; border-top: 1px solid var(--border); padding-top: 1.5rem; }
  .news-share { display: flex; gap: 1rem; font-size: 0.82rem; }
  .news-share a { color: var(--accent); }

  @media (max-width: 600px) {
    .news-article-title { font-size: 1.5rem; }
    .news-related-grid { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 2: 描画と JSON-LD を確認**

Run: `npm run build` → `npm run preview`、ブラウザで `/news/bank-security-consulting/` を開く。
Expected: パンくず・カテゴリ・タイトル・日付・著者・ヒーロー・要点・本文・関連記事（もう1件）・戻る/共有が表示される。
JSON-LD 確認: `dist/news/bank-security-consulting/index.html` を開き、`application/ld+json` が **3つ**（NewsArticle / BreadcrumbList / Organization）含まれ、`"@type":"NewsArticle"` に headline・datePublished・author・publisher があること。faq を持つ記事では FAQPage も出ること。

```bash
grep -o 'application/ld+json' dist/news/bank-security-consulting/index.html | wc -l   # 期待値: 3
grep -o '"@type":"NewsArticle"' dist/news/bank-security-consulting/index.html         # 1件ヒット
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/news/[slug].astro
git commit -m "feat(news): add article detail page with JSON-LD (NewsArticle/Breadcrumb/FAQ)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: トップページ連動とナビ/フッターのリンク修正

**Files:**
- Modify: `src/pages/index.astro`（frontmatter追加 ＋ 1676-1700 の `#news` 置換）
- Modify: `src/config/ja/navData.json.ts:31`, `src/config/en/navData.json.ts:31`, `src/config/fr/navData.json.ts:31`
- Modify: `src/pages/about.astro:225`, `src/pages/anomaly-detection.astro:108`

- [ ] **Step 1: `index.astro` にコレクション取得を追加**

`src/pages/index.astro` の 1 行目 `<!DOCTYPE html>` の**直前**に、Astro frontmatter ブロックを新設する（このファイルは現状 frontmatter を持たないため新規に追加する）:

```astro
---
import { getCollection } from "astro:content";

const latestNews = (await getCollection("news", ({ data }) => data.draft !== true))
  .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
  .slice(0, 3);

const fmtDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
---
<!DOCTYPE html>
```

- [ ] **Step 2: `#news` のリスト内容を自動表示に置換**

`src/pages/index.astro` 1676-1700 行の `#news` セクションのうち、`<div class="news-list reveal d1">` の中の**ハードコードされた `.news-item` 群**を、次の動的出力に置き換える。あわせて「すべて見る」リンクの `href="#"`（1684 行付近）を `href="/news"` に変更する:

```astro
      <div class="news-header reveal">
        <div>
          <span class="section-label">News</span>
          <h2 class="section-heading" data-ja="最新情報" data-en="Latest News">最新情報</h2>
        </div>
        <a href="/news" class="btn-sm" data-ja="すべて見る" data-en="View all">すべて見る</a>
      </div>
      <div class="news-list reveal d1">
        {latestNews.map((post) => (
          <a class="news-item" href={`/news/${post.id}/`}>
            <span class="news-date">{fmtDate(post.data.pubDate)}</span>
            <span class="news-cat" data-ja={post.data.category} data-en={post.data.category}>{post.data.category}</span>
            <span class="news-title" data-ja={post.data.title} data-en={post.data.title}>{post.data.title}</span>
          </a>
        ))}
      </div>
```

注: `.news-item` を `<div>` から `<a>` に変えるため、CSS で `.news-item` に `cursor: pointer` が無い場合も問題ないが、リンク色継承のため既存の `a { color: inherit }` が効く。`data-en` には日本語と同値を入れ、英語表示時の崩れを防ぐ（スペック §5）。

- [ ] **Step 3: ナビ/フッターのニュースリンクを `/news` に**

各ファイルの該当箇所を修正する:

- `src/config/ja/navData.json.ts:31` … `link: "/#news-section",` → `link: "/news",`
- `src/config/en/navData.json.ts:31` … `link: "/en/#news-section",` → `link: "/news",`
- `src/config/fr/navData.json.ts:31` … `link: "/#news-section",` → `link: "/news",`
- `src/pages/about.astro:225` … `<a href="/#news">ニュース</a>` → `<a href="/news">ニュース</a>`
- `src/pages/anomaly-detection.astro:108` … `<li><a href="/#news">News</a></li>` → `<li><a href="/news">News</a></li>`

また `index.astro` 内のナビ/フッターにニュースへのアンカー（`href="#news"`、1027 行・1829 行付近）がある。トップ内アンカーとして残してもよいが、ポータルへ誘導するなら `/news` に変更する。**本計画では 1829 行付近のフッターのニュースリンクを `/news` に変更**し、1027 行付近のグローバルナビのニュースリンクも `/news` に変更する。

- [ ] **Step 4: 全体ビルドと目視確認**

Run: `npm run build` → `npm run preview`
Expected:
- トップ `/` の「最新情報」に Task 3 の2件が新しい順で表示され、各行クリックで `/news/<slug>/` に遷移する。「すべて見る」で `/news` に遷移する。
- ナビ/フッターの「ニュース」リンクが `/news` に飛ぶ。

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/config/ja/navData.json.ts src/config/en/navData.json.ts src/config/fr/navData.json.ts src/pages/about.astro src/pages/anomaly-detection.astro
git commit -m "feat(news): wire homepage news section to collection and fix nav links

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: 最終ビルド検証と受け入れ確認

**Files:** なし（検証のみ）

- [ ] **Step 1: クリーンビルド**

Run: `rm -rf dist && npm run build`
Expected: エラー・警告なく完了。`dist/news/index.html` と `dist/news/<slug>/index.html` が生成される。

- [ ] **Step 2: サイトマップ確認**

Run: `npm run build` 後、`dist/` 内のサイトマップを確認:

```bash
grep -o '/news[^<"]*' dist/sitemap-0.xml | sort -u
```

Expected: `/news/` と各記事 `/news/<slug>/` が含まれる（draft は含まれない）。

- [ ] **Step 3: 受け入れ基準チェック（スペック §9）**

- [ ] `/admin` に「News」があり記事作成できる（Task 2 で確認済み）
- [ ] `npm run build` 成功
- [ ] `/news` がハイブリッド型で描画、カテゴリ絞り込み動作
- [ ] `/news/<slug>` が全構成要素込みで描画
- [ ] トップ `#news` が最新自動表示、「すべて見る」→ `/news`
- [ ] 記事ページに NewsArticle / BreadcrumbList / Organization（faqあれば FAQPage）JSON-LD、canonical、OGP/Twitter Card が出力（Task 7 Step2 で確認）

- [ ] **Step 4: 最終コミット（必要なら）**

検証のみで変更が無ければコミット不要。微修正が出た場合は内容に応じたメッセージでコミットする。

---

## Self-Review メモ（計画作成者による確認済み）

- スペック §1〜§10 の各要件にタスクを割当済み（基盤=T1/T2、データ=T3、SEO/AEO=T4・T7、レイアウト=T5、ポータル=T6、詳細=T7、トップ連動/配線=T8、受け入れ=T9）。
- カテゴリ値・スキーマ項目名（`authorRole`/`authorAvatar`/`summary`/`faq`/`featured`/`draft`）は content.config.ts・Collections.tsx・両ページ間で一致。
- `post.id` を slug として一貫使用（一覧リンク・getStaticPaths・関連記事すべて `post.id`）。
- 既存テスト基盤が無いため検証は build＋dist 確認に統一。スペックの「test」要件はこの方針に合致。

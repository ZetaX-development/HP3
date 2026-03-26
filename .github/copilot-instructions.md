# Amplify - Astro SaaS テンプレート開発ガイド

## プロジェクト概要

Amplify は Astro v5 + Tailwind CSS v4 で構築された多言語対応 SaaS / ブログテンプレート。Keystatic CMS を使用したコンテンツ管理と、Starwind UI コンポーネントライブラリを統合。

## アーキテクチャの要点

### コンテンツ管理の三層構造
1. **Astro Content Collections** (`src/content.config.ts`) - ファイルベースのコンテンツ API
   - `blog`, `authors`, `otherPages`, `codeToggles` コレクション
   - `glob` loader で `src/data/` からマークダウンファイルを読み込み
2. **Keystatic CMS** (`keystatic.config.tsx`) - ビジュアルコンテンツ編集
   - dev では local mode、本番では cloud mode で動作
   - コレクション名に言語サフィックス（例: `blogEN`, `blogFR`）
3. **JSON 設定ファイル** (`src/config/**/*.json`, `.json.ts`)
   - サイト設定、ナビゲーション、FAQ、チームなどの構造化データ

### 国際化（i18n）システム
- **設定の中心**: `src/config/siteSettings.json.ts` と `src/config/translationData.json.ts`
- **ロケール対応ページ**: `/fr/**/*.astro` が各言語のミラーページ
- **専用スクリプト**: `npm run config-i18n` でロケール設定を対話的に更新
  - `astro.config.mjs`, Keystatic, データファイルを一括更新
  - 単一言語の場合、翻訳機能を自動削除
- **ユーティリティ**:
  - `getLocaleFromUrl(url)`: URL からロケール抽出（`Astro.currentLocale` の代替）
  - `filterCollectionByLanguage()`: コレクションを言語でフィルタリング
  - `useTranslations(locale)`: テキスト翻訳関数を取得

### パスエイリアス（tsconfig.json）
```typescript
"@config/*" → "src/config/*"
"@js/*" → "src/js/*"
"@layouts/*" → "src/layouts/*"
"@components/*" → "src/components/*"
"@assets/*", "@images/*", "@videos/*" → "src/assets/**"
```

### スタイリングアーキテクチャ
- **Tailwind v4** (`@tailwindcss/vite`) - CSS ファーストの新しいエンジン
- **CSS テーマ定義**: `src/styles/tailwind-theme.css` で `@theme` ブロックを使用
- **コンポーネントバリアント**: `tailwind-variants` (`tv()`) で型安全なバリアント管理
  - 例: `src/components/starwind/button/Button.astro`
- **グローバルスタイル**: `src/styles/global.css` が `BaseLayout.astro` で読み込まれる

### Starwind コンポーネントシステム
- **場所**: `src/components/starwind/**` - 32 個の UI コンポーネント
- **設定**: `starwind.config.json` でバージョンとオプションを管理
- **パターン**: 各コンポーネントは `tv()` でスタイルバリアントを定義
  ```typescript
  export const button = tv({
    base: "...",
    variants: { variant: {...}, size: {...} }
  })
  ```

## 重要な開発ワークフロー

### ビルド＆デプロイ
```bash
npm run dev        # 開発サーバー（localhost:3000）
npm run build      # Netlify 向けビルド（SSR + 静的生成）
npm run preview    # ビルド結果をローカルプレビュー
```

### i18n 設定変更
```bash
npm run config-i18n  # 対話式でロケール追加/削除、設定ファイル自動更新
```
- 新しい言語を追加する際は、`src/pages/[lang]/` と `src/config/[lang]/` を作成
- Keystatic コレクションも対応する言語バリアントを追加

### Keystatic CMS 削除
```bash
npm run remove-keystatic  # Keystatic 関連コードと依存関係を完全削除
```

### コード品質
```bash
npm run format  # ESLint + Prettier で自動整形
npm run lint    # ESLint によるコードチェック
```

## プロジェクト固有の規約

### コンテンツコレクションの言語フィルタリング
ページの `getStaticPaths()` で必ず `filterCollectionByLanguage()` を使用:
```typescript
const pages = await getCollection("otherPages", ({ data }) => data.draft !== true);
const filtered = filterCollectionByLanguage(pages, currentLocale);
```

### 下書き除外パターン
- ファイル名が `_` で始まる場合は自動除外（glob pattern: `**/[^_]*.{md,mdx}`）
- frontmatter で `draft: true` を設定して手動除外

### 多言語ページの mappingKey
- `mappingKey` フィールドで言語間のページ対応を管理（SEO の hreflang 用）
- 同一コンテンツの異なる言語版は同じ `mappingKey` を設定

### カスタムコンポーネントの自動インポート
`astro.config.mjs` の `astro-auto-import` により、以下はインポート不要:
- `Admonition.astro` - MDX ファイル内で直接使用可能

### アニメーション設定
- `siteSettings.useAnimations` でサイト全体のアニメーションを制御
- `tw-animate-css` と `motion-on-scroll` を使用
- View Transitions は `siteSettings.useViewTransitions` で制御

## 統合と外部依存

### Netlify デプロイ
- **Adapter**: `@astrojs/netlify` - SSR サポート
- **設定**: `netlify.toml` で build コマンドと publish ディレクトリを指定
- **画像最適化**: `imageCDN: false` に設定（Astro Assets を使用）

### Keystatic Cloud
- 本番環境: `cloud: { project: "cosmic-themes/amplify" }`
- 認証: Keystatic Cloud アカウントが必要（最大 3 ユーザー無料）
- アクセス: `/keystatic` または `/admin`（リダイレクト設定あり）

### React 統合
- Keystatic UI に必要なため `@astrojs/react` を統合
- `jsxImportSource: "react"` で React 19 を使用

## 主要ファイルの役割

- [astro.config.mjs](astro.config.mjs) - Astro 設定、i18n ルーティング、インテグレーション
- [src/config/siteSettings.json.ts](src/config/siteSettings.json.ts) - ロケール定義、アニメーション設定
- [src/config/translationData.json.ts](src/config/translationData.json.ts) - データ翻訳とテキスト翻訳のマッピング
- [src/content.config.ts](src/content.config.ts) - コンテンツコレクションスキーマ定義
- [keystatic.config.tsx](keystatic.config.tsx) - CMS コレクションとフィールド定義
- [src/js/localeUtils.ts](src/js/localeUtils.ts) - ロケール取得とコレクションフィルタリング
- [scripts/config-i18n.js](scripts/config-i18n.js) - i18n 設定の自動化スクリプト

## デバッグのヒント

- **ロケール問題**: `getLocaleFromUrl(Astro.url)` を使用（`Astro.currentLocale` は undefined の可能性）
- **コンテンツが表示されない**: `draft: false` と glob pattern の `[^_]*` を確認
- **Keystatic エラー**: dev 環境では local storage、本番では cloud 設定を確認
- **CSS が適用されない**: Tailwind v4 では `@theme` ブロック内でトークンを定義

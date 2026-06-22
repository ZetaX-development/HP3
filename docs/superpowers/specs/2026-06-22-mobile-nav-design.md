# スマホ対応（モバイルナビ）設計

- 日付: 2026-06-22
- ステータス: 承認済み（全自動実装）

## 課題
スマホ幅でナビの `.nav-links/.nav-cta/.lang-toggle` が `display:none`（一部ページは隠す指定すら無く崩れる）なのに、代替のモバイルメニューが無く、スマホでナビゲートできない。

## 方針（承認済み）
- レイアウト: **A = フルスクリーン オーバーレイ**、配色はブランド紺、ハンバーガーは右上。
- 重複回避のため **共有コンポーネント `src/components/Nav/MobileNav.astro`** に集約（マークアップ＋`is:global`CSS＋script）。各ページは import＋`<MobileNav />` の1行のみ。

## コンポーネント `MobileNav.astro`
- ハンバーガー(≡)ボタン：`@media (max-width:768px)` でのみ表示。同メディアで `.nav .nav-links/.nav-cta/.lang-toggle` を `display:none !important`（隠す指定が無いページも一括正常化）。
- フルスクリーン オーバーレイ（`position:fixed; inset:0;` 紺背景）：ホーム / Services（一覧+Zeta各種）/ Company（ニュース・会社紹介）/ お問い合わせ(CTA) / JP・EN / ×閉じる。
- リンクは絶対パス（どのページからも有効）、`data-ja`/`data-en` 付き。
- script：開閉トグル＋`body`スクロールロック＋Escで閉じる。言語ボタンは既存の `.lang-btn[data-lang]` を委譲クリック（無ければ `data-lang` 属性を設定）。
- ブレークポイントは既存に合わせ **768px**。

## 適用先（import＋`<MobileNav />`）
- 独立ページ（`<nav class="nav">` を持つ）: index, about, ai-dx, ai-training, anomaly-detection, hardware, security, security-policy, privacy-policy, terms
- 共有レイアウト: NewsLayout.astro（ニュース/サービスを一括カバー）
- 404 は BaseLayout（テーマ側ナビ）のため対象外。

## 付帯
- 横はみ出し是正：メディアクエリ0の anomaly-detection 等で必要なら最小ガード（`overflow-x` / `max-width:100%`）。

## 受け入れ基準
- スマホ幅で各ページに≡が出て、タップで全画面メニュー → 各リンクで遷移できる。
- スマホでデスクトップ用ナビが隠れ、横スクロールが出ない。
- `npm run build` 成功。本番反映後、主要ページがスマホで操作可能。

# サービス専用ページ `/services`（Zetaブランド・ビジュアルカード）設計

- 日付: 2026-06-21
- ステータス: 承認済み（実装計画へ）
- スコープ: 専用ページ `/services` 新設 ＋ ナビ/トップの名称・導線をZetaブランドに統一

## 目的
algomatic風の「ビジュアル先行カード」で、ZetaXの4サービスをプロダクト的（Zeta◯◯）に魅力的へ見せる専用ページを新設する。

## 確定事項（ブレストでの決定）
- レイアウト: **B = ビジュアル先行カード**（2列・モバイル1列）
- カードのビジュアル: **① ブランドグラデ帯（紺〜青）＋ラインアイコン＋番号**（実写真は使わない）
- 適用範囲: **専用ページ `/services` を新設**（トップは残す）
- ブランド名統一: 4サービスを **Zeta名** に統一

## サービス一覧（4件）
各カード = ヘッダー（グラデ＋SVGアイコン＋番号）／**Zeta名（大）**／日本語サブ／タグ／「詳細を見る →」。カード全体が詳細ページへのリンク。

| # | 表示名 | 日本語サブ | アイコン(SVG) | リンク | タグ（現状トップ流用） |
|---|---|---|---|---|---|
| 01 | Zeta Consulting | AI/ITコンサルティング・開発 | 回路/ノード | /ai-dx | 戦略立案 / AI導入支援 / システム開発 / DX推進 / 運用・保守 |
| 02 | Zeta Shield | セキュリティコンサルティング | 盾 | /security | 脆弱性診断 / ポリシー策定 / 次世代暗号 PQC / 都内大手銀行実績 |
| 03 | Zeta Coach | AI研修・リテラシー教育 | 学帽 | /ai-training | 上場企業実績 / 士業事務所 / 製造業 / カスタマイズ設計 |
| 04 | Zeta Edge | ハードウェア開発 | チップ | /hardware | （現状トップのハードウェアカードのタグを流用） |

説明文（service-desc）は現状トップ `#services` の各カード本文を流用。

## ページ構成 `src/pages/services.astro`
- 共有レイアウト `src/layouts/NewsLayout.astro` を流用（ナビ・フッター・グローバルCSS・`NewsSeo` を再利用）。
  - props: `title="サービス — ZetaX"`, `description`（サービス概要）, `ogType="website"`。
  - NewsSeo は website モードで canonical / OGP / Organization JSON-LD を出力（NewsArticleは出ない）。
- セクション: `section-label` "Services" ＋ 見出し「サービス」＋ リード文（現状トップのサブ文「AI/ITのコンサルから開発、セキュリティ、ハードウェアまで…完全内製」を流用）。
- `.services-page-grid`（2列／900px以下1列）に4枚のカード。
- 末尾CTA: 「ご相談はこちら →」→ `/#contact`。
- スコープCSSは `services.astro` 内の `<style>`。CSS変数（--accent, --border, --bg-card, --text-* 等）はNewsLayoutのグローバルから利用。

### カード構造（例・01）
```
<a class="svc-card" href="/ai-dx/">
  <div class="svc-card-head">  <!-- グラデ帯 -->
    <svg class="svc-icon">…</svg>
    <span class="svc-num">01</span>
  </div>
  <div class="svc-card-body">
    <h3 class="svc-name">Zeta Consulting</h3>
    <p class="svc-sub">AI/ITコンサルティング・開発</p>
    <p class="svc-desc">…（流用）…</p>
    <div class="svc-tags"><span class="svc-tag">戦略立案</span>…</div>
    <span class="svc-link">詳細を見る →</span>
  </div>
</a>
```

## 配線（名称・導線の統一）
- `src/pages/index.astro`:
  - ナビ「サービス ▾」ドロップダウンの先頭に **「サービス一覧」→ `/services/`** を追加。各項目ラベルを Zeta名 に更新（Zeta Consulting / Zeta Shield / Zeta Coach / Zeta Edge）。リンク先（/ai-dx 等）は維持。
  - ヒーロー等の「サービスを見る」ボタン（`href="#services"`）→ `href="/services/"`。
  - トップ `#services` セクションの各カード `service-title` を Zeta名 に更新（日本語サブは `service-badge-label` 等で併記、または見出し下に小さく）。説明・タグ・リンクは維持。
- リンクは末尾スラッシュ `/services/` で統一（既存ニュースに合わせる）。

## 範囲外
- 各詳細ページ（/ai-dx, /security, /ai-training, /hardware）の本文作り込み。Zeta名は必要なら上部に軽く併記する程度（本タスクでは必須としない）。
- `/anomaly-detection`（プロダクト）。
- 多言語（en/fr）の個別最適化。`data-ja`/`data-en` は既存トグルに合わせ、英語は当面 Zeta名＋英語サブで対応。

## 受け入れ基準
- `npm run build` 成功、`/services/` が生成される。
- `/services/` が2列ビジュアルカードで4サービス（Zeta名）を表示し、各カードが対応詳細ページにリンクする。
- カードヘッダーがブランドグラデ＋アイコン＋番号で表示される。
- ナビ「サービス ▾」に「サービス一覧」(/services/) があり、ラベルがZeta名。トップ「サービスを見る」→ /services/。
- トップ #services のカード見出しがZeta名に統一されている。
- `/services/` に canonical / OGP / Organization JSON-LD が出力される。
- 既存サイトと同一のヘッダー/フッター/配色で表示される。

## 留意
- `NewsLayout` は実質サイト共通レイアウトとして流用する（名称はNewsだが機能的に汎用）。将来 `SiteLayout` へ改称する余地はあるが本タスクでは行わない。

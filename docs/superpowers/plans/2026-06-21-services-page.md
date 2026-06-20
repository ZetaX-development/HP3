# サービス専用ページ `/services` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zetaブランドのビジュアル先行カードで4サービスを見せる専用ページ `/services` を新設し、トップ/ナビの名称・導線をZeta名に統一する。

**Architecture:** 既存の共有レイアウト `NewsLayout`（サイト共通chrome＋SEO）を流用して `src/pages/services.astro` を1枚作る。カードは frontmatter のデータ配列＋インラインSVGアイコンで描画。トップ `index.astro` のナビ・フッター・#services見出し・ヒーローボタンをZeta名/`/services/` に更新。

**Tech Stack:** Astro 5（静的ページ）、共有 `NewsLayout.astro`、スコープCSS。テストフレームワークは無いため検証は `npm run build` ＋ `dist/` 出力確認。

**Spec:** `docs/superpowers/specs/2026-06-21-services-page-design.md`

---

## 前提
- パッケージマネージャは npm。検証は `npm run build` 成功＋ `dist/` 確認（ユニットテストなし）。
- リンクは末尾スラッシュ `/services/` で統一。
- コミット末尾に `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`。
- 作業ブランチ：新規に `feat/services-page` を切る（mainで直接作業しない）。

## File Structure
- 作成: `src/pages/services.astro` — `/services` ページ本体（4サービスのZetaカード＋スコープCSS）。
- 変更: `src/pages/index.astro` — ナビdropdown（サービス一覧追加＋Zetaラベル）、ヒーロー「サービスを見る」→`/services/`、フッターのサービスリンク・ラベル、#servicesカード見出しをZeta名へ。

---

## Task 0: 作業ブランチ作成

- [ ] **Step 1: ブランチ作成**

```bash
cd /Users/yosato/HP3
git checkout -b feat/services-page
git branch --show-current   # 期待: feat/services-page
```

---

## Task 1: `/services` ページ作成

**Files:**
- Create: `src/pages/services.astro`

- [ ] **Step 1: ページを作成**

`src/pages/services.astro` に以下を **そのまま** 作成する:

```astro
---
import NewsLayout from "@layouts/NewsLayout.astro";

const services = [
  {
    num: "01",
    name: "Zeta Consulting",
    sub: "AI/ITコンサルティング・開発",
    href: "/ai-dx/",
    icon: "consulting",
    desc: "何を作るべきか分からない段階から伴走します。課題定義・要件整理・設計・開発・運用保守まで、一つのチームが責任を持って一気通貫で対応します。金融、医療、流通、建設など幅広い業界に対応しています。",
    tags: ["戦略立案", "AI導入支援", "システム開発", "DX推進", "運用・保守"],
  },
  {
    num: "02",
    name: "Zeta Shield",
    sub: "セキュリティコンサルティング",
    href: "/security/",
    icon: "shield",
    desc: "都内大手銀行をはじめとする金融機関との支援実績を持つセキュリティコンサルチームです。脆弱性診断・セキュリティポリシー策定にとどまらず、量子コンピュータ時代に対応した次世代暗号（耐量子暗号）の導入支援まで対応します。",
    tags: ["脆弱性診断", "ポリシー策定", "次世代暗号 / PQC", "都内大手銀行実績"],
  },
  {
    num: "03",
    name: "Zeta Coach",
    sub: "AI研修・リテラシー教育",
    href: "/ai-training/",
    icon: "coach",
    desc: "上場企業・士業事務所・製造業など、幅広い組織でのAI研修実績があります。経営層から現場社員まで対象に合わせてプログラムを設計し、AIを実務で使いこなせる人材の育成をサポートします。ツールの操作研修にとどまらず、業務への応用・活用戦略まで一貫して対応します。",
    tags: ["上場企業実績", "士業事務所", "製造業", "カスタマイズ設計"],
  },
  {
    num: "04",
    name: "Zeta Edge",
    sub: "ハードウェア開発",
    href: "/hardware/",
    icon: "edge",
    desc: "PCB基板の設計から組み込みソフトウェアの実装まで、ハードウェア開発を完全内製で行います。主力プロダクトは製造業向け予兆保全システム。工場の機械が壊れる前に異常を検知し、突発的な設備停止を未然に防ぎます。クラウド・Wi-Fi不要で動作するため、ネットワーク環境が整っていない工場でも即日導入が可能です。",
    tags: ["PCB基板設計", "組み込み開発", "予兆保全システム", "クラウド不要", "3工場導入済み"],
  },
];

// インラインSVGラインアイコン（stroke=currentColor）
const icons: Record<string, string> = {
  consulting: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 6h6a2 2 0 0 1 2 2v2M7 18h6a2 2 0 0 0 2-2v-2"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9.5 12l1.8 1.8L15 10"/></svg>`,
  coach: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-4 9 4-9 4z"/><path d="M7 10v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5"/><path d="M21 8v5"/></svg>`,
  edge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3"/></svg>`,
};
---

<NewsLayout
  title="サービス — ZetaX"
  description="ZetaXのサービス。AI/ITコンサルから開発、セキュリティ、AI研修、ハードウェアまで、完全内製で一気通貫に提供します。"
  ogType="website"
>
  <section class="section">
    <div class="container">
      <span class="section-label">Services</span>
      <h1 class="section-heading">サービス</h1>
      <p class="section-sub">AI/ITのコンサルから開発、セキュリティ、ハードウェアまで。すべて自社チームが完全内製でお届けします。</p>

      <div class="svc-grid">
        {services.map((s) => (
          <a class="svc-card" href={s.href}>
            <div class={`svc-head svc-head-${s.icon}`}>
              <span class="svc-icon" set:html={icons[s.icon]} />
              <span class="svc-num">{s.num}</span>
            </div>
            <div class="svc-body">
              <h2 class="svc-name">{s.name}</h2>
              <p class="svc-sub">{s.sub}</p>
              <p class="svc-desc">{s.desc}</p>
              <div class="svc-tags">
                {s.tags.map((t) => <span class="svc-tag">{t}</span>)}
              </div>
              <span class="svc-link">詳細を見る →</span>
            </div>
          </a>
        ))}
      </div>

      <div class="svc-cta">
        <a href="/#contact" class="btn-sm">ご相談はこちら →</a>
      </div>
    </div>
  </section>
</NewsLayout>

<style>
  .svc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2.5rem 0 2rem; }
  .svc-card { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-card); transition: transform 0.2s, box-shadow 0.2s; }
  .svc-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }

  .svc-head { position: relative; height: 132px; background: linear-gradient(135deg, #0d2060, #3b5fdf); display: flex; align-items: center; justify-content: center; }
  .svc-head-shield { background: linear-gradient(135deg, #0a1840, #1a3fbf); }
  .svc-head-coach { background: linear-gradient(135deg, #14224f, #4a5ad0); }
  .svc-head-edge { background: linear-gradient(135deg, #0d2060, #6a7aff); }
  .svc-icon { color: #fff; opacity: 0.95; }
  .svc-icon :global(svg) { width: 46px; height: 46px; display: block; }
  .svc-num { position: absolute; right: 16px; bottom: 8px; font-family: var(--font-en); font-size: 2.6rem; font-weight: 800; color: rgba(255,255,255,0.16); line-height: 1; }

  .svc-body { padding: 1.6rem; display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
  .svc-name { font-family: var(--font-en); font-size: 1.35rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em; }
  .svc-sub { font-size: 0.82rem; font-weight: 600; color: var(--accent); }
  .svc-desc { font-size: 0.9rem; line-height: 1.85; color: var(--text-secondary); margin-top: 0.3rem; }
  .svc-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.4rem; }
  .svc-tag { font-family: var(--font-jp); font-size: 0.68rem; font-weight: 600; padding: 3px 9px; border-radius: 2px; background: var(--accent-pale); color: var(--accent); }
  .svc-link { margin-top: auto; padding-top: 0.9rem; font-family: var(--font-en); font-size: 0.82rem; font-weight: 600; color: var(--accent); }

  .svc-cta { text-align: center; margin-top: 1.5rem; }

  @media (max-width: 900px) {
    .svc-grid { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 2: ビルドして描画確認**

Run: `cd /Users/yosato/HP3 && npm run build`
Expected: 成功。`dist/services/index.html` が生成される。確認:
```bash
ls dist/services/index.html
grep -c 'svc-card' dist/services/index.html          # >= 4
grep -o 'Zeta Consulting\|Zeta Shield\|Zeta Coach\|Zeta Edge' dist/services/index.html | sort -u   # 4種すべて
grep -o 'href="/ai-dx/"\|href="/security/"\|href="/ai-training/"\|href="/hardware/"' dist/services/index.html | sort -u   # 4リンク
grep -c 'svg' dist/services/index.html               # アイコンSVGが含まれる(>=4)
grep -c 'rel="canonical"\|application/ld+json' dist/services/index.html   # SEO出力あり
```
（ディスク逼迫でビルドが ENOSPC のみで失敗した場合は DONE_WITH_CONCERNS とし、ディスク確保は行わない。）

- [ ] **Step 3: Commit**

```bash
cd /Users/yosato/HP3
git add src/pages/services.astro
git commit -m "feat(services): add /services page with Zeta-branded visual cards

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: トップページの名称・導線をZetaに統一

**Files:**
- Modify: `src/pages/index.astro`

各編集は「探す→置換」。対象文字列は現状のもの。**他の箇所は触らない**。

- [ ] **Step 1: ナビ ドロップダウンに「サービス一覧」追加＋ラベルをZeta名に**

`src/pages/index.astro` のナビ内、次のブロック（概ね 1008〜1012 行）:
```html
            <p class="nav-dropdown-label">Services</p>
            <a href="/ai-dx" data-ja="AI/ITコンサル・開発" data-en="AI/IT Consulting & Dev">AI/ITコンサル・開発</a>
            <a href="/security" data-ja="セキュリティコンサル" data-en="Security Consulting">セキュリティコンサル</a>
            <a href="/ai-training" data-ja="AI研修" data-en="AI Training">AI研修</a>
            <a href="/hardware" data-ja="ハードウェア開発" data-en="Hardware Dev">ハードウェア開発</a>
```
を次に置換:
```html
            <p class="nav-dropdown-label">Services</p>
            <a href="/services/" data-ja="サービス一覧" data-en="All Services">サービス一覧</a>
            <a href="/ai-dx" data-ja="Zeta Consulting" data-en="Zeta Consulting">Zeta Consulting</a>
            <a href="/security" data-ja="Zeta Shield" data-en="Zeta Shield">Zeta Shield</a>
            <a href="/ai-training" data-ja="Zeta Coach" data-en="Zeta Coach">Zeta Coach</a>
            <a href="/hardware" data-ja="Zeta Edge" data-en="Zeta Edge">Zeta Edge</a>
```

- [ ] **Step 2: ヒーローの「サービスを見る」ボタンを /services/ へ**

行 1074 付近:
```html
          <a href="#services" class="btn-primary" data-ja="サービスを見る" data-en="Our Services">サービスを見る</a>
```
を:
```html
          <a href="/services/" class="btn-primary" data-ja="サービスを見る" data-en="Our Services">サービスを見る</a>
```

- [ ] **Step 3: フッターのサービスリンク ラベルをZeta名に**

行 1828〜1831 付近:
```html
            <li><a href="/ai-dx" data-ja="AI/ITコンサル・開発" data-en="AI/IT Consulting & Dev">AI/ITコンサル・開発</a></li>
            <li><a href="/security" data-ja="セキュリティコンサル" data-en="Security Consulting">セキュリティコンサル</a></li>
            <li><a href="/ai-training" data-ja="AI研修" data-en="AI Training">AI研修</a></li>
            <li><a href="/hardware" data-ja="ハードウェア開発" data-en="Hardware Dev">ハードウェア開発</a></li>
```
を:
```html
            <li><a href="/ai-dx" data-ja="Zeta Consulting" data-en="Zeta Consulting">Zeta Consulting</a></li>
            <li><a href="/security" data-ja="Zeta Shield" data-en="Zeta Shield">Zeta Shield</a></li>
            <li><a href="/ai-training" data-ja="Zeta Coach" data-en="Zeta Coach">Zeta Coach</a></li>
            <li><a href="/hardware" data-ja="Zeta Edge" data-en="Zeta Edge">Zeta Edge</a></li>
```

- [ ] **Step 4: #services セクションの各カード見出しをZeta名に（日本語はサブ併記）**

4箇所の `service-title`（行 1383 / 1398 / 1412 / 1426 付近）を、Zeta名（英）＋日本語サブの2段にする。サブはインラインstyleで小さく（ホームのCSSを増やさない）。

1383（ai-dx）:
```html
          <h3 class="service-title" data-ja="AI/ITコンサルティング<br>およびシステム開発" data-en="AI/IT Consulting<br>and System Development">AI/ITコンサルティング<br>およびシステム開発</h3>
```
→
```html
          <h3 class="service-title">Zeta Consulting<br><span style="font-size:0.82rem;font-weight:600;color:var(--text-secondary)">AI/ITコンサルティング・開発</span></h3>
```

1398（security）:
```html
          <h3 class="service-title" data-ja="セキュリティ<br>コンサルティング" data-en="Security<br>Consulting">セキュリティ<br>コンサルティング</h3>
```
→
```html
          <h3 class="service-title">Zeta Shield<br><span style="font-size:0.82rem;font-weight:600;color:var(--text-secondary)">セキュリティコンサルティング</span></h3>
```

1412（ai-training）:
```html
          <h3 class="service-title" data-ja="AI研修・<br>リテラシー教育" data-en="AI Training &amp;<br>Literacy Education">AI研修・<br>リテラシー教育</h3>
```
→
```html
          <h3 class="service-title">Zeta Coach<br><span style="font-size:0.82rem;font-weight:600;color:var(--text-secondary)">AI研修・リテラシー教育</span></h3>
```

1426（hardware）:
```html
          <h3 class="service-title" data-ja="ハードウェア<br>開発" data-en="Hardware<br>Development">ハードウェア<br>開発</h3>
```
→
```html
          <h3 class="service-title">Zeta Edge<br><span style="font-size:0.82rem;font-weight:600;color:var(--text-secondary)">ハードウェア開発</span></h3>
```

- [ ] **Step 5: ビルドして確認**

Run: `cd /Users/yosato/HP3 && npm run build`
Expected: 成功。確認:
```bash
grep -o 'href="/services/"' dist/index.html | sort -u                 # ナビ＋ヒーローで出現
grep -o 'Zeta Consulting\|Zeta Shield\|Zeta Coach\|Zeta Edge' dist/index.html | sort -u   # 4種(ナビ/フッター/#services)
grep -c 'href="#services"' dist/index.html                            # 期待: 0（ヒーローボタンは/services/へ移行。section id="services"自体は別物なので残る点に注意）
```
注: `<section ... id="services">` の id は残す（アンカーとして使われ得る）。ヒーローの `href="#services"` だけ `/services/` に変わっていること。

- [ ] **Step 6: Commit**

```bash
cd /Users/yosato/HP3
git add src/pages/index.astro
git commit -m "feat(services): unify nav/footer/home service names to Zeta brand, link to /services/

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: 最終ビルド検証

- [ ] **Step 1: クリーンビルド**

Run: `cd /Users/yosato/HP3 && rm -rf dist && npm run build`
Expected: エラーなく完了。`dist/services/index.html` と更新済み `dist/index.html` が生成。

- [ ] **Step 2: 受け入れ基準チェック（spec §受け入れ基準）**

- [ ] `/services/` が2列カードで4サービス（Zeta名）表示、各カードが詳細ページにリンク
- [ ] カードヘッダーがグラデ＋SVGアイコン＋番号
- [ ] ナビに「サービス一覧」(/services/)、ラベルがZeta名
- [ ] ヒーロー「サービスを見る」→ /services/
- [ ] トップ #services 見出しがZeta名
- [ ] `/services/` に canonical / OGP / Organization JSON-LD
- [ ] 既存と同一のヘッダー/フッター/配色

```bash
grep -o 'application/ld+json' dist/services/index.html | wc -l   # >=1 (Organization)
grep -c 'class="nav"\|class="footer"' dist/services/index.html   # ヘッダー/フッター存在
```

---

## Self-Review メモ（計画作成者）
- spec の全要件（/servicesページ・Bビジュアルカード・①グラデ+アイコン・Zeta名4種・配線・SEO）にタスクを割当済み（ページ=T1、配線=T2、検証=T3）。
- Zeta名・リンク（/ai-dx 等）・末尾スラッシュは全タスクで一致。
- アイコンkeyは services 配列の icon と icons マップ、`.svc-head-<icon>` クラスで一致（consulting/shield/coach/edge）。
- テスト基盤が無いため検証はbuild＋dist確認に統一（spec受け入れ基準に合致）。

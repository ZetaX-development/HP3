# 本番デプロイ準備チェックリスト（Cloudflare）

ZetaX サイトを `https://zetax.jp` に本番公開するまでに必要な作業をまとめる。
デプロイ先は **Cloudflare**（`@astrojs/cloudflare` アダプタ / `wrangler.jsonc`、Worker名 `zetax-hp`）に確定。

凡例：🔴 必須ブロッカー / 🟠 公開時までに / 🟡 任意

---

## 1. 🔴 Keystatic の保存先（本番でCMSを使うなら必須）

現状 `keystatic.config.ts` は本番で `storage: { kind: "cloud" }`、`cloud.project: "cosmic-themes/amplify"`（＝**他人のプロジェクト**）。このままだと本番で記事を保存できない／他者プロジェクトを指す。3つの選択肢から決める。

### 選択肢A（推奨・最小手数）: GitHub ストレージ
CMSの保存＝**リポジトリへ直接コミット**。Keystatic Cloud アカウント不要。

`keystatic.config.ts` を変更:
```ts
storage: {
  kind: "github",
  repo: { owner: "ZetaX-development", name: "HP3" },
},
```
- GitHub App 連携（Keystatic が案内するOAuth）を初回に許可。
- 編集者はGitHubアカウントが必要。少人数運用に最適。

### 選択肢B: Keystatic Cloud
[keystatic.cloud](https://keystatic.cloud/) でZetaX用プロジェクトを作成（無料・最大3名）し、`cloud.project` をそのIDに差し替え。非エンジニアでも使いやすいダッシュボード。

### 選択肢C: ローカルのみ（CMSは本番で使わない）
本番ではCMS編集せず、記事追加はローカルdev（`kind:"local"`）→ git push → 自動デプロイ、で運用。`/keystatic` は本番で無効化してよい。最もシンプルで安全。

> 決まったら設定変更＋ビルド確認します。どれにするか教えてください（迷えばA推奨）。

---

## 2. 🔴 Cloudflare の SESSION KV バインディング

Astro のセッション機能が Cloudflare アダプタで有効になり、`SESSION` という KV バインディングを要求する（dev起動時に警告が出ている）。本番で未設定だとランタイムエラーの恐れ。

手順:
```bash
npx wrangler kv namespace create SESSION
```
返ってきた `id` を `wrangler.jsonc` に記入（該当箇所にコメントで雛形を用意済み）:
```jsonc
"kv_namespaces": [
  { "binding": "SESSION", "id": "<上で得たid>" }
]
```

> 注: Keystatic を「選択肢C（本番でCMS無効）」にする場合でも、Astro セッションを使う箇所がなければこの警告は無害。確実を期すなら設定推奨。

---

## 3. 🔴 問い合わせフォームが未送信（本番で問い合わせが消失）

`src/pages/index.astro` の `submitForm()` は1秒待って「送信完了」を表示するだけで**実際には送信していない**。本番前に実装が必要。選択肢:

### 選択肢A（推奨・Cloudflareと相性◎）: Pages/Worker のサーバ関数
`src/pages/api/contact.ts`（SSR）を作り、フォームを `POST /api/contact` に送信。メール送信は [Resend](https://resend.com) 等のAPIを利用。雛形:

```ts
// src/pages/api/contact.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "");
  const message = String(form.get("message") ?? "");
  if (!name || !email) {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }
  // 例: Resend API（要 RESEND_API_KEY を環境変数/CFシークレットに設定）
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "noreply@zetax.jp",
      to: "info@zetax.jp",
      subject: `お問い合わせ: ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
```
クライアント側 `submitForm()` を `fetch("/api/contact", { method:"POST", body: new FormData(form) })` に置き換え、成功時のみ完了表示に。

### 選択肢B（最小実装）: フォームサービス
[Formspree](https://formspree.io/) / [Web3Forms](https://web3forms.com/) 等のエンドポイントに `<form action="...">` をPOSTするだけ。サーバコード不要。最短で動く。

> どちらにするか決めてもらえれば実装します（メール送信先・サービス選定が必要）。

---

## 4. 🟠 コンテンツ・会社情報の実データ化

- **ニュース記事が仮**: ヒーロー画像は流用の `storm-*.webp`、本文は短いスタブ。実画像・実記事に差し替え（CMS or `src/data/news/`）。
- **会社情報のプレースホルダ**: `src/config/{ja,en,fr}/siteData.json.ts` の住所「1234 Main Street / New York」「(123) 456-7890」を実住所・実電話に。`info@zetax.jp` は要確認。
- **anomaly-detection ページ**の「準備中」事例ボックス（`src/pages/anomaly-detection.astro`）の扱い（記事化 or 非表示）。

> 注: en/fr の「お客様の声(testimonialData)」「FAQ(faqData)」にCosmic Themes称賛文やcosmicthemes.comリンクが残るが、**現在のライブページからは未使用＝公開サイトには表示されない**（残骸）。気になればコンポーネントごと削除可（未使用のため安全、ビルドで検証）。

---

## 5. 🟡 仕上げ（対応済み）

- ✅ 誤った Jekyll GitHub Pages ワークフロー削除（main pushでの誤起動を停止）
- ✅ 非Cloudflareのデプロイ残骸（netlify.toml / .vercel / 重複wrangler）を整理
- ✅ favicon を全ページに追加
- ✅ コピーライト年 2024 → 2026
- ✅ ニュースリンクを `/news/`（末尾スラッシュ）に統一
- ✅ Keystatic管理画面ブランド名／fr siteData を ZetaX 化

残りの任意項目:
- `fmtDate` の3ファイル重複を共有ユーティリティ化（保守性）
- `NewsLayout` が既存サイトCSSを複製 → 共有スタイルシート化の余地
- 未使用テーマ部品（`Cta/*`・`Hero/*`・`Testimonials/*`・`Faq/*` 等）と未使用依存 `@astrojs/netlify` の削除

---

## 6. デプロイ手順（Cloudflare）

1. 上記 🔴（Keystatic保存先・SESSION KV・フォーム）を解決。
2. このPR（`feat/news-portal`）をレビュー → `main` にマージ。
3. Cloudflare 側のビルド設定を確認:
   - ビルドコマンド: `npm run build`
   - 出力: `dist`（アダプタが `dist/_worker.js/` を生成）
   - 設定ファイル: `wrangler.jsonc`
4. 必要な環境変数/シークレットを Cloudflare に登録（例: `RESEND_API_KEY`、Keystatic Cloud利用時の関連値）。
5. デプロイ後、`https://zetax.jp/news/`・記事・`/admin`・問い合わせ送信・サイトマップ（`/sitemap-index.xml`）を実機確認。
6. Google Search Console でサイトマップ送信、リッチリザルトテストで記事の構造化データを検証。

---

## 7. 検証コマンド（ローカル）

```bash
npm run build          # クリーンビルド
npm run preview        # dist をローカル配信して目視
# 構造化データ確認:
grep -o 'application/ld+json' dist/news/bank-security-consulting/index.html | wc -l   # 3
```

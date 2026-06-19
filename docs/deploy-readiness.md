# 本番デプロイ準備チェックリスト（Cloudflare）

ZetaX サイトを `https://zetax.jp` に本番公開するまでに必要な作業をまとめる。
デプロイ先は **Cloudflare**（`@astrojs/cloudflare` アダプタ / `wrangler.jsonc`、Worker名 `zetax-hp`）に確定。

凡例：🔴 必須ブロッカー / 🟠 公開時までに / 🟡 任意

---

## 1. ✅ Keystatic の保存先 → GitHub ストレージ（設定済み）

`keystatic.config.ts` を **GitHub ストレージ**に変更済み（dev=local、prod=github、`repo: ZetaX-development/HP3`）。CMSの保存＝**リポジトリへ直接コミット**。Keystatic Cloud アカウント不要。

**残りの一回だけの設定（本番デプロイ前に必要）:**
- 本番で `/keystatic` を開くと GitHub App 連携を案内されるので承認。
- 連携で発行される以下を **Cloudflare の環境変数/シークレット**に登録:
  - `KEYSTATIC_GITHUB_CLIENT_ID`
  - `KEYSTATIC_GITHUB_CLIENT_SECRET`
  - `KEYSTATIC_SECRET`（任意の十分長いランダム文字列）
- ローカル開発はこれらなしでOK（`kind:"local"`）。
- 編集者は対象リポジトリへの権限を持つGitHubアカウントが必要（少人数運用向き）。

> 非エンジニアが多用するなら Keystatic Cloud（[keystatic.cloud](https://keystatic.cloud/) でZetaX用プロジェクト作成 → `storage:{kind:"cloud"}`＋`cloud.project`）に切り替える選択肢もあり。今はGitHubストレージで確定。

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

## 3. ✅ 問い合わせフォーム → `/api/contact`（実装済み）

以前は「送信完了」を出すだけの偽実装だった。**実装済み**:
- `src/pages/api/contact.ts`（SSR, `prerender=false`）でフォームを受信し、[Resend](https://resend.com) で `info@zetax.jp` へメール送信（`reply_to` は送信者）。
- `src/pages/index.astro` の `submitForm()` を実 `POST /api/contact` に変更。成功時のみ完了表示、失敗時は「info@zetax.jp へ直接連絡」を案内してボタン復帰。
- APIキー未設定時は `503 not_configured` を返し、フォールバック案内を表示（問い合わせを黙って失う事故を防止）。

**残りの一回だけの設定（本番で実際にメールを送るため）:**
1. [Resend](https://resend.com) で無料アカウント作成。
2. **`zetax.jp` ドメインを Resend で検証**（DNSにSPF/DKIMレコードを追加）。検証後 `noreply@zetax.jp` から送信可能に。
3. APIキーを発行し、**Cloudflare のシークレット**に `RESEND_API_KEY` として登録。
4. ローカルで試すなら、リポジトリ直下に `.dev.vars`（gitignore対象）を作り `RESEND_API_KEY=xxxxx` を記載。

> 送信先(`info@zetax.jp`)や送信元(`noreply@zetax.jp`)を変える場合は `src/pages/api/contact.ts` の `TO`/`FROM` を編集。Resendのドメイン検証が面倒なら、フォームサービス（Formspree / Web3Forms）に切り替える手もある（その場合フォームの送信先だけ差し替え）。

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

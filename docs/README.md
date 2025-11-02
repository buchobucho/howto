# 講座資料 / Course Materials

このディレクトリには、様々な講座・コースのスライド資料やドキュメントが格納されています。

## 📚 利用可能な講座

### 1. AI×TikTokアフィリエイト完全攻略ガイド

**ファイル**:
- [詳細ガイド（Markdown）](./AI-TikTok-Affiliate-Guide.md)
- [プレゼンテーションスライド（Marp形式）](./AI-TikTok-Affiliate-Slides.md)

**概要**:
初心者向けのAI×TikTokアフィリエイト講座。AIツールを活用してTikTokで効率的にアフィリエイト収益を得る方法を解説しています。

**内容**:
- AI×TikTokアフィリエイトの基礎
- 必要なツールと準備
- 実践的な6ステップ
- 収益化のポイント
- 成功戦略

**対象者**:
- アフィリエイト初心者
- TikTokで収益化したい方
- AIツールを活用したい方
- 副業を始めたい方

**元動画**: [YouTube](https://www.youtube.com/watch?v=gNc-FSfBDcA)

---

## 📖 使い方

### Markdownドキュメント

通常のMarkdownビューアーで閲覧できます：
```bash
# VSCode等のエディタで開く
code AI-TikTok-Affiliate-Guide.md
```

### プレゼンテーションスライド

Marp対応のツールで表示できます：

#### 1. Marp CLIを使用
```bash
# Marp CLIをインストール
npm install -g @marp-team/marp-cli

# スライドをHTMLに変換
marp AI-TikTok-Affiliate-Slides.md -o slides.html

# PDFに変換
marp AI-TikTok-Affiliate-Slides.md -o slides.pdf

# プレゼンテーションモードで表示
marp -p AI-TikTok-Affiliate-Slides.md
```

#### 2. VS Code拡張機能を使用
1. [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode)をインストール
2. `.md`ファイルを開く
3. プレビューボタンをクリック

#### 3. オンラインエディタを使用
[Marp Web](https://web.marp.app/)にアクセスして、ファイルの内容を貼り付け

---

## 🎨 スライドのカスタマイズ

### テーマの変更

スライドファイルの先頭部分で設定できます：

```markdown
---
marp: true
theme: default  # default, gaia, uncover から選択
paginate: true
backgroundColor: #fff
---
```

### 利用可能なテーマ
- `default`: シンプルで読みやすい
- `gaia`: モダンでスタイリッシュ
- `uncover`: プレゼンテーション向け

---

## 📊 資料の構成

### 詳細ガイド（Markdown）
- 包括的な情報
- 詳細な説明とコード例
- チェックリストと付録
- 自学自習に最適

### プレゼンテーションスライド（Marp）
- 要点を凝縮
- ビジュアル重視
- プレゼンテーション向け
- 講義やセミナーで使用

---

## 🔧 開発環境

### 必要なツール

```bash
# Node.js環境
node --version  # v18以上推奨

# Marp CLI（オプション）
npm install -g @marp-team/marp-cli

# PDFエクスポート用（オプション）
# Chrome/Chromiumが必要
```

### エクスポート例

```bash
# HTML出力（スタンドアロン）
marp --html AI-TikTok-Affiliate-Slides.md

# PDF出力
marp --pdf AI-TikTok-Affiliate-Slides.md

# PowerPoint形式で出力
marp --pptx AI-TikTok-Affiliate-Slides.md

# 全てのフォーマットで出力
marp AI-TikTok-Affiliate-Slides.md --html --pdf --pptx
```

---

## 📝 ライセンス

これらの資料は教育目的で作成されています。
- 個人学習での利用: ✅ 自由に利用可能
- 再配布: ✅ 許可されていますが、出典を明記してください
- 商用利用: ⚠️ 事前に許可が必要です

---

## 🤝 貢献

資料の改善提案や誤字脱字の修正は歓迎します！

1. Issueを作成して提案
2. Pull Requestを送信

---

## 📞 サポート

質問やフィードバックがある場合は：
- GitHub Issues: [howto/issues](https://github.com/buchobucho/howto/issues)
- 元動画のコメント欄

---

**作成日**: 2025年11月2日
**最終更新**: 2025年11月2日

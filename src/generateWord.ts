/**
 * Word文書生成機能
 * Miyabi動作確認のためのサンプルWord文書を生成
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

/**
 * サンプルWord文書を生成する
 */
export async function generateSampleDocument(): Promise<string> {
  // Word文書の作成
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // タイトル
          new Paragraph({
            text: 'Miyabi動作確認レポート',
            heading: HeadingLevel.HEADING_1,
          }),

          // 空白行
          new Paragraph({
            text: '',
          }),

          // セクション1: 概要
          new Paragraph({
            text: '1. 概要',
            heading: HeadingLevel.HEADING_2,
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'このドキュメントは、Miyabiフレームワークのローカル環境での動作確認のために、',
              }),
              new TextRun({
                text: 'AIエージェント',
                bold: true,
              }),
              new TextRun({
                text: 'によって自動生成されました。',
              }),
            ],
          }),

          new Paragraph({
            text: '',
          }),

          // セクション2: Miyabiについて
          new Paragraph({
            text: '2. Miyabiフレームワークとは',
            heading: HeadingLevel.HEADING_2,
          }),

          new Paragraph({
            text: 'Miyabiは、自律型AI開発を実現するフレームワークです。以下の機能を提供します：',
          }),

          new Paragraph({
            text: '• 7種類のAIエージェント（Coordinator, CodeGen, Review, Issue, PR, Deploy, Mizusumashi）',
            bullet: {
              level: 0,
            },
          }),

          new Paragraph({
            text: '• GitHubとの完全統合',
            bullet: {
              level: 0,
            },
          }),

          new Paragraph({
            text: '• 自動Issue処理パイプライン',
            bullet: {
              level: 0,
            },
          }),

          new Paragraph({
            text: '• 53ラベルの状態管理システム',
            bullet: {
              level: 0,
            },
          }),

          new Paragraph({
            text: '',
          }),

          // セクション3: 動作確認結果
          new Paragraph({
            text: '3. 動作確認結果',
            heading: HeadingLevel.HEADING_2,
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: '✓ ',
                color: '00FF00',
                bold: true,
              }),
              new TextRun({
                text: 'Miyabiフレームワークのインストール成功',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: '✓ ',
                color: '00FF00',
                bold: true,
              }),
              new TextRun({
                text: 'AIエージェントの起動成功',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: '✓ ',
                color: '00FF00',
                bold: true,
              }),
              new TextRun({
                text: 'Word文書の自動生成成功',
              }),
            ],
          }),

          new Paragraph({
            text: '',
          }),

          // セクション4: 次のステップ
          new Paragraph({
            text: '4. 次のステップ',
            heading: HeadingLevel.HEADING_2,
          }),

          new Paragraph({
            text: '1. GitHubでIssueを作成する',
            numbering: {
              reference: 'number-numbering',
              level: 0,
            },
          }),

          new Paragraph({
            text: '2. Miyabiエージェントに処理を任せる',
            numbering: {
              reference: 'number-numbering',
              level: 0,
            },
          }),

          new Paragraph({
            text: '3. 自動生成されたPRをレビューする',
            numbering: {
              reference: 'number-numbering',
              level: 0,
            },
          }),

          new Paragraph({
            text: '4. マージして完了',
            numbering: {
              reference: 'number-numbering',
              level: 0,
            },
          }),

          new Paragraph({
            text: '',
          }),

          // フッター
          new Paragraph({
            children: [
              new TextRun({
                text: '---',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: '生成日時: ' + new Date().toLocaleString('ja-JP'),
                italics: true,
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Generated by Miyabi Framework',
                italics: true,
              }),
            ],
          }),
        ],
      },
    ],
    numbering: {
      config: [
        {
          reference: 'number-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: 'left',
            },
          ],
        },
      ],
    },
  });

  // 出力ディレクトリを作成
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ファイル名を生成（タイムスタンプ付き）
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `miyabi-verification-report-${timestamp}.docx`;
  const filePath = path.join(outputDir, fileName);

  // Word文書を保存
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);

  console.log(`✓ Word文書を生成しました: ${filePath}`);
  return filePath;
}

/**
 * メイン実行関数
 */
export async function main(): Promise<void> {
  console.log('🌸 Miyabi Word文書生成ツール');
  console.log('');

  try {
    const filePath = await generateSampleDocument();
    console.log('');
    console.log('✓ 完了！');
    console.log(`  ファイル: ${filePath}`);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトとして直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

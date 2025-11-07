# Lark API統合ガイド

Lark（飛書/Feishu）APIを使用してBase（Bitable）を作成・管理するための完全ガイドです。

## 目次

1. [概要](#概要)
2. [セットアップ](#セットアップ)
3. [基本的な使い方](#基本的な使い方)
4. [API リファレンス](#apiリファレンス)
5. [使用例](#使用例)
6. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### Lark Base（Bitable）とは

Lark Baseは、Larkプラットフォームが提供する強力なデータベース・スプレッドシート機能です。以下の特徴があります：

- **柔軟なデータ構造**: テキスト、数値、日付、選択肢、添付ファイルなど多様なフィールドタイプ
- **リアルタイムコラボレーション**: 複数人での同時編集が可能
- **API統合**: プログラムからのデータ操作が可能
- **ビュー機能**: フィルター、ソート、グループ化などの表示カスタマイズ
- **権限管理**: きめ細かなアクセス制御

### このライブラリでできること

- ✅ Bitable（Base）の作成
- ✅ テーブルの作成とフィールド定義
- ✅ レコードのCRUD操作（作成・読取・更新・削除）
- ✅ バッチ処理による効率的なデータ操作
- ✅ フィルター・ソート機能を使った検索
- ✅ TypeScriptによる型安全な開発

---

## セットアップ

### 1. Larkアプリケーションの作成

1. [Lark Open Platform](https://open.larksuite.com/)にアクセス
2. 「開発者バックエンド」→「アプリを作成」をクリック
3. アプリ情報を入力して作成
4. アプリの**App ID**と**App Secret**を取得
5. 権限管理で以下の権限を有効化：
   - `bitable:app` - Base管理
   - `bitable:table` - テーブル管理
   - `bitable:record` - レコード管理

### 2. 環境変数の設定

`.env`ファイルを作成し、取得した認証情報を設定します：

```bash
LARK_APP_ID=your_app_id_here
LARK_APP_SECRET=your_app_secret_here
```

### 3. パッケージのインストール

このプロジェクトには既にLark SDKがインストールされています：

```bash
npm install @larksuiteoapi/node-sdk
```

---

## 基本的な使い方

### クイックスタート

```typescript
import { LarkService } from './src/services/LarkService.js';

// 1. LarkServiceを初期化
const larkService = new LarkService({
  appId: process.env.LARK_APP_ID!,
  appSecret: process.env.LARK_APP_SECRET!,
  appType: 'self_built',
});

// 2. Baseを作成
const bitable = await larkService.createBitable({
  name: 'My First Base',
});

console.log(`Base created: ${bitable.url}`);
```

### 完全なBaseを一度に作成

```typescript
// フィールド定義
const fields = [
  { field_name: '名前', type: 1 },          // テキスト
  { field_name: 'メール', type: 15 },       // URL
  { field_name: '年齢', type: 2 },          // 数値
];

// 初期データ
const records = [
  { fields: { 名前: '山田太郎', メール: 'yamada@example.com', 年齢: 30 } },
  { fields: { 名前: '佐藤花子', メール: 'sato@example.com', 年齢: 25 } },
];

// 一度に作成
const result = await larkService.createCompleteBase(
  'User Database',    // Base名
  'ユーザー一覧',      // テーブル名
  fields,             // フィールド定義
  records             // 初期レコード
);

console.log(`Base URL: ${result.url}`);
console.log(`Created ${result.recordIds.length} records`);
```

---

## APIリファレンス

### LarkService

#### コンストラクタ

```typescript
new LarkService(config: LarkConfig)
```

**パラメータ:**
- `config.appId` - Lark App ID（必須）
- `config.appSecret` - Lark App Secret（必須）
- `config.appType` - `'self_built'` または `'marketplace'`（省略可、デフォルト: `'self_built'`）
- `config.tenantKey` - ISVアプリの場合のテナントキー（省略可）

#### メソッド

##### `createBitable()`

新しいBitable（Base）を作成します。

```typescript
async createBitable(request: CreateBitableRequest): Promise<CreateBitableResponse>
```

**例:**
```typescript
const bitable = await larkService.createBitable({
  name: 'Project Management',
  folder_token: 'optional_folder_token',
});
```

**戻り値:**
```typescript
{
  app_token: string;  // アプリトークン
  name: string;       // Base名
  url: string;        // BaseのURL
}
```

---

##### `createTable()`

Bitable内にテーブルを作成します。

```typescript
async createTable(
  appToken: string,
  request: CreateTableRequest
): Promise<CreateTableResponse>
```

**例:**
```typescript
const table = await larkService.createTable(appToken, {
  table_name: 'タスク一覧',
  default_view_name: '全体ビュー',
  fields: [
    { field_name: 'タスク名', type: 1 },
    { field_name: '完了', type: 7 },
  ],
});
```

**戻り値:**
```typescript
{
  table_id: string;           // テーブルID
  name: string;               // テーブル名
  default_view_id: string;    // デフォルトビューID
  fields: Array<{             // フィールド一覧
    field_id: string;
    field_name: string;
    type: FieldType;
  }>;
}
```

---

##### `createRecord()`

テーブルに1件のレコードを作成します。

```typescript
async createRecord(
  appToken: string,
  tableId: string,
  request: CreateRecordRequest
): Promise<CreateRecordResponse>
```

**例:**
```typescript
const record = await larkService.createRecord(appToken, tableId, {
  fields: {
    タスク名: 'レポート作成',
    完了: false,
  },
});
```

---

##### `batchCreateRecords()`

複数のレコードを一度に作成します。

```typescript
async batchCreateRecords(
  appToken: string,
  tableId: string,
  request: BatchCreateRecordsRequest
): Promise<BatchCreateRecordsResponse>
```

**例:**
```typescript
const result = await larkService.batchCreateRecords(appToken, tableId, {
  records: [
    { fields: { タスク名: 'タスク1', 完了: false } },
    { fields: { タスク名: 'タスク2', 完了: false } },
    { fields: { タスク名: 'タスク3', 完了: true } },
  ],
});

console.log(`${result.records.length} records created`);
```

---

##### `listRecords()`

テーブルからレコードを検索します。

```typescript
async listRecords(
  appToken: string,
  tableId: string,
  request?: ListRecordsRequest
): Promise<ListRecordsResponse>
```

**例:**
```typescript
// すべてのレコードを取得
const allRecords = await larkService.listRecords(appToken, tableId);

// フィルター・ソート・ページング付き
const filteredRecords = await larkService.listRecords(appToken, tableId, {
  filter: 'CurrentValue.[完了] = FALSE()',
  sort: [{ field_name: 'タスク名', desc: false }],
  page_size: 20,
});
```

---

##### `updateRecord()`

レコードを更新します。

```typescript
async updateRecord(
  appToken: string,
  tableId: string,
  recordId: string,
  fields: Record<string, any>
): Promise<CreateRecordResponse>
```

**例:**
```typescript
await larkService.updateRecord(appToken, tableId, recordId, {
  完了: true,
});
```

---

##### `deleteRecord()`

レコードを削除します。

```typescript
async deleteRecord(
  appToken: string,
  tableId: string,
  recordId: string
): Promise<void>
```

**例:**
```typescript
await larkService.deleteRecord(appToken, tableId, recordId);
```

---

##### `createCompleteBase()`

Base、テーブル、初期レコードを一度に作成するヘルパーメソッドです。

```typescript
async createCompleteBase(
  baseName: string,
  tableName: string,
  fields: TableField[],
  records?: CreateRecordRequest[]
): Promise<{
  appToken: string;
  tableId: string;
  url: string;
  recordIds: string[];
}>
```

**例:**
```typescript
const result = await larkService.createCompleteBase(
  'Employee DB',
  '社員一覧',
  [
    { field_name: '社員名', type: 1 },
    { field_name: '部署', type: 1 },
  ],
  [
    { fields: { 社員名: '山田太郎', 部署: '営業部' } },
  ]
);
```

---

## フィールドタイプ

Lark Baseでサポートされているフィールドタイプ一覧：

| タイプ | 値 | 説明 | 使用例 |
|--------|---|------|--------|
| テキスト | 1 | 単一行テキスト | 名前、メモ |
| 数値 | 2 | 数値（整数・小数） | 年齢、金額 |
| 単一選択 | 3 | ドロップダウンから1つ選択 | ステータス、優先度 |
| 複数選択 | 4 | 複数の選択肢を選択可能 | タグ、カテゴリ |
| 日付 | 5 | 日付・日時 | 開始日、期限 |
| チェックボックス | 7 | ON/OFF | 完了フラグ |
| ユーザー | 11 | Larkユーザー選択 | 担当者、作成者 |
| 電話番号 | 13 | 電話番号 | 連絡先 |
| URL | 15 | リンク | ウェブサイト、参照先 |
| 添付ファイル | 17 | ファイルアップロード | ドキュメント、画像 |
| 単一関連 | 18 | 他テーブルへのリンク（1対1） | 親レコード |
| ルックアップ | 19 | 関連レコードの値を参照 | 関連情報 |
| 数式 | 20 | 計算式 | 合計、平均 |
| 二重関連 | 21 | 他テーブルへのリンク（多対多） | タグ付け |
| 位置情報 | 22 | 地図上の位置 | 住所、オフィス |
| グループ化 | 23 | フィールドのグループ | セクション |
| 作成時刻 | 1001 | レコード作成日時（自動） | - |
| 最終更新時刻 | 1002 | レコード更新日時（自動） | - |
| 作成者 | 1003 | レコード作成者（自動） | - |
| 最終更新者 | 1004 | レコード更新者（自動） | - |

### フィールド定義の例

```typescript
// テキストフィールド
{ field_name: '商品名', type: 1 }

// 数値フィールド
{ field_name: '価格', type: 2 }

// 単一選択フィールド
{
  field_name: 'ステータス',
  type: 3,
  property: {
    options: [
      { name: 'TODO', color: 1 },
      { name: '進行中', color: 2 },
      { name: '完了', color: 3 },
    ],
  },
}

// 日付フィールド
{
  field_name: '開始日',
  type: 5,
  property: {
    date_format: 'yyyy/MM/dd',
  },
}

// チェックボックス
{ field_name: '完了', type: 7 }
```

---

## 使用例

完全な使用例は `/examples/lark-example.ts` を参照してください。

### 例1: タスク管理システム

```typescript
const result = await larkService.createCompleteBase(
  'Task Management',
  'タスク一覧',
  [
    { field_name: 'タスク名', type: 1 },
    {
      field_name: '優先度',
      type: 3,
      property: {
        options: [
          { name: '高', color: 1 },
          { name: '中', color: 2 },
          { name: '低', color: 3 },
        ],
      },
    },
    { field_name: '期限', type: 5 },
    { field_name: '完了', type: 7 },
  ],
  [
    {
      fields: {
        タスク名: 'プロジェクト計画書作成',
        優先度: '高',
        期限: Date.now() + 7 * 24 * 60 * 60 * 1000,
        完了: false,
      },
    },
  ]
);
```

### 例2: 顧客管理システム

```typescript
const result = await larkService.createCompleteBase(
  'CRM System',
  '顧客一覧',
  [
    { field_name: '会社名', type: 1 },
    { field_name: '担当者名', type: 1 },
    { field_name: 'メールアドレス', type: 15 },
    { field_name: '電話番号', type: 13 },
    {
      field_name: 'ステータス',
      type: 3,
      property: {
        options: [
          { name: '見込み客', color: 1 },
          { name: '商談中', color: 2 },
          { name: '成約', color: 3 },
          { name: '失注', color: 4 },
        ],
      },
    },
    { field_name: '予算', type: 2 },
  ]
);
```

### 例3: 在庫管理システム

```typescript
const result = await larkService.createCompleteBase(
  'Inventory System',
  '在庫一覧',
  [
    { field_name: '商品コード', type: 1 },
    { field_name: '商品名', type: 1 },
    { field_name: '在庫数', type: 2 },
    { field_name: '単価', type: 2 },
    { field_name: '最終入庫日', type: 5 },
    {
      field_name: '在庫状況',
      type: 3,
      property: {
        options: [
          { name: '十分', color: 3 },
          { name: '要発注', color: 2 },
          { name: '欠品', color: 1 },
        ],
      },
    },
  ]
);
```

---

## 実行方法

### 使用例を実行

```bash
# 環境変数を設定
export LARK_APP_ID="your_app_id"
export LARK_APP_SECRET="your_app_secret"

# TypeScriptファイルを実行
npx tsx examples/lark-example.ts
```

### テストを実行

```bash
npm test tests/LarkService.test.ts
```

---

## トラブルシューティング

### よくある問題

#### 1. 認証エラー（401 Unauthorized）

**原因:** App IDまたはApp Secretが間違っている

**解決方法:**
- Lark Open Platformで認証情報を再確認
- 環境変数が正しく設定されているか確認
```bash
echo $LARK_APP_ID
echo $LARK_APP_SECRET
```

#### 2. 権限エラー（403 Forbidden）

**原因:** アプリに必要な権限が付与されていない

**解決方法:**
- Lark Open Platformの「権限管理」で以下を有効化：
  - `bitable:app`
  - `bitable:table`
  - `bitable:record`
- 権限変更後、アプリを再インストール

#### 3. レコード作成失敗

**原因:** フィールド名またはデータ型が一致していない

**解決方法:**
- フィールド名が完全に一致しているか確認（大文字小文字も区別）
- データ型が正しいか確認（数値フィールドに文字列を入れていないか等）

#### 4. SDK import エラー

**原因:** ESM/CommonJSの互換性問題

**解決方法:**
- `package.json`に`"type": "module"`が設定されているか確認
- インポート文で`.js`拡張子を明示的に指定

```typescript
// ✅ 正しい
import { LarkService } from './src/services/LarkService.js';

// ❌ 間違い
import { LarkService } from './src/services/LarkService';
```

---

## 参考リンク

### 公式ドキュメント

- [Lark Open Platform](https://open.larksuite.com/)
- [Bitable API Documentation](https://open.larksuite.com/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview)
- [Node.js SDK GitHub](https://github.com/larksuite/node-sdk)

### 追加リソース

- [Lark Developer Community](https://open.larksuite.com/community)
- [API Reference](https://open.larksuite.com/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)

---

## サポート

質問や問題がある場合：

1. まず[トラブルシューティング](#トラブルシューティング)を確認
2. GitHubのIssueを検索
3. 新しいIssueを作成して質問

---

**ドキュメント最終更新:** 2025年11月7日

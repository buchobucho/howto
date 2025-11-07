/**
 * Lark Service 使用例
 * LarkServiceの基本的な使用方法を示すサンプルコード
 */

import { LarkService } from '../src/services/LarkService.js';
import type { LarkConfig, TableField } from '../src/types/lark.js';

/**
 * 環境変数からLark設定を取得
 */
function getLarkConfig(): LarkConfig {
  const appId = process.env.LARK_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error(
      'LARK_APP_ID and LARK_APP_SECRET must be set in environment variables'
    );
  }

  return {
    appId,
    appSecret,
    appType: 'self_built',
  };
}

/**
 * 例1: 簡単なBaseを作成
 */
async function example1_createSimpleBase() {
  console.log('\n=== Example 1: Create Simple Base ===\n');

  const config = getLarkConfig();
  const larkService = new LarkService(config);

  // Bitableを作成
  const bitable = await larkService.createBitable({
    name: 'My First Base',
  });

  console.log('Bitable created:');
  console.log(`  App Token: ${bitable.app_token}`);
  console.log(`  Name: ${bitable.name}`);
  console.log(`  URL: ${bitable.url}`);
}

/**
 * 例2: フィールドを持つテーブルを作成
 */
async function example2_createTableWithFields() {
  console.log('\n=== Example 2: Create Table with Fields ===\n');

  const config = getLarkConfig();
  const larkService = new LarkService(config);

  // Bitableを作成
  const bitable = await larkService.createBitable({
    name: 'Customer Database',
  });

  // フィールドを定義
  const fields: TableField[] = [
    {
      field_name: '顧客名',
      type: 1, // テキスト
    },
    {
      field_name: 'メールアドレス',
      type: 15, // URL
    },
    {
      field_name: '電話番号',
      type: 13, // 電話番号
    },
    {
      field_name: 'ステータス',
      type: 3, // 単一選択
      property: {
        options: [
          { name: '見込み客', color: 1 },
          { name: '商談中', color: 2 },
          { name: '成約', color: 3 },
          { name: '失注', color: 4 },
        ],
      },
    },
    {
      field_name: '登録日',
      type: 5, // 日付
      property: {
        date_format: 'yyyy/MM/dd',
      },
    },
  ];

  // テーブルを作成
  const table = await larkService.createTable(bitable.app_token, {
    table_name: '顧客一覧',
    default_view_name: '全体ビュー',
    fields,
  });

  console.log('Table created:');
  console.log(`  Table ID: ${table.table_id}`);
  console.log(`  Name: ${table.name}`);
  console.log(`  Fields: ${table.fields.length} fields`);
}

/**
 * 例3: レコードを追加
 */
async function example3_createRecords() {
  console.log('\n=== Example 3: Create Records ===\n');

  const config = getLarkConfig();
  const larkService = new LarkService(config);

  // Bitableとテーブルを作成
  const bitable = await larkService.createBitable({
    name: 'Task Management',
  });

  const table = await larkService.createTable(bitable.app_token, {
    table_name: 'タスク',
    fields: [
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
      { field_name: '完了', type: 7 }, // チェックボックス
    ],
  });

  // レコードを作成
  const record = await larkService.createRecord(
    bitable.app_token,
    table.table_id,
    {
      fields: {
        タスク名: 'サンプルタスク',
        優先度: '高',
        完了: false,
      },
    }
  );

  console.log('Record created:');
  console.log(`  Record ID: ${record.record_id}`);
  console.log(`  Fields:`, record.fields);
}

/**
 * 例4: バッチでレコードを追加
 */
async function example4_batchCreateRecords() {
  console.log('\n=== Example 4: Batch Create Records ===\n');

  const config = getLarkConfig();
  const larkService = new LarkService(config);

  // Bitableとテーブルを作成
  const bitable = await larkService.createBitable({
    name: 'Product Inventory',
  });

  const table = await larkService.createTable(bitable.app_token, {
    table_name: '商品在庫',
    fields: [
      { field_name: '商品名', type: 1 },
      { field_name: '価格', type: 2 },
      { field_name: '在庫数', type: 2 },
    ],
  });

  // 複数のレコードをバッチ作成
  const batchResult = await larkService.batchCreateRecords(
    bitable.app_token,
    table.table_id,
    {
      records: [
        { fields: { 商品名: 'ノートPC', 価格: 120000, 在庫数: 15 } },
        { fields: { 商品名: 'マウス', 価格: 2500, 在庫数: 50 } },
        { fields: { 商品名: 'キーボード', 価格: 8000, 在庫数: 30 } },
        { fields: { 商品名: 'モニター', 価格: 35000, 在庫数: 20 } },
      ],
    }
  );

  console.log(`${batchResult.records.length} records created`);
  batchResult.records.forEach((record, index) => {
    console.log(`  Record ${index + 1}: ${record.record_id}`);
  });
}

/**
 * 例5: 完全なBaseを一度に作成
 */
async function example5_createCompleteBase() {
  console.log('\n=== Example 5: Create Complete Base ===\n');

  const config = getLarkConfig();
  const larkService = new LarkService(config);

  // フィールド定義
  const fields: TableField[] = [
    { field_name: 'プロジェクト名', type: 1 },
    {
      field_name: 'ステータス',
      type: 3,
      property: {
        options: [
          { name: '未着手', color: 1 },
          { name: '進行中', color: 2 },
          { name: '完了', color: 3 },
        ],
      },
    },
    { field_name: '開始日', type: 5 },
    { field_name: '予算', type: 2 },
  ];

  // 初期レコード
  const records = [
    {
      fields: {
        プロジェクト名: 'ウェブサイトリニューアル',
        ステータス: '進行中',
        開始日: Date.now(),
        予算: 5000000,
      },
    },
    {
      fields: {
        プロジェクト名: 'モバイルアプリ開発',
        ステータス: '未着手',
        開始日: Date.now(),
        予算: 8000000,
      },
    },
  ];

  // 完全なBaseを一度に作成
  const result = await larkService.createCompleteBase(
    'Project Management',
    'プロジェクト一覧',
    fields,
    records
  );

  console.log('Complete Base created:');
  console.log(`  App Token: ${result.appToken}`);
  console.log(`  Table ID: ${result.tableId}`);
  console.log(`  URL: ${result.url}`);
  console.log(`  Records: ${result.recordIds.length} records created`);
}

/**
 * 例6: レコードの検索・更新・削除
 */
async function example6_recordOperations() {
  console.log('\n=== Example 6: Record Operations ===\n');

  const config = getLarkConfig();
  const larkService = new LarkService(config);

  // Baseを作成
  const result = await larkService.createCompleteBase(
    'Employee Database',
    '社員一覧',
    [
      { field_name: '社員名', type: 1 },
      { field_name: '部署', type: 1 },
      { field_name: '入社年', type: 2 },
    ],
    [
      { fields: { 社員名: '山田太郎', 部署: '営業部', 入社年: 2020 } },
      { fields: { 社員名: '佐藤花子', 部署: '開発部', 入社年: 2021 } },
    ]
  );

  // レコード一覧を取得
  const listResult = await larkService.listRecords(
    result.appToken,
    result.tableId
  );
  console.log(`Found ${listResult.total} records`);

  if (listResult.records.length > 0) {
    const firstRecord = listResult.records[0];

    // レコードを更新
    await larkService.updateRecord(
      result.appToken,
      result.tableId,
      firstRecord.record_id,
      {
        部署: '管理部',
      }
    );
    console.log(`Record ${firstRecord.record_id} updated`);

    // レコードを削除
    await larkService.deleteRecord(
      result.appToken,
      result.tableId,
      firstRecord.record_id
    );
    console.log(`Record ${firstRecord.record_id} deleted`);
  }
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    // 環境変数をチェック
    if (!process.env.LARK_APP_ID || !process.env.LARK_APP_SECRET) {
      console.log('⚠️  Environment variables not set\n');
      console.log('To run these examples, set the following environment variables:');
      console.log('  export LARK_APP_ID="your_app_id"');
      console.log('  export LARK_APP_SECRET="your_app_secret"\n');
      console.log('Get your credentials from: https://open.larksuite.com/\n');
      return;
    }

    console.log('🚀 Lark Service Examples\n');

    // 実行する例を選択（コメントアウトで切り替え）
    await example1_createSimpleBase();
    // await example2_createTableWithFields();
    // await example3_createRecords();
    // await example4_batchCreateRecords();
    // await example5_createCompleteBase();
    // await example6_recordOperations();

    console.log('\n✅ Examples completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合はメイン関数を実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

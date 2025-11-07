/**
 * Lark API デモ - 実用的な例
 */

import { LarkService } from '../src/services/LarkService.js';

async function main() {
  console.log('🚀 Lark API Demo\n');

  // LarkServiceを初期化
  const larkService = new LarkService({
    appId: process.env.LARK_APP_ID!,
    appSecret: process.env.LARK_APP_SECRET!,
  });

  // 例1: タスク管理システム
  console.log('📋 Creating Task Management Base...\n');

  const taskBase = await larkService.createCompleteBase(
    '【デモ】タスク管理',
    'タスク一覧',
    [
      { field_name: 'タスク名', type: 1 },
      {
        field_name: '優先度',
        type: 3,
        property: {
          options: [
            { name: '🔴 高', color: 1 },
            { name: '🟡 中', color: 2 },
            { name: '🟢 低', color: 3 },
          ],
        },
      },
      {
        field_name: 'ステータス',
        type: 3,
        property: {
          options: [
            { name: '📝 未着手', color: 1 },
            { name: '🚀 進行中', color: 2 },
            { name: '✅ 完了', color: 3 },
          ],
        },
      },
      { field_name: '期限', type: 5 },
      { field_name: '完了', type: 7 },
    ],
    [
      {
        fields: {
          タスク名: 'プロジェクト計画書を作成',
          優先度: '🔴 高',
          ステータス: '🚀 進行中',
          期限: Date.now() + 7 * 24 * 60 * 60 * 1000,
          完了: false,
        },
      },
      {
        fields: {
          タスク名: 'チームミーティングの資料準備',
          優先度: '🟡 中',
          ステータス: '📝 未着手',
          期限: Date.now() + 3 * 24 * 60 * 60 * 1000,
          完了: false,
        },
      },
      {
        fields: {
          タスク名: '週次レポート提出',
          優先度: '🟢 低',
          ステータス: '✅ 完了',
          期限: Date.now(),
          完了: true,
        },
      },
    ]
  );

  console.log('✅ Task Management Base created!');
  console.log(`   📊 URL: ${taskBase.url}`);
  console.log(`   📝 Records: ${taskBase.recordIds.length} tasks\n`);

  // 例2: 顧客管理システム
  console.log('👥 Creating CRM Base...\n');

  const crmBase = await larkService.createCompleteBase(
    '【デモ】顧客管理CRM',
    '顧客リスト',
    [
      { field_name: '会社名', type: 1 },
      { field_name: '担当者名', type: 1 },
      { field_name: 'メールアドレス', type: 1 },
      { field_name: '電話番号', type: 1 },
      {
        field_name: '取引ステータス',
        type: 3,
        property: {
          options: [
            { name: '🔍 見込み客', color: 1 },
            { name: '💬 商談中', color: 2 },
            { name: '✅ 成約', color: 3 },
            { name: '❌ 失注', color: 4 },
          ],
        },
      },
      { field_name: '予算（万円）', type: 2 },
      { field_name: '初回接触日', type: 5 },
    ],
    [
      {
        fields: {
          会社名: '株式会社サンプル商事',
          担当者名: '山田太郎',
          メールアドレス: 'yamada@sample-corp.jp',
          電話番号: '03-1234-5678',
          取引ステータス: '💬 商談中',
          '予算（万円）': 500,
          初回接触日: Date.now() - 14 * 24 * 60 * 60 * 1000,
        },
      },
      {
        fields: {
          会社名: 'テクノロジー株式会社',
          担当者名: '佐藤花子',
          メールアドレス: 'sato@techno.co.jp',
          電話番号: '03-9876-5432',
          取引ステータス: '🔍 見込み客',
          '予算（万円）': 300,
          初回接触日: Date.now() - 7 * 24 * 60 * 60 * 1000,
        },
      },
      {
        fields: {
          会社名: 'デジタルソリューションズ',
          担当者名: '鈴木一郎',
          メールアドレス: 'suzuki@digital-sol.com',
          電話番号: '03-5555-1234',
          取引ステータス: '✅ 成約',
          '予算（万円）': 800,
          初回接触日: Date.now() - 30 * 24 * 60 * 60 * 1000,
        },
      },
    ]
  );

  console.log('✅ CRM Base created!');
  console.log(`   📊 URL: ${crmBase.url}`);
  console.log(`   👥 Records: ${crmBase.recordIds.length} customers\n`);

  // 例3: 在庫管理システム
  console.log('📦 Creating Inventory Management Base...\n');

  const inventoryBase = await larkService.createCompleteBase(
    '【デモ】在庫管理システム',
    '商品在庫',
    [
      { field_name: '商品コード', type: 1 },
      { field_name: '商品名', type: 1 },
      { field_name: '在庫数', type: 2 },
      { field_name: '単価（円）', type: 2 },
      {
        field_name: '在庫状況',
        type: 3,
        property: {
          options: [
            { name: '✅ 十分', color: 3 },
            { name: '⚠️ 要発注', color: 2 },
            { name: '❌ 欠品', color: 1 },
          ],
        },
      },
      { field_name: '最終入庫日', type: 5 },
    ],
    [
      {
        fields: {
          商品コード: 'PRD-001',
          商品名: 'ノートPC（15インチ）',
          在庫数: 25,
          '単価（円）': 120000,
          在庫状況: '✅ 十分',
          最終入庫日: Date.now() - 5 * 24 * 60 * 60 * 1000,
        },
      },
      {
        fields: {
          商品コード: 'PRD-002',
          商品名: 'ワイヤレスマウス',
          在庫数: 8,
          '単価（円）': 2500,
          在庫状況: '⚠️ 要発注',
          最終入庫日: Date.now() - 20 * 24 * 60 * 60 * 1000,
        },
      },
      {
        fields: {
          商品コード: 'PRD-003',
          商品名: 'メカニカルキーボード',
          在庫数: 0,
          '単価（円）': 8000,
          在庫状況: '❌ 欠品',
          最終入庫日: Date.now() - 45 * 24 * 60 * 60 * 1000,
        },
      },
      {
        fields: {
          商品コード: 'PRD-004',
          商品名: '4Kモニター（27インチ）',
          在庫数: 15,
          '単価（円）': 35000,
          在庫状況: '✅ 十分',
          最終入庫日: Date.now() - 10 * 24 * 60 * 60 * 1000,
        },
      },
    ]
  );

  console.log('✅ Inventory Management Base created!');
  console.log(`   📊 URL: ${inventoryBase.url}`);
  console.log(`   📦 Records: ${inventoryBase.recordIds.length} products\n`);

  // サマリー
  console.log('\n🎉 All Demo Bases Created Successfully!\n');
  console.log('📊 Summary:');
  console.log(`   1. Task Management: ${taskBase.url}`);
  console.log(`   2. CRM System: ${crmBase.url}`);
  console.log(`   3. Inventory Management: ${inventoryBase.url}`);
  console.log('\n💡 Open these URLs in your browser to see the created bases!\n');
}

// 実行
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

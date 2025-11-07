/**
 * Lark API Type Definitions
 * Lark（飛書/Feishu）API用の型定義
 */

/**
 * Lark認証設定
 */
export interface LarkConfig {
  /** アプリID */
  appId: string;
  /** アプリシークレット */
  appSecret: string;
  /** アプリタイプ（ISVの場合は指定） */
  appType?: 'self_built' | 'marketplace';
  /** テナントキー（ISVアプリの場合に必要） */
  tenantKey?: string;
}

/**
 * Bitable（Base）作成リクエスト
 */
export interface CreateBitableRequest {
  /** Bitableの名前 */
  name: string;
  /** フォルダトークン（配置先フォルダ）*/
  folder_token?: string;
}

/**
 * Bitable（Base）作成レスポンス
 */
export interface CreateBitableResponse {
  /** アプリトークン */
  app_token: string;
  /** アプリの名前 */
  name: string;
  /** アプリのURL */
  url: string;
}

/**
 * テーブル作成リクエスト
 */
export interface CreateTableRequest {
  /** テーブル名 */
  table_name: string;
  /** デフォルトビュー名 */
  default_view_name?: string;
  /** フィールド定義 */
  fields?: TableField[];
}

/**
 * テーブルフィールド定義
 */
export interface TableField {
  /** フィールド名 */
  field_name: string;
  /** フィールドタイプ */
  type: FieldType;
  /** フィールドプロパティ */
  property?: FieldProperty;
  /** 説明 */
  description?: string;
}

/**
 * フィールドタイプ
 */
export type FieldType =
  | 1  // テキスト
  | 2  // 数値
  | 3  // 単一選択
  | 4  // 複数選択
  | 5  // 日付
  | 7  // チェックボックス
  | 11 // ユーザー
  | 13 // 電話番号
  | 15 // URL
  | 17 // 添付ファイル
  | 18 // 単一関連
  | 19 // ルックアップ
  | 20 // 数式
  | 21 // 二重関連
  | 22 // 位置情報
  | 23 // グループ化
  | 1001 // 作成時刻
  | 1002 // 最終更新時刻
  | 1003 // 作成者
  | 1004; // 最終更新者

/**
 * フィールドプロパティ
 */
export interface FieldProperty {
  /** 選択肢（単一選択/複数選択の場合） */
  options?: Array<{
    name: string;
    color?: number;
  }>;
  /** 数式（数式フィールドの場合） */
  formula?: string;
  /** 日付フォーマット（日付フィールドの場合） */
  date_format?: string;
  /** 自動入力（チェックボックスの場合） */
  auto_fill?: boolean;
}

/**
 * テーブル作成レスポンス
 */
export interface CreateTableResponse {
  /** テーブルID */
  table_id: string;
  /** テーブル名 */
  name: string;
  /** デフォルトビューID */
  default_view_id: string;
  /** フィールド一覧 */
  fields: Array<{
    field_id: string;
    field_name: string;
    type: FieldType;
  }>;
}

/**
 * レコード作成リクエスト
 */
export interface CreateRecordRequest {
  /** フィールド値 */
  fields: Record<string, any>;
}

/**
 * レコード作成レスポンス
 */
export interface CreateRecordResponse {
  /** レコードID */
  record_id: string;
  /** フィールド値 */
  fields: Record<string, any>;
  /** 作成時刻 */
  created_time: number;
  /** 最終更新時刻 */
  last_modified_time: number;
}

/**
 * バッチレコード作成リクエスト
 */
export interface BatchCreateRecordsRequest {
  /** レコード配列 */
  records: CreateRecordRequest[];
}

/**
 * バッチレコード作成レスポンス
 */
export interface BatchCreateRecordsResponse {
  /** レコード配列 */
  records: CreateRecordResponse[];
}

/**
 * レコード検索リクエスト
 */
export interface ListRecordsRequest {
  /** ビューID */
  view_id?: string;
  /** フィルター条件 */
  filter?: string;
  /** ソート順 */
  sort?: Array<{
    field_name: string;
    desc: boolean;
  }>;
  /** ページサイズ */
  page_size?: number;
  /** ページトークン */
  page_token?: string;
}

/**
 * レコード検索レスポンス
 */
export interface ListRecordsResponse {
  /** レコード配列 */
  records: CreateRecordResponse[];
  /** 次のページトークン */
  page_token?: string;
  /** 全レコード数 */
  total: number;
  /** さらにレコードがあるか */
  has_more: boolean;
}

/**
 * Lark APIエラー
 */
export interface LarkApiError {
  /** エラーコード */
  code: number;
  /** エラーメッセージ */
  msg: string;
}

/**
 * Lark API基本レスポンス
 */
export interface LarkApiResponse<T = any> {
  /** エラーコード（0は成功） */
  code: number;
  /** エラーメッセージ */
  msg: string;
  /** レスポンスデータ */
  data?: T;
}

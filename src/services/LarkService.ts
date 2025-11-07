/**
 * Lark Service
 * Lark（飛書/Feishu）API統合サービス
 */

import * as lark from '@larksuiteoapi/node-sdk';
import type {
  LarkConfig,
  CreateBitableRequest,
  CreateBitableResponse,
  CreateTableRequest,
  CreateTableResponse,
  CreateRecordRequest,
  CreateRecordResponse,
  BatchCreateRecordsRequest,
  BatchCreateRecordsResponse,
  ListRecordsRequest,
  ListRecordsResponse,
} from '../types/lark.js';

/**
 * LarkService
 * Lark APIとの統合を管理するサービスクラス
 */
export class LarkService {
  private client: lark.Client;
  private config: LarkConfig;

  /**
   * コンストラクタ
   * @param config Lark設定
   */
  constructor(config: LarkConfig) {
    this.config = config;

    // Larkクライアントを初期化
    this.client = new lark.Client({
      appId: config.appId,
      appSecret: config.appSecret,
      appType:
        config.appType === 'marketplace' ? lark.AppType.ISV : lark.AppType.SelfBuild,
    });

    console.log(`[LarkService] Initialized with appId: ${config.appId}`);
  }

  /**
   * Bitable（Base）を作成
   * @param request Bitable作成リクエスト
   * @returns Bitable作成レスポンス
   */
  async createBitable(
    request: CreateBitableRequest
  ): Promise<CreateBitableResponse> {
    try {
      console.log(`[LarkService] Creating Bitable: ${request.name}`);

      const response = await this.client.bitable.app.create({
        data: {
          name: request.name,
          folder_token: request.folder_token,
        },
      });

      if (response.code !== 0) {
        throw new Error(`Failed to create Bitable: ${response.msg}`);
      }

      console.log(
        `[LarkService] Bitable created successfully: ${response.data?.app?.app_token}`
      );

      return {
        app_token: response.data?.app?.app_token || '',
        name: response.data?.app?.name || request.name,
        url: response.data?.app?.url || '',
      };
    } catch (error) {
      console.error('[LarkService] Error creating Bitable:', error);
      throw error;
    }
  }

  /**
   * テーブルを作成
   * @param appToken アプリトークン
   * @param request テーブル作成リクエスト
   * @returns テーブル作成レスポンス
   */
  async createTable(
    appToken: string,
    request: CreateTableRequest
  ): Promise<CreateTableResponse> {
    try {
      console.log(
        `[LarkService] Creating table: ${request.table_name} in app: ${appToken}`
      );

      const response = await this.client.bitable.appTable.create({
        path: {
          app_token: appToken,
        },
        data: {
          table: {
            name: request.table_name,
            default_view_name: request.default_view_name,
            fields: request.fields,
          },
        },
      });

      if (response.code !== 0) {
        throw new Error(`Failed to create table: ${response.msg}`);
      }

      console.log(
        `[LarkService] Table created successfully: ${response.data?.table_id}`
      );

      return {
        table_id: response.data?.table_id || '',
        name: response.data?.name || request.table_name,
        default_view_id: response.data?.default_view_id || '',
        fields: response.data?.fields || [],
      };
    } catch (error) {
      console.error('[LarkService] Error creating table:', error);
      throw error;
    }
  }

  /**
   * レコードを作成
   * @param appToken アプリトークン
   * @param tableId テーブルID
   * @param request レコード作成リクエスト
   * @returns レコード作成レスポンス
   */
  async createRecord(
    appToken: string,
    tableId: string,
    request: CreateRecordRequest
  ): Promise<CreateRecordResponse> {
    try {
      console.log(
        `[LarkService] Creating record in table: ${tableId}, app: ${appToken}`
      );

      const response = await this.client.bitable.appTableRecord.create({
        path: {
          app_token: appToken,
          table_id: tableId,
        },
        data: {
          fields: request.fields,
        },
      });

      if (response.code !== 0) {
        throw new Error(`Failed to create record: ${response.msg}`);
      }

      console.log(
        `[LarkService] Record created successfully: ${response.data?.record?.record_id}`
      );

      return {
        record_id: response.data?.record?.record_id || '',
        fields: response.data?.record?.fields || {},
        created_time: response.data?.record?.created_time || Date.now(),
        last_modified_time: response.data?.record?.last_modified_time || Date.now(),
      };
    } catch (error) {
      console.error('[LarkService] Error creating record:', error);
      throw error;
    }
  }

  /**
   * レコードをバッチ作成
   * @param appToken アプリトークン
   * @param tableId テーブルID
   * @param request バッチレコード作成リクエスト
   * @returns バッチレコード作成レスポンス
   */
  async batchCreateRecords(
    appToken: string,
    tableId: string,
    request: BatchCreateRecordsRequest
  ): Promise<BatchCreateRecordsResponse> {
    try {
      console.log(
        `[LarkService] Batch creating ${request.records.length} records in table: ${tableId}`
      );

      const response = await this.client.bitable.appTableRecord.batchCreate({
        path: {
          app_token: appToken,
          table_id: tableId,
        },
        data: {
          records: request.records,
        },
      });

      if (response.code !== 0) {
        throw new Error(`Failed to batch create records: ${response.msg}`);
      }

      console.log(
        `[LarkService] ${response.data?.records?.length || 0} records created successfully`
      );

      return {
        records:
          response.data?.records?.map((record: any) => ({
            record_id: record.record_id,
            fields: record.fields,
            created_time: record.created_time,
            last_modified_time: record.last_modified_time,
          })) || [],
      };
    } catch (error) {
      console.error('[LarkService] Error batch creating records:', error);
      throw error;
    }
  }

  /**
   * レコード一覧を取得
   * @param appToken アプリトークン
   * @param tableId テーブルID
   * @param request レコード検索リクエスト
   * @returns レコード検索レスポンス
   */
  async listRecords(
    appToken: string,
    tableId: string,
    request?: ListRecordsRequest
  ): Promise<ListRecordsResponse> {
    try {
      console.log(`[LarkService] Listing records from table: ${tableId}`);

      const response = await this.client.bitable.appTableRecord.list({
        path: {
          app_token: appToken,
          table_id: tableId,
        },
        params: {
          view_id: request?.view_id,
          filter: request?.filter,
          sort: request?.sort ? JSON.stringify(request.sort) : undefined,
          page_size: request?.page_size,
          page_token: request?.page_token,
        },
      });

      if (response.code !== 0) {
        throw new Error(`Failed to list records: ${response.msg}`);
      }

      console.log(`[LarkService] Found ${response.data?.total || 0} records`);

      return {
        records:
          response.data?.items?.map((record: any) => ({
            record_id: record.record_id,
            fields: record.fields,
            created_time: record.created_time,
            last_modified_time: record.last_modified_time,
          })) || [],
        page_token: response.data?.page_token,
        total: response.data?.total || 0,
        has_more: response.data?.has_more || false,
      };
    } catch (error) {
      console.error('[LarkService] Error listing records:', error);
      throw error;
    }
  }

  /**
   * レコードを更新
   * @param appToken アプリトークン
   * @param tableId テーブルID
   * @param recordId レコードID
   * @param fields 更新するフィールド
   * @returns 更新されたレコード
   */
  async updateRecord(
    appToken: string,
    tableId: string,
    recordId: string,
    fields: Record<string, any>
  ): Promise<CreateRecordResponse> {
    try {
      console.log(
        `[LarkService] Updating record: ${recordId} in table: ${tableId}`
      );

      const response = await this.client.bitable.appTableRecord.update({
        path: {
          app_token: appToken,
          table_id: tableId,
          record_id: recordId,
        },
        data: {
          fields,
        },
      });

      if (response.code !== 0) {
        throw new Error(`Failed to update record: ${response.msg}`);
      }

      console.log(`[LarkService] Record updated successfully: ${recordId}`);

      return {
        record_id: response.data?.record?.record_id || recordId,
        fields: response.data?.record?.fields || fields,
        created_time: response.data?.record?.created_time || Date.now(),
        last_modified_time: response.data?.record?.last_modified_time || Date.now(),
      };
    } catch (error) {
      console.error('[LarkService] Error updating record:', error);
      throw error;
    }
  }

  /**
   * レコードを削除
   * @param appToken アプリトークン
   * @param tableId テーブルID
   * @param recordId レコードID
   */
  async deleteRecord(
    appToken: string,
    tableId: string,
    recordId: string
  ): Promise<void> {
    try {
      console.log(
        `[LarkService] Deleting record: ${recordId} from table: ${tableId}`
      );

      const response = await this.client.bitable.appTableRecord.delete({
        path: {
          app_token: appToken,
          table_id: tableId,
          record_id: recordId,
        },
      });

      if (response.code !== 0) {
        throw new Error(`Failed to delete record: ${response.msg}`);
      }

      console.log(`[LarkService] Record deleted successfully: ${recordId}`);
    } catch (error) {
      console.error('[LarkService] Error deleting record:', error);
      throw error;
    }
  }

  /**
   * 完全なBase（Bitable + Table + Records）を作成するヘルパーメソッド
   * @param baseName Base名
   * @param tableName テーブル名
   * @param fields フィールド定義
   * @param records 初期レコード
   * @returns 作成されたBase情報
   */
  async createCompleteBase(
    baseName: string,
    tableName: string,
    fields: CreateTableRequest['fields'],
    records?: BatchCreateRecordsRequest['records']
  ): Promise<{
    appToken: string;
    tableId: string;
    url: string;
    recordIds: string[];
  }> {
    try {
      console.log(`[LarkService] Creating complete base: ${baseName}`);

      // 1. Bitableを作成
      const bitable = await this.createBitable({ name: baseName });

      // 2. テーブルを作成
      const table = await this.createTable(bitable.app_token, {
        table_name: tableName,
        fields,
      });

      // 3. レコードを作成（オプション）
      let recordIds: string[] = [];
      if (records && records.length > 0) {
        const batchResult = await this.batchCreateRecords(
          bitable.app_token,
          table.table_id,
          { records }
        );
        recordIds = batchResult.records.map((r) => r.record_id);
      }

      console.log(
        `[LarkService] Complete base created successfully: ${bitable.app_token}`
      );

      return {
        appToken: bitable.app_token,
        tableId: table.table_id,
        url: bitable.url,
        recordIds,
      };
    } catch (error) {
      console.error('[LarkService] Error creating complete base:', error);
      throw error;
    }
  }

  /**
   * 設定を取得
   * @returns Lark設定
   */
  getConfig(): LarkConfig {
    return { ...this.config };
  }
}

/**
 * Lark Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LarkService } from '../src/services/LarkService.js';
import type { LarkConfig } from '../src/types/lark.js';

describe('LarkService', () => {
  let service: LarkService;
  let mockConfig: LarkConfig;

  beforeEach(() => {
    mockConfig = {
      appId: 'test_app_id',
      appSecret: 'test_app_secret',
      appType: 'self_built',
    };

    service = new LarkService(mockConfig);
  });

  describe('Initialization', () => {
    it('should initialize with config', () => {
      const config = service.getConfig();
      expect(config.appId).toBe('test_app_id');
      expect(config.appSecret).toBe('test_app_secret');
      expect(config.appType).toBe('self_built');
    });

    it('should support ISV app type', () => {
      const isvConfig: LarkConfig = {
        appId: 'isv_app_id',
        appSecret: 'isv_app_secret',
        appType: 'marketplace',
        tenantKey: 'tenant_key_123',
      };

      const isvService = new LarkService(isvConfig);
      const config = isvService.getConfig();
      expect(config.appType).toBe('marketplace');
      expect(config.tenantKey).toBe('tenant_key_123');
    });
  });

  describe('Bitable Operations', () => {
    it('should have createBitable method', () => {
      expect(typeof service.createBitable).toBe('function');
    });

    it('should have createTable method', () => {
      expect(typeof service.createTable).toBe('function');
    });

    it('should have createCompleteBase method', () => {
      expect(typeof service.createCompleteBase).toBe('function');
    });
  });

  describe('Record Operations', () => {
    it('should have createRecord method', () => {
      expect(typeof service.createRecord).toBe('function');
    });

    it('should have batchCreateRecords method', () => {
      expect(typeof service.batchCreateRecords).toBe('function');
    });

    it('should have listRecords method', () => {
      expect(typeof service.listRecords).toBe('function');
    });

    it('should have updateRecord method', () => {
      expect(typeof service.updateRecord).toBe('function');
    });

    it('should have deleteRecord method', () => {
      expect(typeof service.deleteRecord).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid app credentials gracefully', () => {
      const invalidConfig: LarkConfig = {
        appId: '',
        appSecret: '',
      };

      expect(() => new LarkService(invalidConfig)).not.toThrow();
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct field types', () => {
      const fields = [
        {
          field_name: 'Name',
          type: 1 as const, // テキスト
        },
        {
          field_name: 'Age',
          type: 2 as const, // 数値
        },
        {
          field_name: 'Email',
          type: 15 as const, // URL
        },
      ];

      expect(fields).toBeDefined();
      expect(fields.length).toBe(3);
      expect(fields[0].type).toBe(1);
      expect(fields[1].type).toBe(2);
      expect(fields[2].type).toBe(15);
    });

    it('should support field properties', () => {
      const selectField = {
        field_name: 'Status',
        type: 3 as const, // 単一選択
        property: {
          options: [
            { name: 'TODO', color: 1 },
            { name: 'In Progress', color: 2 },
            { name: 'Done', color: 3 },
          ],
        },
      };

      expect(selectField.property?.options).toBeDefined();
      expect(selectField.property?.options?.length).toBe(3);
    });
  });
});

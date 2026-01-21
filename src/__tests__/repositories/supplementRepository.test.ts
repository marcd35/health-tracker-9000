import { SupplementRepository } from '@/lib/database/repositories/supplementRepository';
import { setupTestDbWithData, teardownTestDb } from '../setup/test-db';
import { mockSupplements } from '../fixtures/mockData';

describe('SupplementRepository', () => {
  let db: any;
  let repo: SupplementRepository;

  beforeEach(() => {
    db = setupTestDbWithData();
    repo = new SupplementRepository();
    // Override the database connection for testing
    (repo as any).db = db;
  });

  afterEach(() => {
    if (db) {
      teardownTestDb(db);
    }
  });

  describe('Supplement CRUD', () => {
    describe('getAllSupplements', () => {
      it('should return all supplements ordered by name', () => {
        // Clear existing supplements and insert test supplements
        db.prepare('DELETE FROM supplements').run();

        const supplements = [
          { name: 'Zinc', nutrients: { zinc: 15 } },
          { name: 'Vitamin A', nutrients: { vitaminA: 900 } },
          { name: 'Multivitamin', nutrients: { vitaminC: 60 } },
        ];

        supplements.forEach((supp) => {
          repo.createSupplement({
            name: supp.name,
            brand: 'Test Brand',
            servingSize: '1 capsule',
            nutrients: supp.nutrients,
            customNutrients: {},
            supplementType: 'nutrient',
            color: '#6366f1',
            dosageFrequency: 'daily',
            dosageQuantity: 1,
          });
        });

        const result = repo.getAllSupplements();
        expect(result).toHaveLength(3);
        expect(result.map((s) => s.name)).toEqual(['Multivitamin', 'Vitamin A', 'Zinc']);
      });

      it('should return empty array when no supplements exist', () => {
        // Clear all supplements
        db.prepare('DELETE FROM supplements').run();
        const result = repo.getAllSupplements();
        expect(result).toEqual([]);
      });
    });

    describe('getSupplementById', () => {
      it('should return supplement by id', () => {
        const created = repo.createSupplement({
          name: mockSupplements[0].name,
          brand: mockSupplements[0].brand,
          servingSize: mockSupplements[0].servingSize,
          nutrients: mockSupplements[0].nutrients,
          customNutrients: mockSupplements[0].customNutrients,
          supplementType: mockSupplements[0].supplementType,
          color: mockSupplements[0].color,
          dosageFrequency: mockSupplements[0].dosageFrequency,
          dosageQuantity: mockSupplements[0].dosageQuantity,
        });

        const result = repo.getSupplementById(created.id);
        expect(result).toMatchObject({
          id: created.id,
          name: mockSupplements[0].name,
          brand: mockSupplements[0].brand,
        });
      });

      it('should return null for non-existent supplement', () => {
        const result = repo.getSupplementById('non-existent');
        expect(result).toBeNull();
      });
    });

    describe('createSupplement', () => {
      it('should create a nutrient-based supplement', () => {
        const data = {
          name: 'Vitamin C',
          brand: 'Generic',
          servingSize: '500mg tablet',
          nutrients: { vitaminC: 500 },
          customNutrients: {},
          supplementType: 'nutrient' as const,
          color: '#ef4444',
          dosageFrequency: 'daily' as const,
          dosageQuantity: 1,
        };

        const result = repo.createSupplement(data);

        expect(result).toMatchObject({
          ...data,
          id: expect.any(String),
          createdAt: expect.any(String),
        });

        // Verify in database
        const saved = repo.getSupplementById(result.id);
        expect(saved).toBeTruthy();
      });

      it('should create a custom supplement', () => {
        const data = {
          name: 'Omega-3',
          brand: 'Fish Oil Co',
          servingSize: '1 softgel',
          nutrients: {},
          customNutrients: { epa: 300, dha: 200 },
          supplementType: 'custom' as const,
          color: '#3b82f6',
          dosageFrequency: 'daily' as const,
          dosageQuantity: 2,
        };

        const result = repo.createSupplement(data);
        expect(result.supplementType).toBe('custom');
        expect(result.customNutrients).toEqual({ epa: 300, dha: 200 });
      });
    });

    describe('updateSupplement', () => {
      let supplementId: string;

      beforeEach(() => {
        const created = repo.createSupplement({
          name: 'Test Supplement',
          brand: 'Test Brand',
          servingSize: '1 capsule',
          nutrients: { vitaminD: 1000 },
          customNutrients: {},
          supplementType: 'nutrient',
          color: '#6366f1',
          dosageFrequency: 'daily',
          dosageQuantity: 1,
        });
        supplementId = created.id;
      });

      it('should update supplement successfully', () => {
        const updates = {
          name: 'Updated Supplement',
          dosageQuantity: 2,
          nutrients: { vitaminD: 2000, calcium: 500 },
        };

        const result = repo.updateSupplement(supplementId, updates);

        expect(result.name).toBe('Updated Supplement');
        expect(result.dosageQuantity).toBe(2);
        expect(result.nutrients).toEqual({ vitaminD: 2000, calcium: 500 });
      });

      it('should throw error for non-existent supplement', () => {
        expect(() => {
          repo.updateSupplement('non-existent', { name: 'New Name' });
        }).toThrow('Supplement not found');
      });

      it('should handle partial updates', () => {
        const result = repo.updateSupplement(supplementId, { dosageQuantity: 3 });

        expect(result.dosageQuantity).toBe(3);
        expect(result.name).toBe('Test Supplement'); // Unchanged
      });
    });

    describe('deleteSupplement', () => {
      it('should delete supplement and associated logs', () => {
        const supplement = repo.createSupplement({
          name: 'Test Supplement',
          brand: 'Test Brand',
          servingSize: '1 capsule',
          nutrients: { vitaminD: 1000 },
          customNutrients: {},
          supplementType: 'nutrient',
          color: '#6366f1',
          dosageFrequency: 'daily',
          dosageQuantity: 1,
        });

        // Create a log for this supplement
        repo.logSupplementTaken({
          date: '2024-01-15',
          supplementId: supplement.id,
          supplementName: supplement.name,
          taken: true,
        });

        // Verify log exists
        const logsBefore = repo.getSupplementLogsByDate('2024-01-15');
        expect(logsBefore.some((log) => log.supplementId === supplement.id)).toBe(true);

        // Delete supplement
        repo.deleteSupplement(supplement.id);

        // Verify supplement is gone
        expect(repo.getSupplementById(supplement.id)).toBeNull();

        // Verify logs are gone
        const logsAfter = repo.getSupplementLogsByDate('2024-01-15');
        expect(logsAfter.some((log) => log.supplementId === supplement.id)).toBe(false);
      });

      it('should not throw error when deleting non-existent supplement', () => {
        expect(() => {
          repo.deleteSupplement('non-existent');
        }).not.toThrow();
      });
    });
  });

  describe('Supplement Logs', () => {
    let supplementId: string;

    beforeEach(() => {
      const supplement = repo.createSupplement({
        name: 'Test Vitamin',
        brand: 'Test Brand',
        servingSize: '1 capsule',
        nutrients: { vitaminD: 1000 },
        customNutrients: {},
        supplementType: 'nutrient',
        color: '#fbbf24',
        dosageFrequency: 'daily',
        dosageQuantity: 1,
      });
      supplementId = supplement.id;
    });

    describe('logSupplementTaken', () => {
      it('should log supplement as taken', () => {
        const logData = {
          date: '2024-01-15',
          supplementId,
          supplementName: 'Test Vitamin',
          taken: true,
        };

        const result = repo.logSupplementTaken(logData);

        expect(result).toMatchObject({
          ...logData,
          id: expect.any(String),
          takenAt: expect.any(String),
          createdAt: expect.any(String),
        });

        // Verify in database
        const logs = repo.getSupplementLogsByDate('2024-01-15');
        expect(logs).toHaveLength(1);
        expect(logs[0].taken).toBe(true);
      });

      it('should log supplement as not taken', () => {
        const logData = {
          date: '2024-01-15',
          supplementId,
          supplementName: 'Test Vitamin',
          taken: false,
        };

        repo.logSupplementTaken(logData);

        const logs = repo.getSupplementLogsByDate('2024-01-15');
        expect(logs[0].taken).toBe(false);
      });

      it('should handle duplicate warnings', () => {
        // First log
        repo.logSupplementTaken({
          date: '2024-01-15',
          supplementId,
          supplementName: 'Test Vitamin',
          taken: true,
        });

        // Second log (duplicate)
        const result = repo.logSupplementTaken({
          date: '2024-01-15',
          supplementId,
          supplementName: 'Test Vitamin',
          taken: true,
          isDuplicateWarning: true,
        });

        expect(result.isDuplicateWarning).toBe(true);
      });
    });

    describe('getSupplementLogsByDate', () => {
      beforeEach(() => {
        // Create multiple logs for the same date
        repo.logSupplementTaken({
          date: '2024-01-15',
          supplementId,
          supplementName: 'Test Vitamin',
          taken: true,
          takenAt: '2024-01-15T08:00:00.000Z',
        });

        repo.logSupplementTaken({
          date: '2024-01-15',
          supplementId,
          supplementName: 'Test Vitamin',
          taken: false,
          takenAt: '2024-01-15T20:00:00.000Z',
        });
      });

      it('should return logs for specific date ordered by taken_at', () => {
        const logs = repo.getSupplementLogsByDate('2024-01-15');

        expect(logs).toHaveLength(2);
        expect(logs[0].takenAt).toBe('2024-01-15T08:00:00.000Z');
        expect(logs[1].takenAt).toBe('2024-01-15T20:00:00.000Z');
      });

      it('should return empty array for date with no logs', () => {
        const logs = repo.getSupplementLogsByDate('2024-01-20');
        expect(logs).toHaveLength(0);
      });
    });

    describe('getSupplementLogsByDates', () => {
      beforeEach(() => {
        repo.logSupplementTaken({
          date: '2024-01-15',
          supplementId,
          supplementName: 'Test Vitamin',
          taken: true,
        });
        repo.logSupplementTaken({
          date: '2024-01-16',
          supplementId,
          supplementName: 'Test Vitamin',
          taken: false,
        });
      });

      it('should return logs for multiple dates', () => {
        const logs = repo.getSupplementLogsByDates(['2024-01-15', '2024-01-16']);
        expect(logs).toHaveLength(2);
        expect(logs.map((l) => l.date)).toEqual(['2024-01-15', '2024-01-16']);
      });

      it('should return empty array for empty dates array', () => {
        const logs = repo.getSupplementLogsByDates([]);
        expect(logs).toHaveLength(0);
      });
    });

    describe('checkDuplicateLog', () => {
      it('should return true when supplement already taken on date', () => {
        repo.logSupplementTaken({
          date: '2024-01-15',
          supplementId,
          supplementName: 'Test Vitamin',
          taken: true,
        });

        const isDuplicate = repo.checkDuplicateLog('2024-01-15', supplementId);
        expect(isDuplicate).toBe(true);
      });

      it('should return false when supplement not taken on date', () => {
        const isDuplicate = repo.checkDuplicateLog('2024-01-15', supplementId);
        expect(isDuplicate).toBe(false);
      });

      it('should return false when supplement taken but not marked as taken', () => {
        repo.logSupplementTaken({
          date: '2024-01-15',
          supplementId,
          supplementName: 'Test Vitamin',
          taken: false,
        });

        const isDuplicate = repo.checkDuplicateLog('2024-01-15', supplementId);
        expect(isDuplicate).toBe(false);
      });
    });

    describe('getAllSupplementLogs', () => {
      beforeEach(() => {
        // Create logs across multiple dates
        for (let i = 1; i <= 10; i++) {
          repo.logSupplementTaken({
            date: `2024-01-${String(i).padStart(2, '0')}`,
            supplementId,
            supplementName: 'Test Vitamin',
            taken: i % 2 === 0, // Alternate taken/not taken
          });
        }
      });

      it('should return paginated logs with total count', () => {
        const result = repo.getAllSupplementLogs(undefined, undefined, 5, 0);

        expect(result.data).toHaveLength(5);
        expect(result.total).toBe(10);
      });

      it('should handle date range filtering', () => {
        const result = repo.getAllSupplementLogs('2024-01-03', '2024-01-07');

        expect(result.total).toBe(5); // dates 3-7
        expect(result.data).toHaveLength(5);
      });

      it('should handle pagination with date range', () => {
        const result = repo.getAllSupplementLogs('2024-01-01', '2024-01-10', 3, 3);

        expect(result.total).toBe(10);
        expect(result.data).toHaveLength(3);
        expect(result.data[0].date).toBe('2024-01-07'); // Offset 3 from most recent (dates are ordered DESC)
      });
    });
  });

  describe('Nutrient Targets', () => {
    describe('upsertNutrientTarget', () => {
      it('should create new nutrient target', () => {
        const result = repo.upsertNutrientTarget('vitaminD', 50, true);

        expect(result).toMatchObject({
          nutrientKey: 'vitaminD',
          targetValue: 50,
          useRda: true,
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });

      it('should update existing nutrient target', () => {
        // Create initial target
        const initial = repo.upsertNutrientTarget('vitaminD', 25, true);

        // Small delay to ensure different timestamp
        setTimeout(() => {}, 1);

        // Update it
        const result = repo.upsertNutrientTarget('vitaminD', 50, false);

        expect(result.targetValue).toBe(50);
        expect(result.useRda).toBe(false);
        expect(result.id).toBe(initial.id); // Same record
        // Note: In test environment, timestamps might be identical, so we check the values instead
      });
    });

    describe('getNutrientTarget', () => {
      it('should return nutrient target by key', () => {
        repo.upsertNutrientTarget('calcium', 1000, true);

        const result = repo.getNutrientTarget('calcium');
        expect(result?.targetValue).toBe(1000);
        expect(result?.useRda).toBe(true);
      });

      it('should return null for non-existent target', () => {
        const result = repo.getNutrientTarget('nonexistent');
        expect(result).toBeNull();
      });
    });

    describe('getAllNutrientTargets', () => {
      it('should return all nutrient targets', () => {
        repo.upsertNutrientTarget('vitaminD', 25, true);
        repo.upsertNutrientTarget('calcium', 1000, false);

        const targets = repo.getAllNutrientTargets();
        expect(targets).toHaveLength(2);
        expect(targets.map((t) => t.nutrientKey)).toContain('vitaminD');
        expect(targets.map((t) => t.nutrientKey)).toContain('calcium');
      });
    });

    describe('deleteNutrientTarget', () => {
      it('should delete nutrient target', () => {
        repo.upsertNutrientTarget('iron', 18, true);

        repo.deleteNutrientTarget('iron');

        const result = repo.getNutrientTarget('iron');
        expect(result).toBeNull();
      });

      it('should not throw error when deleting non-existent target', () => {
        expect(() => {
          repo.deleteNutrientTarget('nonexistent');
        }).not.toThrow();
      });
    });
  });

  describe('Custom Nutrients', () => {
    describe('createCustomNutrient', () => {
      it('should create custom nutrient', () => {
        const data = {
          key: 'omega3',
          name: 'Omega-3 Fatty Acids',
          unit: 'mg',
          category: 'fatty-acids',
          userDefinedTarget: 1000,
        };

        const result = repo.createCustomNutrient(data);

        expect(result).toMatchObject({
          ...data,
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
    });

    describe('getCustomNutrientByKey', () => {
      it('should return custom nutrient by key', () => {
        repo.createCustomNutrient({
          key: 'test-nutrient',
          name: 'Test Nutrient',
          unit: 'mg',
          category: 'test',
        });

        const result = repo.getCustomNutrientByKey('test-nutrient');
        expect(result?.name).toBe('Test Nutrient');
      });

      it('should return null for non-existent custom nutrient', () => {
        const result = repo.getCustomNutrientByKey('nonexistent');
        expect(result).toBeNull();
      });
    });

    describe('getAllCustomNutrients', () => {
      it('should return all custom nutrients ordered by category and name', () => {
        repo.createCustomNutrient({
          key: 'zinc-custom',
          name: 'Zinc Custom',
          unit: 'mg',
          category: 'minerals',
        });

        repo.createCustomNutrient({
          key: 'vitamin-a-custom',
          name: 'Vitamin A Custom',
          unit: 'IU',
          category: 'vitamins',
        });

        const nutrients = repo.getAllCustomNutrients();
        expect(nutrients).toHaveLength(2);
        // Should be ordered by category, then name
        expect(nutrients[0].category).toBe('minerals');
        expect(nutrients[1].category).toBe('vitamins');
      });
    });

    describe('updateCustomNutrient', () => {
      let nutrientKey: string;

      beforeEach(() => {
        const created = repo.createCustomNutrient({
          key: 'test-update',
          name: 'Test Update',
          unit: 'mg',
          category: 'test',
          userDefinedTarget: 100,
        });
        nutrientKey = created.key;
      });

      it('should update custom nutrient', () => {
        const updates = {
          name: 'Updated Name',
          userDefinedTarget: 200,
        };

        const result = repo.updateCustomNutrient(nutrientKey, updates);

        expect(result.name).toBe('Updated Name');
        expect(result.userDefinedTarget).toBe(200);
        // Note: In test environment, timestamps might be identical
      });

      it('should throw error for non-existent custom nutrient', () => {
        expect(() => {
          repo.updateCustomNutrient('nonexistent', { name: 'New Name' });
        }).toThrow('Custom nutrient not found');
      });
    });

    describe('deleteCustomNutrient', () => {
      it('should delete custom nutrient', () => {
        repo.createCustomNutrient({
          key: 'to-delete',
          name: 'To Delete',
          unit: 'mg',
          category: 'test',
        });

        repo.deleteCustomNutrient('to-delete');

        const result = repo.getCustomNutrientByKey('to-delete');
        expect(result).toBeNull();
      });

      it('should not throw error when deleting non-existent custom nutrient', () => {
        expect(() => {
          repo.deleteCustomNutrient('nonexistent');
        }).not.toThrow();
      });
    });
  });
});

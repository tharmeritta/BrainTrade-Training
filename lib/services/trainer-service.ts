import type { TrainingPeriod, TrainingDayRecord, DisciplineRecord, DisciplineType } from '@/types';

export const TrainerService = {
  async getPeriods(): Promise<{ periods: TrainingPeriod[] }> {
    const res = await fetch('/api/trainer/training-periods');
    if (!res.ok) throw new Error('Failed to fetch training periods');
    return res.json();
  },

  async createPeriod(data: any): Promise<TrainingPeriod> {
    const res = await fetch('/api/trainer/training-periods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create period');
    }
    return res.json();
  },

  async updatePeriod(id: string, data: Partial<TrainingPeriod>): Promise<TrainingPeriod> {
    const res = await fetch(`/api/trainer/training-periods/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update period');
    return res.json();
  },

  async deletePeriod(id: string): Promise<void> {
    const res = await fetch(`/api/trainer/training-periods/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete period');
  },

  async getDayRecords(periodId: string): Promise<{ records: TrainingDayRecord[] }> {
    const res = await fetch(`/api/trainer/training-periods/${periodId}/days`);
    if (!res.ok) throw new Error('Failed to fetch day records');
    return res.json();
  },

  async updateDayRecord(periodId: string, data: any): Promise<TrainingDayRecord> {
    const res = await fetch(`/api/trainer/training-periods/${periodId}/days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save day record');
    return res.json();
  },

  async getDisciplineRecords(periodId: string): Promise<{ records: DisciplineRecord[] }> {
    const res = await fetch(`/api/trainer/discipline?periodId=${periodId}`);
    if (!res.ok) throw new Error('Failed to fetch discipline records');
    return res.json();
  },

  async createDisciplineRecord(data: any): Promise<DisciplineRecord> {
    const res = await fetch('/api/trainer/discipline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create discipline record');
    }
    return res.json();
  },

  async deleteDisciplineRecord(id: string): Promise<void> {
    const res = await fetch(`/api/trainer/discipline/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete discipline record');
  },
};

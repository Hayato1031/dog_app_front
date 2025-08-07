export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Medicine {
  id: number;
  name: string;
  morning_dose?: number;
  evening_dose?: number;
  night_dose?: number;
  unit: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface DoseRecord {
  id: number;
  medicine_id: number;
  dose_date: string;
  morning_taken: boolean;
  evening_taken: boolean;
  night_taken: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  medicine?: Medicine;
}

export interface CalendarData {
  [date: string]: {
    status: '完了' | '一部' | '未実施';
    records: Array<{
      id: number;
      medicine_name: string;
      completion_status: '完了' | '一部' | '未実施';
    }>;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error?: string;
  errors?: { [key: string]: string[] };
}

export interface HealthRecord {
  id: number;
  date: string;
  condition?: number; // 1-5 scale
  appetite?: number; // 1-5 scale
  notes?: string;
  importance: number; // 1-3 scale
  is_hospital_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImportantRecordsResponse {
  last_hospital_visit: HealthRecord | null;
  important_records: HealthRecord[];
}

export interface HealthCalendarData {
  [date: string]: {
    has_record: boolean;
    condition?: number;
    appetite?: number;
    importance?: number;
    is_hospital_day?: boolean;
    notes?: string;
  };
}
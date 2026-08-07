// ─── Auth ────────────────────────────────────────────────────────────────────

export type Role = "student" | "trainer" | "admin";

export interface AuthSession {
  access_token: string;
  token_type: string;
  expires_at: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  role: Role;
  email: string | null;
  phone: string | null;
  full_name: string;
  status: "active" | "disabled";
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  code: string;
  name: string;
  timezone: string;
  status: "active" | "disabled";
  class_type_ids: string[];
}

export type ClassCategory = "group_reformer" | "group_mat" | "private" | "duo";

export interface ClassType {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ClassCategory;
  level: string;
  default_capacity: number;
  status: "active" | "disabled";
  branch_ids: string[];
}

// ─── Package ──────────────────────────────────────────────────────────────────

export interface CoursePackage {
  id: string;
  code: string;
  name: string;
  sessions: number;
  validity_days: number;
  status: "active" | "disabled";
  class_type_ids: string[];
}

// ─── Session ──────────────────────────────────────────────────────────────────

export type SessionStatus = "scheduled" | "cancelled" | "completed";

export interface ClassSession {
  id: string;
  branch_id: string;
  branch_name: string;
  class_type_id: string;
  class_type_name: string;
  trainer_id: string | null;
  trainer_name: string | null;
  start_at: string;
  end_at: string;
  capacity: number;
  booked_count: number;
  status: SessionStatus;
  is_mine?: boolean;
}

// ─── Credits ──────────────────────────────────────────────────────────────────

export type CreditLotStatus = "active" | "frozen" | "void";

export interface CreditLot {
  id: string;
  package_id: string;
  package_name: string;
  sessions_total: number;
  sessions_remaining: number;
  activated_at: string;
  expires_at: string;
  status: CreditLotStatus;
  branch_id: string | null;
  branch_name: string | null;
}

export interface CreditSummary {
  total_remaining: number;
  lots: CreditLot[];
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export type BookingStatus =
  | "booked"
  | "cancelled_refunded"
  | "attended"
  | "no_show";

export interface Booking {
  id: string;
  session_id: string;
  session_start_at: string;
  session_end_at: string;
  branch_name: string;
  class_type_name: string;
  trainer_name: string | null;
  student_id: string;
  student_name: string;
  student_phone: string | null;
  status: BookingStatus;
  channel: string;
  booked_at: string;
  cancelled_at: string | null;
  cancellable?: boolean;
  cancellation_reason?: string | null;
}

// ─── Trainer ──────────────────────────────────────────────────────────────────

export interface Trainer extends AppUser {
  role: "trainer";
  last_login_at?: string | null;
}

// ─── Student ──────────────────────────────────────────────────────────────────

export interface Student extends AppUser {
  role: "student";
  credits: number;
}

export interface AdminCreditLot {
  id: string;
  package_id: string;
  package_name: string;
  sessions_total: number;
  sessions_remaining: number;
  activated_at: string;
  expires_at: string;
  status: CreditLotStatus;
  branch_id: string | null;
  branch_name: string | null;
  class_type_ids: string[];
}

export interface StudentDetail {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: "active" | "disabled";
  notes: string | null;
  credits: number;
  credit_lots: AdminCreditLot[];
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface HaravanProductMapping {
  id: string;
  haravan_product_id: string | null;
  haravan_variant_id: string;
  package_id: string;
  package_name: string;
  haravan_sku: string | null;
  branch_id: string | null;
  branch_name: string | null;
  active: boolean;
}

// ─── API body types ───────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  message?: string;
}

export interface AdjustCreditBody {
  delta?: number;
  expires_at?: string;
  reason: string;
}

export interface CreateSessionBody {
  branch_id: string;
  class_type_id: string;
  trainer_id: string;
  start_at: string;
  end_at: string;
  capacity: number;
}

export interface CreateTrainerBody {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface CreateStudentBody {
  full_name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface CreateCreditLotBody {
  package_id: string;
  sessions_total: number;
  expires_at: string;
  branch_id?: string;
}

export interface TrainerStudentSearchResult {
  id: string;
  full_name: string;
  phone: string | null;
}

export interface CreditHistoryEntry {
  kind: "credit" | "expiry";
  at: string;
  reason: string;
  detail: { delta?: number; balance_after?: number; old_expires_at?: string; new_expires_at?: string };
  actor_name: string | null;
}

export interface AttendanceBody {
  status: "attended" | "no_show" | "booked";
}

export interface CreateTrainerSessionBody {
  branch_id: string;
  class_type_id: string;
  start_at: string;
  end_at: string;
  capacity?: number;
}

export interface AdminCancelBookingBody {
  reason: string;
  refund?: boolean;
}

export interface AdminRescheduleBookingBody {
  new_session_id: string;
  reason: string;
}

export interface CancelSessionBody {
  reason?: string;
}

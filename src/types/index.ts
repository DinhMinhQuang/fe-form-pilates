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

export interface StudentProfile extends AppUser {
  haravan_customer_id: string | null;
  notes: string | null;
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  timezone: string;
  status: "active" | "disabled";
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
}

// ─── Package ──────────────────────────────────────────────────────────────────

export interface CoursePackage {
  id: string;
  code: string;
  name: string;
  sessions: number;
  validity_months: number;
  status: "active" | "disabled";
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
  channel: "student" | "admin";
  booked_at: string;
  cancelled_at: string | null;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface Trainer extends AppUser {
  role: "trainer";
}

export interface Student extends AppUser {
  role: "student";
  haravan_customer_id: string | null;
  notes: string | null;
}

export interface StudentDetail extends Student {
  credits: CreditSummary;
  recent_bookings: Booking[];
}

export interface HaravanProductMapping {
  id: string;
  haravan_product_id: string | null;
  haravan_variant_id: string;
  package_id: string;
  package_name: string;
  branch_id: string | null;
  branch_name: string | null;
  active: boolean;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  message?: string;
}

export interface BookResponse {
  booking_id: string;
}

export interface AdjustCreditBody {
  delta: number;
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
  phone: string;
  password: string;
}

export interface CreateStudentBody {
  full_name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface AttendanceBody {
  status: "attended" | "no_show";
}

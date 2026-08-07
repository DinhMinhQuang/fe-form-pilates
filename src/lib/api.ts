import { clearSession, getToken } from "@/lib/auth";
import type {
  AdjustCreditBody,
  AdminCancelBookingBody,
  AdminRescheduleBookingBody,
  AppUser,
  AttendanceBody,
  AuthSession,
  Booking,
  BookingStatus,
  Branch,
  CancelSessionBody,
  ClassSession,
  ClassType,
  CoursePackage,
  CreateCreditLotBody,
  CreateSessionBody,
  CreateStudentBody,
  CreateTrainerBody,
  CreateTrainerSessionBody,
  CreditHistoryEntry,
  CreditLot,
  CreditLotStatus,
  CreditSummary,
  HaravanProductMapping,
  Student,
  StudentDetail,
  Trainer,
  TrainerStudentSearchResult,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    if (res.status === 401 && auth) {
      clearSession();
      window.location.href = "/login";
      throw new ApiError(401, "Unauthorized");
    }
    let msg = res.statusText;
    try {
      const body = await res.json();
      const raw = body.message ?? body.error?.message ?? body.error ?? msg;
      msg = typeof raw === "string" ? raw : JSON.stringify(raw);
    } catch {
      // ignore
    }
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function get<T>(path: string, auth = true) {
  return request<T>(path, { method: "GET" }, auth);
}

interface RawPage<T> {
  items: T[];
  next_cursor: string | null;
}

// Mảng thật (giữ nguyên .length/.map/... cho mọi chỗ đang dùng như array phẳng), gắn thêm
// .nextCursor để chỗ nào cần "tải thêm" có thể đọc mà không phải sửa lại toàn bộ call site.
export type Paged<T> = T[] & { nextCursor: string | null };

function toPaged<T>(page: RawPage<T>): Paged<T> {
  return Object.assign(page.items, { nextCursor: page.next_cursor });
}

function qs(params?: Record<string, string | number | undefined | null>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v != null) as [string, string][];
  return entries.length ? "?" + new URLSearchParams(entries).toString() : "";
}

// Endpoint hỗ trợ cursor pagination — trả Paged<T> (mảng + .nextCursor) thay vì mảng phẳng.
function getPage<T>(path: string, params?: Record<string, string | number | undefined | null>) {
  return get<RawPage<T>>(`${path}${qs(params)}`).then(toPaged);
}

function post<T>(path: string, body?: unknown, auth = true) {
  return request<T>(
    path,
    { method: "POST", body: body ? JSON.stringify(body) : undefined },
    auth,
  );
}

function patch<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

function put<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

function del<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: "DELETE",
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ─── BE raw types (match exact API response shapes) ───────────────────────────

interface RawStudentSession {
  id: string;
  branch_id: string;
  branch_name: string;
  class_name: string;
  category: string;
  trainer_name: string | null;
  start_at: string;
  end_at: string;
  capacity: number;
  available_slots: number;
}

interface RawStudentBooking {
  id: string;
  session_id: string;
  class_name: string;
  branch_name: string;
  start_at: string;
  end_at: string;
  status: string;
  booked_at: string;
  cancellable: boolean;
}

interface RawCreditView {
  lot_id: string;
  package_name: string;
  sessions_total: number;
  sessions_remaining: number;
  activated_at: string;
  expires_at: string;
  status: string;
  branch_id: string | null;
  branch_name: string | null;
}

interface RawAdminSession {
  id: string;
  branch_id: string;
  branch_name: string;
  class_type_id: string;
  class_name: string;
  trainer_id: string | null;
  trainer_name: string | null;
  start_at: string;
  end_at: string;
  capacity: number;
  booked_count: number;
  status: string;
}

interface RawAdminBooking {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  student_phone: string | null;
  branch_name: string;
  class_name: string;
  start_at: string;
  end_at: string;
  status: string;
  channel: string;
  booked_at: string;
  cancellation_reason: string | null;
}

interface RawTrainerSession {
  id: string;
  class_name: string;
  branch_name: string;
  trainer_name: string | null;
  start_at: string;
  end_at: string;
  booked_count: number;
  capacity: number;
  status: string;
  is_mine: boolean;
}

interface RawStudentInClass {
  booking_id: string;
  student_id: string;
  full_name: string;
  phone: string | null;
  status: string;
}

// ─── Transforms ───────────────────────────────────────────────────────────────

function toStudentSession(r: RawStudentSession): ClassSession {
  return {
    id: r.id,
    branch_id: r.branch_id,
    branch_name: r.branch_name,
    class_type_id: "",
    class_type_name: r.class_name,
    trainer_id: null,
    trainer_name: r.trainer_name,
    start_at: r.start_at,
    end_at: r.end_at,
    capacity: r.capacity,
    booked_count: r.capacity - r.available_slots,
    status: "scheduled",
  };
}

function toAdminSession(r: RawAdminSession): ClassSession {
  return {
    id: r.id,
    branch_id: r.branch_id,
    branch_name: r.branch_name,
    class_type_id: r.class_type_id,
    class_type_name: r.class_name,
    trainer_id: r.trainer_id,
    trainer_name: r.trainer_name,
    start_at: r.start_at,
    end_at: r.end_at,
    capacity: r.capacity,
    booked_count: r.booked_count,
    status: r.status as ClassSession["status"],
  };
}

function toStudentBooking(r: RawStudentBooking): Booking {
  return {
    id: r.id,
    session_id: r.session_id,
    session_start_at: r.start_at,
    session_end_at: r.end_at,
    branch_name: r.branch_name,
    class_type_name: r.class_name,
    trainer_name: null,
    student_id: "",
    student_name: "",
    student_phone: null,
    status: r.status as BookingStatus,
    channel: "student",
    booked_at: r.booked_at,
    cancelled_at: null,
    cancellable: r.cancellable,
  };
}

function toAdminBooking(r: RawAdminBooking): Booking {
  return {
    id: r.id,
    session_id: r.session_id,
    session_start_at: r.start_at,
    session_end_at: r.end_at,
    branch_name: r.branch_name,
    class_type_name: r.class_name,
    trainer_name: null,
    student_id: r.student_id,
    student_name: r.student_name,
    student_phone: r.student_phone,
    status: r.status as BookingStatus,
    channel: r.channel,
    booked_at: r.booked_at,
    cancelled_at: null,
    cancellation_reason: r.cancellation_reason,
  };
}

function toCreditSummary(raws: RawCreditView[]): CreditSummary {
  const lots: CreditLot[] = raws.map((r) => ({
    id: r.lot_id,
    package_id: "",
    package_name: r.package_name,
    sessions_total: r.sessions_total,
    sessions_remaining: r.sessions_remaining,
    activated_at: r.activated_at,
    expires_at: r.expires_at,
    status: r.status as CreditLotStatus,
    branch_id: r.branch_id,
    branch_name: r.branch_name,
  }));
  const total_remaining = lots
    .filter((l) => l.status === "active")
    .reduce((sum, l) => sum + l.sessions_remaining, 0);
  return { total_remaining, lots };
}

function toTrainerSession(r: RawTrainerSession): ClassSession {
  return {
    id: r.id,
    branch_id: "",
    branch_name: r.branch_name,
    class_type_id: "",
    class_type_name: r.class_name,
    trainer_id: null,
    trainer_name: r.trainer_name,
    start_at: r.start_at,
    end_at: r.end_at,
    capacity: r.capacity,
    booked_count: r.booked_count,
    status: r.status as ClassSession["status"],
    is_mine: r.is_mine,
  };
}

function toTrainerStudentBooking(r: RawStudentInClass): Booking {
  return {
    id: r.booking_id,
    session_id: "",
    session_start_at: "",
    session_end_at: "",
    branch_name: "",
    class_type_name: "",
    trainer_name: null,
    student_id: r.student_id,
    student_name: r.full_name,
    student_phone: r.phone,
    status: r.status as BookingStatus,
    channel: "student",
    booked_at: "",
    cancelled_at: null,
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  requestMagicLink: (email?: string, phone?: string) =>
    post<{ message: string }>("/auth/magic-links", { email, phone }, false),

  exchangeMagicToken: (token: string) =>
    post<AuthSession>("/auth/magic/exchange", { token }, false),

  staffLogin: (email: string, password: string) =>
    post<AuthSession>("/auth/staff/login", { email, password }, false),
};

// ─── Me ──────────────────────────────────────────────────────────────────────

export const meApi = {
  profile: () => get<AppUser>("/me"),
};

// ─── Catalog ─────────────────────────────────────────────────────────────────

export const catalogApi = {
  branches: () => get<Branch[]>("/branches", false),
  classTypes: () => get<ClassType[]>("/class-types", false),
  packages: () => get<CoursePackage[]>("/packages", false),
};

// ─── Student ─────────────────────────────────────────────────────────────────

export const studentApi = {
  sessions: async (params?: {
    branchId?: string;
    from?: string;
    to?: string;
    cursor?: string;
    limit?: number;
  }): Promise<Paged<ClassSession>> => {
    const raw = await getPage<RawStudentSession>("/sessions", {
      branch_id: params?.branchId,
      from: params?.from,
      to: params?.to,
      cursor: params?.cursor,
      limit: params?.limit,
    });
    return Object.assign(raw.map(toStudentSession), { nextCursor: raw.nextCursor });
  },

  myBookings: async (params?: { status?: string; cursor?: string; limit?: number }): Promise<Paged<Booking>> => {
    const raw = await getPage<RawStudentBooking>("/me/bookings", params);
    return Object.assign(raw.map(toStudentBooking), { nextCursor: raw.nextCursor });
  },

  myCredits: async (): Promise<CreditSummary> => {
    const raw = await get<RawCreditView[]>("/me/credits");
    return toCreditSummary(raw);
  },

  book: (sessionId: string) =>
    post<{ booking_id: string }>(`/sessions/${sessionId}/book`),

  cancel: (bookingId: string) =>
    post<void>(`/bookings/${bookingId}/cancel`),
};

// ─── Trainer ─────────────────────────────────────────────────────────────────

export const trainerApi = {
  sessions: async (params?: {
    from?: string;
    to?: string;
    branchId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<Paged<ClassSession>> => {
    const raw = await getPage<RawTrainerSession>("/trainer/sessions", {
      from: params?.from,
      to: params?.to,
      branch_id: params?.branchId,
      cursor: params?.cursor,
      limit: params?.limit,
    });
    return Object.assign(raw.map(toTrainerSession), { nextCursor: raw.nextCursor });
  },

  students: async (sessionId: string): Promise<Booking[]> => {
    const raw = await get<RawStudentInClass[]>(`/trainer/sessions/${sessionId}/students`);
    return raw.map(toTrainerStudentBooking);
  },

  markAttendance: (bookingId: string, body: AttendanceBody) =>
    post<void>(`/trainer/bookings/${bookingId}/attendance`, body),

  searchStudents: (q: string, params?: { cursor?: string; limit?: number }) =>
    getPage<TrainerStudentSearchResult>("/trainer/students", { q, ...params }),

  book: (studentId: string, sessionId: string) =>
    post<{ booking_id: string }>(
      `/trainer/students/${studentId}/sessions/${sessionId}/book`,
    ),

  createSession: (body: CreateTrainerSessionBody) =>
    post<{ session_id: string }>("/trainer/sessions", body),
};

// ─── Admin — Sessions ─────────────────────────────────────────────────────────

export const adminSessionApi = {
  list: async (params?: {
    from?: string;
    to?: string;
    branch_id?: string;
    trainer_id?: string;
    status?: string;
    cursor?: string;
    limit?: number;
  }): Promise<Paged<ClassSession>> => {
    const raw = await getPage<RawAdminSession>("/admin/sessions", params);
    return Object.assign(raw.map(toAdminSession), { nextCursor: raw.nextCursor });
  },

  create: (body: CreateSessionBody) =>
    post<{ session_id: string }>("/admin/sessions", body),

  update: (sessionId: string, body: Partial<CreateSessionBody & { status: string }>) =>
    patch<void>(`/admin/sessions/${sessionId}`, body),

  cancel: (sessionId: string, body?: CancelSessionBody) =>
    del<void>(`/admin/sessions/${sessionId}`, body),
};

// ─── Admin — Trainers ─────────────────────────────────────────────────────────

export const adminTrainerApi = {
  list: (params?: { status?: string; q?: string; cursor?: string; limit?: number }) =>
    getPage<Trainer>("/admin/trainers", params),
  create: (body: CreateTrainerBody) =>
    post<{ trainer_id: string }>("/admin/trainers", body),
  update: (trainerId: string, body: Partial<CreateTrainerBody & { status: string }>) =>
    patch<void>(`/admin/trainers/${trainerId}`, body),
  disable: (trainerId: string) => del<void>(`/admin/trainers/${trainerId}`),
};

// ─── Admin — Students ─────────────────────────────────────────────────────────

export const adminStudentApi = {
  list: (params?: { q?: string; status?: string; cursor?: string; limit?: number }) =>
    getPage<Student>("/admin/students", params),

  create: (body: CreateStudentBody) =>
    post<{ student_id: string }>("/admin/students", body),

  detail: (studentId: string) =>
    get<StudentDetail>(`/admin/students/${studentId}`),

  update: (studentId: string, body: Partial<CreateStudentBody & { status: string }>) =>
    patch<void>(`/admin/students/${studentId}`, body),

  disable: (studentId: string) => del<void>(`/admin/students/${studentId}`),

  book: (studentId: string, sessionId: string) =>
    post<{ booking_id: string }>(
      `/admin/students/${studentId}/sessions/${sessionId}/book`,
    ),

  createCredit: (studentId: string, body: CreateCreditLotBody) =>
    post<{ lot_id: string }>(`/admin/students/${studentId}/credits`, body),

  adjustCredit: (
    studentId: string,
    creditLotId: string,
    body: AdjustCreditBody,
  ) =>
    patch<{ sessions_remaining: number }>(
      `/admin/students/${studentId}/credits/${creditLotId}`,
      body,
    ),

  creditHistory: (studentId: string, creditLotId: string) =>
    get<CreditHistoryEntry[]>(`/admin/students/${studentId}/credits/${creditLotId}/history`),
};

// ─── Admin — Bookings ─────────────────────────────────────────────────────────

export const adminBookingApi = {
  list: async (params?: {
    from?: string;
    to?: string;
    student_id?: string;
    session_id?: string;
    status?: string;
    q?: string;
    cursor?: string;
    limit?: number;
  }): Promise<Paged<Booking>> => {
    const raw = await getPage<RawAdminBooking>("/admin/bookings", params);
    return Object.assign(raw.map(toAdminBooking), { nextCursor: raw.nextCursor });
  },

  cancel: (bookingId: string, body: AdminCancelBookingBody) =>
    post<{ refunded: boolean }>(`/admin/bookings/${bookingId}/cancel`, body),

  reschedule: (bookingId: string, body: AdminRescheduleBookingBody) =>
    post<{ booking_id: string }>(`/admin/bookings/${bookingId}/reschedule`, body),
};

// ─── Admin — Haravan ─────────────────────────────────────────────────────────

export const adminHaravanApi = {
  listMappings: (params?: {
    branch_id?: string;
    active?: boolean;
    q?: string;
    cursor?: string;
    limit?: number;
  }) =>
    getPage<HaravanProductMapping>("/admin/haravan/product-mappings", {
      ...params,
      active: params?.active == null ? undefined : String(params.active),
    }),

  createMapping: (body: {
    haravan_product_id?: string;
    haravan_variant_id: string;
    package_id: string;
    branch_id?: string;
  }) => post<{ mapping_id: string }>("/admin/haravan/product-mappings", body),

  updateMapping: (
    mappingId: string,
    body: Partial<{
      haravan_product_id: string;
      haravan_variant_id: string;
      package_id: string;
      branch_id: string;
      active: boolean;
    }>,
  ) => patch<void>(`/admin/haravan/product-mappings/${mappingId}`, body),

  setPackageClassTypes: (packageId: string, classTypeIds: string[]) =>
    put<void>(`/admin/packages/${packageId}/class-types`, {
      class_type_ids: classTypeIds,
    }),
};

export { ApiError };

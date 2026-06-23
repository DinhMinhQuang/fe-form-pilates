import { getToken } from "@/lib/auth";
import type {
  AdjustCreditBody,
  AppUser,
  AttendanceBody,
  AuthSession,
  Booking,
  Branch,
  ClassSession,
  ClassType,
  CoursePackage,
  CreateSessionBody,
  CreateStudentBody,
  CreateTrainerBody,
  CreditSummary,
  HaravanProductMapping,
  Student,
  StudentDetail,
  Trainer,
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
  console.log(BASE)
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
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body.message ?? body.error ?? msg;
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

function del<T>(path: string) {
  return request<T>(path, { method: "DELETE" });
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
  sessions: (branchId?: string) =>
    get<ClassSession[]>(
      branchId ? `/sessions?branch_id=${branchId}` : "/sessions",
    ),
  myBookings: () => get<Booking[]>("/me/bookings"),
  myCredits: () => get<CreditSummary>("/me/credits"),
  book: (sessionId: string) =>
    post<{ booking_id: string }>(`/sessions/${sessionId}/book`),
  cancel: (bookingId: string) =>
    post<void>(`/bookings/${bookingId}/cancel`),
};

// ─── Trainer ─────────────────────────────────────────────────────────────────

export const trainerApi = {
  sessions: () => get<ClassSession[]>("/trainer/sessions"),
  students: (sessionId: string) =>
    get<Booking[]>(`/trainer/sessions/${sessionId}/students`),
  markAttendance: (bookingId: string, body: AttendanceBody) =>
    post<void>(`/trainer/bookings/${bookingId}/attendance`, body),
};

// ─── Admin — Sessions ─────────────────────────────────────────────────────────

export const adminSessionApi = {
  list: () => get<ClassSession[]>("/admin/sessions"),
  create: (body: CreateSessionBody) =>
    post<{ session_id: string }>("/admin/sessions", body),
  update: (sessionId: string, body: Partial<CreateSessionBody>) =>
    patch<void>(`/admin/sessions/${sessionId}`, body),
  cancel: (sessionId: string) => del<void>(`/admin/sessions/${sessionId}`),
};

// ─── Admin — Trainers ─────────────────────────────────────────────────────────

export const adminTrainerApi = {
  list: () => get<Trainer[]>("/admin/trainers"),
  create: (body: CreateTrainerBody) =>
    post<{ trainer_id: string }>("/admin/trainers", body),
  update: (trainerId: string, body: Partial<CreateTrainerBody>) =>
    patch<void>(`/admin/trainers/${trainerId}`, body),
  disable: (trainerId: string) => del<void>(`/admin/trainers/${trainerId}`),
};

// ─── Admin — Students ─────────────────────────────────────────────────────────

export const adminStudentApi = {
  list: () => get<Student[]>("/admin/students"),
  create: (body: CreateStudentBody) =>
    post<{ student_id: string }>("/admin/students", body),
  detail: (studentId: string) =>
    get<StudentDetail>(`/admin/students/${studentId}`),
  update: (studentId: string, body: Partial<CreateStudentBody>) =>
    patch<void>(`/admin/students/${studentId}`, body),
  book: (studentId: string, sessionId: string) =>
    post<{ booking_id: string }>(
      `/admin/students/${studentId}/sessions/${sessionId}/book`,
    ),
  adjustCredit: (
    studentId: string,
    creditLotId: string,
    body: AdjustCreditBody,
  ) =>
    patch<void>(
      `/admin/students/${studentId}/credits/${creditLotId}`,
      body,
    ),
};

// ─── Admin — Bookings ─────────────────────────────────────────────────────────

export const adminBookingApi = {
  list: () => get<Booking[]>("/admin/bookings"),
  cancel: (bookingId: string) =>
    post<void>(`/admin/bookings/${bookingId}/cancel`),
};

// ─── Admin — Haravan ─────────────────────────────────────────────────────────

export const adminHaravanApi = {
  listMappings: () =>
    get<HaravanProductMapping[]>("/admin/haravan/product-mappings"),
  createMapping: (body: {
    haravan_product_id?: string;
    haravan_variant_id: string;
    package_id: string;
    branch_id?: string;
  }) => post<{ mapping_id: string }>("/admin/haravan/product-mappings", body),
  updateMapping: (mappingId: string, body: { active: boolean }) =>
    patch<void>(`/admin/haravan/product-mappings/${mappingId}`, body),
  setPackageClassTypes: (packageId: string, classTypeIds: string[]) =>
    put<void>(`/admin/packages/${packageId}/class-types`, {
      class_type_ids: classTypeIds,
    }),
};

export { ApiError };

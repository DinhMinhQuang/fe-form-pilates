/* eslint-disable @typescript-eslint/no-require-imports -- Run this Node CommonJS test without a build step. */
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const student = { id: "student-1", full_name: "Student", role: "student" };
const oldStudent = { ...student, id: "student-old" };
const response = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: `HTTP ${status}`,
  json: async () => body,
});

function app({ token, user, magic = "", pathname = "/student/login", fetcher } = {}) {
  const saved = new Map();
  if (token) saved.set("fp_access_token", token);
  if (user) saved.set("fp_user", JSON.stringify(user));
  const calls = [];
  const redirects = [];
  const updates = [];
  const effects = [];
  const location = { pathname, href: pathname };
  const context = vm.createContext({
    Error, URLSearchParams, process: { env: {} }, window: { location },
    localStorage: {
      getItem: (key) => saved.get(key) ?? null,
      setItem: (key, value) => saved.set(key, value),
      removeItem: (key) => saved.delete(key),
    },
    fetch: async (url, init) => {
      const call = { path: new URL(url).pathname, ...init };
      calls.push(call);
      assert.ok(fetcher, `Unexpected request: ${call.path}`);
      return fetcher(call, saved);
    },
  });
  const router = { replace: (href) => redirects.push(href) };
  const modules = new Map();
  function load(name) {
    if (name === "react") return {
      Suspense: () => null,
      useState: (initial) => [initial, (value) => updates.push(value)],
      useRef: (value) => ({ current: value }),
      useEffect: (effect) => effects.push(effect),
    };
    if (name === "react/jsx-runtime") return { jsx: () => null, jsxs: () => null };
    if (name === "next/navigation") return {
      useRouter: () => router,
      useSearchParams: () => new URLSearchParams(magic ? { token: magic } : {}),
    };
    if (name.startsWith("@/components/")) return { default: () => null };
    const base = path.join(__dirname, "../src", name.replace(/^@\//, ""));
    const filename = existsSync(`${base}.ts`) ? `${base}.ts` : `${base}.tsx`;
    if (modules.has(filename)) return modules.get(filename).exports;
    const loaded = { exports: {} };
    modules.set(filename, loaded);
    let source = readFileSync(filename, "utf8");
    if (name === "@/app/(auth)/magic/page") source += "\nexport { MagicExchange };";
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    });
    vm.runInContext(`(function(require, module, exports) {${outputText}\n})`, context, { filename })(load, loaded, loaded.exports);
    return loaded.exports;
  }
  return {
    saved, calls, redirects, updates, location,
    api: load("@/lib/api"),
    async mount(page, repeatEffect = false) {
      const component = load(`@/app/(auth)/${page}/page`);
      (page === "magic" ? component.MagicExchange : component.default)();
      for (const effect of effects) {
        effect();
        // React StrictMode repeats effect setup using the same ref.
        if (repeatEffect) effect();
      }
      await new Promise(setImmediate);
    },
  };
}

test("student login restores a saved token even when fp_user is missing", async () => {
  const a = app({ token: "saved", fetcher: (call) => {
    assert.equal(call.path, "/me");
    assert.equal(call.headers.Authorization, "Bearer saved");
    return response(200, student);
  } });
  await a.mount("student/login");
  assert.deepEqual(a.redirects, ["/schedule"]);
  assert.deepEqual(JSON.parse(a.saved.get("fp_user")), student);
  assert.equal(a.saved.get("fp_access_token"), "saved");
});

test("no saved token leaves the student login form available without an API call", async () => {
  const a = app();
  assert.equal(await a.api.authApi.restoreSession(), null);
  await a.mount("student/login");
  assert.deepEqual(a.calls, []);
  assert.deepEqual(a.redirects, []);
  assert.equal(a.updates.at(-1), false);
});

for (const [pathname, user, destination] of [
  ["/student/login", undefined, "/student/login"],
  ["/magic", undefined, "/student/login"],
  ["/schedule", student, "/student/login"],
  ["/admin/sessions", { role: "admin" }, "/login"],
]) test(`expired session at ${pathname} clears storage and redirects to ${destination}`, async () => {
  const a = app({ token: "expired", user, pathname, fetcher: () => response(401, {}) });
  await assert.rejects(a.api.authApi.restoreSession(), (error) => error.status === 401);
  assert.equal(a.saved.size, 0);
  assert.equal(a.location.href, destination);
});

for (const failure of ["server", "network"]) test(`${failure} failure while restoring preserves the saved session`, async () => {
  const a = app({ token: "saved", user: student, fetcher: () => {
    if (failure === "network") throw new Error("Network unavailable");
    return response(503, { message: "Service unavailable" });
  } });
  await a.mount("student/login");
  assert.equal(a.saved.get("fp_access_token"), "saved");
  assert.deepEqual(JSON.parse(a.saved.get("fp_user")), student);
  assert.deepEqual(a.redirects, []);
  assert.equal(a.location.href, "/student/login");
  assert.ok(a.updates.some((value) => typeof value === "string" && value.includes("unavailable")));
});

for (const status of [200, 401]) for (const action of ["logout", "switch"]) {
  test(`a delayed ${status} response cannot overwrite the session after ${action}`, async () => {
    let respond;
    const delayed = new Promise((resolve) => { respond = resolve; });
    const a = app({ token: "old", user: oldStudent, fetcher: () => delayed });
    const restoring = a.api.authApi.restoreSession();
    a.saved.clear();
    if (action === "switch") {
      a.saved.set("fp_access_token", "new");
      a.saved.set("fp_user", JSON.stringify(student));
    }
    respond(response(status, oldStudent));
    if (status === 401) await assert.rejects(restoring, (error) => error.status === 401);
    else assert.equal(await restoring, null);
    assert.equal(a.location.href, "/student/login");
    assert.deepEqual(a.redirects, []);
    if (action === "logout") assert.equal(a.saved.size, 0);
    else {
      assert.equal(a.saved.get("fp_access_token"), "new");
      assert.deepEqual(JSON.parse(a.saved.get("fp_user")), student);
    }
  });
}

test("a fresh magic link switches accounts and is exchanged only once when its effect repeats", async () => {
  const a = app({ token: "old", user: oldStudent, magic: "fresh", pathname: "/magic", fetcher: (call, saved) => {
    if (call.path === "/auth/magic/exchange") {
      assert.deepEqual(JSON.parse(call.body), { token: "fresh" });
      assert.equal(call.headers.Authorization, undefined);
      return response(200, { access_token: "new" });
    }
    assert.equal(call.path, "/me");
    assert.equal(call.headers.Authorization, "Bearer new");
    assert.equal(saved.has("fp_user"), false);
    return response(200, student);
  } });
  await a.mount("magic", true);
  assert.deepEqual(a.calls.map((call) => call.path), ["/auth/magic/exchange", "/me"]);
  assert.equal(a.saved.get("fp_access_token"), "new");
  assert.deepEqual(JSON.parse(a.saved.get("fp_user")), student);
  assert.deepEqual(a.redirects, ["/schedule"]);
  assert.deepEqual(a.updates, []);
});

test("a used magic link resumes an existing valid session after exchange returns 401", async () => {
  const a = app({ token: "saved", magic: "used", pathname: "/magic", fetcher: (call) => {
    if (call.path === "/auth/magic/exchange") return response(401, { message: "Link already used" });
    assert.equal(call.headers.Authorization, "Bearer saved");
    return response(200, student);
  } });
  await a.mount("magic");
  assert.deepEqual(a.calls.map((call) => call.path), ["/auth/magic/exchange", "/me"]);
  assert.deepEqual(a.redirects, ["/schedule"]);
  assert.deepEqual(a.updates, []);
});

test("an invalid magic link without a saved session shows an error", async () => {
  const a = app({ magic: "invalid", pathname: "/magic", fetcher: () => response(401, { message: "Invalid link" }) });
  await a.mount("magic");
  assert.equal(a.calls.length, 1);
  assert.deepEqual(a.redirects, []);
  assert.equal(a.updates[0].message, "Invalid link");
  assert.equal(a.saved.size, 0);
});

for (const failure of ["server", "network"]) test(`magic ${failure} failure does not fall back to another account`, async () => {
  const a = app({ token: "old", user: oldStudent, magic: "fresh", pathname: "/magic", fetcher: () => {
    if (failure === "network") throw new Error("Network unavailable");
    return response(503, { message: "Service unavailable" });
  } });
  await a.mount("magic");
  assert.deepEqual(a.calls.map((call) => call.path), ["/auth/magic/exchange"]);
  assert.deepEqual(a.redirects, []);
  assert.ok(a.updates[0] instanceof Error);
  assert.equal(a.saved.get("fp_access_token"), "old");
  assert.deepEqual(JSON.parse(a.saved.get("fp_user")), oldStudent);
});

test("a missing magic token restores a saved session or reports an invalid link", async () => {
  const saved = app({ token: "saved", pathname: "/magic", fetcher: () => response(200, student) });
  await saved.mount("magic");
  assert.deepEqual(saved.calls.map((call) => call.path), ["/me"]);
  assert.deepEqual(saved.redirects, ["/schedule"]);
  const empty = app({ pathname: "/magic" });
  await empty.mount("magic");
  assert.equal(empty.calls.length, 0);
  assert.equal(empty.updates[0].message, "Link không hợp lệ.");
});

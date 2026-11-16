/* StudyBuddy - client-side behaviour (Submission 3). Pure JavaScript, no libraries. */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setupNav();
    setupToasts();
    setupBadges();
    setupCollapsibleForms();
    setupPasswordTools();
    setupCharCounters();
    setupDateTimeRules();
    setupTableFilters();
    setupRowActions();
    setupFormValidation();
    setupProfilePicture();
  }

  /* ---------- helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  function toast(msg, type) {
    const box = $("#toast-box");
    const t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }
  function setupToasts() {
    const box = document.createElement("div");
    box.id = "toast-box";
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }

  /* ---------- navigation: clean separators, highlight page, mobile menu ---------- */
  function setupNav() {
    const nav = $("header nav");
    if (!nav) return;
    Array.from(nav.childNodes).forEach(n => { if (n.nodeType === 3) n.remove(); });
    const here = location.pathname.split("/").slice(-2).join("/");
    $$("a", nav).forEach(a => {
      const target = a.getAttribute("href").split("/").slice(-2).join("/");
      const sameFolder = a.pathname.split("/").slice(-2).join("/") === here;
      if (sameFolder || target === here) a.classList.add("active");
    });
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-toggle";
    btn.textContent = "\u2630";
    btn.setAttribute("aria-label", "Toggle menu");
    btn.addEventListener("click", () => nav.classList.toggle("open"));
    nav.parentNode.insertBefore(btn, nav);
  }

  /* ---------- status badges ---------- */
  const BADGES = {
    ok: ["confirmed", "completed", "active", "accepted", "approved", "verified", "resolved"],
    warn: ["pending", "open", "waiting"],
    bad: ["rejected", "declined", "cancelled", "suspended", "removed"],
    info: ["rescheduled", "dismissed"]
  };
  function badgeClass(text) {
    const t = text.trim().toLowerCase();
    for (const k in BADGES) if (BADGES[k].includes(t)) return "badge-" + k;
    return null;
  }
  function makeBadge(cell, text) {
    const cls = badgeClass(text);
    if (!cls) return;
    cell.innerHTML = "";
    const s = document.createElement("span");
    s.className = "badge " + cls;
    s.textContent = text;
    cell.appendChild(s);
  }
  function setupBadges() {
    $$("table").forEach(tbl => {
      const wrap = document.createElement("div");
      wrap.className = "table-wrap";
      tbl.parentNode.insertBefore(wrap, tbl);
      wrap.appendChild(tbl);
      const heads = $$("thead th", tbl).map(th => th.textContent.trim().toLowerCase());
      const si = heads.indexOf("status");
      if (si > -1) $$("tbody tr", tbl).forEach(tr => {
        const c = tr.children[si];
        if (c) makeBadge(c, c.textContent);
      });
    });
    const v = $$("main p b").find(b => /verified/i.test(b.textContent));
    if (v) { v.className = "badge badge-ok"; }
  }

  /* ---------- edit / reschedule forms open on demand ---------- */
  function setupCollapsibleForms() {
    const forms = $$("form[id^='edit-'], form#reschedule");
    forms.forEach(f => f.classList.add("js-collapsible"));
    function sync() {
      const id = location.hash.slice(1);
      forms.forEach(f => f.classList.toggle("open", f.id === id));
    }
    $$("a[href^='#']").forEach(a => {
      const id = a.getAttribute("href").slice(1);
      const f = id && document.getElementById(id);
      if (f && f.classList.contains("js-collapsible")) {
        a.addEventListener("click", e => {
          e.preventDefault();
          const open = f.classList.toggle("open");
          if (open) {
            f.scrollIntoView({ behavior: "smooth", block: "center" });
            const first = $("input:not([type=hidden]),select,textarea", f);
            if (first) first.focus();
          }
        });
      }
    });
    $$("form.js-collapsible button[type=reset]").forEach(b =>
      b.addEventListener("click", () => b.closest("form").classList.remove("open")));
    sync();
  }

  /* ---------- passwords: show/hide, strength meter, match check ---------- */
  function setupPasswordTools() {
    $$("input[type=password]").forEach(inp => {
      const wrap = document.createElement("span");
      wrap.className = "pw-wrap";
      wrap.style.display = "block";
      inp.parentNode.insertBefore(wrap, inp);
      wrap.appendChild(inp);
      inp.style.maxWidth = "100%";
      const t = document.createElement("button");
      t.type = "button";
      t.className = "pw-toggle";
      t.textContent = "Show";
      t.addEventListener("click", () => {
        const show = inp.type === "password";
        inp.type = show ? "text" : "password";
        t.textContent = show ? "Hide" : "Show";
      });
      wrap.appendChild(t);
    });
    // strength meter on "new" password fields
    $$("input[name=password], input[name=new_password]").forEach(inp => {
      if (!inp.closest("form").querySelector("[name=confirm_password]")) return;
      const bar = document.createElement("div");
      bar.className = "strength";
      bar.innerHTML = "<span></span>";
      const lbl = document.createElement("span");
      lbl.className = "strength-label";
      const host = inp.closest(".pw-wrap");
      host.after(bar);
      bar.after(lbl);
      inp.addEventListener("input", () => {
        const s = strength(inp.value);
        const levels = [["Too short", "#ef4444", 15], ["Weak", "#f97316", 35], ["Fair", "#eab308", 60], ["Good", "#22c55e", 80], ["Strong", "#15803d", 100]];
        const l = inp.value ? levels[s] : ["", "#e5e7eb", 0];
        bar.firstChild.style.width = l[2] + "%";
        bar.firstChild.style.background = l[1];
        lbl.textContent = l[0] ? "Password strength: " + l[0] : "";
      });
    });
  }
  function strength(p) {
    if (p.length < 8) return 0;
    let s = 1;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++;
    return Math.min(s, 4);
  }

  /* ---------- live character counters ---------- */
  function setupCharCounters() {
    $$("textarea[maxlength], input[type=text][maxlength]").forEach(el => {
      const c = document.createElement("small");
      c.className = "char-count";
      const upd = () => (c.textContent = el.value.length + " / " + el.maxLength);
      el.after(c);
      el.addEventListener("input", upd);
      el.form && el.form.addEventListener("reset", () => setTimeout(upd));
      upd();
    });
  }

  /* ---------- date/time rules ---------- */
  function setupDateTimeRules() {
    const today = new Date().toISOString().slice(0, 10);
    $$("input[type=date]").forEach(d => {
      if (["date", "until"].includes(d.name)) d.min = today;
    });
  }

  /* ---------- live table filtering ---------- */
  function setupTableFilters() {
    // user search: filter rows as you type
    const q = $("input[type=search]");
    if (q) {
      const tbl = $("table");
      const run = () => filterRows(tbl, r => r.textContent.toLowerCase().includes(q.value.trim().toLowerCase()));
      q.addEventListener("input", run);
      q.form.addEventListener("submit", e => { e.preventDefault(); run(); });
    }
    // find partners: filter results by department, course, method, min score
    const f = $("form[method=get]");
    if (f && $("#min_score")) {
      const tbl = $("table");
      const apply = e => {
        if (e) e.preventDefault();
        const dep = $("#department").value.toLowerCase();
        const course = $("#course").value.split(" ")[0].toLowerCase();
        const method = (f.querySelector("[name=study_method]:checked") || {}).value;
        const min = Number($("#min_score").value) || 0;
        const shown = filterRows(tbl, r => {
          const c = r.children;
          const score = parseInt(c[5].textContent, 10) || 0;
          return (!dep || c[1].textContent.toLowerCase() === dep) &&
            (!course || c[2].textContent.toLowerCase().includes(course)) &&
            (!method || c[4].textContent.toLowerCase().replace("-", "_") === method) &&
            score >= min;
        });
        if (e) toast(shown + " partner(s) found", shown ? "ok" : "err");
      };
      f.addEventListener("submit", apply);
      f.addEventListener("reset", () => setTimeout(() => filterRows(tbl, () => true)));
    }
    // activity / analytics: simple date-range sanity check
    $$("form[method=get]").forEach(form => {
      const from = form.querySelector("[name=from]"), to = form.querySelector("[name=to]");
      if (from && to) form.addEventListener("submit", e => {
        e.preventDefault();
        if (from.value && to.value && from.value > to.value) {
          fieldError(to, "End date must be after start date");
        } else { clearError(to); toast("Filter applied", "ok"); }
      });
    });
  }
  function filterRows(tbl, test) {
    let shown = 0;
    $$("tbody tr:not(.empty-row)", tbl).forEach(r => {
      const ok = test(r);
      r.style.display = ok ? "" : "none";
      if (ok) shown++;
    });
    let empty = $("tbody .empty-row", tbl);
    if (!shown && !empty) {
      empty = document.createElement("tr");
      empty.className = "empty-row";
      empty.innerHTML = "<td colspan='" + tbl.tHead.rows[0].cells.length + "'>No matching records</td>";
      tbl.tBodies[0].appendChild(empty);
    }
    if (empty) empty.style.display = shown ? "none" : "";
    return shown;
  }

  /* ---------- table row actions (accept, cancel, delete, ...) ---------- */
  const ACTIONS = {
    accept: ["Accepted", "Request accepted"],
    reject: ["Rejected", "Request rejected"],
    decline: ["Declined", "Session declined"],
    cancel: ["Cancelled", "Session cancelled", true],
    complete: ["Completed", "Session marked as completed"],
    suspend: ["Suspended", "User suspended", true],
    delete: [null, "Item deleted", true],
    send_request: [null, "Partner request sent"]
  };
  function setupRowActions() {
    $$("table form").forEach(form => {
      const a = form.querySelector("input[name=action]");
      if (!a || !ACTIONS[a.value]) return;
      form.addEventListener("submit", e => {
        e.preventDefault();
        const [status, msg, confirmIt] = ACTIONS[a.value];
        if (confirmIt && !confirm("Are you sure? (" + a.value + ")")) return;
        const row = form.closest("tr");
        if (a.value === "delete") {
          row.remove();
          toast(msg, "ok");
          return;
        }
        if (a.value === "send_request") {
          const b = form.querySelector("button");
          b.textContent = "Request sent";
          b.disabled = true;
          b.style.opacity = ".6";
          toast(msg, "ok");
          return;
        }
        const tbl = row.closest("table");
        const si = $$("thead th", tbl).findIndex(th => /status/i.test(th.textContent));
        if (si > -1 && status) makeBadge(row.children[si], status);
        $$("form", row.lastElementChild).forEach(f => f !== form && a.value !== "complete" && f.remove());
        form.remove();
        toast(msg, "ok");
      });
    });
  }

  /* ---------- validation ---------- */
  function fieldError(el, msg) {
    clearError(el);
    el.classList.add("invalid");
    el.classList.remove("valid");
    const s = document.createElement("small");
    s.className = "error-msg";
    s.textContent = msg;
    (el.closest(".pw-wrap") || el).after(s);
  }
  function clearError(el) {
    el.classList.remove("invalid");
    const host = el.closest(".pw-wrap") || el;
    const nx = host.nextElementSibling;
    if (nx && nx.classList.contains("error-msg")) nx.remove();
    const nx2 = host.nextElementSibling && host.nextElementSibling.nextElementSibling;
    if (nx2 && nx2.classList.contains("error-msg")) nx2.remove();
  }
  function messageFor(el) {
    const v = el.validity;
    if (v.valueMissing) return "This field is required";
    if (v.typeMismatch) return el.type === "email" ? "Enter a valid email address" : "Invalid value";
    if (v.patternMismatch) return el.title || ({ student_id: "Format: 23-12345-1", phone: "Format: 01XXXXXXXXX", code: "Format: CSE101" }[el.name] || "Invalid format");
    if (v.tooShort) return "Must be at least " + el.minLength + " characters";
    if (v.rangeUnderflow) return "Must be at least " + el.min;
    if (v.rangeOverflow) return "Must be at most " + el.max;
    return "Invalid value";
  }
  function checkField(el) {
    clearError(el);
    el.setCustomValidity("");
    const f = el.form;
    if (el.name === "confirm_password") {
      const pw = f.querySelector("[name=password],[name=new_password]");
      if (pw && el.value !== pw.value) el.setCustomValidity("Passwords do not match");
    }
    if (el.name === "new_password" && f.querySelector("[name=current_password]") &&
        el.value && el.value === f.querySelector("[name=current_password]").value)
      el.setCustomValidity("New password must differ from the current one");
    if (el.name === "end_time" || el.name === "to_time") {
      const s = f.querySelector("[name=start_time],[name=from_time]");
      if (s && s.value && el.value && el.value <= s.value) el.setCustomValidity("End time must be after start time");
    }
    if (el.name === "date" && el.value && el.min && el.value < el.min) el.setCustomValidity("Date cannot be in the past");
    if (el.type === "file" && el.files[0] && el.files[0].size > 5 * 1024 * 1024)
      el.setCustomValidity("File must be smaller than 5 MB");
    if (el.checkValidity()) { if (el.value) el.classList.add("valid"); return true; }
    fieldError(el, el.validationMessage && el.willValidate && el.validity.customError ? el.validationMessage : messageFor(el));
    return false;
  }
  function setupFormValidation() {
    $$("form").forEach(form => {
      if (form.method.toLowerCase() === "get" && form.querySelector("[name=from],#min_score,[type=search]")) return;
      if (form.closest("table") && form.querySelector("input[name=action]") && !form.querySelector("[required]")) return;
      form.noValidate = true;
      const fields = () => $$("input:not([type=hidden]):not([type=reset]),select,textarea", form).filter(x => x.type !== "radio" && x.type !== "checkbox");
      fields().forEach(el => {
        el.addEventListener("blur", () => { if (el.value || el.classList.contains("invalid")) checkField(el); });
        el.addEventListener("input", () => { if (el.classList.contains("invalid")) checkField(el); });
        el.addEventListener("change", () => checkField(el));
      });
      // re-check confirm field when the first password changes
      const cp = form.querySelector("[name=confirm_password]");
      const np = form.querySelector("[name=password],[name=new_password]");
      if (cp && np) np.addEventListener("input", () => cp.value && checkField(cp));
      form.addEventListener("reset", () => setTimeout(() => {
        $$(".error-msg", form).forEach(x => x.remove());
        fields().forEach(x => x.classList.remove("invalid", "valid"));
      }));
      form.addEventListener("submit", e => {
        e.preventDefault();
        let ok = true, firstBad = null;
        fields().forEach(el => { if (!checkField(el)) { ok = false; firstBad = firstBad || el; } });
        // radio groups & required checkbox groups
        const seen = {};
        $$("input[type=radio][required]", form).forEach(r => {
          if (seen[r.name]) return;
          seen[r.name] = 1;
          const grp = $$("input[type=radio][name='" + r.name + "']", form);
          const fs = r.closest("fieldset");
          const old = fs.querySelector(":scope > .error-msg");
          if (old) old.remove();
          if (!grp.some(x => x.checked)) {
            ok = false;
            const s = document.createElement("small");
            s.className = "error-msg";
            s.textContent = "Please choose an option";
            fs.appendChild(s);
            firstBad = firstBad || r;
          }
        });
        if (!ok) { firstBad.focus(); toast("Please fix the highlighted fields", "err"); return; }
        const act = form.querySelector("input[name=action]");
        if (act && act.value === "delete_account" && !confirm("This will permanently delete your account. Continue?")) return;
        success(form);
      });
    });
  }
  function success(form) {
    const title = (form.querySelector("legend") || {}).textContent || "Form";
    toast(title.trim() + " submitted successfully (demo, no server yet)", "ok");
    if (form.classList.contains("js-collapsible")) form.classList.remove("open");
    if (form.id === "" || !form.classList.contains("js-collapsible")) form.reset();
  }

  /* ---------- profile picture preview ---------- */
  function setupProfilePicture() {
    const inp = $("input[type=file][name=picture]");
    const img = $("main img");
    if (!inp || !img) return;
    inp.addEventListener("change", () => {
      const f = inp.files[0];
      if (f && f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024) img.src = URL.createObjectURL(f);
    });
  }
})();

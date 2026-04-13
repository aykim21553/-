(function () {
  const MAX_DIGITS = 12;
  const mainEl = document.getElementById("main");
  const exprEl = document.getElementById("expr");
  const keysEl = document.getElementById("keys");

  let display = "0";
  let stored = null;
  let pendingOp = null;
  let freshInput = true;

  function formatNumber(n) {
    if (!Number.isFinite(n)) return "오류";
    const s = String(n);
    if (s.includes("e")) return s;
    const [intPart, frac] = s.split(".");
    const trimmed = intPart.length + (frac ? frac.length : 0);
    if (trimmed > MAX_DIGITS) {
      const rounded = Number(n.toPrecision(MAX_DIGITS));
      return String(rounded);
    }
    return s;
  }

  function updateView() {
    mainEl.textContent = display;
    if (stored !== null && pendingOp) {
      const sym = { "+": "+", "-": "−", "*": "×", "/": "÷" }[pendingOp] || pendingOp;
      exprEl.textContent = `${formatNumber(stored)} ${sym}`;
    } else {
      exprEl.textContent = "";
    }
  }

  function applyOp(a, b, op) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  function commitPending() {
    if (stored === null || pendingOp === null) return;
    const cur = parseFloat(display);
    const next = applyOp(stored, cur, pendingOp);
    display = formatNumber(next);
    stored = Number.isFinite(next) ? next : null;
    pendingOp = null;
    freshInput = true;
  }

  function inputDigit(d) {
    if (freshInput) {
      display = d;
      freshInput = false;
    } else {
      if (display === "0" && d !== "0") display = d;
      else if (display === "-0" && d !== "0") display = "-" + d;
      else if (display.replace("-", "").replace(".", "").length < MAX_DIGITS) {
        display += d;
      }
    }
  }

  function inputDot() {
    if (freshInput) {
      display = "0.";
      freshInput = false;
      return;
    }
    if (!display.includes(".")) display += ".";
  }

  function setOp(op) {
    const cur = parseFloat(display);
    if (stored !== null && pendingOp && !freshInput) {
      commitPending();
      if (display === "오류") return;
    }
    stored = parseFloat(display);
    pendingOp = op;
    freshInput = true;
  }

  function equals() {
    if (stored === null || pendingOp === null) return;
    commitPending();
  }

  function clearAll() {
    display = "0";
    stored = null;
    pendingOp = null;
    freshInput = true;
  }

  function toggleSign() {
    if (display === "0" || display === "오류") return;
    if (display.startsWith("-")) display = display.slice(1);
    else display = "-" + display;
    if (freshInput && stored !== null) freshInput = false;
  }

  function percent() {
    const n = parseFloat(display);
    if (!Number.isFinite(n)) return;
    display = formatNumber(n / 100);
    freshInput = true;
  }

  keysEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-digit], button[data-op], button[data-action]");
    if (!btn) return;

    const digit = btn.getAttribute("data-digit");
    const op = btn.getAttribute("data-op");
    const action = btn.getAttribute("data-action");

    if (digit !== null) {
      inputDigit(digit);
    } else if (op !== null) {
      setOp(op);
    } else if (action === "dot") {
      inputDot();
    } else if (action === "equals") {
      equals();
    } else if (action === "clear") {
      clearAll();
    } else if (action === "sign") {
      toggleSign();
    } else if (action === "percent") {
      percent();
    }

    updateView();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") {
      inputDigit(e.key);
    } else if (e.key === ".") {
      inputDot();
    } else if (e.key === "+" || e.key === "-") {
      setOp(e.key);
    } else if (e.key === "*") {
      setOp("*");
    } else if (e.key === "/") {
      e.preventDefault();
      setOp("/");
    } else if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      equals();
    } else if (e.key === "Escape") {
      clearAll();
    } else if (e.key === "Backspace") {
      e.preventDefault();
      if (!freshInput && display.length > 1) {
        display = display.slice(0, -1);
      } else if (!freshInput && display.length === 1) {
        display = "0";
        freshInput = true;
      }
    } else {
      return;
    }
    updateView();
  });

  updateView();
})();

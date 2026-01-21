/* ===========================
   SIMPLE WEB ANALYTICS TRACKER
   (No Database, uses localStorage)
=========================== */

let startTime = Date.now(); // used for time spent

// ✅ Get current page name
function getPageName() {
  const file = window.location.pathname.split("/").pop();
  if (file === "" || file === "index.html") return "Home";
  if (file === "about.html") return "About";
  if (file === "contact.html") return "Contact";
  if (file === "analytics.html") return "Analytics";
  return file;
}

// ✅ Get stored analytics array
function getAnalyticsData() {
  return JSON.parse(localStorage.getItem("analyticsData")) || [];
}

// ✅ Save analytics array
function saveAnalyticsData(data) {
  localStorage.setItem("analyticsData", JSON.stringify(data));
}

// ✅ Add a new record
function logEvent(action, element = "N/A", timeSpent = 0) {
  const analyticsData = getAnalyticsData();

  const record = {
    page: getPageName(),
    action: action,
    element: element,
    timeSpent: timeSpent,
    timestamp: new Date().toLocaleString()
  };

  analyticsData.push(record);
  saveAnalyticsData(analyticsData);

  // If on analytics page, refresh table live
  if (getPageName() === "Analytics") {
    renderTable();
  }

  console.log("✅ Logged:", record);
}

/* ===========================
   1) TRACK PAGE VISIT
=========================== */
window.addEventListener("load", () => {
  logEvent("Page Visit", "Page Loaded", 0);
});

/* ===========================
   2) TRACK TIME SPENT
   When user leaves page
=========================== */
window.addEventListener("beforeunload", () => {
  const endTime = Date.now();
  const secondsSpent = Math.round((endTime - startTime) / 1000);

  // log time only if 1+ seconds
  if (secondsSpent > 0) {
    logEvent("Time Spent", "Page", secondsSpent);
  }
});

/* ===========================
   3) TRACK NAVBAR CLICKS
=========================== */
document.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    const href = e.target.getAttribute("href");
    if (href && href.includes(".html")) {
      logEvent("Navbar Click", href, 0);
    }
  }
});

/* ===========================
   4) TRACK CARD / IMAGE CLICKS
   (Home page experiment cards)
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const cardId = card.getAttribute("data-card") || "unknown_card";
      logEvent("Card Click", cardId, 0);
    });
  });
});

/* ===========================
   5) TRACK FORM SUBMISSION
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedbackForm");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault(); // stop reload

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;

      logEvent("Form Submit", `Name:${name}, Email:${email}`, 0);

      alert("✅ Feedback submitted successfully!");

      form.reset();
    });
  }
});

/* ===========================
   6) RENDER TABLE (Analytics page)
=========================== */
function renderTable() {
  const tableBody = document.querySelector("#analyticsTable tbody");
  if (!tableBody) return;

  const data = getAnalyticsData();
  tableBody.innerHTML = "";

  data.forEach((row, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${row.page}</td>
      <td>${row.action}</td>
      <td>${row.element}</td>
      <td>${row.timeSpent}</td>
      <td>${row.timestamp}</td>
    `;

    tableBody.appendChild(tr);
  });
}

// Auto render when on analytics page
document.addEventListener("DOMContentLoaded", () => {
  if (getPageName() === "Analytics") {
    renderTable();
  }
});

/* ===========================
   7) CLEAR DATA BUTTON
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  const clearBtn = document.getElementById("clearDataBtn");

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all analytics data?")) {
        localStorage.removeItem("analyticsData");
        renderTable();
        alert("✅ Analytics data cleared!");
      }
    });
  }
});

/* ===========================
   8) EXPORT CSV BUTTON
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  const exportBtn = document.getElementById("exportCsvBtn");

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const data = getAnalyticsData();

      if (data.length === 0) {
        alert("No data available to export!");
        return;
      }

      // CSV Header
      let csvContent = "Index,Page,Action,Element,TimeSpent,Timestamp\n";

      // CSV Rows
      data.forEach((row, index) => {
        const csvRow = [
          index + 1,
          row.page,
          row.action,
          row.element.replaceAll(",", " "), // avoid breaking CSV
          row.timeSpent,
          row.timestamp
        ].join(",");

        csvContent += csvRow + "\n";
      });

      // Download CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "analytics_data.csv");
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
    });
  }
});

/* ===========================
   EXPORT JSON BUTTON
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  const exportJsonBtn = document.getElementById("exportJsonBtn");

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener("click", () => {
      const data = getAnalyticsData();

      if (data.length === 0) {
        alert("No data available to export!");
        return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "analytics_data.json";
      link.click();
    });
  }
});

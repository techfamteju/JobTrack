const API_URL = "/api/jobs";

const elements = {
  total: document.getElementById("totalCount"),
  interviews: document.getElementById("interviewCount"),
  offers: document.getElementById("offerCount"),
  applied: document.getElementById("appliedCount"),
  resultCount: document.getElementById("resultCount"),
  tableWrap: document.getElementById("tableWrap"),
  tableBody: document.getElementById("jobsTableBody"),
  loading: document.getElementById("loadingState"),
  empty: document.getElementById("emptyState"),
  error: document.getElementById("errorState"),
  search: document.getElementById("searchInput"),
  filter: document.getElementById("statusFilter"),
  modal: document.getElementById("jobModal"),
  form: document.getElementById("jobForm"),
  formError: document.getElementById("formError"),
  modalTitle: document.getElementById("modalTitle"),
  saveButton: document.getElementById("saveJobButton"),
  jobId: document.getElementById("jobId"),
  company: document.getElementById("company"),
  title: document.getElementById("title"),
  location: document.getElementById("location"),
  status: document.getElementById("status"),
  appliedDate: document.getElementById("appliedDate"),
  interviewDate: document.getElementById("interviewDate"),
  jobUrl: document.getElementById("jobUrl"),
  notes: document.getElementById("notes"),
  toast: document.getElementById("toast")
};

let allJobs = [];
let toastTimer;

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);
  elements.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.add("hidden"), 3200);
}

function setError(message) {
  elements.error.textContent = message;
  elements.error.classList.toggle("hidden", !message);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

async function loadJobs() {
  elements.loading.classList.remove("hidden");
  elements.tableWrap.classList.add("hidden");
  elements.empty.classList.add("hidden");
  setError("");

  try {
    const query = new URLSearchParams();
    const search = elements.search.value.trim();
    const status = elements.filter.value;
    if (search) query.set("search", search);
    if (status) query.set("status", status);

    const suffix = query.toString() ? `?${query.toString()}` : "";
    allJobs = await apiRequest(`${API_URL}${suffix}`);
    renderJobs(allJobs);
    updateStats();
  } catch (error) {
    setError(`${error.message}. Check that the server and MongoDB are running, then refresh.`);
    elements.empty.classList.add("hidden");
  } finally {
    elements.loading.classList.add("hidden");
  }
}

function updateStats() {
  elements.total.textContent = allJobs.length;
  elements.interviews.textContent = allJobs.filter(job => job.status === "Interview").length;
  elements.offers.textContent = allJobs.filter(job => job.status === "Offer").length;
  elements.applied.textContent = allJobs.filter(job => job.status === "Applied").length;
  elements.resultCount.textContent = `${allJobs.length} ${allJobs.length === 1 ? "application" : "applications"}`;
}

function renderJobs(jobs) {
  elements.tableBody.innerHTML = "";

  if (!jobs.length) {
    elements.tableWrap.classList.add("hidden");
    elements.empty.classList.remove("hidden");
    return;
  }

  elements.empty.classList.add("hidden");
  elements.tableWrap.classList.remove("hidden");

  jobs.forEach(job => {
    const tr = document.createElement("tr");
    const initial = escapeHtml((job.company || "?").trim().charAt(0).toUpperCase());
    const statusClass = `status-${job.status}`;
    const jobLink = job.jobUrl
      ? `<a href="${escapeHtml(job.jobUrl)}" target="_blank" rel="noopener noreferrer" class="job-title">View job posting ↗</a>`
      : `<div class="job-title">${escapeHtml(job.title)}</div>`;

    tr.innerHTML = `
      <td><div class="company-cell"><div class="company-logo">${initial}</div><div><div class="company-name">${escapeHtml(job.company)}</div>${jobLink}</div></div></td>
      <td>${escapeHtml(job.location || "—")}</td>
      <td>${formatDate(job.appliedDate)}</td>
      <td><span class="status-badge ${statusClass}">${escapeHtml(job.status)}</span></td>
      <td><div class="row-actions"><button class="small-action" data-action="edit" data-id="${escapeHtml(job._id)}">Edit</button><button class="small-action delete" data-action="delete" data-id="${escapeHtml(job._id)}">Delete</button></div></td>`;
    elements.tableBody.appendChild(tr);
  });
}

function openModal(job = null) {
  elements.form.reset();
  elements.formError.classList.add("hidden");
  elements.jobId.value = job?._id || "";
  elements.modalTitle.textContent = job ? "Edit application" : "Add application";
  elements.saveButton.textContent = job ? "Update application" : "Save application";
  elements.company.value = job?.company || "";
  elements.title.value = job?.title || "";
  elements.location.value = job?.location || "";
  elements.status.value = job?.status || "Applied";
  elements.appliedDate.value = job?.appliedDate ? localDateString(new Date(job.appliedDate)) : localDateString();
  elements.interviewDate.value = job?.interviewDate ? localDateString(new Date(job.interviewDate)) : "";
  elements.jobUrl.value = job?.jobUrl || "";
  elements.notes.value = job?.notes || "";
  elements.modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  elements.company.focus();
}

function closeModal() {
  elements.modal.classList.add("hidden");
  document.body.style.overflow = "";
}

async function saveJob(event) {
  event.preventDefault();
  elements.formError.classList.add("hidden");

  const payload = {
    company: elements.company.value.trim(),
    title: elements.title.value.trim(),
    location: elements.location.value.trim(),
    status: elements.status.value,
    appliedDate: elements.appliedDate.value,
    interviewDate: elements.interviewDate.value || null,
    jobUrl: elements.jobUrl.value.trim(),
    notes: elements.notes.value.trim()
  };

  if (!payload.company || !payload.title || !payload.appliedDate) {
    elements.formError.textContent = "Please fill in company name, job title, and date applied.";
    elements.formError.classList.remove("hidden");
    return;
  }

  const id = elements.jobId.value;
  const isEditing = Boolean(id);
  elements.saveButton.disabled = true;
  elements.saveButton.textContent = isEditing ? "Updating…" : "Saving…";

  try {
    await apiRequest(isEditing ? `${API_URL}/${encodeURIComponent(id)}` : API_URL, {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    closeModal();
    showToast(isEditing ? "Application updated successfully." : "Application added successfully.");
    await loadJobs();
  } catch (error) {
    elements.formError.textContent = error.message;
    elements.formError.classList.remove("hidden");
  } finally {
    elements.saveButton.disabled = false;
    elements.saveButton.textContent = isEditing ? "Update application" : "Save application";
  }
}

async function handleTableAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;

  if (action === "edit") {
    try {
      const job = await apiRequest(`${API_URL}/${encodeURIComponent(id)}`);
      openModal(job);
    } catch (error) {
      showToast(error.message, true);
    }
  }

  if (action === "delete") {
    const job = allJobs.find(item => item._id === id);
    if (!window.confirm(`Delete the application for ${job?.company || "this company"}? This cannot be undone.`)) return;
    try {
      await apiRequest(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
      showToast("Application deleted.");
      await loadJobs();
    } catch (error) {
      showToast(error.message, true);
    }
  }
}

document.getElementById("openAddModal").addEventListener("click", () => openModal());
document.getElementById("emptyAddButton").addEventListener("click", () => openModal());
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);
elements.modal.addEventListener("click", event => {
  if (event.target.matches("[data-close-modal]")) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !elements.modal.classList.contains("hidden")) closeModal();
});
elements.form.addEventListener("submit", saveJob);
elements.tableBody.addEventListener("click", handleTableAction);
elements.filter.addEventListener("change", loadJobs);

let searchTimer;
elements.search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadJobs, 250);
});

loadJobs();

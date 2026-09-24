(() => {
  "use strict";
  const timeline = document.getElementById("activity-timeline");
  const filters = document.getElementById("activity-filters");
  const status = document.getElementById("activity-status");
  const toggle = document.getElementById("activity-toggle");
  const previewLimit = 12;
  let expanded = false;
  let selectedCategory = null;
  const text = value => typeof value === "string" && value.trim().length > 0;
  function dateKey(value) {
    if (!text(value) || !/^\d{4}(-\d{2})?(-\d{2})?$/.test(value)) return null;
    const parts = value.split("-").map(Number);
    const [year, month = 1, day = 1] = parts;
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    if (year < 1 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return `${value}${parts.length === 1 ? "-01-01" : parts.length === 2 ? "-01" : ""}`;
  }
  function dateLabel(value) {
    if (value === "Present") return value;
    if (value.length === 4) return value;
    return new Intl.DateTimeFormat("en", {
      year: "numeric", month: "short", ...(value.length === 10 ? { day: "numeric" } : {}), timeZone: "UTC"
    }).format(new Date(`${dateKey(value)}T00:00:00Z`));
  }
  function node(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  }
  function safeLink(value) {
    if (!text(value)) return null;
    try {
      const url = new URL(value, document.baseURI);
      if (["https:", "http:"].includes(url.protocol)) return url.href;
      // Relative document links also work when previewing index.html locally.
      if (url.protocol === "file:" && !/^[a-z][a-z\d+.-]*:|^\/\//i.test(value)) return url.href;
    } catch (_) { /* An invalid link is omitted from the public page. */ }
    return null;
  }
  const source = window.professionalActivities;
  if (!Array.isArray(source)) {
    status.textContent = "The timeline could not be loaded. Please try again later.";
    timeline.hidden = true;
    return;
  }
  const activities = source.filter(entry => entry && dateKey(entry.date) && text(entry.category) && text(entry.title))
    .sort((a, b) => dateKey(b.date).localeCompare(dateKey(a.date)));
  if (activities.length !== source.length) console.warn("Timeline: skipped activities missing a valid date, category, or title.");
  function render(category) {
    timeline.replaceChildren();
    const matching = activities.filter(entry => category === null || entry.category === category);
    const visible = expanded ? matching : matching.slice(0, previewLimit);
    for (const entry of visible) {
      const item = node("li", "timeline-item");
      const card = node("article", "activity-card");
      const meta = node("div", "activity-meta");
      const start = node("time", "", dateLabel(entry.date));
      start.dateTime = entry.date;
      meta.append(start);
      if (entry.endDate === "Present" || dateKey(entry.endDate)) {
        meta.append(node("span", "", "–"));
        const end = node(entry.endDate === "Present" ? "span" : "time", "", dateLabel(entry.endDate));
        if (entry.endDate !== "Present") end.dateTime = entry.endDate;
        meta.append(end);
      }
      meta.append(node("span", "activity-category", entry.category));
      card.append(meta, node("h3", "", entry.title));
      const context = [entry.organization, entry.location].filter(text).join(" · ");
      if (context) card.append(node("p", "activity-context", context));
      if (text(entry.description)) card.append(node("p", "activity-description", entry.description));
      const extra = entry.details && typeof entry.details === "object" && !Array.isArray(entry.details)
        ? Object.entries(entry.details).filter(([key, value]) => text(key) && (text(value) || typeof value === "number")) : [];
      const links = (Array.isArray(entry.links) ? entry.links : [])
        .filter(link => link && text(link.label) && safeLink(link.url));
      if (extra.length || links.length) {
        const details = node("details");
        details.append(node("summary", "", "More information"));
        if (extra.length) {
          const list = node("dl");
          for (const [label, value] of extra) list.append(node("dt", "", label), node("dd", "", value));
          details.append(list);
        }
        if (links.length) {
          const list = node("ul", "activity-links");
          for (const link of links) {
            const li = node("li");
            const anchor = node("a", "", link.label);
            anchor.href = safeLink(link.url);
            li.append(anchor);
            list.append(li);
          }
          details.append(list);
        }
        card.append(details);
      }
      item.append(card);
      timeline.append(item);
    }
    timeline.hidden = visible.length === 0;
    toggle.hidden = matching.length <= previewLimit;
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.textContent = expanded ? "Show fewer activities" : `Show all ${matching.length} activities`;
    status.textContent = activities.length ? `${visible.length < matching.length ? `${visible.length} of ${matching.length}` : visible.length} ${matching.length === 1 ? "activity" : "activities"}${category === null ? "" : ` · ${category}`} · Newest first` : "Activities will appear here soon.";
  }
  if (activities.length) {
    for (const category of [null, ...[...new Set(activities.map(entry => entry.category))].sort((a, b) => a.localeCompare(b))]) {
      const button = node("button", "activity-filter", category === null ? "All activities" : category);
      button.type = "button";
      button.setAttribute("aria-pressed", String(category === null));
      button.addEventListener("click", () => {
        for (const sibling of filters.children) sibling.setAttribute("aria-pressed", String(sibling === button));
        selectedCategory = category;
        expanded = false;
        render(category);
      });
      filters.append(button);
    }
  }
  toggle.addEventListener("click", () => {
    expanded = !expanded;
    render(selectedCategory);
    // Keep keyboard navigation at the content that has just become relevant.
    if (expanded) {
      const firstNewItem = timeline.children[previewLimit];
      if (firstNewItem) {
        firstNewItem.setAttribute("tabindex", "-1");
        firstNewItem.focus({ preventScroll: true });
        firstNewItem.scrollIntoView({ block: "start" });
      }
    } else {
      document.getElementById("activity-title").focus({ preventScroll: true });
      document.getElementById("activity").scrollIntoView({ block: "start" });
    }
  });
  render(null);
})();

# Updating your professional timeline

Edit `docs/activities.js`. Each activity is a small record inside the square brackets. Copy this minimal entry, change the values, and keep a comma after each record:

```js
{
  date: "2026-09",
  category: "Course",
  title: "Name of the course"
},
```

Dates must be quoted strings: a year (`"2026"`), month (`"2026-09"`), or exact day (`"2026-09-21"`). Entries sort by start date, newest first, regardless of their order in the file. A year-only date sorts as January 1; a month-only date sorts as its first day.

Categories are free text: for example Education, Course, Congress, Teaching, Award, or Employment. Filters appear automatically for categories you use. Use consistent spelling and capitalization.

Optional fields:

- `endDate`: a date or `"Present"` for an ongoing activity.
- `organization` and `location`: institution and place.
- `description`: a short summary, always visible.
- `details`: any named fields, such as Role, Hours, Authors, Credits, or Notes. These appear under **More information**.
- `links`: a list of labels and URLs, also under **More information**. Use an HTTPS URL or a path relative to `docs/index.html`, such as `certificates/course.pdf`.

Omit fields you do not need. All content is plain text, not HTML. Within quoted text, use `\"` for a double quote and `\n` for a new line. Avoid removing commas or the outer square brackets. An entry without a valid date, title, or category is skipped; a syntax error in the file prevents the timeline from loading.

Save and commit your changes, then push to the branch used by GitHub Pages. Once deployment finishes, the public timeline updates. This is a static site: there is no login, database, or public editing form. You can also edit this one file using GitHub's file editor. Only publish details and attachments intended to be public.

Open `docs/index.html` locally to preview; no build step or server is required.

The page initially shows the newest 12 entries. Category filters search the complete timeline and reset the preview to 12 matching entries. **Show all** expands the selected category; **Show fewer** restores the preview. Categories appear alphabetically.

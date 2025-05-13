let thoughts = JSON.parse(localStorage.getItem("thoughts")) || [];

function saveThoughts() {
  localStorage.setItem("thoughts", JSON.stringify(thoughts));
}

function renderThoughts() {
  const container = document.getElementById("thoughtsContainer");
  const previewOn = document.getElementById("markdownToggle").checked;
  const filter = document.getElementById("filterTags").value.trim().toLowerCase();
  container.innerHTML = "";

  thoughts.forEach((t, i) => {
    // filter by tag or ID
    if (filter && !t.text.toLowerCase().includes(filter) && !t.tags.includes(filter)) return;

    const div = document.createElement("div");
    div.className = "thought";

    // header with delete & link
    const header = document.createElement("div");
    header.className = "thought-header";
    header.innerHTML = `
      <span>Thought #${i+1}</span>
      <div>
        ${t.url ? `<a href="${t.url}" target="_blank">🔗</a>` : ""}
        <button onclick="deleteThought(${i})">✕</button>
      </div>
    `;

    // body text
    const body = document.createElement("div");
    body.className = "thought-body";
    body.textContent = t.text;

    div.append(header, body);

    // markdown preview
    if (previewOn) {
      const preview = document.createElement("div");
      preview.className = "thought-preview";
      preview.innerHTML = marked.parse(t.text);
      div.appendChild(preview);
    }

    container.appendChild(div);
  });
}

function addThought() {
  const text = document.getElementById("newThought").value.trim();
  const url  = document.getElementById("urlInput").value.trim();
  if (!text) return;

  const tags = Array.from(text.matchAll(/#(\w+)/g)).map(m => "#" + m[1].toLowerCase());
  thoughts.push({ text, url, tags });
  saveThoughts();

  document.getElementById("newThought").value = "";
  document.getElementById("urlInput").value = "";
  renderThoughts();
}

function deleteThought(index) {
  thoughts.splice(index, 1);
  saveThoughts();
  renderThoughts();
}

function exportThoughts(format) {
  let content, filename;
  if (format === "json") {
    content  = JSON.stringify(thoughts, null, 2);
    filename = "cognivault.json";
  } else {
    content  = thoughts.map(t => `---\n${t.text}\n${t.url?`\nLink: ${t.url}`:""}`).join("\n");
    filename = "cognivault.md";
  }
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function importThoughts() {
  const f = document.getElementById("importFile").files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      thoughts = JSON.parse(e.target.result);
      saveThoughts();
      renderThoughts();
    } catch {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(f);
}

window.onload = renderThoughts;

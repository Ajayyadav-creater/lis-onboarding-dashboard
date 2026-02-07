let imageFile;

const upload = document.getElementById("imageUpload");
const preview = document.getElementById("preview");

upload.addEventListener("change", e => {
  imageFile = e.target.files[0];
  preview.src = URL.createObjectURL(imageFile);
});
document.getElementById("ocrBtn").addEventListener("click", () => {
  if (!imageFile) return alert("Upload image first");

  document.getElementById("status").innerText = "Extracting text...";

  Tesseract.recognize(
    imageFile,
    "eng",
    {
      logger: m => console.log(m)
    }
  ).then(({ data: { text } }) => {
    document.getElementById("ocrOutput").value = text;
    document.getElementById("status").innerText = "Text extracted successfully";
  });
});
function parseTests(text) {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 5)
    .map(line => {
      const parts = line.split(/\s+/);
      return {
        code: parts[0],
        name: parts.slice(1).join(" ")
      };
    });
}
function renderTable(tests) {
  const tbody = document.querySelector("#testTable tbody");
  tbody.innerHTML = "";

  tests.forEach(test => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${test.code}</td>
      <td>${test.name}</td>
    `;

    tbody.appendChild(row);
  });
}
document.getElementById("ocrBtn").addEventListener("click", () => {
  if (!imageFile) return alert("Upload image first");

  document.getElementById("status").innerText = "Extracting text...";

  Tesseract.recognize(imageFile, "eng")
    .then(({ data: { text } }) => {
      document.getElementById("ocrOutput").value = text;

      const tests = parseTests(text);
      renderTable(tests);

      document.getElementById("status").innerText =
        `Extracted ${tests.length} tests successfully`;
    });
});
document.getElementById("copyBtn").addEventListener("click", () => {
  let text = "";
  document.querySelectorAll("#testTable tbody tr").forEach(row => {
    text += row.children[0].innerText + "\t" +
            row.children[1].innerText + "\n";
  });

  navigator.clipboard.writeText(text);
  alert("Copied to clipboard");
});


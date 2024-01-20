async function loadLunr() {
  for (const url of ["elasticlunr.min.js", "lunr.stemmer.support.js", "lunr.it.js"]) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "/" + url;
    await new Promise((resolve) => {
      script.onload = resolve;
      document.body.appendChild(script);
    });
  }
}

const lunrLoaded = loadLunr();

let index = null;
const maxResults = 20;

const searchResults = document.getElementById("search-results");

async function search() {
  await lunrLoaded;
  if (index == null) {
    const indexData = await (await fetch("/search_index.it.json")).json();
    index = elasticlunr.Index.load(indexData);
    index.use(lunr.it);
  }
  const val = document.getElementById("searchbar").value;
  if (val === "") return;
  const results = index.search(val, {fields: {title: {boost: 3}, body: {boost: 1}, description: {boost: 2}}});
  searchResults.style.display = "block";
  searchResults.innerHTML = "";
  if (results.length === 0) {
    const div = document.createElement("div");
    div.classList = ["alert alert-warning"];
    div.innerHTML = `Nessun risultato per <b>${val}</b>`;
    searchResults.appendChild(div);
    return;
  }
  const searchResultsList = document.createElement("ul");
  searchResults.appendChild(searchResultsList);
  for (let i = 0; i < Math.min(results.length, maxResults); i++) {
    const li = document.createElement("li");
    // TODO: consider adding a summary of the article / first few words (results[i].doc.body).
    li.innerHTML = [
      `<div class="search-result-item">`,
      `<a class="link-secondary link-underline-opacity-0" href=${results[i].ref}><h3>${results[i].doc.title}</h3></a>`,
      `</div>`
    ].join("");
    searchResultsList.appendChild(li);
  }
}

window.addEventListener('click', function (e) {
  if (searchResults.style.display === "block" && !searchResults.contains(e.target)) {
    searchResults.style.display = "none";
  }
});


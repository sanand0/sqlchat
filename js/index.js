import { html, render } from "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js";

const $output = document.querySelector("#output");
document.querySelector("#search-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);

  const renderUserMessage = (question) => {
    const userMsgDiv = html`
      <div class="user-messages">
        <div class="user-selected-question">${question}</div>
      </div>
    `;
    render(userMsgDiv, document.querySelector(".userAskedQs"));
  };
  document.querySelector(".defaultText").style.display = "none";
  await renderUserMessage(formData.get("question"));

  render(
    html`
      <h2 class="h5">Generating SQL...</h2>
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    `,
    $output,
  );

  const sqlResponse = await fetch("query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: formData.get("question") }),
  });
  const sqlData = await sqlResponse.json();

  render(
    html`<h2 class="h5">Running query...</h2>
      <pre>${sqlData.sql}</pre>
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`,
    $output,
  );

  const resultResponse = await fetch("result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sqlData),
  });
  const resultData = await resultResponse.json();
  const result = resultData.result;

  // result is an array of objects. We'll render it as a table
  render(
    html`
      <h2 class="h5">Ran query...</h2>
      <pre>${sqlData.sql}</pre>
      <h2 class="h5">Results</h2>
      <table class="table">
        <thead>
          <tr>
            ${Object.keys(result[0]).map((key) => html`<th>${key}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${result.map(
            (row) => html`
              <tr>
                ${Object.values(row).map((value) => html`<td>${value}</td>`)}
              </tr>
            `,
          )}
        </tbody>
      </table>
    `,
    $output,
  );
});

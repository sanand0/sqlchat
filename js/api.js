import { num } from "https://cdn.jsdelivr.net/npm/@gramex/ui/dist/format.js";
import { createChart } from "https://uat.gramener.com/data-insights-chat-ipl/js/chart.js";
import {
  hideLoader,
  scrollToBottom,
  addExcelButtonListener,
} from "https://uat.gramener.com/data-insights-chat-ipl/js/common.js";

export const getResultAndRender = async (question, mainDiv) => {
  const URL = "query";
  const options = {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify(question),
  };

  fetch(URL, options)
      .then((response) => {
      if (!response.ok) {
          mainDiv.insertAdjacentHTML(
          "beforeend",
          `<div class="fs-16">Sorry! its not a valid query, please try asking other query</div>`,
          );
          hideLoader();
          scrollToBottom();
      }
      return response.json();
      })
      .then((data) => {
      const sqlData = data;
      console.log("POST request succeeded with JSON response:", data);
      renderData(sqlData, question, mainDiv)
      })
      .catch((error) => {
      console.error("There was a problem with the POST request:", error);
      });
}

export const renderData = async (sqlResp, question, mainDiv) => {
  try {
    const response = await fetch(`get-result?question=${question}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sqlResp),
    });

    if (!response.ok) {
      mainDiv.insertAdjacentHTML(
        "beforeend",
        `<div class="fs-16">Sorry! It's not a valid query, please try asking another query</div>`,
      );
      mainDiv.querySelector(".relevantQuestion").remove();
      hideLoader();
      scrollToBottom();
      return;
    }

    const data = await response.json();
    const result = data.slice(0, -1);
    const queryString = data[data.length - 1]?.query || "";

    if (result.length > 0) {
      const tableHtml = `
        <ul class="list-group">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Result
            <span class="badge bg-primary rounded-pill">
              <button class="btn btn-sm button-excel" title="Export Table Data To Excel">
                <i class="bi bi-download text-white"></i>
              </button>
            </span>
          </li>
        </ul>
        <div class="tableDiv">
          <table class="table table-bordered">
            <thead>
              <tr>${Object.keys(result[0])
                .map((key) => `<th>${key}</th>`)
                .join("")}</tr>
            </thead>
            <tbody>
              ${result
                .map(
                  (row) => `
                <tr>${Object.values(row)
                  .map(
                    (value) => `<td>${isNaN(value) ? value : num(value)}</td>`,
                  )
                  .join("")}</tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <button class="btn btn-primary btn-sm mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${mainDiv.id}" aria-expanded="false" aria-controls="collapse${mainDiv.id}">
          View query
        </button>
        <div class="collapse" id="collapse${mainDiv.id}">
          <div class="card card-body">${queryString}</div>
        </div>
      `;

      createChart(result, mainDiv);
      mainDiv.insertAdjacentHTML(
        "beforeend",
        `<div class="fs-16">${tableHtml}</div>`,
      );
      const excelButton = mainDiv.querySelector(".button-excel");
      addExcelButtonListener(excelButton);
    } else {
      mainDiv.insertAdjacentHTML(
        "beforeend",
        `<div class="fs-16">Sorry! It's not a valid query, please try asking another query</div>`,
      );
      mainDiv.querySelector(".relevantQuestion").remove();
    }

    document.querySelector("[name='question']").value = "";
  } catch (error) {
    console.error("There was a problem with the POST request:", error);
  } finally {
    scrollToBottom();
    hideLoader();
  }
};

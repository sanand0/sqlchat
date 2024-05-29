import { createChart } from "./chart.js";
import {
  hideLoader,
  scrollToBottom,
  addExcelButtonListener,
} from "./common.js";

export const getResultAndRender = async (formData, mainDiv) => {
  //eslint-disable-next-line
  fetch(`get-result?question=${formData.get("question")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        mainDiv.insertAdjacentHTML(
          "beforeend",
          `<div class="bot-messages fs-16">Sorry! its not a valid query, please try asking other query</div>`,
        );
        hideLoader();
        scrollToBottom();
      }
      return response.json();
    })
    .then((data) => {
      const result = data;

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
                        <tr>
                            ${Object.keys(result[0])
                              .map((key) => `<th>${key}</th>`)
                              .join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${result
                          .map(
                            (row) => `
                                <tr>
                                    ${Object.values(row)
                                      .map((value) => `<td>${value}</td>`)
                                      .join("")}
                                </tr>
                            `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
      const uniqueId = `response-${Date.now()}`;
      const messagesList = mainDiv;
      messagesList.insertAdjacentHTML(
        "beforeend",
        `<div id="${uniqueId}" class="bot-messages fs-16">${tableHtml}</div>`,
      );
      document.querySelector("[name='question']").value = "";
      const currentDiv = document.getElementById(uniqueId);
      const excelButton = currentDiv.querySelector(".button-excel");
      addExcelButtonListener(excelButton);
      createChart(result, currentDiv);
      scrollToBottom();
      hideLoader();
    })
    .catch((error) => {
      console.error("There was a problem with the POST request:", error);
      scrollToBottom();
      hideLoader();
    });
};

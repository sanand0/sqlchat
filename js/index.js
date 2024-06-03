import { showLoader, scrollToBottom, hideLoader } from "./common.js";
import { getResultAndRender } from "./api.js";

const $output = document.querySelector(".Messages_list");
const appendUserMessage = (question) => {
  document.querySelector(".defaultText").style.display = "none";
  $output.insertAdjacentHTML(
    "beforeend",
    `
  <div class="user-messages">
      <div class="user-selected-question">${question}</div>
  </div>
  `,
  );
  document.querySelector("[name='question']").value = "";
  showLoader($output);
  scrollToBottom();
};

document
  .querySelector("#search-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const question = formData.get("question");
    appendUserMessage(question);
    await getMostRelevantQs(question);
  });

const getMostRelevantQs = async (originalQuestion) => {
  fetch(`get-closest?question=${originalQuestion}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        hideLoader();
        scrollToBottom();
      }
      return response.json();
    })
    .then((data) => {
      const uniqueId = `response-${Date.now()}`;
      $output.insertAdjacentHTML(
        "beforeend",
        `<div id="${uniqueId}" class="bot-messages"></div> 
        `,
      );
      let mainDiv = document.getElementById(uniqueId);
      if (Object.values(data)[0] >= 0.5) {
        mainDiv.insertAdjacentHTML(
          "beforeend",
          `<div class="relevantQuestion mb-2">    
         <p class="fs-16 card p-2 m-0"> We can answer a question similar to what you asked <br> <b>${Object.keys(data)[0]} </b></p>
         <div class="d-flex align-items-center justify-content-end mt-2">
         <span class="px-2"> Would you like you proceed ? </span>
         <span>
         <button class="btn btn-outline-primary btn-sm p-1" title="Yes" id="acceptRelevantQuestion">Yes</button>
         <button class="btn p-0 btn-outline-secondary btn-sm p-1" title="No" id="originalQuestion">No</button>
         </span>
         </div>
         </div>`,
        );
        document
          .querySelector(`#${uniqueId} button#acceptRelevantQuestion`)
          .addEventListener("click", () => {
            document.querySelector(`#${uniqueId} .relevantQuestion`).remove();
            mainDiv.insertAdjacentHTML(
              "beforeend",
              `<p class="fs-16 card p-2 m-0 mb-2"> ${Object.keys(data)[0]}</p>
         `,
            );
            showLoader(mainDiv);
            getResultAndRender(Object.keys(data)[0], mainDiv);
          });
        document
          .querySelector(`#${uniqueId} button#originalQuestion`)
          .addEventListener("click", () => {
            document.querySelector(`#${uniqueId} .relevantQuestion`).remove();
            mainDiv.insertAdjacentHTML(
              "beforeend",
              `<div>    
          <div class="relevantQuestion mb-2">    
           <p class="fs-16 card p-2 m-0"> Here is what we think is the answer to your question</p>
           </div>
           </div>`,
            );
            showLoader(mainDiv);
            getResultAndRender(originalQuestion, mainDiv);
          });
      } else {
        showLoader(mainDiv);
        getResultAndRender(originalQuestion, mainDiv);
      }

      scrollToBottom();
      hideLoader();
    })
    .catch((error) => {
      console.error("There was a problem with the POST request:", error);
      scrollToBottom();
      hideLoader();
    });
};

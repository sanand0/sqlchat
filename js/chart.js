/* globals d3 */
export const createChart = (data, container) => {
  if (data.length > 1) columnValidation(data, container);
};

export const columnValidation = (data, container) => {
  const id = container.id;

  const segregateColumns = (data) => {
    if (data.length === 0) return { categorical: [], numerical: [] };

    const firstRow = data[0];
    const categorical = [];
    const numerical = [];

    Object.keys(firstRow).forEach((key) => {
      if (typeof firstRow[key] === "number") {
        numerical.push(key);
      } else {
        categorical.push(key);
      }
    });

    return { categorical, numerical };
  };

  const { categorical, numerical } = segregateColumns(data);

  if (categorical.length > 0 && numerical.length > 0) {
    container.insertAdjacentHTML(
      "beforeend",
      `<div class='chartContainer d-flex align-items-start justify-content-between'>
      <div class="chartSvg-${id}"><p class='py-2 m-0 h6'>Visual representation</p> </div>
      <div class='chartOptions-${id}'> <p class='py-2 m-0 h6'>Chart options</p> </div>
      </div>`,
    );

    const createRadioButtons = (columns, category, id) => {
      const categoryHTML = `
    <div class="${category}-columns p-2">
      <p class="fw-500">${category.charAt(0).toUpperCase() + category.slice(1)} Columns</p>
      ${columns
        .map(
          (col, index) => `
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault${category}${id}" value="${col}" id="${category}+${col}" ${index === 0 ? "checked" : ""}>
          <label class="form-check-label" for="${category}+${col}${id}">${col}</label>
        </div>`,
        )
        .join("")}
    </div>
  `;
      container
        .querySelector(`.chartOptions-${id}`)
        .insertAdjacentHTML("beforeend", categoryHTML);
    };

    createRadioButtons(categorical, "categorical", id);
    createRadioButtons(numerical, "numerical", id);

    const selectedCheckboxes = [];
    document
      .querySelectorAll(".form-check-input:checked")
      .forEach((checkbox) => {
        selectedCheckboxes.push(checkbox.id);
      });
    drawChart(data, selectedCheckboxes, container);

    const handleRadioChange = () => {
      drawChart(
        data,
        Array.from(
          container.querySelectorAll('input[type="radio"]:checked'),
        ).map((el) => el.id),
        container,
      );
    };

    container
      .querySelectorAll("input.form-check-input[type='radio']")
      .forEach((radio) => {
        radio.addEventListener("change", handleRadioChange);
      });
  } else {
    container.insertAdjacentHTML(
      "beforeend",
      "<p>NOTE: Not enough data to create a chart.</p>",
    );
  }
};

const drawChart = (data, cols, container) => {
  container.querySelectorAll("svg").forEach((svg) => svg.remove());
  const margin = { top: 20, right: 30, bottom: 70, left: 40 },
    width = 500 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

  const xCol = cols.find((col) => col.includes("categorical")).split("+")[1];
  const yCol = cols.find((col) => col.includes("numerical")).split("+")[1];

  const svg = d3
    .select(container.querySelector(`.chartSvg-${container.id}`))
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d[xCol]))
    .range([0, width])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yCol])])
    .nice()
    .range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(x).tickFormat(function (d) {
        const item = data.find((item) => item[xCol] === d);
        if (!item || !item[xCol]) return "";
        const text = item[xCol];
        return text.length > 10 ? text.substring(0, 5) + "..." : text;
      }),
    )
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g").call(
    d3.axisLeft(y).ticks(5),
    // .tickFormat(function (d, i) {
    //   if (data[i] && "formatted_Total_Revenue" in data[i]) {
    //     return data[i].formatted_Total_Revenue;
    //   }
    // }),
  );

  svg
    .append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d[xCol]))
    .attr("y", (d) => y(d[yCol]))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d[yCol]));
};

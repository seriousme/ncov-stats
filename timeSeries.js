const Papa = require("papaparse");
const fs = require("fs");
const placeData = require("./TypedDataSet.json");
const dates = [];

const places = placeData.value.reduce(
  (map, obj) => ((map[obj.Naam_2.trim()] = obj.Naam_4.trim()), map),
  {}
);

const resultsByPlace = {};

function getData(file, date) {
  const csvData = fs.readFileSync(file, "utf8");
  const parsedData = Papa.parse(csvData, {
    header: true,
    dynamicTyping: true
  }).data;
  parsedData.forEach(el => {
    if (el.Aantal !== null && el.Gemeente !== undefined) {
      resultsByPlace[el.Gemeente] = resultsByPlace[el.Gemeente] || {
        Gemeente: el.Gemeente,
        Provincie: places[el.Gemeente]
      };
      resultsByPlace[el.Gemeente][date] = el.Aantal;
    }
  });
}

function numbersPerProvince(data) {
  const results = {};
  data.forEach(el => {
    results[el.Provincie] = results[el.Provincie] || {
      Provincie: el.Provincie
    };
    dates.forEach(date => {
      if (el[date]) {
        results[el.Provincie][date] = results[el.Provincie][date] || 0;
        results[el.Provincie][date] += el[date];
      }
    });
  });
  return Object.values(results);
}

function progression(data) {
  const results = [];
  let before = "";
  let totalBefore = 0;

  dates.forEach(current => {
    let total = 0;
    data.forEach(el => {
      if (el[current]) {
        total += el[current];
      }
    });

    const difference = total - totalBefore;
    const percentage = (100 * (difference / totalBefore)).toFixed(2);
    const stats = {
      date: current,
      total,
      difference,
      percentage
    };
    results.push(stats);
    before = current;
    totalBefore = total;
  });
  return results;
}

function progressionPerProvince(numbersPerProvince) {
  const data = numbersPerProvince;
  const results = [];

  data.forEach(el => {
    let before = "";
    let totalBefore = 0;
    const stats = {
      Provincie: el.Provincie
    };

    dates.forEach(current => {
      let total = el[current];
      if (typeof total === "number") {
        const difference = total - totalBefore;
        const percentage = (100 * (difference / totalBefore)).toFixed(2);
        stats[current] = percentage;
        totalBefore = total;
      }
      before = current;
    });
    results.push(stats);
  });
  return results;
}

function stats(data) {
  const results = [];
  let before = "";

  dates.forEach(current => {
    const stats = {
      date: current,
      total: 0,
      stable: 0,
      increased: 0,
      decreased: 0
    };
    data.forEach(el => {
      if (el[current] || el[before]) {
        stats.total++;
        const difference = (el[current] || 0) - (el[before] || 0);
        if (difference > 0) stats.increased++;
        if (difference == 0) stats.stable++;
        if (difference < 0) stats.decreased++;
      }
    });
    before = current;
    results.push(stats);
  });
  return results;
}

function placesPerProvince(data) {
  const results = {};
  data.forEach(el => {
    results[el.Provincie] = results[el.Provincie] || {
      Provincie: el.Provincie
    };
    dates.forEach(date => {
      if (el[date]) {
        results[el.Provincie][date] = results[el.Provincie][date] || 0;
        results[el.Provincie][date] += 1;
      }
    });
  });
  return Object.values(results);
}

function writeResults(data, name) {
  fs.writeFile(`./results/${name}.csv`, Papa.unparse(data), () => {});
  fs.writeFile(`./results/${name}.json`, JSON.stringify(data), () => {});
}

fs.readdir("./data", (err, files) => {
  files.forEach(file => {
    const rawDate = file.match(/\d+/)[0];
    const date = rawDate.replace(/(\d{2})(\d{2})(\d{4})/, "$1-$2-$3");
    dates.push(date);
    getData(`./data/${file}`, date);
  });
  const results = Object.values(resultsByPlace);
  writeResults(results, "timeseries");
  const npp = numbersPerProvince(results);
  writeResults(npp, "numbersPerProvince");
  writeResults(placesPerProvince(results), "placesPerProvince");
  writeResults(stats(results), "stats");
  writeResults(progression(results), "progression");
  writeResults(progressionPerProvince(npp), "progressionPerProvince");
});

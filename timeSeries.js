const Papa = require("papaparse");
const fs = require("fs");
const placeData = require("./TypedDataSet.json");
const dates = [];
const datadir = "./data"

const places = placeData.value.reduce(
  (map, obj) => ((map[obj.Naam_2.trim()] = obj.Naam_4.trim()), map),
  {}
);

// hacks because of spelling
places['Súdwest Fryslân'] = 'Friesland';
places['Bergen (L)'] = 'Limburg';
places['Bergen (NH)'] = 'Noord-Holland';
places['Hengelo (O)'] = 'Overijssel';


const resultsByPlace = {};

function getData(file, date) {
  const csvData = fs.readFileSync(file, "utf8");
  const parsedData = Papa.parse(csvData, {
    header: true,
    dynamicTyping: true,
    transformHeader: (h) => {
      return h.replace('﻿"Category"', 'Gemeente')
    }
  }).data;
  parsedData.forEach(el => {
    if (el.Aantal !== null && el.Gemeente !== undefined) {
      if (!places[el.Gemeente]) {
        console.log(`Geen provincie voor:${el.Gemeente}:`);
      }
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
  return results.reverse();
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

function timeToDouble(data,key) {
  const result = [];

  data.forEach(el => {
    let total;
    const item={}
    item[key]=el[key];
    item.days=1;
    dates.slice().reverse().forEach(current => {
      if (typeof (total) === "undefined") {
        total = el[current];
        return;
      }
      if (el[current] && (total / el[current] < 2)) {
        item.days++;
      }
    });
    result.push(item);
  });
  return result;
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

function rowToColumn(data,key){
  const result=[];
  dates.slice().reverse().forEach(date => {
    const item={
      date
    };
    data.forEach(el => {
      item[el[key]]=el[date];
    });
    result.push(item);
  });
  return result;
}

function writeResults(data, name) {
  fs.writeFile(`./results/${name}.csv`, Papa.unparse(data), () => { });
  fs.writeFile(`./results/${name}.json`, JSON.stringify(data), () => { });
}

fs.readdir(datadir, (err, files) => {
  const fileList = [];
  files.forEach(file => {
    if (!file.match(/\.csv$/)) return;
    const rawDate = file.match(/\d+/)[0];
    const date = rawDate.replace(/(\d{2})(\d{2})(\d{4})/, "$1-$2-$3");
    const sortdate = rawDate.replace(/(\d{2})(\d{2})(\d{4})/, "$3-$2-$1");
    fileList.push({ sortdate, file, date });
  });
  fileList.sort((a, b) => (a.sortdate > b.sortdate ? 1 : -1));
  fileList.forEach(el => {
    getData(`${datadir}/${el.file}`, el.date);
    dates.push(el.date);
  }
  );
  const results = Object.values(resultsByPlace);
  writeResults(results, "timeseries");
  const npp = numbersPerProvince(results);
  writeResults(rowToColumn(npp,'Provincie'), "numbersPerProvince");
  writeResults(rowToColumn(placesPerProvince(results),'Provincie'), "placesPerProvince");
  writeResults(stats(results), "stats");
  writeResults(progression(results), "progression");
  writeResults(rowToColumn(progressionPerProvince(npp),'Provincie'), "progressionPerProvince");
  writeResults(timeToDouble(npp,'Provincie'),"time2doublePerProvince");
});

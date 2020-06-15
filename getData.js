const jsdom = require("jsdom");
const fs = require('fs');
const { JSDOM } = jsdom;
const URL = 'https://www.rivm.nl/coronavirus-covid-19/actueel';
//const validHeaderStart = "Gemnr;Gemeente;Meldingen;Zkh opname;";
const validHeaderStart = "Gemnr;Gemeente;Totaal_Absoluut;Zkh_Absoluut;";

const zeroPad = (num, places) => String(num).padStart(places, '0')
const d = new Date();
const today = zeroPad(d.getDate(), 2) + zeroPad((d.getMonth() + 1), 2) + d.getFullYear();
const csvFileName = `./data/hospitals-${today}.csv`;

console.log('Fetching data from:', URL);
const { document } = JSDOM.fromURL(URL)
    .then(dom => {
        const document = dom.window.document;
        const modificationDate = document.querySelector(".content-date-edited").textContent.trim();
        const csvData = document.querySelector("#csvData").textContent.trim();
        console.log(modificationDate);
        if (csvData.startsWith(validHeaderStart)) {
            fs.writeFile(csvFileName, csvData, (err) => {
                if (err) throw err;
                console.log(`The csvdata has been saved to ${csvFileName}`);
            });
        }
        else {
            throw new Error("CSV data has unexpected format");
        }
    })
    .catch(err => {
        console.log(err.message)
        process.exit(1)
    })






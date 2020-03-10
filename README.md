# ncov-stats
Dutch stats on the 2020 Corona virus (SARS-NCOV2) spread based on [RIVM](https://www.rivm.nl/) data

RIVM source data is the data folder.
The calculated stats are in the results folder.

## Available statistics
The following stats are available:
* [time series](results/timeseries.csv) An overview of cases by places over time.
* [progression](results/progression.csv) Overal changes in the numbers
* [numbers per province](results/numbersPerProvince.csv) Number of cases grouped by province
* [places per province](results/placesPerProvince.csv) Number of communities per province that have at least one case
* [progression per province](results/progressionPerProvince.csv) Percentage of change per province over time
* [stats on communities](results/stats.csv) Changes in number of communities reported to have cases.

## Code
A [script](timeSeries.js) is used to calculate the stats from the source data. 

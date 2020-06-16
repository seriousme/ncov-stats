# ncov-stats
Dutch stats on the 2020 Corona virus (SARS-CoV-2) spread based on [RIVM](https://www.rivm.nl/) data

RIVM source data is the data folder.
The calculated stats are in the results folder.

## Change in reporting 
RIVM used to report positively tested cases but switched to hospitalizations on 31 March 2020. Therefore the hospitalization stats are available from 31 March onwards.

The source data before March 31 is available in the cases-data folder.
The stats data before March 31 is available in the cases-results folder.

## Another change in reporting
RIVM changed the reporting again on 16 June 2020 and is now reporting on time intervals. For now this means no more updated results in this repoistory.

## Available statistics
The following stats are available:
* [time series](results/timeseries.csv) An overview of cases per community over time.
* [progression](results/progression.csv) Overal changes in the numbers
* [numbers per province](results/numbersPerProvince.csv) Number of cases grouped by province
* [places per province](results/placesPerProvince.csv) Number of communities per province that have at least one case
* [progression per province](results/progressionPerProvince.csv) Percentage of change per province over time
* [time to double per province](results/time2doublePerProvince.csv) Number of days ago when the reported number of cases was at most half as much as the latest number of cases.
* [stats on communities](results/stats.csv) Changes in number of communities reported to have cases.

Note: people with unknown residence are not listed in the downloadable RIVM data, so the total here might differ a bit from the total reported in the news. 

## Code
A [script](timeSeries.js) is used to calculate the stats from the source data. 

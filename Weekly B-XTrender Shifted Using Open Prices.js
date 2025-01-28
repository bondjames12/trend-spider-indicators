/*
This version of B-XTrender uses a fixed weekly timeframe no matter what you selct on the chart.
Only use on time frames lower than Weekly
Original B-XTrender uses close prices this uses open to avoid forwarding looking when backtesting
This is also shifted back by 1 week to avoid forward looking when backtesting

*/
//Ported by Colin Weber from Tradingview: B-Xtrender @Puppytherapy v3
//All credit to original author https://www.tradingview.com/script/YHZimEz8-B-Xtrender-Puppytherapy/ 
//and https://ifta.org/public/files/journal/d_ifta_journal_19.pdf IFTA Journal by Bharat Jhunjhunwala
//
describe_indicator('Weekly B-XTrender Shifted/Open Prices','lower');
// Inputs
const short_l1 = input.number('Short - L1', 5);
const short_l2 = input.number('Short - L2', 20);
const short_l3 = input.number('Short - L3', 5);
const showHistogram = input.boolean("Show Osc. - Histogram", true)
const showColorLine = input.boolean("Show Color - Line", false)

const showTrendLine = input.boolean("Show Trend - Line", false)
const long_l1 = input.number('Long - L1', 20);
const long_l2 = input.number('Long - L2', 5);

//Get weekly price data
const priceDataRaw = await request.history(current.ticker, 'W',{ chart_type: "candles", ext_session: false });
const priceData = shift(priceDataRaw.open, -1);
debugger;
/*After asking trendspider devs how to make this indicator safe to use for backtesting they indicated to do 3 things:
1: Use interpolate_sparse_series constant mode 
2: shift W data by 1 candle to the right (so for the current week use LAST week data)
3: use Open prices of W candles only. no High, no Low, no Close, just Open."
*/

let shortTermXtrender = sub(rsi(sub(ema(priceData, short_l1), ema(priceData, short_l2)), short_l3),50);
let shortXtrenderCol = [];
shortXtrenderCol.push(null);
for (let i = 1; i < shortTermXtrender.length; i++) {
	if (shortTermXtrender[i] > 0) {
		if (shortTermXtrender[i] > shortTermXtrender[i-1])
			shortXtrenderCol.push(`rgba(0, 230, 118, 0.5)`); // bright green 50% opaque
		else
			shortXtrenderCol.push(`rgba(34, 138, 34, 0.5)`); //dark green 50% opaque
	} else
	{
		if (shortTermXtrender[i] > shortTermXtrender[i-1])
			shortXtrenderCol.push(`rgba(255, 82, 82, 0.5)`); //bright red
		else
			shortXtrenderCol.push(`rgba(139, 00, 00, 0.5)`); //dark red
	}
}

//Land and interpolate on current timeframe
const shortTermXtrender_interp = interpolate_sparse_series(land_points_onto_series(priceDataRaw.time, shortTermXtrender, time),"constant")
const shortXtrenderCol_interp = interpolate_sparse_series(land_points_onto_series(priceDataRaw.time, shortXtrenderCol, time),"constant")
if(showHistogram)
	paint(shortTermXtrender_interp, {
		name: "Weekly B-Xtrender Osc. - Histogram",
		color: shortXtrenderCol_interp,
		style: 'column',
		thickness: 1
	});

let longTermXtrender  = sub(rsi(ema(priceData, long_l1), long_l2 ),50);
let macollongXtrenderCol = [];
macollongXtrenderCol.push(null);
for (let i = 2; i < longTermXtrender.length; i++) {
	if (longTermXtrender[i] > longTermXtrender[i-1])
		macollongXtrenderCol.push(`rgba(0, 230, 118, 0.2)`); // bright green 20% opaque
	else
		macollongXtrenderCol.push(`rgba(255, 82, 82, 0.2)`); //bright red 20% opaque
}
macollongXtrenderCol.push(null);

//Land and interpolate on current timeframe
const longTermXtrender_interp = interpolate_sparse_series(land_points_onto_series(priceDataRaw.time, longTermXtrender, time),"constant")
const macollongXtrenderCol_interp = interpolate_sparse_series(land_points_onto_series(priceDataRaw.time, macollongXtrenderCol, time),"constant")
	
if(showTrendLine)
	paint(longTermXtrender_interp, {
		name: "Weekly B-Xtrender Trend - Line",
		color: macollongXtrenderCol_interp,
		style: 'line',
		thickness: 3
	});

function t3(src, len) {
  let xe1_1 = ema(src, len);
  let xe2_1 = ema(xe1_1, len);
  let xe3_1 = ema(xe2_1, len);
  let xe4_1 = ema(xe3_1, len);
  let xe5_1 = ema(xe4_1, len);
  let xe6_1 = ema(xe5_1, len);
  const b_1 = 0.7;
  const c1_1 = -b_1 * b_1 * b_1;
  const c2_1 = 3 * b_1 * b_1 + 3 * b_1 * b_1 * b_1;
  const c3_1 = -6 * b_1 * b_1 - 3 * b_1 - 3 * b_1 * b_1 * b_1;
  const c4_1 = 1 + 3 * b_1 + b_1 * b_1 * b_1 + 3 * b_1 * b_1;
  let nT3Average_1 = [];
  for (let i = 0; i < src.length; i++) {
    nT3Average_1[i] = c1_1 * (xe6_1[i] || 0) + c2_1 * (xe5_1[i] || 0) + c3_1 * (xe4_1[i] || 0) + c4_1 * (xe3_1[i] || 0);
  }
    return nT3Average_1;
}


let maShortTermXtrender = t3( shortTermXtrender , 5 )
let colShortTermXtrender = [];
colShortTermXtrender.push(null);
for (let i = 2; i < maShortTermXtrender.length; i++) {
	if (maShortTermXtrender[i] > maShortTermXtrender[i-1])
		colShortTermXtrender.push(`rgba(0, 230, 118, 0.2)`); // bright green 20% opaque
	else
		colShortTermXtrender.push(`rgba(255, 82, 82, 0.2)`); //bright red 20% opaque
}
colShortTermXtrender.push(null);

//Land and interpolate on current timeframe
const maShortTermXtrender_interp = interpolate_sparse_series(land_points_onto_series(priceDataRaw.time, maShortTermXtrender, time),"constant")
const colShortTermXtrender_interp = interpolate_sparse_series(land_points_onto_series(priceDataRaw.time, colShortTermXtrender, time),"constant")

if(showColorLine)
	paint(maShortTermXtrender_interp, {
		name: "Weekly B-Xtrender Color - Line",
		color: colShortTermXtrender_interp,
		style: 'line',
		thickness: 3
	});

//Paint color from color line as line so we can use in strategy tester
const showColorBooleanLine = input.boolean("Show Color - Boolean Line", false)
const BullBearInd = Array(colShortTermXtrender_interp.length).fill(null);
for (let i = 0; i < colShortTermXtrender_interp.length; i++) {
    if (colShortTermXtrender_interp[i] === 'rgba(0, 230, 118, 0.2)') {  // bright green
        BullBearInd[i] = 70;
    } else if (colShortTermXtrender_interp[i] === 'rgba(255, 82, 82, 0.2)') {  // bright red
        BullBearInd[i] = -70;
    }
}
if(showColorBooleanLine)
{
	let p_bb = paint(BullBearInd,{
  name:  "Weekly B-Xtrender Color - Boolean Line (70=Green, -70=Red)",
  color: "white",
  style: 'line',
  thickness: 1});
}

let bullSwitch = Array(maShortTermXtrender.length).fill(null);
let bearSwitch = Array(maShortTermXtrender.length).fill(null);
// Start from index 2 since we need to look back 2 positions
for (let i = 2; i < maShortTermXtrender.length; i++) {
	const cur = maShortTermXtrender[i];
	const prev = maShortTermXtrender[i-1];
	const twoBefore = maShortTermXtrender[i-2];
	
	if (cur > prev && prev < twoBefore) {
		bullSwitch[i] = cur;
	} else {
		bullSwitch[i] = null;
	}
	if (cur < prev && prev > twoBefore) {
		bearSwitch[i] = cur;
	} else {
		bearSwitch[i] = null;
	}
}

const bullSwitch_interp = land_points_onto_series(priceDataRaw.time, bullSwitch, time)
const bearSwitch_interp = land_points_onto_series(priceDataRaw.time, bearSwitch, time)
debugger;
function getExtendCount(timeframe) {
    // Get the current timeframe and set appropriate extend count
	//Assumes 5 day trading week, 6.5 trading hours per day
    switch(timeframe) {
        case '1h':
        case '60':
            return 5 * 6.5; // Copy across a week worth of hourly bars
        case '2h':
        case '120':
            return (5 * 6.5) / 2;
        case '4h':
        case '240':
            return (5 * 6.5) / 4;
        case '30':
            return (5 * 7 * 60) / 30; // Double the hourly count for 30min
        case '15':
            return (5 * 6.5 * 60) / 15; // Quadruple the hourly count for 15min
		case '10':
            return (5 * 6.5 * 60) / 10; // Quadruple the hourly count for 15min
        case '5':
            return (5 * 6.5 * 60) / 5; // 12x the hourly count for 5min
        case '1':
            return (5 * 6.5 * 60) / 1; // 60x the hourly count for 1min
        case 'D':
        case '1D':
            return 5; // Copy across 5 daily bars
        case 'W':
        case '1W':
            return 1; // Don't copy on weekly
        default:
            return 1; // Default to no copy
    }
}

function extendSignals(signals, timeframe) {
    let extendedSignals = Array(signals.length).fill(null);
    const extendCount = getExtendCount(timeframe);
    
    for (let i = 0; i < signals.length; i++) {
        if (signals[i] !== null) {
            // Found a signal, copy it to this and next positions based on timeframe
            for (let j = 0; j < extendCount && (i + j) < signals.length; j++) {
                extendedSignals[i + j] = signals[i];
            }
        }
    }
    return extendedSignals;
}

// Get current timeframe
const currentTimeframe = current.resolution;

// Extend the signals across the week
const extendedBullSwitch = extendSignals(bullSwitch_interp,currentTimeframe);
const extendedBearSwitch = extendSignals(bearSwitch_interp,currentTimeframe);

const showShapes = input.boolean("Show Shapes", false)
if(showShapes)
{
	paint(extendedBullSwitch, { name: "Weekly Shapes - Bull Switch", style: 'dotted', thickness: 8, color: `rgba(0, 230, 118, 0.2)` });
	paint(extendedBearSwitch, { name: "Weekly Shapes - Bear Switch", style: 'dotted', thickness: 8, color: `rgba(255, 82, 82, 0.2)` });
}

//Detect higher or lower direction in shortTerm histogram and create a line to indicate that
let direction = Array(shortTermXtrender.length).fill(null);
// Start from index 1 since we need to look back 1 positions
for (let i = 1; i < shortTermXtrender.length; i++) {
	const cur = shortTermXtrender[i];
	const prev = shortTermXtrender[i-1];
	
	if (cur > prev) {
		direction[i] = 70;
	}
	if (cur < prev) {
		direction[i] = -70;
	}
	if (cur == prev) {
		direction[i] = 0;
	}
}

const direction_landed = land_points_onto_series(priceDataRaw.time, direction, time)
// Extend/Copy the signals across the week
const direction_interp = interpolate_sparse_series(direction_landed, 'constant');
const showDirection = input.boolean("Show Histo Direction", true)
if(showDirection)
{
	paint(direction_interp, { name: "Weekly Histo Direction", style: 'line', thickness: 1, color: `rgba(255, 255, 255, 1)` });
}
import React, { useState } from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import { useMaterialUIController } from "context";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import {
  ema,
  elderRay,
  discontinuousTimeScaleProviderBuilder,
  Chart,
  ChartCanvas,
  CandlestickSeries,
  LineSeries,
  BarSeries,
  CurrentCoordinate,
  ElderRaySeries,
  SingleValueTooltip,
  EdgeIndicator,
  MovingAverageTooltip,
  OHLCTooltip,
  MouseCoordinateY,
  ZoomButtons,
  CrossHairCursor,
  XAxis,
  YAxis,
  lastVisibleItemBasedZoomAnchor,
} from "react-financial-charts";

function findClosestCandle(candles, newsDate) {
  let closest = null;
  let minDiff = Infinity;
  const target = new Date(newsDate).getTime();

  for (let c of candles) {
    const diff = Math.abs(new Date(c.open_time).getTime() - target);
    if (diff < minDiff) {
      minDiff = diff;
      closest = c;
    }
  }
  return val > 2 ? "#999" : val > 0 ? "#26a69a" : val < 0 ? "#ef5350" : "#999";

  return closest;
}

const CryptoDashboard = ({ data: initialData, trl: trlData, width, ratio }) => {
  const [sellScale, setSellScale] = useState(1000); // default 99%
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [visibleSeries, setVisibleSeries] = useState({
    ema12: true,
    ema26: true,
    tst_1: false,
    tst_2: false,
    tst_3: false,
    lightgbm_1: true,
    lightgbm_2: false,
    lightgbm_3: false,
    trl_1: false,
    trl_2: false,
    trl_3: false,
  });

  const toggleSeries = (key) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!initialData || !initialData.length || width <= 0) return null;

  const filteredData = initialData.filter((d) => d.open_time && !isNaN(new Date(d.open_time)));
  // Make a copy of filteredData
  const mergedData = filteredData.map((d) => ({ ...d }));

  // For each news item, find the closest candle
  trlData.forEach((event) => {
    let closestIndex = -1;
    let minDiff = Infinity;
    const eventTime = new Date(event.date).getTime();

    mergedData.forEach((candle, idx) => {
      const candleTime = new Date(candle.open_time).getTime();
      const diff = Math.abs(candleTime - eventTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    if (closestIndex !== -1) {
      // console.log(`Attaching event on ${event.date} to candle at ${mergedData[closestIndex].open_time}`);
      // Attach news/TRLS to the closest candle
      mergedData[closestIndex].news = event;
      mergedData[closestIndex].trl_1 = event.trl_1;
      mergedData[closestIndex].trl_2 = event.trl_2;
      mergedData[closestIndex].trl_3 = event.trl_3;
      mergedData[closestIndex].price_change = event.price_change;
    }
  });

  const ScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
    (d) => new Date(d.open_time)
  );

  // EMA setup
  const ema12 = ema()
    .id(1)
    .options({ windowSize: 12 })
    .merge((d, c) => {
      d.ema12 = c;
    })
    .accessor((d) => d.ema12)
    .stroke("#FF9900");
  const ema26 = ema()
    .id(2)
    .options({ windowSize: 26 })
    .merge((d, c) => {
      d.ema26 = c;
    })
    .accessor((d) => d.ema26)
    .stroke("#0099FF");
  const elder = elderRay();

  const calculatedData = elder(ema26(ema12(mergedData)));
  const { data, xScale, xAccessor, displayXAccessor } = ScaleProvider(calculatedData);

  const pricesDisplayFormat = format(".2f");
  const timeDisplayFormat = timeFormat("%d %b");
  const startIndex = Math.max(0, data.length - 150);
  const start = xAccessor(data[startIndex]);
  const end = xAccessor(data[data.length - 1]);
  const xExtents = [start, end];

  const volumeColor = (d) =>
    d.close > d.open ? "rgba(38, 166, 154, 0.3)" : "rgba(239, 83, 80, 0.3)";
  const openCloseColor = (d) => (d.close > d.open ? "#26a69a" : "#ef5350");

  // Prediction models
  const predictions = ["tst_1", "tst_2", "tst_3", "lightgbm_1", "lightgbm_2", "lightgbm_3"];
  const trl_predictions = ["trl_1", "trl_2", "trl_3"];
  // Light mode colors (existing)
  const predColors = [
    "#FFC107", // Amber/Yellow
    "#1976D2", // Strong Blue
    "#FF5722", // Deep Orange
    "#388E3C", // Dark Green
    "#7B1FA2", // Deep Purple
    "#0097A7", // Teal
  ];

  const trl_predcolors = [
    "#E91E63", // Pink
    "#8BC34A", // Light Green
    "#FF9800", // Orange
  ];

  // Dark mode colors (brighter for visibility)
  const predColorsDark = [
    "#FFEB3B", // Bright Yellow
    "#64B5F6", // Light Blue
    "#FF8A65", // Soft Orange
    "#81C784", // Light Green
    "#BA68C8", // Light Purple
    "#4DD0E1", // Cyan/Teal
  ];

  const trl_predcolorsDark = [
    "#F48FB1", // Soft Pink
    "#AED581", // Lime Green
    "#FFB74D", // Soft Orange
  ];

  const getPredictedPrice = (d, key) => {
    if (!d[key] || d[key].length !== 3) return 0;

    const logits = d[key];
    const maxLogit = Math.max(...logits);
    const exps = logits.map((l) => Math.exp(l - maxLogit));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map((e) => e / sumExps);
    const action = probs.indexOf(Math.max(...probs));
    // console.log(`TRL ${key} logits: ${logits}, probs: ${probs}, action: ${action}`);
    switch (action) {
      case 0:
        return probs[action]; // Buy
      case 1:
        return 2 + probs[action]; // Hold
      case 2:
        return -1 * probs[action]; // Sell scaled
      default:
        return null;
    }
  };

  const height = 1000;
  const margin = { left: 0, right: 48, top: 0, bottom: 24 };
  const gridHeight = height - margin.top - margin.bottom;
  const elderRayHeight = 150;
  const volumeChartHeight = 150;
  const predChartHeight = 200; // height for prediction bar chart
  const trlChartHeight = 200; // height for TRL bar chart
  const profitcomparebarHeight = 200; // height for profit comparison bar chart

  const candleChartHeight =
    gridHeight - elderRayHeight - volumeChartHeight - trlChartHeight - predChartHeight;

  const candleChartOrigin = [0, 0]; // top

  const trlChartOrigin = [0, candleChartHeight + elderRayHeight + volumeChartHeight]; // below candle chart
  const volumeChartOrigin = [0, candleChartHeight + elderRayHeight]; // below TRL
  const elderRayOrigin = [0, candleChartHeight]; // bottom
  const profitChartOrigin = [
    0,
    candleChartHeight + elderRayHeight + volumeChartHeight + trlChartHeight,
  ]; // below TRL
  const profitcomparechartorigin = [
    0,
    candleChartHeight + elderRayHeight + volumeChartHeight + trlChartHeight,
  ]; // below TRL
  const strokeStyles = [
    { strokeStyle: "#444", strokeDasharray: "2,2" },
    { strokeStyle: "#444", strokeDasharray: "4,2" },
    { strokeStyle: "#444", strokeDasharray: "1,3" },
    { strokeStyle: "#444", strokeDasharray: "4,4" },
    { strokeStyle: "#444", strokeDasharray: "8,2" },
    { strokeStyle: "#444", strokeDasharray: "2,6" },
    { strokeStyle: "#444", strokeDasharray: "3,3,1,3" },
    { strokeStyle: "#444", strokeDasharray: "1,1" },
    { strokeStyle: "#444", strokeDasharray: "6,3,2,3" },
  ];
  const allModels = [...predictions, ...trl_predictions];
  // Precompute realistic profit for all prediction models
  const profitData = {};
  [...predictions, ...trl_predictions].forEach((p) => {
    let position = 0; // Units held
    let avgCost = 0; // Average cost per unit
    let realizedProfit = 0; // Profit from sold positions
    let totalInvested = 0; // Total money spent buying

    console.log(`\n=== Running model: ${p} ===`);

    profitData[p] = mergedData.map((d) => {
      const val = getPredictedPrice(d, p);
      const price = Number(d.close); // Use close price for trading

      if (val == null || isNaN(price)) {
        // If prediction or price invalid, just return last known totalReturn
        const unrealizedProfit = position * (price - avgCost);
        const totalProfit = realizedProfit + unrealizedProfit;
        const totalReturn = totalInvested > 0 ? totalProfit / totalInvested : 0;
        return { ...d, profit: totalReturn, position };
      }

      if (val > 0 && val <= 1) {
        // Buy
        const buyAmount = val;
        totalInvested += price * buyAmount;
        avgCost = (avgCost * position + price * buyAmount) / (position + buyAmount);
        position += buyAmount;
      } else if (val > 2) {
        // Hold: do nothing
      } else if (val < 0) {
        // Sell
        const sellAmount = Math.min(position, (Math.abs(val) * sellScale) / 1000);
        realizedProfit += (price - avgCost) * sellAmount;
        position -= sellAmount;
        if (position === 0) avgCost = 0;
      }

      // Calculate total return including unrealized gains
      const unrealizedProfit = position * (price - avgCost);
      const totalProfit = realizedProfit + unrealizedProfit;
      const totalReturn = totalInvested > 0 ? totalProfit / totalInvested : 0;

      return { ...d, profit: totalReturn, position };
    });
  });

  console.log("\n=== Final Profits ===, Sell Scale:", sellScale);
  console.log(profitData);

  const accuracyData = {};

  [...predictions, ...trl_predictions].forEach((p) => {
    console.log(`\n=== Calculating accuracy for model: ${p} ===`);

    accuracyData[p] = mergedData.map((d, idx, arr) => {
      const val = getPredictedPrice(d, p);
      const price = Number(d.close);

      if (val == null || isNaN(price) || idx === arr.length - 1) {
        // Last candle has no "next price" to compare
        return { ...d, correct: null };
      }

      const nextPrice = Number(arr[idx + 1].close);
      let correct = 0;

      if (val > 0 && val <= 1) {
        // Buy prediction: price should go up
        correct = nextPrice > price ? 1 : 0;
      } else if (val > 2) {
        // Hold prediction: optionally count if price change is small
        correct = Math.abs(nextPrice - price) / price < 0.001 ? 1 : 0;
      } else if (val < 0) {
        // Sell prediction: price should go down
        correct = nextPrice < price ? 1 : 0;
      }

      return { ...d, correct };
    });
  });

  const profitOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Model Final Profit" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Profit" } },
    },
  };

  const accuracyOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Model Prediction Accuracy (%)" },
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: "Accuracy (%)" } },
    },
  };

  // Data for profit
  const profitChartData = {
    labels: allModels,
    datasets: [
      {
        label: "Final Profit Percentage",
        data: allModels.map((p) => profitData[p][profitData[p].length - 1].profit),
        backgroundColor: allModels.map((p, idx) =>
          darkMode
            ? predColorsDark[idx] || trl_predcolorsDark[idx % trl_predcolorsDark.length]
            : predColors[idx] || trl_predcolors[idx % trl_predcolors.length]
        ),
      },
    ],
  };
  console.log("Profit Chart Data:", profitChartData);

  // Data for accuracy
  const accuracyChartData = {
    labels: allModels,
    datasets: [
      {
        label: "Prediction Accuracy (%)",
        data: allModels.map((p) => {
          const valid = accuracyData[p].filter((d) => d.correct !== null);
          const totalCorrect = valid.reduce((sum, d) => sum + d.correct, 0);
          return valid.length ? (totalCorrect / valid.length) * 100 : 0;
        }),
        backgroundColor: allModels.map((p, idx) =>
          darkMode
            ? predColorsDark[idx] || trl_predcolorsDark[idx % trl_predcolorsDark.length]
            : predColors[idx] || trl_predcolors[idx % trl_predcolors.length]
        ),
      },
    ],
  };

  // === Count Buy, Sell, Hold per Model ===
  const actionCountData = {};

  [...predictions, ...trl_predictions].forEach((p) => {
    console.log(`\n=== Counting actions for model: ${p} ===`);

    let buyCount = 0;
    let holdCount = 0;
    let sellCount = 0;

    mergedData.forEach((d) => {
      const val = getPredictedPrice(d, p);
      if (val == null) return;

      if (val > 0 && val <= 1) buyCount++;
      else if (val > 2) holdCount++;
      else if (val < 0) sellCount++;
    });

    actionCountData[p] = { buy: buyCount, hold: holdCount, sell: sellCount };
  });

  console.log("Action Count Data:", actionCountData);

  // === Chart Data for Buy/Sell/Hold Counts ===
  const actionChartData = {
    labels: allModels,
    datasets: [
      {
        label: "Buy",
        data: allModels.map((p) => actionCountData[p]?.buy || 0),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
      },
      {
        label: "Hold",
        data: allModels.map((p) => actionCountData[p]?.hold || 0),
        backgroundColor: "rgba(255, 205, 86, 0.7)",
      },
      {
        label: "Sell",
        data: allModels.map((p) => actionCountData[p]?.sell || 0),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
    ],
  };

  const actionChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Buy / Hold / Sell Counts per Model" },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Count" },
      },
    },
  };

  const chartWidth = 500;
  const chartHeight = 300;
  return (
    <div>
      <MDBox sx={{ width: "100%" }}>
        <Grid container spacing={2}>
          {[
            { data: profitChartData, options: profitOptions },
            { data: accuracyChartData, options: accuracyOptions },
            { data: actionChartData, options: actionChartOptions },
          ].map((chart, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ p: 1, overflow: "visible", height: "auto" }}>
                <MDBox sx={{ height: chartHeight * 0.8 }}>
                  <Bar data={chart.data} options={chart.options} />
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>

      {/* Top controls row */}
      <MDBox display="flex" alignItems="center" gap={2} mb={2}>
        {/* Sidebar toggles */}
        <MDBox display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <MDBox display="flex" alignItems="center" gap={1}>
            <input
              type="checkbox"
              checked={visibleSeries.ema12}
              onChange={() => toggleSeries("ema12")}
            />
            <MDTypography variant="body2">EMA 12</MDTypography>
          </MDBox>

          <MDBox display="flex" alignItems="center" gap={1}>
            <input
              type="checkbox"
              checked={visibleSeries.ema26}
              onChange={() => toggleSeries("ema26")}
            />
            <MDTypography variant="body2">EMA 26</MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>

      {/* Chart below controls, fills full width */}
      <div
        style={{
          width: "100%",
          backgroundColor: darkMode ? "#21284A" : "#FAFAFA", // subtle background
          borderRadius: "8px",
          padding: "8px",
          overflowX: "auto",
        }}
      >
        {/* Chart */}

        <ChartCanvas
          height={height}
          width={Math.max(width - 120, 600)} // minimal width to avoid crashing
          ratio={ratio}
          margin={margin}
          data={data}
          seriesName="BTCUSDT"
          xScale={xScale}
          xAccessor={xAccessor}
          displayXAccessor={displayXAccessor}
          xExtents={xExtents}
          zoomAnchor={lastVisibleItemBasedZoomAnchor}
        >
          {/* TRL Line Chart */}
          {/* <rect
            x={0}
            y={0}
            width={width - 120}
            height={height}
            fill={darkMode ? "#21284A" : "#FAFAFA"}
          /> */}
          {/* Volume */}
          <Chart
            id={1}
            height={volumeChartHeight}
            origin={() => volumeChartOrigin}
            yExtents={(d) => d.volume}
          >
            <BarSeries yAccessor={(d) => d.volume} fill={volumeColor} />
            <YAxis
              strokeStyle={darkMode ? "#FFFFFF" : "#000000"}
              stroke={darkMode ? "#FFFFFF" : "#000000"}
              gridLinesStrokeStyle={darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0,0,0,0.1)"}
              tickStroke={darkMode ? "#FFFFFF" : "#000000"}
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              axisAt="right"
              orient="right"
              ticks={5}
            />
            <XAxis
              strokeStyle={darkMode ? "#FFFFFF" : "#000000"}
              showGridLines
              gridLinesStrokeStyle={darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0,0,0,0.1)"}
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              stroke={darkMode ? "#FFFFFF" : "#000000"} // font color
              tickStroke={darkMode ? "#FFFFFF" : "#000000"} // tick label color
            />
            <MouseCoordinateY
              textFill={darkMode ? "#FFFFFF" : "#000000"}
              rectWidth={margin.right}
              displayFormat={pricesDisplayFormat}
            />
          </Chart>

          {/* Main Candlestick + EMA + Predictions */}
          <Chart
            id={2}
            height={candleChartHeight}
            origin={() => candleChartOrigin}
            yExtents={(d) => [d.low, d.high, d.ema12, d.ema26]}
          >
            <XAxis
              strokeStyle={darkMode ? "#FFFFFF" : "#000000"}
              gridLinesStrokeStyle={darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0,0,0,0.1)"}
              showGridLines
              showTickLabel={false}
              stroke={darkMode ? "#FFFFFF" : "#000000"} // font color
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              tickStroke={darkMode ? "#FFFFFF" : "#000000"} // tick label color
            />
            <YAxis
              strokeStyle={darkMode ? "#FFFFFF" : "#000000"}
              stroke={darkMode ? "#FFFFFF" : "#000000"}
              gridLinesStrokeStyle={darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0,0,0,0.1)"}
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              tickStroke={darkMode ? "#FFFFFF" : "#000000"}
              showGridLines
              tickFormat={pricesDisplayFormat}
            />
            <CandlestickSeries fill={openCloseColor} stroke={openCloseColor} />
            {visibleSeries.ema26 && (
              <LineSeries
                yAccessor={ema26.accessor()}
                strokeStyle={ema26.stroke()}
                highlightOnHover={true}
              />
            )}
            {visibleSeries.ema12 && (
              <LineSeries
                yAccessor={ema12.accessor()}
                strokeStyle={ema12.stroke()}
                highlightOnHover={true}
              />
            )}
            {visibleSeries.ema26 && (
              <CurrentCoordinate yAccessor={ema26.accessor()} fill={ema26.stroke()} />
            )}
            {visibleSeries.ema12 && (
              <CurrentCoordinate yAccessor={ema12.accessor()} fill={ema12.stroke()} />
            )}

            <MouseCoordinateY
              textFill={darkMode ? "#FFFFFF" : "#000000"}
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              rectWidth={margin.right}
              displayFormat={pricesDisplayFormat}
            />
            <EdgeIndicator
              itemType="last"
              rectWidth={margin.right}
              fill={openCloseColor}
              lineStroke={openCloseColor}
              displayFormat={pricesDisplayFormat}
              yAccessor={(d) => d.close}
            />
            <MovingAverageTooltip
              origin={[8, 24]}
              options={[
                {
                  yAccessor: ema26.accessor(),
                  type: "EMA",
                  stroke: ema26.stroke(),
                  windowSize: 26,
                },
                {
                  yAccessor: ema12.accessor(),
                  type: "EMA",
                  stroke: ema12.stroke(),
                  windowSize: 12,
                },
              ]}
            />

            <OHLCTooltip
              origin={[8, 46]}
              labelFill={darkMode ? "#FFFFFF" : "#000000"}
              textFill={darkMode ? "#FFFFFF" : "#000000"}
            />
            <ZoomButtons />
          </Chart>

          {/* Elder-Ray */}
          <Chart
            id={3}
            height={elderRayHeight}
            yExtents={[0, elder.accessor()]}
            origin={elderRayOrigin}
            padding={{ top: 8, bottom: 8 }}
          >
            <XAxis
              strokeStyle={darkMode ? "#FFFFFF" : "#000000"}
              showGridLines
              gridLinesStrokeStyle={darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0,0,0,0.1)"}
              stroke={darkMode ? "#FFFFFF" : "#000000"} // font color
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              tickStroke={darkMode ? "#FFFFFF" : "#000000"} // tick label color
            />
            <YAxis
              strokeStyle={darkMode ? "#FFFFFF" : "#000000"}
              stroke={darkMode ? "#FFFFFF" : "#000000"}
              gridLinesStrokeStyle={darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0,0,0,0.1)"}
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              tickStroke={darkMode ? "#FFFFFF" : "#000000"}
              ticks={4}
              tickFormat={pricesDisplayFormat}
            />
            <MouseCoordinateY
              textFill={darkMode ? "#FFFFFF" : "#000000"}
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              rectWidth={margin.right}
              displayFormat={pricesDisplayFormat}
            />
            <ElderRaySeries yAccessor={elder.accessor()} />
          </Chart>

          {/* Top controls row */}

          {/* Model Prediction Bar Chart */}
          <Chart
            id={4}
            height={trlChartHeight} // adjust as needed
            origin={() => trlChartOrigin} // stacked below Elder-Ray
            yExtents={(d) => [-1, 1]}
            padding={{ top: 65, bottom: 5 }}
          >
            <XAxis
              strokeStyle={darkMode ? "#FFFFFF" : "#000000"}
              showGridLines
              gridLinesStrokeStyle={darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0,0,0,0.1)"}
              stroke={darkMode ? "#FFFFFF" : "#000000"} // font color
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              tickStroke={darkMode ? "#FFFFFF" : "#000000"} // tick label color
            />
            <YAxis
              strokeStyle={darkMode ? "#FFFFFF" : "#000000"}
              stroke={darkMode ? "#FFFFFF" : "#000000"}
              gridLinesStrokeStyle={darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0,0,0,0.1)"}
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              tickStroke={darkMode ? "#FFFFFF" : "#000000"}
              ticks={4}
            />

            {[...predictions, ...trl_predictions].map((p, idx) =>
              visibleSeries[p] ? (
                <BarSeries
                  key={p}
                  tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
                  strokeStyle={strokeStyles[idx % strokeStyles.length].strokeStyle}
                  strokeDasharray={strokeStyles[idx % strokeStyles.length].strokeDasharray}
                  baseAt={(xScale, yScale) => yScale(0)}
                  yAccessor={(d) => {
                    const val = getPredictedPrice(d, p);
                    return val > 2 ? val - 2 : val;
                  }}
                  fillStyle={(d) => {
                    const val = getPredictedPrice(d, p);
                    return val > 2 ? "#999" : val > 0 ? "#26a69a" : val < 0 ? "#ef5350" : "#999";
                  }}
                />
              ) : null
            )}

            <MouseCoordinateY
              textFill={darkMode ? "#FFFFFF" : "#000000"}
              rectWidth={margin.right}
              displayFormat={(val) => val.toFixed(2)}
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
            />

            {[...predictions, ...trl_predictions].map((p, idx) => (
              <SingleValueTooltip
                key={p}
                yAccessor={(d) => {
                  const val = getPredictedPrice(d, p);
                  // if greater than 2, subtract 2
                  return val > 2 ? val - 2 : val;
                }}
                yLabel={`${p} Confidence`}
                yDisplayFormat={(val) => (val == null || isNaN(val) ? "" : val.toFixed(2))}
                origin={(w, h) => [
                  idx * 150, // start 200px from left, then 100px between items
                  60, // fixed distance from top
                ]}
                labelFill={
                  darkMode
                    ? predColorsDark[idx] || trl_predcolorsDark[idx % trl_predcolorsDark.length]
                    : predColors[idx] || trl_predcolors[idx % trl_predcolors.length]
                }
                valueFill={
                  darkMode
                    ? predColorsDark[idx] || trl_predcolorsDark[idx % trl_predcolorsDark.length]
                    : predColors[idx] || trl_predcolors[idx % trl_predcolors.length]
                }
              />
            ))}
            <OHLCTooltip
              origin={[8, 46]}
              labelFill={darkMode ? "#FFFFFF" : "#000000"}
              textFill={darkMode ? "#FFFFFF" : "#000000"}
            />
            <ZoomButtons />
          </Chart>

          <Chart
            id={5}
            height={predChartHeight}
            origin={() => profitChartOrigin}
            yExtents={(d) => {
              // Collect profits for all visible prediction models at this candle
              const profits = [...predictions, ...trl_predictions]
                .filter((p) => visibleSeries[p])
                .map((p) => profitData[p].find((x) => x.open_time === d.open_time).profit);

              return profits; // yExtents expects an array of numbers
            }}
            padding={{ top: 70, bottom: 40 }}
          >
            <XAxis
              strokeStyle={darkMode ? "#FFFFFF" : "#000000"}
              showGridLines
              gridLinesStrokeStyle={darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0,0,0,0.1)"}
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              stroke={darkMode ? "#FFFFFF" : "#000000"} // font color
              tickStroke={darkMode ? "#FFFFFF" : "#000000"} // tick label color
            />
            <YAxis
              ticks={4}
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              gridLinesStrokeStyle={darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0,0,0,0.1)"}
              strokeStyle={darkMode ? "#FFFFFF" : "#000000"}
              stroke={darkMode ? "#FFFFFF" : "#000000"}
              tickStroke={darkMode ? "#FFFFFF" : "#000000"}
            />

            <MouseCoordinateY
              tickLabelFill={darkMode ? "#FFFFFF" : "#000000"}
              textFill={darkMode ? "#FFFFFF" : "#000000"}
              rectWidth={margin.right}
              displayFormat={(val) => val.toFixed(2)}
            />

            {[...predictions, ...trl_predictions].map((p, idx) =>
              visibleSeries[p] ? (
                <CurrentCoordinate
                  key={p + "_profit_coord"}
                  yAccessor={(d) => profitData[p].find((x) => x.open_time === d.open_time).profit}
                  fillStyle={
                    darkMode
                      ? predColorsDark[idx] || trl_predcolorsDark[idx % trl_predcolorsDark.length]
                      : predColors[idx] || trl_predcolors[idx % trl_predcolors.length]
                  }
                />
              ) : null
            )}

            {[...predictions, ...trl_predictions].map((p, idx) =>
              visibleSeries[p] ? (
                <LineSeries
                  key={p + "_profit"}
                  yAccessor={(d) => profitData[p].find((x) => x.open_time === d.open_time).profit}
                  strokeStyle={
                    darkMode
                      ? predColorsDark[idx] || trl_predcolorsDark[idx % trl_predcolorsDark.length]
                      : predColors[idx] || trl_predcolors[idx % trl_predcolors.length]
                  }
                  highlightOnHover={true}
                />
              ) : null
            )}

            {[...predictions, ...trl_predictions].map((p, idx) =>
              visibleSeries[p] ? (
                <SingleValueTooltip
                  key={p + "_tooltip"}
                  yLabel={`${p} Profit %`}
                  yAccessor={(d) => profitData[p].find((x) => x.open_time === d.open_time).profit}
                  yDisplayFormat={(val) => val.toFixed(2)}
                  origin={(w, h) => [0 + idx * 140, 60]} // adjust tooltip position
                  labelFill={
                    darkMode
                      ? predColorsDark[idx] || trl_predcolorsDark[idx % trl_predcolorsDark.length]
                      : predColors[idx] || trl_predcolors[idx % trl_predcolors.length]
                  }
                  valueFill={
                    darkMode
                      ? predColorsDark[idx] || trl_predcolorsDark[idx % trl_predcolorsDark.length]
                      : predColors[idx] || trl_predcolors[idx % trl_predcolors.length]
                  }
                />
              ) : null
            )}

            <OHLCTooltip
              origin={[8, 46]}
              labelFill={darkMode ? "#FFFFFF" : "#000000"}
              textFill={darkMode ? "#FFFFFF" : "#000000"}
            />
          </Chart>

          <CrossHairCursor />
        </ChartCanvas>
      </div>

      <MDBox display="flex" alignItems="center" gap={2} mb={2}>
        {/* Slider for Sell scaling */}
        <MDBox>
          <MDTypography variant="body2">Sell Scale: {sellScale.toFixed(2)}</MDTypography>
          <input
            type="range"
            min="1"
            max="10000"
            step="100"
            value={sellScale}
            onChange={(e) => setSellScale(parseFloat(e.target.value))}
          />
        </MDBox>

        {/* Sidebar toggles */}
        <MDBox display="flex" alignItems="center" gap={2} flexWrap="wrap">
          {predictions.map((p) => (
            <MDBox key={p} display="flex" alignItems="center" gap={1}>
              <input type="checkbox" checked={visibleSeries[p]} onChange={() => toggleSeries(p)} />
              <MDTypography variant="body2">{p}</MDTypography>
            </MDBox>
          ))}

          {trl_predictions.map((p) => (
            <MDBox key={p} display="flex" alignItems="center" gap={1}>
              <input type="checkbox" checked={visibleSeries[p]} onChange={() => toggleSeries(p)} />
              <MDTypography variant="body2">{p}</MDTypography>
            </MDBox>
          ))}
        </MDBox>
      </MDBox>
    </div>
  );
};

CryptoDashboard.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  trl: PropTypes.array.isRequired,
};

export default CryptoDashboard;

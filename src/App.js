/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import axios from "axios";
import { Network } from "vis-network/standalone";
import CandlestickChart from "./CandlestickChart.js";
import { usePrices } from "./usePrices.js";
import { useTRL } from "./useTRL.js";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  registerables,
} from "chart.js";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  ...registerables // ✅ spread instead of passing as one object
);

import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt";
gantt.config.readonly = true; // disables all editing
gantt.config.drag_move = false; // cannot move tasks
gantt.config.drag_resize = false; // cannot resize tasks
gantt.config.drag_progress = false; // cannot change progress
gantt.config.drag_links = false; // cannot create dependencies

console.log("Loading Chart.js...");

const BASE_URL = "http://localhost:8000"; // backend FastAPI
const DAG_NAME = "training_pipeline";
const DEFAULT_LAST_N = 10;

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 React routes
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  const [dagRuns, setDagRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);

  useEffect(() => {
    fetchDagRuns();
  }, []);
  useEffect(() => {
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.duration_unit = "minute";
    gantt.config.scale_unit = "minute";
    gantt.config.date_scale = "%H:%i";
    gantt.config.subscales = [{ unit: "minute", step: 15, date: "%H:%i" }];
    gantt.config.readonly = true;
    gantt.init("gantt_here");
  }, []);

  // When DAG run changes
  useEffect(() => {
    if (!selectedRun) return;

    const tasksData = selectedRun.tasks.map((t, index) => ({
      id: t.id || index + 1,
      text: t.task_name,
      start_date: formatDateForGantt(t.start_time),
      duration:
        t.start_time && t.end_time
          ? (new Date(t.end_time) - new Date(t.start_time)) / (1000 * 60)
          : null,
      progress: t.status === "SUCCESS" ? 1 : t.status === "RUNNING" ? 0.5 : 0,
      parent: 0,
      open: true,
      color:
        t.status === "SUCCESS"
          ? "green"
          : t.status === "FAILED"
          ? "red"
          : t.status === "RUNNING"
          ? "orange"
          : "gray",
    }));

    const edges = buildEdges();
    const linksData = buildGanttLinks(tasksData, edges);

    gantt.clearAll(); // <-- clear old tasks
    gantt.parse({ data: tasksData, links: linksData }); // <-- add new tasks
  }, [selectedRun]);

  useEffect(() => {
    if (selectedRun) {
      renderGraph(selectedRun);
    }
  }, [selectedRun]);

  const fetchDagRuns = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/status/events`, {
        params: { limit: 300, dag_name: DAG_NAME },
      });

      const lastRuns = dedupeTasksByMostRecentStartTime(
        getLastNDagCycles(res.data, DEFAULT_LAST_N)
      );

      const runsList = Object.entries(lastRuns).map(([runId, tasks]) => ({
        runId,
        tasks,
      }));

      setDagRuns(runsList);
      if (runsList.length > 0) setSelectedRun(runsList[0]);
    } catch (err) {
      console.error("Error fetching DAG runs:", err);
    }
  };

  const getLastNDagCycles = (tasks, n = 2) => {
    const dagGroups = {};
    tasks.forEach((task) => {
      if (!dagGroups[task.run_id]) dagGroups[task.run_id] = [];
      dagGroups[task.run_id].push(task);
    });

    console.log("DAG Groups:", dagGroups);
    const sortedRunIds = Object.keys(dagGroups).sort((a, b) =>
      a.split("__")[1].localeCompare(b.split("__")[1])
    );

    const lastRuns = sortedRunIds.slice(-n);
    const result = {};
    lastRuns.forEach((runId) => {
      result[runId] = dagGroups[runId].sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );
    });
    console.log("Last N DAG cycles:", result);
    return result;
  };

  const dedupeTasksByMostRecentStartTime = (dagCycles) => {
    const dedupedResult = {};

    Object.entries(dagCycles).forEach(([runId, tasks]) => {
      const taskMap = {};

      tasks.forEach((task) => {
        const existing = taskMap[task.task_name];
        if (!existing || new Date(task.start_time) > new Date(existing.start_time)) {
          taskMap[task.task_name] = task;
        }
      });

      // Sort deduped tasks by start_time again (optional, for consistency)
      dedupedResult[runId] = Object.values(taskMap).sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );
    });

    console.log("Deduped DAG cycles:", dedupedResult);
    return dedupedResult;
  };

  function formatDateForGantt(isoString) {
    console.log("Formatting date:", isoString);
    if (!isoString) return null;
    // Remove fractional seconds
    const cleanIso = isoString.split(".")[0]; // "2025-09-28T18:57:30"
    const d = new Date(cleanIso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    console.log("Formatted date:", `${yyyy}-${mm}-${dd} ${hh}:${min}`);
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`; // "YYYY-MM-DD HH:mm"
  }

  const buildGanttLinks = (tasks, edges) => {
    const nameToId = {};
    tasks.forEach((t) => {
      nameToId[t.text] = t.id; // map task name to id
    });

    const links = edges
      .map((e, index) => {
        const sourceId = nameToId[e.from];
        const targetId = nameToId[e.to];
        if (sourceId != null && targetId != null) {
          return {
            id: index + 1,
            source: sourceId,
            target: targetId,
            type: "0", // Finish-to-Start
          };
        }
        return null;
      })
      .filter((l) => l != null); // remove any nulls if a task name not found

    return links;
  };

  const buildEdges = () => {
    const edges = [];
    edges.push({ from: "pre_train_dataset", to: "flush_and_init" });
    edges.push({ from: "flush_and_init", to: "vast_ai_train" });

    const cryptos = ["BTCUSDT"];
    const models_ = ["lightgbm", "tst"];
    const models = ["trl"];
    cryptos.forEach((crypto) => models_.forEach((m) => models.push(`${crypto}_${m}`)));

    models.forEach((m) => edges.push({ from: "vast_ai_train", to: `post_train_${m}` }));
    edges.push({ from: "vast_ai_train", to: "monitor_all_to_kill" });

    return edges;
  };
  const renderGraph = (run) => {
    const nodesSet = new Set();
    const edges = buildEdges();

    edges.forEach((e) => {
      nodesSet.add(e.from);
      nodesSet.add(e.to);
    });

    // Map task status to node color
    const statusColors = {
      SUCCESS: "lightgreen",
      FAILED: "red",
      RUNNING: "orange",
      SKIPPED: "gray",
    };

    const nodesArray = Array.from(nodesSet).map((n) => {
      const task = run.tasks.find((t) => t.task_name === n);
      const status = task?.status || "NOT STARTED";

      // console.log(`Node: ${n}, Task:`, task, `Status: ${status}`);

      return {
        id: n,
        label: n,
        title: `Task: ${n}
Status: ${status}
Start: ${formatDateForGantt(task?.start_time) || "N/A"}
End: ${formatDateForGantt(task?.end_time) || "N/A"}`,

        color: statusColors[status] || "grey",
        shape: "box", // clearer for DAGs
      };
    });

    const container = document.getElementById("dag-network");
    const data = { nodes: nodesArray, edges };

    const options = {
      layout: {
        hierarchical: {
          direction: "LR", // left to right
          sortMethod: "directed",
          nodeSpacing: 200, // spacing between nodes
          levelSeparation: 200, // spacing between levels
        },
      },
      edges: {
        arrows: { to: { enabled: true } },
        smooth: true,
      },
      interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true,
        hover: true,
        selectable: true,
      },
      physics: {
        enabled: true, // allows spreading out dynamically
        hierarchicalRepulsion: {
          nodeDistance: 150,
          centralGravity: 0.0,
          springLength: 200,
          springConstant: 0.01,
          damping: 0.09,
        },
      },
    };

    new Network(container, data, options);
  };

  const data = usePrices();
  const trl = useTRL();

  return (
    <div>
      <ThemeProvider theme={darkMode ? themeDark : theme}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="Material Dashboard 2"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
      <div>
        <div style={{ padding: 20 }}>
          <h1>BTC/USDT Candlestick Chart</h1>
          <CandlestickChart
            data={data}
            trl={trl}
            width={1700}
            height={2000}
            ratio={window.devicePixelRatio || 1}
          />
        </div>

        <h2>DAG Task Gantt Chart</h2>
        <label>Select DAG Run: </label>
        <select
          onChange={(e) => setSelectedRun(dagRuns.find((run) => run.runId === e.target.value))}
          value={selectedRun?.runId || ""}
        >
          {dagRuns.map((run) => (
            <option key={run.runId} value={run.runId}>
              {run.runId}
            </option>
          ))}
        </select>
        <div style={{ width: "100%", height: "100vh" }} id="gantt_here"></div>

        <div style={{ padding: "20px" }}></div>
        <div style={{ padding: "20px" }}>
          <h2>Interactive DAG Status</h2>
          <label>Select DAG Run: </label>
          <select
            onChange={(e) => setSelectedRun(dagRuns.find((run) => run.runId === e.target.value))}
            value={selectedRun?.runId || ""}
          >
            {dagRuns.map((run) => (
              <option key={run.runId} value={run.runId}>
                {run.runId}
              </option>
            ))}
          </select>

          <div
            id="dag-network"
            style={{ height: "600px", border: "1px solid gray", marginTop: "20px" }}
          />
        </div>
      </div>
    </div>
  );
}

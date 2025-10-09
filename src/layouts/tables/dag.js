import axios from "axios";
import { Network } from "vis-network/standalone";
import { useState, useEffect, useMemo } from "react";
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
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useMaterialUIController, setDarkMode } from "context";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt";
gantt.config.readonly = true; // disables all editing
gantt.config.drag_move = false; // cannot move tasks
gantt.config.drag_resize = false; // cannot resize tasks
gantt.config.drag_progress = false; // cannot change progress
gantt.config.drag_links = false; // cannot create dependencies

const BASE_URL = "https://crypto-backend.gokuladethya.uk"; // backend FastAPI
const DAG_NAME = "training_pipeline";
const DEFAULT_LAST_N = 10;

const DagViewer = () => {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const handleDarkModeToggle = () => {
    setDarkMode(dispatch, !darkMode);
  };

  const [dagRuns, setDagRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);

  if (darkMode) {
    // optional if you want CSS classes
    gantt.setSkin("dark");
  } else {
    gantt.setSkin("material");
  }
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
    gantt.skin = "material";
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

    console.log("Tasks for Gantt:", tasksData);
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

      const lastRuns = dedupeTasksByCreatedAtRange(getLastNDagCycles(res.data, DEFAULT_LAST_N));

      const runsList = Object.entries(lastRuns)
        .map(([runId, tasks]) => ({
          runId,
          tasks,
          // Take the latest start_time in the run
          latestTime: tasks.reduce(
            (max, t) => (new Date(t.start_time) > max ? new Date(t.start_time) : max),
            new Date(0)
          ),
        }))
        .sort((a, b) => b.latestTime - a.latestTime); // latest first

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

  const dedupeTasksByCreatedAtRange = (dagCycles) => {
    const dedupedResult = {};

    Object.entries(dagCycles).forEach(([runId, tasks]) => {
      console.log(`\nProcessing DAG run: ${runId} with ${tasks.length} tasks`);
      const taskMap = {};

      // 🔧 Sort events by created_at ascending before processing
      const sortedTasks = [...tasks].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      sortedTasks.forEach((task) => {
        const { task_name, created_at } = task;
        const current = new Date(created_at);

        if (!taskMap[task_name]) {
          console.log(`🆕 New task: ${task_name} @ ${created_at}`);
          taskMap[task_name] = {
            ...task,
            start_time: created_at,
            end_time: null,
          };
        } else {
          const existing = taskMap[task_name];
          const start = new Date(existing.start_time);
          const end = existing.end_time ? new Date(existing.end_time) : start;

          console.log(
            `🔁 Duplicate task: ${task_name} | existing start=${existing.start_time}, end=${existing.end_time} | current=${created_at}`
          );

          // Since we're going in chronological order, last event = latest state
          existing.end_time = created_at;
          existing.status = task.status;
          existing.event_type = task.event_type;
          existing.message = task.message;

          console.log(`⏩ Updated end_time for ${task_name} → ${created_at}`);
        }
      });

      const finalTasks = Object.values(taskMap).sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );

      console.log(
        `✅ Final deduped tasks for ${runId}:`,
        finalTasks.map((t) => ({
          task: t.task_name,
          start: t.start_time,
          end: t.end_time,
          status: t.status,
        }))
      );

      dedupedResult[runId] = finalTasks;
    });

    console.log("\n🎯 Deduped DAG cycles with start/end:", dedupedResult);
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

  return (
    <MDBox p={3}>
      <Grid container spacing={3}>
        {/* DAG Task Gantt Chart */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              backgroundColor: darkMode ? "#21284A" : "#FAFAFA",
            }}
          >
            <MDBox
              p={3}
              sx={{
                minHeight: "100vh",
                backgroundColor: darkMode ? "#202940" : "#FAFAFA",
                transition: "background-color 0.3s ease",
              }}
            >
              <MDTypography variant="h5" fontWeight="medium" mb={2}>
                DAG Task Gantt Chart
              </MDTypography>

              {/* Select Box */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="gantt-select-label">Select DAG Run</InputLabel>
                <Select
                  labelId="gantt-select-label"
                  value={selectedRun?.runId || ""}
                  onChange={(e) =>
                    setSelectedRun(dagRuns.find((run) => run.runId === e.target.value))
                  }
                  sx={{
                    borderRadius: 2,
                    "& .MuiSelect-select": { py: 1.2 },
                  }}
                >
                  {dagRuns.map((run) => (
                    <MenuItem key={run.runId} value={run.runId}>
                      {run.runId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Gantt Chart Container */}
              <MDBox
                id="gantt_here"
                className={darkMode ? "dark-mode" : ""}
                sx={{
                  width: "100%",
                  height: "55vh",
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.08)",
                  backgroundColor: darkMode ? "#21284A" : "#FAFAFA",
                }}
              />
            </MDBox>
          </Card>
        </Grid>

        {/* Interactive DAG Status */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              backgroundColor: darkMode ? "#202940" : "#FAFAFA",
            }}
          >
            <MDBox
              p={3}
              sx={{
                minHeight: "100vh",
                backgroundColor: darkMode ? "#202940" : "#FAFAFA",
                transition: "background-color 0.3s ease",
              }}
            >
              <MDTypography variant="h5" fontWeight="medium" mb={2}>
                Interactive DAG Status
              </MDTypography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="dag-select-label">Select DAG Run</InputLabel>
                <Select
                  labelId="dag-select-label"
                  value={selectedRun?.runId || ""}
                  onChange={(e) =>
                    setSelectedRun(dagRuns.find((run) => run.runId === e.target.value))
                  }
                  sx={{
                    borderRadius: 2,
                    "& .MuiSelect-select": { py: 1.2 },
                  }}
                >
                  {dagRuns.map((run) => (
                    <MenuItem key={run.runId} value={run.runId}>
                      {run.runId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <MDBox
                id="dag-network"
                sx={{
                  height: "600px",
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.08)",
                  backgroundColor: darkMode ? "#3e4a85" : "#F9FAFB",
                }}
              />
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default DagViewer;

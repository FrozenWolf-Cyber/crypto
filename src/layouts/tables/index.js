import React, { useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import DagViewer from "./dag.js";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import eventsTableData from "./eventsTableData";
import { useEvents } from "./useEvents";
import { useMaterialUIController, setDarkMode } from "context";

function Tables() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const handleDarkModeToggle = () => {
    setDarkMode(dispatch, !darkMode);
  };

  const [selectedDag, setSelectedDag] = useState("");
  const [limit, setLimit] = useState(1000);

  const events = useEvents({ dagName: selectedDag, limit });
  const dagNames = useMemo(() => Array.from(new Set(events.map((e) => e.dag_name))), [events]);

  // Convert for DataTable
  const { columns, rows } = eventsTableData(events);

  // Compute chart data
  // Build chart data dynamically
  const chartDataFormatted = useMemo(() => {
    const statusCounts = events.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts), // ["SUCCESS", "RUNNING", "FAILED"]
      datasets: [
        {
          label: "Event Count",
          data: Object.values(statusCounts), // [12, 5, 3]
          backgroundColor: Object.keys(statusCounts).map((status) => {
            if (status.toLowerCase().includes("success")) return "#4caf50"; // green
            if (status.toLowerCase().includes("fail")) return "#f44336"; // red
            if (status.toLowerCase().includes("run")) return "#ff9800"; // orange
            return "#9e9e9e"; // gray fallback
          }),
          borderRadius: 8,
        },
      ],
    };
  }, [events]);

  return (
    <DashboardLayout>
      <Box display="flex" alignItems="center" gap={1} p={2}>
        <Typography variant="h6">{darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}</Typography>
        <Switch checked={darkMode} onChange={handleDarkModeToggle} />
      </Box>
      <MDBox pt={6} pb={3}>
        {/* Filters & Chart */}
        <Grid container spacing={3}>
          {/* Filters */}
          <Grid item xs={12} md={6} lg={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" gutterBottom>
                  Filters
                </MDTypography>
                <Grid container spacing={2}>
                  <MDBox p={3}>
                    <MDTypography variant="h6" gutterBottom>
                      Filters
                    </MDTypography>

                    {/* "All DAGs" checkbox */}
                    <MDBox display="flex" alignItems="center" my={0.5}>
                      <input
                        type="checkbox"
                        checked={selectedDag === ""}
                        onChange={() => setSelectedDag("")}
                        style={{ marginRight: "10px" }}
                      />
                      <MDTypography variant="body2">All DAGs</MDTypography>
                    </MDBox>

                    {/* DAG checkboxes */}
                    <MDBox display="flex" flexDirection="column">
                      {(selectedDag ? [selectedDag] : dagNames).map(
                        (dag) =>
                          console.log(dagNames) || (
                            <MDBox key={dag} display="flex" alignItems="center" my={0.5}>
                              <input
                                type="checkbox"
                                checked={selectedDag === dag}
                                onChange={() => setSelectedDag((prev) => (prev === dag ? "" : dag))}
                                style={{ marginRight: "10px" }}
                              />
                              <MDTypography variant="body2">{dag}</MDTypography>
                            </MDBox>
                          )
                      )}
                    </MDBox>
                  </MDBox>

                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id="limit-select-label">Last X Entries</InputLabel>
                      <Select
                        labelId="limit-select-label"
                        value={limit}
                        label="Last X Entries"
                        onChange={(e) => setLimit(Number(e.target.value))}
                      >
                        {[50, 100, 200, 300, 500, 700, 1000].map((val) => (
                          <MenuItem key={val} value={val}>
                            {val}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>

          {/* Chart */}
          <Grid item xs={12} md={6} lg={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" gutterBottom>
                  Status Overview
                </MDTypography>

                <MDBox backgroundColor="#ffffff" p={2} borderRadius="lg">
                  <Bar
                    data={chartDataFormatted}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: {
                          display: true,
                          text: selectedDag ? `Status Overview: ${selectedDag}` : "All DAGs",
                        },
                        tooltip: {
                          callbacks: {
                            label: function (tooltipItem) {
                              const value = tooltipItem.raw; // the actual count
                              return `${tooltipItem.label}: ${value}`;
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: { color: "transparent" },
                        },
                        y: {
                          grid: { color: "transparent" },
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Table */}
        <Grid container spacing={3} mt={1}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Events Table
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={{ defaultValue: 10, entries: [5, 10, 20, 50] }}
                  showTotalEntries
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <div>
        <DagViewer />
      </div>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;

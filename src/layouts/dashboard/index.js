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

// @mui material components
import Grid from "@mui/material/Grid";
import MDButton from "components/MDButton";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import { usePrices } from "../../usePrices.js";
import { useTRL } from "../../useTRL.js";
import CandlestickChart from "../../CandlestickChart.js";
// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";
import { useState } from "react";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { useEffect, useMemo } from "react";

// Material Dashboard 2 React context
import { useMaterialUIController, setDarkMode } from "context";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
import {
  setOpenConfigurator,
  setTransparentSidenav,
  setWhiteSidenav,
  setFixedNavbar,
  setSidenavColor,
} from "context";

function Dashboard() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [trlReloadTrigger, setTRLReloadTrigger] = useState(0);

  const handleDarkModeToggle = () => {
    setDarkMode(dispatch, !darkMode);
  };
  const handleReload = () => {
    console.log("Manual reload triggered");
    setReloadTrigger((prev) => prev + 1);
  };

  // Clear cache function
  const handleClear = () => {
    console.log("Clearing local cache");
    localStorage.removeItem("pricesData");
    localStorage.removeItem("lastFingerprint");
    setReloadTrigger((prev) => prev + 1);
  };

  // Sync function (called every 1 hour)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      console.log("Hourly sync triggered");
      setReloadTrigger((prev) => prev + 1);
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(syncInterval);
  }, []);
  const { sales, tasks } = reportsLineChartData;
  const data = usePrices(reloadTrigger); // update usePrices to accept dependency

  const trl = useTRL(trlReloadTrigger);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Box display="flex" alignItems="center" gap={1} p={2}>
          <Typography variant="h6">{darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}</Typography>
          <Switch checked={darkMode} onChange={handleDarkModeToggle} />
        </Box>
        {/* <Grid container spacing={3}> */}
        {/* </Grid> */}
        <Box display="flex" gap={2} mb={2}>
          <MDButton
            variant="gradient"
            color="info"
            onClick={() => {
              console.log("Manual reload triggered for Prices & TRL");
              setReloadTrigger((prev) => prev + 1);
              setTRLReloadTrigger((prev) => prev + 1);
            }}
          >
            Reload All
          </MDButton>

          {/* Clear all cache */}
          <MDButton
            variant="gradient"
            color="error"
            onClick={() => {
              console.log("Clearing all local cache for Prices & TRL");
              localStorage.removeItem("pricesData");
              localStorage.removeItem("lastFingerprint");
              localStorage.removeItem("trlData");
              localStorage.removeItem("lastTRLFingerprint");
              setReloadTrigger((prev) => prev + 1);
              setTRLReloadTrigger((prev) => prev + 1);
            }}
          >
            Clear Cache All
          </MDButton>
        </Box>
        <Typography variant="h4" gutterBottom>
          Price Candlestick Chart (Last 3 Months)
        </Typography>
        <Typography variant="body2" gutterBottom>
          Please wait for data to load. This may take a few moments depending on the amount of data.
        </Typography>
        <div style={{ padding: 20 }}>
          <CandlestickChart
            data={data}
            trl={trl}
            width={1450}
            height={2000}
            ratio={window.devicePixelRatio || 1}
          />
        </div>
        <MDBox>
          <Grid item xs={12} md={6} lg={8}>
            <Projects />
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;

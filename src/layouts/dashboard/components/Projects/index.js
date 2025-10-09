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

import { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import DataTable from "examples/Tables/DataTable";
import { useEvents } from "../../../../layouts/tables/useEvents";
import eventsTableData from "../../../../layouts/tables/eventsTableData";

// Data
import data from "layouts/dashboard/components/Projects/data";

function Projects() {
  const [menu, setMenu] = useState(null);
  const selectedDag = "training_pipeline";
  const [limit, setLimit] = useState(1000);

  const events = useEvents({ dagName: selectedDag, limit });
  // Assuming `events` is your event list
  const runsById = {};

  events.forEach((event) => {
    const { run_id, status, task_name } = event;
    if (!runsById[run_id]) {
      runsById[run_id] = { hasPretrain: false, hasFailure: false };
    }

    if (task_name === "pre_train_dataset") {
      runsById[run_id].hasPretrain = true;
    }

    if (status === "FAILED") {
      runsById[run_id].hasFailure = true;
    }
  });

  const validRuns = Object.values(runsById).filter((r) => r.hasPretrain);
  const totalRuns = validRuns.length;
  const successfulRuns = validRuns.filter((r) => !r.hasFailure).length;

  console.log("Events:", events);
  const { columns, rows } = eventsTableData(events);
  // Convert for DataTable
  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem onClick={closeMenu}>Action</MenuItem>
      <MenuItem onClick={closeMenu}>Another action</MenuItem>
      <MenuItem onClick={closeMenu}>Something else</MenuItem>
    </Menu>
  );

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Training Pipeline DAG
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <Icon
              sx={{
                fontWeight: "bold",
                color: ({ palette: { info } }) => info.main,
                mt: -0.5,
              }}
            >
              done
            </Icon>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;<strong>{successfulRuns} done</strong> till now ({totalRuns} total)
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox color="text" px={2}>
          <Icon sx={{ cursor: "pointer", fontWeight: "bold" }} fontSize="small" onClick={openMenu}>
            more_vert
          </Icon>
        </MDBox>
        {renderMenu}
      </MDBox>
      <MDBox>
        <DataTable
          table={{ columns, rows }}
          isSorted={false}
          noEndBorder
          entriesPerPage={{ defaultValue: 20, entries: [5, 10, 20, 50] }}
          showTotalEntries
        />
      </MDBox>
    </Card>
  );
}

export default Projects;

/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

import React from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

export default function eventsTableData(events) {
  // Author component: DAG & Task info
  const Author = ({ dagName, taskName, runId }) => (
    <MDBox display="flex" flexDirection="column" lineHeight={1}>
      <MDTypography display="block" variant="button" fontWeight="medium">
        {dagName}
      </MDTypography>
      <MDTypography variant="caption" color="text">
        {taskName} | {runId}
      </MDTypography>
    </MDBox>
  );

  // Job component: Model info
  const Job = ({ modelName, eventType }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {modelName}
      </MDTypography>
      <MDTypography variant="caption">{eventType}</MDTypography>
    </MDBox>
  );

  // Map status to badge color
  const statusColor = (status) => {
    switch (status) {
      case "SUCCESS":
        return "success";
      case "RUNNING":
        return "warning";
      case "FAILED":
        return "error";
      default:
        return "dark";
    }
  };

  const columns = [
    { Header: "Event", accessor: "author", width: "35%", align: "left" },
    { Header: "Model / Type", accessor: "function", align: "left" },
    { Header: "Status", accessor: "status", align: "center" },
    { Header: "Message", accessor: "message", align: "center" },
    { Header: "Created At", accessor: "created_at", align: "center" },
  ];

  const rows = events.map((event) => ({
    author: <Author dagName={event.dag_name} taskName={event.task_name} runId={event.run_id} />,
    function: <Job modelName={event.model_name} eventType={event.event_type} />,
    status: (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent={event.status.toLowerCase()}
          color={statusColor(event.status)}
          variant="gradient"
          size="sm"
        />
      </MDBox>
    ),
    message: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {event.message}
      </MDTypography>
    ),
    created_at: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {new Date(event.created_at).toLocaleString()}
      </MDTypography>
    ),
  }));

  return { columns, rows };
}

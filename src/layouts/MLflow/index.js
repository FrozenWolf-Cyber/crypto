/**
=========================================================
* Material Dashboard 2 React - MLflow Access Page
=========================================================
*/

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useMaterialUIController } from "context";
import mlflowLogo from "assets/images/logos/MLflow-logo.png"; // relative to src
import bg from "assets/images/bg.jpg";
import Box from "@mui/material/Box";
function MLflowGate() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const mlflowUrl = "https://mlflow.gokuladethya.uk/";
  const username = "012345678910";
  const password = "012345678910";

  return (
    <Box
      sx={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <DashboardLayout>
        <MDBox
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="90vh"
          px={3}
        >
          <MDBox
            sx={{
              width: "650px",
              padding: 6,
              borderRadius: 3,
              textAlign: "center",
              boxShadow: darkMode ? "0 0 25px #000" : "0 0 25px #aaa",
              backgroundColor: darkMode ? "rgba(34,34,34,0.95)" : "rgba(255,255,255,0.95)",
            }}
          >
            {/* MLflow Logo */}
            <img
              src={mlflowLogo}
              alt="MLflow Logo"
              style={{ height: "80px", marginBottom: "20px" }}
            />

            <h1 style={{ marginBottom: "20px" }}>🔒 MLflow Access Portal</h1>

            <p style={{ fontSize: "1.1rem", marginBottom: "30px" }}>
              MLflow cannot be embedded directly in this page. <br />
              To continue, please visit the MLflow site using the following credentials:
            </p>

            {/* Credentials Box */}
            <MDBox
              sx={{
                backgroundColor: darkMode ? "#111" : "#f0f0f0",
                padding: 3,
                borderRadius: 2,
                marginBottom: 30,
              }}
            >
              <p style={{ fontSize: "1.2rem", margin: 0 }}>
                <strong>Username:</strong> <code>{username}</code>
              </p>
              <p style={{ fontSize: "1.2rem", margin: 0 }}>
                <strong>Password:</strong> <code>{password}</code>
              </p>
            </MDBox>

            {/* Go to MLflow Button */}
            <MDButton
              variant="gradient"
              color="info"
              size="large"
              onClick={() => window.open(mlflowUrl, "_blank")}
            >
              Go to MLflow
            </MDButton>

            <p style={{ marginTop: 20, fontSize: "0.9rem", color: darkMode ? "#aaa" : "#555" }}>
              Clicking the button will open MLflow in a new tab.
            </p>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    </Box>
  );
}

export default MLflowGate;

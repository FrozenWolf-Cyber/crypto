import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useMaterialUIController } from "context";
import GrafanaLogo from "assets/images/logos/grafana-logo.png";
import bg from "assets/images/bg.jpg";
function GrafanaGate() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const GrafanaUrl = "https://grafana.gokuladethya.uk/";
  const username = "012345678910";
  const password = "012345678910";

  // Replace with your actual Grafana snapshot URLs
  const grafanaSnapshots = [
    "https://snapshots.raintank.io/dashboard/snapshot/4wrs6xoOx5ZjUvOsARZkxMF5NYGfZMif?orgId=0&refresh=10s&from=1759905856072&to=1759992256072",
    "https://snapshots.raintank.io/dashboard/snapshot/UPFKszZlZlTa4kVVc8Uo9W35dfmt9yRy?orgId=0&refresh=10s&from=1759905916075&to=1759992316075",
    "https://snapshots.raintank.io/dashboard/snapshot/pfVOidE4rxCwGeFpiIkg76KGmh4dXB5I?orgId=0&refresh=10s&from=1759988740459&to=1759992340459",
    "https://snapshots.raintank.io/dashboard/snapshot/l6AKeGlpRKqhPWyysuyo0KHnVJnHztJ5?orgId=0&refresh=10s&from=1759988760460&to=1759992360460",
    "https://snapshots.raintank.io/dashboard/snapshot/LaIGUDkq5aSZ84GapWLhGNV9zbcQx6P2?orgId=0&refresh=10s&from=1759988790460&to=1759992390460",
    "https://snapshots.raintank.io/dashboard/snapshot/14wJUSjB1MCjH9jMaMgAtVhhAeb0NenE?orgId=0&refresh=10s&from=1759988876594&to=1759992476594",
    "https://snapshots.raintank.io/dashboard/snapshot/4bPDLTcMiEt9sEFY0phDUz7BHWc8F3y2?orgId=0&refresh=10s&from=1759988918484&to=1759992518484",
    "https://snapshots.raintank.io/dashboard/snapshot/gmwjOgscjxrBp4LJbpz6B7wQsOx3IG6u?orgId=0&refresh=5s&from=1759989006729&to=1759992606729",
  ];

  return (
    <DashboardLayout>
      <MDBox
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="90vh"
        px={3}
        sx={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/45-degree-fabric-light.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Main Access Card */}
        <MDBox
          sx={{
            width: "650px",
            padding: 6,
            borderRadius: 3,
            textAlign: "center",
            boxShadow: darkMode ? "0 0 25px #000" : "0 0 25px #aaa",
            backgroundColor: darkMode ? "rgba(34,34,34,0.95)" : "rgba(255,255,255,0.95)",
            marginBottom: 6,
          }}
        >
          <img src={GrafanaLogo} style={{ height: "40px", marginBottom: "20px" }} />

          <h4 style={{ marginBottom: "20px" }}>🔒 Grafana Access Portal</h4>

          <p style={{ fontSize: "1rem", marginBottom: "10px" }}>
            Grafana cannot be embedded directly in this page. To view live dashboards, please open
            Grafana in a new tab.
            <br />
            Use the following credentials if prompted:
          </p>

          {/* Credentials */}
          <MDBox
            sx={{
              backgroundColor: darkMode ? "#111" : "#f0f0f0",
              padding: 3,
              borderRadius: 2,
              marginBottom: 5,
            }}
          >
            <p style={{ fontSize: "1.2rem", margin: 0 }}>
              <strong>Username:</strong> <code>{username}</code>
            </p>
            <p style={{ fontSize: "1.2rem", margin: 0 }}>
              <strong>Password:</strong> <code>{password}</code>
            </p>
          </MDBox>

          <MDButton
            variant="gradient"
            color="info"
            size="large"
            onClick={() => window.open(GrafanaUrl, "_blank")}
          >
            Go to Grafana
          </MDButton>

          <p style={{ marginTop: 20, fontSize: "0.9rem", color: darkMode ? "#aaa" : "#555" }}>
            Clicking the button opens Grafana in a new tab.
          </p>
        </MDBox>

        {/* Snapshot Section */}
        <MDBox width="100%" textAlign="center" mb={2}>
          <h2 style={{ color: darkMode ? "#fff" : "#333" }}>📊 Snapshot Previews</h2>
          <p style={{ color: darkMode ? "#aaa" : "#555" }}>
            Quick glance of Grafana dashboards below. For full interactivity, open Grafana.
          </p>
        </MDBox>

        {/* 2x6 Grid for Iframes */}
        {/* 2x6 Fixed Grid for Iframes */}
        {/* 6x2 Fixed Grid for Iframes */}
        {/* 1x12 Full-Width Snapshot Grid */}
        <MDBox
          display="grid"
          gridTemplateColumns="repeat(2, 1fr)"
          gap={4}
          px={3}
          pb={8}
          width="100%"
          mx="auto"
          sx={{
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-thumb": {
              background: darkMode ? "#444" : "#ccc",
              borderRadius: "4px",
            },
          }}
        >
          {grafanaSnapshots.map((url, index) => (
            <MDBox
              key={index}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: darkMode ? "0 0 20px #000" : "0 0 15px #ccc",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.01)",
                  boxShadow: darkMode
                    ? "0 0 25px rgba(255,255,255,0.2)"
                    : "0 0 25px rgba(0,0,0,0.2)",
                },
              }}
            >
              <iframe
                src={url}
                title={`Grafana Snapshot ${index + 1}`}
                width="100%"
                height="500" // taller snapshot view
                frameBorder="0"
                style={{ borderRadius: "8px" }}
              />
            </MDBox>
          ))}
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default GrafanaGate;

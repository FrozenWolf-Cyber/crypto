import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useMaterialUIController } from "context";

function WandB() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox
        py={3}
        px={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* First iframe */}
        <MDBox
          sx={{
            width: "100%",
            height: "100vh", // full viewport
            borderRadius: 2,
            overflow: "hidden",
            border: darkMode ? "1px solid #444" : "1px solid #ddd",
          }}
        >
          <iframe
            src="https://wandb.ai/frozenwolf/mlops/workspace?nw=nwuserfrozenwolf"
            title="WandB Monitor"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </MDBox>

        {/* Second iframe */}
        <MDBox
          sx={{
            width: "100%",
            height: "100vh", // full viewport
            borderRadius: 2,
            overflow: "hidden",
            border: darkMode ? "1px solid #444" : "1px solid #ddd",
          }}
        >
          <iframe
            src="https://wandb.ai/frozenwolf/mlops/reports/Crypto-MLOPs-Live-Report--VmlldzoxNDY2NDQ2Mw"
            title="WandB Report"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default WandB;

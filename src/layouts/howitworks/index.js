import React from "react";
import MDBox from "components/MDBox";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import demo1 from "assets/demo/1.png";
import demo2 from "assets/demo/2.png";
import demo3 from "assets/demo/3.png";
import demo4 from "assets/demo/4.png";
import demo5 from "assets/demo/5.png";
import demo6 from "assets/demo/6.png";
import demo7 from "assets/demo/7.png";
import demo8 from "assets/demo/8.png";
import demo9 from "assets/demo/9.png";
import demo10 from "assets/demo/10.png";
import demo11 from "assets/demo/11.png";
import demo12 from "assets/demo/12.png";
import demo13 from "assets/demo/13.png";
import demo14 from "assets/demo/14.png";
import demo15 from "assets/demo/15.png";
import demo16 from "assets/demo/16.png";
import demo17 from "assets/demo/17.png";
import arch from "assets/demo/arch.jpg";
import k8 from "assets/demo/k8.png";
import Button from "@mui/material/Button";
import DarkModeToggle from "layouts/dashboard/components/darkmode";
import { useMaterialUIController, setDarkMode } from "context";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import { vh } from "framer-motion";
import { useState } from "react";
import CardContent from "@mui/material/CardContent";
const demoImages1 = [demo1, demo2, demo3, demo4, demo5, demo6, demo7, demo8];
const demoImages2 = [demo9, demo10, demo11, demo12, demo13, demo14, demo15, demo16, demo17];
const HowItWorks = () => {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;
  const handleDarkModeToggle = () => {
    setDarkMode(dispatch, !darkMode);
  };
  const [archOpen, setArchOpen] = useState(true); // open by default
  const [k8sOpen, setK8sOpen] = useState(false); // collapsed by default

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box display="flex" alignItems="center" gap={1} p={2}>
        <Typography variant="h6">{darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}</Typography>
        <Switch checked={darkMode} onChange={handleDarkModeToggle} />
      </Box>
      <MDBox
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="90vh"
        px={3}
      >
        {/* ===== Header Section ===== */}
        <div className="container text-center mb-5">
          <h1 className="fw-bold mb-2">Crypto MLOps Pipeline</h1>
          <p className="text-secondary">
            End-to-end orchestration on Kubernetes using FastAPI, Airflow, and Grafana
          </p>
          <a
            href="https://github.com/FrozenWolf-Cyber/crypto-mlops"
            target="_blank"
            rel="noreferrer"
            className="btn btn-dark border border-light mt-3"
          >
            <i className="bi bi-github fs-5 me-2"></i> GitHub
          </a>
        </div>

        {/* ===== Architecture Section ===== */}
        <Box textAlign="center" mb={5}>
          <Grid container justifyContent="center" spacing={2} mb={4}>
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setArchOpen((prev) => !prev)}
              >
                <Typography variant="h6">View Entire Setup</Typography>
              </Button>
            </Grid>

            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setK8sOpen((prev) => !prev)}
              >
                <Typography variant="h6">View Kubernetes Namespace Setup</Typography>
              </Button>
            </Grid>
          </Grid>

          {/* Collapsible Sections */}
          <Collapse in={archOpen} timeout="auto" unmountOnExit>
            <Box mb={4}>
              <img
                src={arch}
                className="img-fluid rounded shadow"
                alt="Main Architecture"
                width={1000}
                height={800}
                style={{ maxWidth: "100%" }}
              />
            </Box>
          </Collapse>

          <Collapse in={k8sOpen} timeout="auto" unmountOnExit>
            <Box>
              <img
                src={k8}
                className="img-fluid rounded shadow"
                alt="Kubernetes Setup"
                style={{ maxWidth: "100%" }}
              />
            </Box>
          </Collapse>
        </Box>
        {/* ===== Demo Section (Carousel) ===== */}
        <div className="container mb-5">
          <Typography variant="h4" gutterBottom textAlign="center" mb={4}>
            <h2 className="fw-bold mb-4">Demo</h2>
          </Typography>
          <div className="row">
            {/* First Carousel */}
            <div className="col-md-6 mb-3">
              <div id="carousel1" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                  {demoImages1.map((img, index) => (
                    <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                      <img
                        src={img}
                        className="d-block w-100 rounded shadow"
                        alt={`Demo1 ${index + 1}`}
                        style={{ objectFit: "cover", height: "600px" }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carousel1"
                  data-bs-slide="prev"
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carousel1"
                  data-bs-slide="next"
                >
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </div>

            {/* Second Carousel */}
            <div className="col-md-6 mb-3">
              <div id="carousel2" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                  {demoImages2.map((img, index) => (
                    <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                      <img
                        src={img}
                        className="d-block w-100 rounded shadow"
                        alt={`Demo2 ${index + 1}`}
                        style={{ objectFit: "cover", height: "600px" }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carousel2"
                  data-bs-slide="prev"
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carousel2"
                  data-bs-slide="next"
                >
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <Box mb={5} width="100%">
          <Grid container spacing={3}>
            {/* Data Pipeline */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: darkMode ? "grey.900" : "background.paper",
                  color: darkMode ? "grey.100" : "text.primary",
                  boxShadow: darkMode
                    ? "0 4px 12px rgba(255,255,255,0.05)"
                    : "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Data Pipeline
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Collects live <strong>BTC/USDT prices</strong> from Binance API and scrapes
                    cryptocurrency news from Yahoo Finance. Generates two types of labels:
                  </Typography>
                  <ul>
                    <li>
                      <strong>Time-Series:</strong> Determines Buy/Hold/Sell based on price trends
                      and percentage changes.
                    </li>
                    <li>
                      <strong>Text-Based:</strong> Evaluates news impact by comparing average price
                      change over the 12 hours after publication to assign Buy/Hold/Sell.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Grid>

            {/* Training */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: darkMode ? "grey.900" : "background.paper",
                  color: darkMode ? "grey.100" : "text.primary",
                  boxShadow: darkMode
                    ? "0 4px 12px rgba(255,255,255,0.05)"
                    : "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Model Training
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Time-Series Models:</strong> TST, LightGBM for predicting price trends.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Text-Based Models (TRL):</strong> FinBERT fine-tuned using
                    Gradient-Regularized Policy Optimization (GRPO) with LoRA adapters.
                    <br />
                    This reframes financial news sentiment as a reinforcement learning problem,
                    where the model aligns predictions with market reactions.
                  </Typography>
                  <Typography variant="body2">
                    Efficient even with limited labeled data. Reward signals are derived from price
                    change magnitudes, combined with KL regularization for stable learning.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Model Versioning */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: darkMode ? "grey.900" : "background.paper",
                  color: darkMode ? "grey.100" : "text.primary",
                  boxShadow: darkMode
                    ? "0 4px 12px rgba(255,255,255,0.05)"
                    : "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Model Versioning
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Models are logged in MLflow with an S3 backend. Versioning strategy:
                  </Typography>
                  <ul>
                    <li>v1: Baseline, fixed</li>
                    <li>v2 & v3: Active production models</li>
                    <li>Last 10 models are archived for rollback or analysis</li>
                  </ul>
                  <Typography variant="body2">
                    Public read-only access is enabled via a viewer behind ingress for transparency.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Inference */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: darkMode ? "grey.900" : "background.paper",
                  color: darkMode ? "grey.100" : "text.primary",
                  boxShadow: darkMode
                    ? "0 4px 12px rgba(255,255,255,0.05)"
                    : "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Model Inference
                  </Typography>
                  <Typography variant="body1" paragraph>
                    ONNX compiled models are hosted in FastAPI pods. Supports:
                  </Typography>
                  <ul>
                    <li>/refresh endpoint to dynamically load the latest models from MLflow.</li>
                    <li>Prometheus instrumentation to monitor inference performance.</li>
                    <li>Integration with Grafana dashboards for real-time monitoring.</li>
                  </ul>
                </CardContent>
              </Card>
            </Grid>

            {/* Orchestration */}
            <Grid item xs={12}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: darkMode ? "grey.900" : "background.paper",
                  color: darkMode ? "grey.100" : "text.primary",
                  boxShadow: darkMode
                    ? "0 4px 12px rgba(255,255,255,0.05)"
                    : "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Pipeline Orchestration
                  </Typography>
                  <Typography variant="body1" paragraph>
                    - Kafka producer streams real-time price data. <br />- Independent consumer pods
                    read data, perform inference, and update PostgreSQL. <br />- Airflow manages
                    Vast.ai pods for automated training, including early stopping, S3 storage, and
                    post-training reconciliation.
                  </Typography>
                  <Typography variant="body2">
                    Detailed reconciliation ensures continuous service without downtime, by stopping
                    outdated consumers, updating predictions, and restarting consumers seamlessly.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* TRL Orchestration */}
            <Grid item xs={12}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: darkMode ? "grey.900" : "background.paper",
                  color: darkMode ? "grey.100" : "text.primary",
                  boxShadow: darkMode
                    ? "0 4px 12px rgba(255,255,255,0.05)"
                    : "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    TRL Orchestration
                  </Typography>
                  <Typography variant="body1" paragraph>
                    - News scraping occurs every 30 minutes. <br />
                    - New ONNX models are compiled if not available. <br />
                    - TRL inference is performed and results are pushed to PostgreSQL. <br />
                    This process ensures that financial news always contributes to updated model
                    predictions.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Kubernetes Setup */}
            <Grid item xs={12}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: darkMode ? "grey.900" : "background.paper",
                  color: darkMode ? "grey.100" : "text.primary",
                  boxShadow: darkMode
                    ? "0 4px 12px rgba(255,255,255,0.05)"
                    : "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Kubernetes Setup
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Namespaces and pods for organized deployment:
                  </Typography>
                  <ul>
                    <li>
                      <strong>Platform:</strong> MLflow, FastAPI inference, backend,
                      producer-consumer, Airflow
                    </li>
                    <li>
                      <strong>Ingress-NGINX:</strong> Reverse proxy for dashboard, Grafana, MLflow
                    </li>
                    <li>
                      <strong>Cert-Manager:</strong> TLS certificate management
                    </li>
                    <li>
                      <strong>Prometheus:</strong> Metrics collection & monitoring
                    </li>
                    <li>
                      <strong>Kafka:</strong> Docker container for message streaming
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        {/* ===== Footer Spacing ===== */}
        <div className="my-5"></div>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default HowItWorks;

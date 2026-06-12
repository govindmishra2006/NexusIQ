import { createFileRoute } from "@tanstack/react-router";
import App from "../App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexusIQ — 30-Second CEO Brief for Shopify Merchants" },
      {
        name: "description",
        content:
          "NexusIQ ingests your Shopify orders, runs IQR anomaly detection, and generates an executive brief in seconds.",
      },
      { property: "og:title", content: "NexusIQ — 30-Second CEO Brief" },
      {
        property: "og:description",
        content:
          "Hyper-premium analytics for Shopify merchants. Detect anomalies, surface trends, get your CEO brief instantly.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: App,
});

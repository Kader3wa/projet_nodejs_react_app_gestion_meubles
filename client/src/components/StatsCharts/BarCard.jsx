import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";
import { useMemo } from "react";
import { palette } from "./colors";

BarCard.propTypes = {
  title: PropTypes.string.isRequired,
  labels: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
};

export default function BarCard({
  title,
  labels = [],
  data = [],
  label = "Valeur",
}) {
  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          id: "v1",
          label,
          data: data.map((v) => Number(v || 0)),
          backgroundColor: palette[0],
          borderColor: "#0a58ca",
          borderWidth: 1,
        },
      ],
    }),
    [labels, data, label]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.08)" },
          ticks: { font: { size: 11 } },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
      },
    }),
    []
  );

  const k = useMemo(
    () => `${labels.join("|")}::${data.join("|")}`,
    [labels, data]
  );

  return (
    <div className="card shadow-sm" style={{ minHeight: 380 }}>
      <div className="card-body">
        <h6 className="text-muted mb-3">{title}</h6>
        <div style={{ height: 300 }}>
          <Bar
            data={chartData}
            options={options}
            redraw
            key={k}
            datasetIdKey="id"
          />
        </div>
      </div>
    </div>
  );
}

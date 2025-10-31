import { Pie } from "react-chartjs-2";
import PropTypes from "prop-types";
import { useMemo } from "react";
import { palette } from "./colors";

PieCard.propTypes = {
  title: PropTypes.string.isRequired,
  labels: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
};

export default function PieCard({ title, labels = [], data = [] }) {
  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: data.map((v) => Number(v || 0)),
          backgroundColor: palette.slice(0, data.length),
          borderColor: palette.slice(0, data.length).map((c) => c + "80"),
          borderWidth: 1,
        },
      ],
    }),
    [labels, data]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 12, font: { size: 11 } },
        },
        tooltip: { enabled: true },
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
          <Pie
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

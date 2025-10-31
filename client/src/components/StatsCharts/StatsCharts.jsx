import PropTypes from "prop-types";
import PieCard from "./PieCard";
import BarCard from "./BarCard";

StatsCharts.propTypes = {
  materials: PropTypes.array,
  companies: PropTypes.array,
  categories: PropTypes.array,
};

export default function StatsCharts({
  materials = [],
  companies = [],
  categories = [],
}) {
  const ready = materials.length || companies.length || categories.length;
  if (!ready) return null;

  return (
    <div className="mt-5">
      <h5 className="mb-3">Statistiques</h5>
      <div className="row g-4">
        <div className="col-12 col-md-6">
          <PieCard
            title="Répartition des matières"
            labels={materials.map((m) => m.name)}
            data={materials.map((m) => Number(m.total_qty || 0))}
          />
        </div>
        <div className="col-12 col-md-6">
          <PieCard
            title="Répartition par fournisseur"
            labels={companies.map((c) => c.company)}
            data={companies.map((c) => Number(c.total_qty || 0))}
          />
        </div>
        <div className="col-12 col-md-6">
          <BarCard
            title="Top matériaux"
            labels={materials.map((m) => m.name)}
            data={materials.map((m) => Number(m.total_qty || 0))}
            label="Quantité"
          />
        </div>
        <div className="col-12 col-md-6">
          <BarCard
            title="Réalisations par catégorie"
            labels={categories.map((c) => c.category)}
            data={categories.map((c) => Number(c.build_count || 0))}
            label="Meubles"
          />
        </div>
      </div>
    </div>
  );
}

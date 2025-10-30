import { useMemo, useState } from "react";
import PropTypes from "prop-types";

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  pageSize: PropTypes.number,
};

export default function DataTable({ columns, rows, pageSize = 10 }) {
  const [sort, setSort] = useState({ key: columns[0].key, dir: "asc" });
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const x = a[sort.key],
        y = b[sort.key];
      if (x == null && y != null) return sort.dir === "asc" ? 1 : -1;
      if (x != null && y == null) return sort.dir === "asc" ? -1 : 1;
      if (x === y) return 0;
      return (x > y ? 1 : -1) * (sort.dir === "asc" ? 1 : -1);
    });
    return copy;
  }, [rows, sort]);

  const start = (page - 1) * pageSize;
  const slice = sorted.slice(start, start + pageSize);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));

  const toggle = (key) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );

  return (
    <>
      <table className="table align-middle">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} role="button" onClick={() => toggle(c.key)}>
                {c.label}
                {sort.key === c.key ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
              </th>
            ))}
            <th style={{ width: 140 }}></th>
          </tr>
        </thead>
        <tbody>
          {slice.map((r) => (
            <tr key={r.id}>
              {columns.map((c) => (
                <td key={c.key}>
                  {c.render ? c.render(r[c.key], r) : r[c.key]}
                </td>
              ))}
              <td className="text-end">{r.actions}</td>
            </tr>
          ))}
          {slice.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center text-muted"
              >
                Aucune donnée
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-end gap-2">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Préc.
        </button>
        <span className="small align-self-center">
          {page}/{pages}
        </span>
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Suiv.
        </button>
      </div>
    </>
  );
}

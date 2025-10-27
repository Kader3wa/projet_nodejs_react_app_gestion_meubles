import { useEffect, useState } from "react";
import { apiHello } from "./Api";

export default function App() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    apiHello()
      .then((data) => {
        console.log(data);
        setData(data);
      })
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">
        <i className="bi bi-box-seam"></i> Meuble Management Client
      </h1>
      {err && <div className="alert alert-danger">Error: {err}</div>}
      {data && (
        <div className="alert alert-success">
          Message from API: {data.message}
        </div>
      )}
    </div>
  );
}

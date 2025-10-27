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
    <div>
      <h1>Meuble Management Client</h1>
      {err && <p style={{ color: "red" }}>Error: {err}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

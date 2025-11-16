import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ConfirmSubscribePage() {
  const { token } = useParams();
  const [status, setStatus] = useState("Confirming...");

  useEffect(() => {
    axios.get(`https://192.168.1.17:2025/confirm-subscribe/${token}`)
      .then(res => setStatus(res.data.message))
      .catch(err => setStatus(err.response?.data?.message || "Something went wrong"));
  }, [token]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>{status}</h2>
    </div>
  );
}

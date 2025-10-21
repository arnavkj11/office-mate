import React, { useEffect, useState } from "react";
import api from "../../api/client";
import AppointmentForm from "../../components/AppointmentForm";
import AppointmentList from "../../components/AppointmentList";

export default function Appointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/appointments");
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <AppointmentForm onCreated={load} />
      <div style={{ height: 12 }} />
      {loading ? <div className="card">Loading…</div> : <AppointmentList items={list} />}
    </>
  );
}

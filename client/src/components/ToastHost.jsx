import { useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import PropTypes from "prop-types";
import { ToastContext } from "../context/ToastContext";

ToastHost.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function ToastHost({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = (msg, variant = "success") =>
    setToasts((t) => [...t, { id: Date.now(), msg, variant }]);
  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={show}>
      {children}
      <ToastContainer position="top-center" className="p-3">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            onClose={() => remove(t.id)}
            bg={t.variant}
            delay={2500}
            autohide
          >
            <Toast.Body className="text-white">{t.msg}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

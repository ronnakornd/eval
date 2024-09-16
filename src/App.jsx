import "./App.css";
import { useState, useEffect } from "react";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Class from "./pages/Class";
import FormEdit from "./pages/FormEdit";
import FormSubmit from "./pages/FormSubmit";
import FormUpdate from "./pages/FormUpdate";
import "@fontsource/pridi";

function App() {
  useEffect(() => {
    // Prevent pinch-to-zoom
    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Add event listener
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/:tab" element={<Dashboard />} />
              <Route path="/class/:class_id" element={<Class />} />
              <Route path="/form/create" element={<FormEdit />} />
              <Route path="/form/edit/:form_id" element={<FormEdit />} />
              <Route path="/form/submit/" element={<FormSubmit />} />
              <Route path="/form/update/:form_id" element={<FormUpdate />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;

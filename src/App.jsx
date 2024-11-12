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
      <BrowserRouter basename="/">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} >
                  <Route index element={<Dashboard />} />
                  <Route path=":tab" element={<Dashboard/>}/>
              </Route>
              <Route path="/submit/" element={<FormSubmit />} />
              <Route path="form_submit" element={<FormSubmit />} />
              <Route path="form_update" element={<FormUpdate  />} />
              <Route path="form_edit" element={<FormEdit />} />
              <Route path="class" element={<Class/>} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;

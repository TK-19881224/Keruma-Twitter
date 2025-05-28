// src/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20 px-4">
        <Outlet /> {/* 各ページがここに表示される */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
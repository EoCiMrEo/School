import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/ui/Header";

const PropertiesLayout = () => {
  return (
    <>
      <Header />
      {/* Match Header fixed height to avoid extra gap */}
      <main className="pt-14 lg:pt-16">
        <Outlet />
      </main>
    </>
  );
};

export default PropertiesLayout;

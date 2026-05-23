import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../../components/ui/Header";

const QuotesLayout = () => {
  const location = useLocation();
  const path = location.pathname.replace(/\/+$/, "");
  const hideHeader = path === "/quotes/create" || path === "/create-quote";
  return (
    <>
      {!hideHeader && <Header />}
      {/* Match header height: h-14 on base, lg:h-16 on large */}
      <main className={hideHeader ? "" : "pt-14 lg:pt-16"}>
        <Outlet />
      </main>
    </>
  );
};

export default QuotesLayout;

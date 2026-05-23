"use client";

import Navbar from "@/components/ui/navbar";
import Image from "next/image";
// import LoginPage from "./login/page";
import Home from "./homepage/page";

export default function HomePage() {
  return (
    <body>
      <Navbar></Navbar>
      <Home></Home>
    </body>
  );
}

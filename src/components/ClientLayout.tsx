"use client";
import React from "react";
import ClientHeader from "@/components/ClientHeader";
import Footer from "@/components/Footer";

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ClientHeader />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
};

export default ClientLayout;

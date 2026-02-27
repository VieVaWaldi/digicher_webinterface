"use client";

import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import { ListViewContainer } from "@/components/listview/ListViewContainer";
import { Box } from "@mui/material";

export default function ListView() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Navbar />
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Suspense>
          <ListViewContainer />
        </Suspense>
      </Box>
    </Box>
  );
}

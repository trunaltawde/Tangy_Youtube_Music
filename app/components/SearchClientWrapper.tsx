"use client";

import React, { useEffect, useState } from "react";
import SearchClient from "./SearchClient";

export default function SearchClientWrapper() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <SearchClient />;
}

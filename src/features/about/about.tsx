"use client";
import { Button } from "@/components/ui/button/button";
import { useState } from "react";
import { AboutMeModal } from "./components/aboutMeModal/aboutMeModal";
import "./css/about.css";
export const About = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="about">
      <Button variant="link" onClick={() => setIsOpen(true)}>
        Om oss
      </Button>

      <AboutMeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

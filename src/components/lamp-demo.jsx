import React from "react";
import { motion } from "motion/react";
import { LampContainer } from "@/components/ui/lamp";

export default function LampDemo({ children }) {
    return (
        <LampContainer>
            {children}
        </LampContainer>
    );
}

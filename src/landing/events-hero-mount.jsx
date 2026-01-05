import { createRoot } from "react-dom/client"
import Threads from "@/components/react-bits/Threads"

const mount = document.getElementById("events-hero-threads")

if (mount) {
    createRoot(mount).render(
        <Threads
            color={[0.043137254901960784, 0.25098039215686274, 0.8784313725490196]}
            amplitude={2.8}
            distance={0}
            enableMouseInteraction
            style={{ width: "100%", height: "100%" }}
        />
    )
}

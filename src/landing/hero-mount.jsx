import { createRoot } from "react-dom/client"
import HeroGradientBlinds from "./HeroGradientBlinds.jsx"
import SplitText from "@/components/react-bits/SplitText"
import TextType from "@/components/react-bits/TextType"
import SectionBlur from "@/components/react-bits/SectionBlur"

const mount = document.getElementById("hero-floating-lines")
const headlineMount = document.getElementById("hero-headline-split")
const typeMount = document.getElementById("fitfindr-type")
const connectMount = document.getElementById("connect-type")
const blogMount = document.getElementById("home_blogs_blur")

if (mount) {
  createRoot(mount).render(<HeroGradientBlinds />)
}

if (headlineMount) {
  createRoot(headlineMount).render(
    <SplitText
      text="TRAINING MADE PERSONAL"
      delay={90}
      duration={0.8}
      startOnVisible
      restartOnVisible
      className="split-hero-headline"
    />
  )
}

if (typeMount) {
  createRoot(typeMount).render(
    <TextType
      text="FIND YOUR PERFECT FIT WITH FITFINDR"
      typingSpeed={75}
      pauseDuration={1500}
      showCursor
      cursorCharacter="|"
      loop={false}
      startOnVisible
      restartOnVisible
      className="fitfindr-type-text"
    />
  )
}

if (connectMount) {
  createRoot(connectMount).render(
    <TextType
      text="CONNECT WITH PROS, COMMUNITY, AND EVENTS"
      typingSpeed={75}
      pauseDuration={1500}
      showCursor
      cursorCharacter="|"
      loop={false}
      startOnVisible
      restartOnVisible
      className="fitfindr-type-text"
    />
  )
}

// Blog blur removed


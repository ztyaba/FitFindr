import FloatingLines from "@/components/react-bits/FloatingLines"

export default function HeroFloatingLines() {
  return (
    <div className="hero-floating-lines">
      <FloatingLines
        linesGradient={["#9e939f", "#666870", "#131620"]}
        animationSpeed={1}
        interactive
        bendRadius={5}
        bendStrength={-0.5}
        mouseDamping={0.05}
        parallax
        parallaxStrength={0.2}
      />
    </div>
  )
}

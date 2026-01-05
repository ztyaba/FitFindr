import GradientBlinds from "@/components/react-bits/GradientBlinds"

export default function HeroGradientBlinds() {
  return (
    <div className="hero-gradient-blinds">
      <GradientBlinds
        gradientColors={["#7474aa", "#002cdb"]}
        angle={114}
        noise={0.17}
        blindCount={39}
        blindMinWidth={50}
        mouseDampening={0.15}
        mirrorGradient={false}
        spotlightRadius={0.5}
        spotlightSoftness={0.9}
        spotlightOpacity={1}
        distortAmount={0.85}
        shineDirection="right"
      />
    </div>
  )
}

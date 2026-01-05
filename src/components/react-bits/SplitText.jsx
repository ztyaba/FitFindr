import { useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"

const defaultFrom = { opacity: 0, y: 40 }
const defaultTo = { opacity: 1, y: 0 }

export default function SplitText({
  text = "",
  className = "",
  delay = 90,
  duration = 0.8,
  ease = "power3.out",
  tag = "span",
  from = defaultFrom,
  to = defaultTo,
  onAnimationComplete,
  startOnVisible = false,
  restartOnVisible = false,
}) {
  const containerRef = useRef(null)
  const chars = useMemo(() => Array.from(text), [text])
  const observerRef = useRef(null)
  const timelineRef = useRef(null)
  const [isVisible, setIsVisible] = useState(!startOnVisible)

  useGSAP(
    () => {
      if (!containerRef.current || !chars.length || !isVisible) return
      const targets = containerRef.current.querySelectorAll(".split-char")
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
      timelineRef.current = gsap.fromTo(
        targets,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          onComplete: () => onAnimationComplete?.(),
        }
      )
    },
    { dependencies: [text, delay, duration, ease, JSON.stringify(from), JSON.stringify(to), isVisible] }
  )

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return

    const resetState = () => {
      if (!containerRef.current) return
      const targets = containerRef.current.querySelectorAll(".split-char")
      gsap.set(targets, { ...from })
    }

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (restartOnVisible) resetState()
            setIsVisible(true)
          } else if (restartOnVisible) {
            setIsVisible(false)
          }
        })
      },
      { threshold: 0.2 }
    )

    observerRef.current.observe(containerRef.current)
    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [startOnVisible, restartOnVisible, from])

  const content = (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {chars.map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="split-char"
            style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </>
  )

  if (tag === "h1") return <h1 ref={containerRef} className={className}>{content}</h1>
  if (tag === "h2") return <h2 ref={containerRef} className={className}>{content}</h2>
  if (tag === "h3") return <h3 ref={containerRef} className={className}>{content}</h3>
  if (tag === "h4") return <h4 ref={containerRef} className={className}>{content}</h4>
  if (tag === "h5") return <h5 ref={containerRef} className={className}>{content}</h5>
  if (tag === "h6") return <h6 ref={containerRef} className={className}>{content}</h6>
  if (tag === "p") return <p ref={containerRef} className={className}>{content}</p>
  return (
    <span ref={containerRef} className={className}>
      {content}
    </span>
  )
}

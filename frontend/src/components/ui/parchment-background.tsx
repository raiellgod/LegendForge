import Image from "next/image"

export function ParchmentBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src="/images/parchment-bg.jpg"
        alt="background"
        fill
        priority
        className="object-cover object-center"
      />
    </div>
  )
}
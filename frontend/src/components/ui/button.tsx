type ButtonProps = {
  children: React.ReactNode
  variant?: "primary" | "outline"
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex h-[55px] w-[175px] items-center justify-center rounded-[20px] border-2 px-5 py-2.5 text-sm font-bold transition-all duration-200 hover:shadow-dark disabled:cursor-not-allowed disabled:opacity-70"

  const variants = {
    primary:
      "border-forge-gold bg-forge-purple text-forge-gold hover:bg-[#3f0b61]",
    outline:
      "border-forge-purple bg-forge-parchment/40 text-forge-purple hover:bg-forge-purple hover:text-forge-gold",
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
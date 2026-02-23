import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side — branded background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-navy overflow-hidden">
        <Image
          src="/images/background-login.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-10 flex flex-col justify-between w-full p-5">
          {/* Logo */}
          <div>
            <h2 className="text-white text-2xl">
              <span className="font-bold">AIDOI</span>{" "}
              <span className="font-light">Portal</span>
            </h2>
          </div>

          {/* Center text */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-white text-9xl font-bold tracking-tight mb-2">
              AIDOI
            </h1>
            <p className="text-white/90 text-2xl max-w-md leading-relaxed">
              The Global Registry for AI Digital Objects.
              <br />
              Secure your AI assets today.
            </p>
          </div>

          {/* Spacer */}
          <div />
        </div>
      </div>

      {/* Right side — form area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

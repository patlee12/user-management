export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <main className="min-h-full bg-background text-foreground p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl shadow-2xl border border-border p-10 bg-card space-y-10 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 group">
        <div className="flex flex-col items-center space-y-6">
          <img
            src="/images/pat.png"
            alt="Profile"
            className="w-36 h-36 rounded-full border-4 border-primary object-cover transition-transform duration-300 group-hover:scale-105 hover:shadow-xl hover:ring-4 hover:ring-primary/40"
          />

          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight transition-colors duration-200 group-hover:text-primary">
              Patrick Lee
            </h1>
            <p className="text-lg text-muted-foreground mt-1 transition-opacity duration-200 group-hover:opacity-90">
              Software Engineer
            </p>
          </div>
        </div>

        <div className="text-center text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto transition-opacity duration-300 group-hover:opacity-95">
          Passionate about building scalable web apps, writing clean code, and
          sipping coffee ☕. <br />
          Currently exploring Bitcoin dev & decentralized tech.
        </div>

        <div className="grid grid-cols-2 gap-6 text-lg text-center text-muted-foreground pt-4">
          <div className="transition-transform duration-200 hover:scale-105 hover:text-primary cursor-default">
            <div className="font-semibold text-foreground text-xl">Boston</div>
            <div>📍 Location</div>
          </div>
          <div className="transition-transform duration-200 hover:scale-105 hover:text-primary cursor-default">
            <div className="font-semibold text-foreground text-xl">9 years</div>
            <div>Experience</div>
          </div>
          <div className="transition-transform duration-200 hover:scale-105 hover:text-primary cursor-default">
            <div className="font-semibold text-foreground text-xl">
              @patlee12
            </div>
            <div>GitHub</div>
          </div>
          <div className="transition-transform duration-200 hover:scale-105 cursor-pointer">
            <a
              href="https://bitstackdynamic.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground text-xl hover:text-primary transition-colors duration-200"
            >
              bitstackdynamic.io
            </a>
            <div>Website</div>
          </div>
        </div>

        <div className="flex justify-center gap-6 pt-8">
          <a
            href="mailto:pat@bitstackdynamic.io"
            className="bg-primary text-primary-foreground text-lg font-medium px-6 py-3 rounded-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            Email
          </a>
          <a
            href="https://github.com/patlee12"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border text-lg font-medium px-6 py-3 rounded-xl transition-transform duration-300 hover:bg-muted hover:-translate-y-1 hover:shadow-md"
          >
            Follow
          </a>
        </div>
      </div>
    </main>
  );
}

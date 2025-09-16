export default function BetaBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] w-full border-b border-amber-600/50 bg-gradient-to-r from-amber-900/50 via-amber-800/40 to-amber-900/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-2 flex flex-col sm:flex-row items-center justify-center gap-2 text-amber-100 text-sm">
        <span className="font-semibold uppercase tracking-wide text-amber-300">
          Beta
        </span>
        <span className="text-center sm:text-left">
          This site is in <span className="font-medium text-amber-200">active development</span>.
          Expect improvements, new features, and occasional bugs.
        </span>
      </div>
    </div>
  );
}

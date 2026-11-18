export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background/80 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-1 text-center">
        <p className="text-xs text-muted-foreground">
          © {year} JuryScore — Tous droits réservés.
        </p>
        <p className="text-xs text-muted-foreground">
          Made with <span className="text-[color:var(--heart)]">💗</span> by{" "}
          <a
            href="https://freeti.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Free Tech Institute
          </a>
        </p>
      </div>
    </footer>
  );
}

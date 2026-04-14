export default function SectionShell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <section className={`mx-auto w-full max-w-6xl px-6 py-20 md:px-10 ${className}`}>
      {children}
    </section>
  );
}

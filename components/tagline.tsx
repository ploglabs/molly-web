import { Fragment } from "react";

export function Tagline({ lines }: { lines: readonly string[] }) {
  const accentLast = lines.length > 1;

  return (
    <p className="mb-0 max-w-md text-sm font-mono leading-relaxed text-neutral-500">
      {lines.map((line, i) => (
        <Fragment key={line}>
          {i > 0 ? <br /> : null}
          {accentLast && i === lines.length - 1 ? (
            <span className="text-zinc-500">{line}</span>
          ) : (
            line
          )}
        </Fragment>
      ))}
    </p>
  );
}

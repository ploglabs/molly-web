"use client";

// georgia11 figlet ASCII art for "> molly"
const LINES = [
  `                                                             `,
  `                                         ,,    ,,            `,
  `                                       \`7MM  \`7MM            `,
  `\`\\\\.                                     MM    MM            `,
  `   \`\\\\:.      \`7MMpMMMb.pMMMb.  ,pW"Wq.    MM      MM \`7M'   \`MF'`,
  `      \`\\\\.      MM    MM    MM 6W'   \`Wb MM    MM   VA   ,V  `,
  `     ,;//'      MM    MM    MM 8M     M8 MM    MM    VA ,V   `,
  `  ,;//'         MM    MM    MM YA.   ,A9 MM    MM     VVV    `,
  `,//'          .JMML  JMML  JMML.\`Ybmd9'.JMML..JMML.   ,V     `,
  `                                                     ,V      `,
  `                                                  OOb"       `,
];

export function MollyAscii() {
  return (
    <div
      role="img"
      aria-label="molly"
      className="w-full overflow-x-auto no-scrollbar"
    >
      <pre className="ascii-logo leading-[1.05] tracking-tight select-none cursor-crosshair font-mono">
        {LINES.map((line, lineIdx) => (
          <span key={lineIdx} className="block">
            {Array.from(line).map((char, colIdx) => {
              if (char === " ") {
                return (
                  <span key={colIdx} className="inline-block w-[1ch]">
                    {" "}
                  </span>
                );
              }
              return (
                <span
                  key={colIdx}
                  className="ascii-char inline-block text-neutral-500 transition-colors duration-75 hover:text-neutral-100"
                  data-active="false"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).setAttribute(
                      "data-active",
                      "true",
                    );
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).setAttribute(
                      "data-active",
                      "false",
                    );
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        ))}
      </pre>
    </div>
  );
}

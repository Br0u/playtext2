import { useMemo } from "react";
import { getFragmentLines } from "../layout/pretext";

type TextFragmentProps = {
  text: string;
  active: boolean;
  width?: number;
  style?: React.CSSProperties;
};

export function TextFragment({ text, active, width = 520, style }: TextFragmentProps) {
  const lines = useMemo(() => getFragmentLines(text, width), [text, width]);

  return (
    <p className={`text-fragment ${active ? "is-active" : ""}`} style={style}>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="text-fragment-line">
          {line}
        </span>
      ))}
    </p>
  );
}

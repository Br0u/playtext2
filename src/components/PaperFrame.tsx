import type { PropsWithChildren } from "react";

export function PaperFrame({ children }: PropsWithChildren) {
  return <section className="paper-frame">{children}</section>;
}

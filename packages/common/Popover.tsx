import React, { useRef, useState } from "react";

// WIP
// TODO: positioning (param should be reworked: "top" | "bottom" | "left" | "right" should be enough)
// TODO: aria is missing
// TODO: see if we can use forwardRef (and merge)
// TODO: see that we can control it from outside (open/close)
// Improvements: stay relative to the parent (not the body), unlike reactjs-popup
// Fixes: reactjs-popup breaking HDS Select (close on select click)
export function Popup ({ trigger, children, position }: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: [string, string];
}): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return <div
    style={{ background: "red", position: "relative" }}
    ref={ref} onClick={() => setIsOpen(!isOpen)}>
    {trigger}
    <div style={{
      position: "absolute",
      zIndex: 1000,
      display: isOpen ? "block" : "none",
      // top: ref.current?.getBoundingClientRect().top,
      // left: ref.current?.getBoundingClientRect().left,
    }}>
      {children}
    </div>
  </div>;
}

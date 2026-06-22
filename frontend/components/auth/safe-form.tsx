"use client";

import * as React from "react";

type SafeFormProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, "method" | "noValidate">;

/**
 * Form wrapper that blocks native GET submits without SSR/client attribute mismatch.
 * method="post" and novalidate are applied after mount so server and client HTML match.
 */
export function SafeForm({ onSubmit, ...props }: SafeFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    form.method = "post";
    form.noValidate = true;
  }, []);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      {...props}
    />
  );
}

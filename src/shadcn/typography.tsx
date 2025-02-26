import { cn } from "shadcn/utils/shadcn-utils";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function H1({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2
      className={cn(
        "scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className }: TypographyProps) {
  return (
    <h3
      className={cn(
        "scroll-m-20 pb-2 text-2xl font-semibold tracking-tight first:mt-0",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function H4({ children, className }: TypographyProps) {
  return (
    <h4 className={cn("scroll-m-20 text-2xl first:mt-0", className)}>
      {children}
    </h4>
  );
}

export function P({ children, className }: TypographyProps) {
  return (
    <p
      className={cn(
        "px-4 text-justify leading-7 md:px-12 [&:not(:first-child)]:mt-6",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function List({ children, className }: TypographyProps) {
  return (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}>
      {children}
    </ul>
  );
}

export function Lead({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-xl text-muted-foreground", className)}>{children}</p>
  );
}

export function BlockQuote({ children, className }: TypographyProps) {
  return (
    <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)}>
      {children}
    </blockquote>
  );
}

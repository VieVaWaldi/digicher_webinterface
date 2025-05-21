import Link from "next/link";
import { H2 } from "shadcn/typography";

export default function DIGICHerLinks() {
  return (
    <div className="mx-auto max-w-2xl pt-8">
      <H2 className="text-center">About the Project</H2>

      <p className="mt-4 px-4 text-center text-muted-foreground">
        This application is part of the{" "}
        <Link
          href="https://www.digicher-project.eu/"
          className="font-medium text-orange-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          DIGICHer project
        </Link>
        . The project aims to develop a framework for equitable, diverse, and
        inclusive practices in digitising minorities&apos; cultural heritage.
        The project focuses on three representative minority groups in Europe:
        the Sámi, the Jewish people, and the Ladin people. Through co-creation
        activities and user-centric approaches, DIGICHer seeks to support the
        European cultural heritage sector in becoming more digitally adept while
        promoting equity, diversity, and inclusion.
      </p>

      <div className="mt-6">
        <Link
          href="https://github.com/VieVaWaldi/DIGICHer_Pipeline"
          className="group block"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center justify-center rounded-md p-4 transition-colors hover:bg-secondary/80">
            <div className="flex flex-col items-center text-base text-muted-foreground sm:flex-row">
              <div className="mb-2 flex items-center sm:mb-0">
                <span className="mr-2 text-3xl">🚀</span>
                <span>Powered by the</span>
              </div>
              <span className="mx-1 font-medium text-orange-500">
                Digital Humanities Data Pipeline
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

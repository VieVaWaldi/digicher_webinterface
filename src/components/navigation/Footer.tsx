import { Github } from "lucide-react";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-slate-900 px-4 py-12 text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Department Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-orange-400">
              Digital Humanities at Friedrich Schiller University
            </h3>
            <p className="text-slate-300">
              The junior professorship focuses on high-level research and
              teaching in Digital Humanities and Digital Cultural Heritage,
              specializing in image- and object-based knowledge media. Our work
              encompasses information behavior, museum mediation, and digital
              competencies development.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="https://www.gw.uni-jena.de/en/8465/juniorprofessur-fuer-digital-humanities"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300"
              >
                Visit Department Website
              </Link>
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-orange-400">Contact</h3>
            <p className="text-slate-300">Led by J.Prof. Dr. Sander Münster</p>
            <p className="text-slate-300">Developed by Walter Ehrenberger</p>
            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/vievawaldi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-orange-400"
              >
                <Github size={20} strokeWidth={1.25} />
                <span>@vievawaldi</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col gap-6 border-t border-slate-600 pt-8 text-sm text-slate-400">
          <Image
            src="/images/eu-funded.png"
            alt="Digicher Logo"
            width={256}
            height={128}
            className="object-contain"
          />
          <p>
            © {currentYear} Friedrich Schiller University Jena. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

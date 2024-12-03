import Image from "next/image";
import Link from "next/link";

export default function Header({ showBackButton = false }) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Link
            href="/"
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            ← Back to Main
          </Link>
        )}
        <Image
          src="/images/digicher-logo.png"
          alt="Digicher Logo"
          width={128}
          height={128}
          className="object-contain"
        />
      </div>
    </header>
  );
}

import Link from "next/link";

export default function DeckGlLinkList() {
  return (
    <div className="mt-8 flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Resources</h2>
      <Link
        href="https://deck.gl/examples"
        className="p-4 bg-yellow-400 text-white rounded hover:bg-yellow-100"
      >
        Basic Examples of Deck GL
      </Link>
      <Link
        href="https://deck.gl/showcase"
        className="p-4 bg-yellow-400 text-white rounded hover:bg-yellow-100"
      >
        More advanced examples of Deck GL
      </Link>
      <Link
        href="https://deck.gl/docs/api-reference/layers"
        className="p-4 bg-yellow-400 text-white rounded hover:bg-yellow-100"
      >
        A list of all Deck GL layers
      </Link>
      <Link
        href="https://docs.mapbox.com/api/maps/styles/"
        className="p-4 bg-yellow-400 text-white rounded hover:bg-yellow-100"
      >
        Styles that can be used for the mapbox maps
      </Link>
    </div>
  );
}
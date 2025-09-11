interface TitleProps {
  count: number;
}

export function Title({ count }: TitleProps) {
  return (
    <>
      <span className="text-gray-700">Displaying</span>{" "}
      <span className="font-semibold text-orange-400">
        {count.toLocaleString() || 0}
      </span>{" "}
      <span className="text-gray-700">Projects</span>
    </>
  );
}

export function InfoBox() {
  return (
    <div className="space-y-4 text-gray-700">
      <section>
        <h3 className="font-semibold text-gray-800">Project Map</h3>
        <p>
          Each dot represents a project with its coordinating institution from
          the aggregated dataset. Click on any project to view detailed
          information including title, objective, funding amount and call
          information. Use the search box to filter projects by keyword.
        </p>
      </section>
    </div>
  );
}

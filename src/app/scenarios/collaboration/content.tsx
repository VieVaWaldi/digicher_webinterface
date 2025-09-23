interface TitleContentProps {
  institutionCount: number;
  connectionsCount: number;
}

export default function TitleContent({
  institutionCount,
  connectionsCount,
}: TitleContentProps) {
  return (
    <div className="space-y-2">
      <p>
        Displaying{" "}
        <span className="font-semibold text-orange-400">
          {institutionCount.toLocaleString() || 0}
        </span>{" "}
        Institutions
        {connectionsCount > 0 && (
          <>
            {" "}
            with{" "}
            <span className="font-semibold text-orange-400">
              {connectionsCount.toLocaleString()}
            </span>{" "}
            collaboration connections
          </>
        )}
      </p>
    </div>
  );
}

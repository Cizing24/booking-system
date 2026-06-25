type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        {title}
      </h1>

      {description ? (
        <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}
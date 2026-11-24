interface ModulePlaceholderProps {
  title: string;
  description: string;
}

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold text-gray-950">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </section>
  );
}

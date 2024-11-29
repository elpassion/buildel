export function toSelectOption(item: { name: string; type: string }) {
  return {
    id: item.name.toString(),
    value: JSON.stringify({ name: item.name, type: item.type }),
    label: item.name,
  };
}

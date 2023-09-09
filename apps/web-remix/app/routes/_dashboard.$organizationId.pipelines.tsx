export {
  page as default,
  action,
  loader,
  meta,
} from "~/components/pages/pipelines/list";

export function ErrorBoundary() {
  return (
    <div>
      <h1>Oops, something went wrong</h1>
    </div>
  );
}

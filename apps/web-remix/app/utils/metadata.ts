import type { LoaderFunction, MetaFunction } from '@remix-run/node';

export const metaWithDefaults = <
  Loader extends LoaderFunction | unknown = unknown,
  ParentsLoaders extends Record<string, LoaderFunction | unknown> = Record<
    string,
    unknown
  >,
>(
  appendFn: MetaFunction<Loader, ParentsLoaders>,
): MetaFunction<Loader, ParentsLoaders> => {
  return (args) => {
    const meta = appendFn(args).map((m) => {
      //@ts-ignore
      if (m['title']) {
        //@ts-ignore
        return { ...m, title: `Buildel | ${m['title']}` };
      }

      return m;
    });

    return [
      {
        name: 'description',
        content:
          'Automate AI workflows effortlessly with our modular, no-code platform. Perfect for developers and non-coders alike. Open-source and community-driven!',
      },
      ...meta,
    ];
  };
};

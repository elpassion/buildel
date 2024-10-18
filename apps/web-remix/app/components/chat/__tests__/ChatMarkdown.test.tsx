import { mergeAdjacentDetailsWithSameSummary } from '~/components/chat/ChatMarkdown';

describe(mergeAdjacentDetailsWithSameSummary.name, () => {
  it('should merge adjacent details with the same summary', () => {
    const markdown = `<details><summary>Summary 1</summary>Child 1</details><details><summary>Summary 1</summary>Child 2</details> hello world`;

    expect(mergeAdjacentDetailsWithSameSummary(markdown)).toMatchInlineSnapshot(
      `
      "<details class="text-sm border border-input rounded-md w-fit py-2 my-2">
      <summary class="cursor-pointer list-none -ml-1 px-4">Summary 1</summary>
      <ul class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 1</span></li><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 2</span></li></ul>
      </details> hello world"
    `,
    );
  });

  it('should group and merge different adjacent details with the same summary', () => {
    const markdown = `<details><summary>Summary 1</summary>Child 1</details><details><summary>Summary 2</summary>Child 1</details><details><summary>Summary 1</summary>Child 2</details> hello world`;

    expect(mergeAdjacentDetailsWithSameSummary(markdown)).toMatchInlineSnapshot(
      `
      "<details class="text-sm border border-input rounded-md w-fit py-2 my-2">
      <summary class="cursor-pointer list-none -ml-1 px-4">Summary 1</summary>
      <ul class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 1</span></li><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 2</span></li></ul>
      </details><details class="text-sm border border-input rounded-md w-fit py-2 my-2">
      <summary class="cursor-pointer list-none -ml-1 px-4">Summary 2</summary>
      <ul class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 1</span></li></ul>
      </details> hello world"
    `,
    );
  });

  it('should do not merge details divided by text', () => {
    const markdown = `<details><summary>Summary 1</summary>Child 1</details> <p>SOME STRANGE TEXT</p> <details><summary>Summary 1</summary>Child 2</details> `;

    expect(mergeAdjacentDetailsWithSameSummary(markdown)).toMatchInlineSnapshot(
      `
      "<details class="text-sm border border-input rounded-md w-fit py-2 my-2">
      <summary class="cursor-pointer list-none -ml-1 px-4">Summary 1</summary>
      <ul class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 1</span></li></ul>
      </details> <p>SOME STRANGE TEXT</p> <details class="text-sm border border-input rounded-md w-fit py-2 my-2">
      <summary class="cursor-pointer list-none -ml-1 px-4">Summary 1</summary>
      <ul class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 2</span></li></ul>
      </details> "
    `,
    );
  });

  it('should merge details at the end of the markdown', () => {
    const markdown = `<p>SOME STRANGE TEXT</p><details><summary>Summary 1</summary>Child 1</details><details><summary>Summary 1</summary>Child 2</details> `;

    expect(mergeAdjacentDetailsWithSameSummary(markdown)).toMatchInlineSnapshot(
      `
      "<p>SOME STRANGE TEXT</p><details class="text-sm border border-input rounded-md w-fit py-2 my-2">
      <summary class="cursor-pointer list-none -ml-1 px-4">Summary 1</summary>
      <ul class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 1</span></li><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 2</span></li></ul>
      </details> "
    `,
    );
  });

  it('should merge details divided by space', () => {
    const markdown = `<details><summary>Summary 1</summary>Child 1</details> <details><summary>Summary 1</summary>Child 2</details><p>SOME STRANGE TEXT</p><details><summary>Summary 1</summary>Child 1</details>      <details><summary>Summary 1</summary>Child 2</details>`;

    expect(mergeAdjacentDetailsWithSameSummary(markdown)).toMatchInlineSnapshot(
      `
      " <details class="text-sm border border-input rounded-md w-fit py-2 my-2">
      <summary class="cursor-pointer list-none -ml-1 px-4">Summary 1</summary>
      <ul class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 1</span></li><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 2</span></li></ul>
      </details><p>SOME STRANGE TEXT</p>      <details class="text-sm border border-input rounded-md w-fit py-2 my-2">
      <summary class="cursor-pointer list-none -ml-1 px-4">Summary 1</summary>
      <ul class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 1</span></li><li class="list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"><span class="left-2 relative -top-1.5">Child 2</span></li></ul>
      </details>"
    `,
    );
  });
});

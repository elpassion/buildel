import { describe, expect } from 'vitest';

import {
  addReferenceToLinks,
  ChatMarkdown,
  getFaviconFromDomain,
  mergeAdjacentDetailsWithSameSummary,
  truncateChildrenContent,
} from '~/components/chat/ChatMarkdown';
import { render } from '~/tests/render';

describe(ChatMarkdown.name, () => {
  describe(mergeAdjacentDetailsWithSameSummary.name, () => {
    it('should merge adjacent details with the same summary', () => {
      const { container } = render(
        <ChatMarkdown>{`<details><summary>Summary 1</summary>Child 1</details><details><summary>Summary 1</summary>Child 2</details> hello world`}</ChatMarkdown>,
      );

      expect(container).toMatchInlineSnapshot(
        `
        <div>
          <div
            id="_root"
          >
            <details
              class="text-sm border border-input rounded-md w-fit py-2 my-2"
            >
              

              <summary
                class="cursor-pointer list-none -ml-1 px-4"
              >
                Summary 1
              </summary>
              

              <ul
                class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"
              >
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 1
                  </span>
                </li>
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 2
                  </span>
                </li>
              </ul>
              

            </details>
             hello world
          </div>
        </div>
      `,
      );
    });

    it('should group and merge different adjacent details with the same summary', () => {
      const { container } = render(
        <ChatMarkdown>{`<details><summary>Summary 1</summary>Child 1</details><details><summary>Summary 2</summary>Child 1</details><details><summary>Summary 1</summary>Child 2</details> hello world`}</ChatMarkdown>,
      );
      expect(container).toMatchInlineSnapshot(
        `
        <div>
          <div
            id="_root"
          >
            <details
              class="text-sm border border-input rounded-md w-fit py-2 my-2"
            >
              

              <summary
                class="cursor-pointer list-none -ml-1 px-4"
              >
                Summary 1
              </summary>
              

              <ul
                class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"
              >
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 1
                  </span>
                </li>
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 2
                  </span>
                </li>
              </ul>
              

            </details>
            <details
              class="text-sm border border-input rounded-md w-fit py-2 my-2"
            >
              

              <summary
                class="cursor-pointer list-none -ml-1 px-4"
              >
                Summary 2
              </summary>
              

              <ul
                class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"
              >
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 1
                  </span>
                </li>
              </ul>
              

            </details>
             hello world
          </div>
        </div>
      `,
      );
    });

    it('should do not merge details divided by text', () => {
      const { container } = render(
        <ChatMarkdown>{`<details><summary>Summary 1</summary>Child 1</details> <p>SOME STRANGE TEXT</p> <details><summary>Summary 1</summary>Child 2</details> `}</ChatMarkdown>,
      );

      expect(container).toMatchInlineSnapshot(
        `
        <div>
          <div
            id="_root"
          >
            <details
              class="text-sm border border-input rounded-md w-fit py-2 my-2"
            >
              

              <summary
                class="cursor-pointer list-none -ml-1 px-4"
              >
                Summary 1
              </summary>
              

              <ul
                class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"
              >
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 1
                  </span>
                </li>
              </ul>
              

            </details>
             
            <p
              class="my-2 break-words whitespace-normal text-sm"
              node="[object Object]"
            >
              SOME STRANGE TEXT
            </p>
             
            <details
              class="text-sm border border-input rounded-md w-fit py-2 my-2"
            >
              

              <summary
                class="cursor-pointer list-none -ml-1 px-4"
              >
                Summary 1
              </summary>
              

              <ul
                class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"
              >
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 2
                  </span>
                </li>
              </ul>
              

            </details>
             
          </div>
        </div>
      `,
      );
    });

    it('should merge details at the end of the markdown', () => {
      const { container } = render(
        <ChatMarkdown>{`<p>SOME STRANGE TEXT</p><details><summary>Summary 1</summary>Child 1</details><details><summary>Summary 1</summary>Child 2</details> `}</ChatMarkdown>,
      );

      expect(container).toMatchInlineSnapshot(
        `
        <div>
          <div
            id="_root"
          >
            <p
              class="my-2 break-words whitespace-normal text-sm"
              node="[object Object]"
            >
              SOME STRANGE TEXT
            </p>
            <details
              class="text-sm border border-input rounded-md w-fit py-2 my-2"
            >
              

              <summary
                class="cursor-pointer list-none -ml-1 px-4"
              >
                Summary 1
              </summary>
              

              <ul
                class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"
              >
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 1
                  </span>
                </li>
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 2
                  </span>
                </li>
              </ul>
              

            </details>
             
          </div>
        </div>
      `,
      );
    });

    it('should merge details divided by space', () => {
      const { container } = render(
        <ChatMarkdown>{`<details><summary>Summary 1</summary>Child 1</details> <details><summary>Summary 1</summary>Child 2</details><p>SOME STRANGE TEXT</p><details><summary>Summary 1</summary>Child 1</details>      <details><summary>Summary 1</summary>Child 2</details>`}</ChatMarkdown>,
      );

      expect(container).toMatchInlineSnapshot(
        `
        <div>
          <div
            id="_root"
          >
             
            <details
              class="text-sm border border-input rounded-md w-fit py-2 my-2"
            >
              

              <summary
                class="cursor-pointer list-none -ml-1 px-4"
              >
                Summary 1
              </summary>
              

              <ul
                class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"
              >
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 1
                  </span>
                </li>
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 2
                  </span>
                </li>
              </ul>
              

            </details>
            <p
              class="my-2 break-words whitespace-normal text-sm"
              node="[object Object]"
            >
              SOME STRANGE TEXT
            </p>
                  
            <details
              class="text-sm border border-input rounded-md w-fit py-2 my-2"
            >
              

              <summary
                class="cursor-pointer list-none -ml-1 px-4"
              >
                Summary 1
              </summary>
              

              <ul
                class="p-0 pb-0 pt-4 mt-2 mb-0 border-t border-input pl-4 pr-5"
              >
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 1
                  </span>
                </li>
                <li
                  class="!m-0 marker:text-muted-foreground text-sm list-none [&:not(:last-child)]:pb-6 pl-0 pr-1 [&:not(:last-child)]:border-l border-input before:relative before:content-[''] before:bg-foreground before:-top-1.5 before:-left-1 before:w-2 before:h-2 before:inline-block before:rounded-full"
                  node="[object Object]"
                >
                  <span
                    class="text-sm break-words whitespace-pre-wrap left-2 relative -top-1.5"
                    node="[object Object]"
                  >
                    Child 2
                  </span>
                </li>
              </ul>
              

            </details>
          </div>
        </div>
      `,
      );
    });
  });
  describe(getFaviconFromDomain.name, () => {
    it('should return favicon url when regional domain', () => {
      expect(getFaviconFromDomain(new URL('https://www.bbc.co.uk'))).toBe(
        `https://www.google.com/s2/favicons?sz=64&domain_url=bbc.co.uk`,
      );
    });

    it('should return favicon url when basic domain', () => {
      expect(getFaviconFromDomain(new URL('https://www.bbc.com'))).toBe(
        `https://www.google.com/s2/favicons?sz=64&domain_url=bbc.com`,
      );
    });

    it('should return favicon url when path domain', () => {
      expect(getFaviconFromDomain(new URL('https://www.bbc.co.uk/news'))).toBe(
        `https://www.google.com/s2/favicons?sz=64&domain_url=bbc.co.uk`,
      );
    });
  });

  describe(addReferenceToLinks.name, () => {
    it('should add link reference at the bottom of the markdown', () => {
      const markdown = `
### Landscape
![Landscape](https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260)
`;

      const result = addReferenceToLinks(markdown);

      expect(result.message).toMatchInlineSnapshot(`
        "
        ### Landscape
        ![Landscape](https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260)
        "
      `);
      expect(result.links).toEqual([]);
    });

    it('should ignore links when incorrect', () => {
      const markdown = `
(https://www.foodnetwork.com/recipes/food-network-kitchen/grilled-lemon-herb-chicken-recipe-2103607)
`;

      const result = addReferenceToLinks(markdown);

      expect(result.links).toEqual([]);
      expect(result.message).toMatchInlineSnapshot(`
      "
      (https://www.foodnetwork.com/recipes/food-network-kitchen/grilled-lemon-herb-chicken-recipe-2103607)
      "
    `);
    });

    it('should ignore links when image links', () => {
      const markdown = `
(https://www.foodnetwork.com/recipes/food-network-kitchen/grilled-lemon-herb-chicken-recipe-2103607)
`;

      const result = addReferenceToLinks(markdown);

      expect(result.links).toEqual([]);
      expect(result.message).toMatchInlineSnapshot(`
      "
      (https://www.foodnetwork.com/recipes/food-network-kitchen/grilled-lemon-herb-chicken-recipe-2103607)
      "
    `);
    });
  });

  describe(truncateChildrenContent.name, () => {
    it('should truncate too long code blocks', () => {
      const markdown = `
\`\`\`python
class ToDoList:
    def __init__(self):
        self.tasks = []

    def add_task(self, task):
        self.tasks.append(task)
        print(f'Added task: "{task}"')

    def remove_task(self, task_number):
        if 0 <= task_number < len(self.tasks):
            removed_task = self.tasks.pop(task_number)
            print(f'Removed task: "{removed_task}"')
        else:
            print("Invalid task number.")

    def view_tasks(self):
        if not self.tasks:
            print("No tasks in the list.")
        else:
            print("Your tasks:")
            for index, task in enumerate(self.tasks):
                print(f"{index}. {task}")
\`\`\`
`;

      expect(truncateChildrenContent(markdown, 100)).toMatchInlineSnapshot(`
        [
          "
        \`\`\`python
        class ToDoList:
            def __init__(self):
                self.ta

        ... rest of code",
        ]
      `);
    });

    it('shouldnt truncate code blocks', () => {
      const markdown = `
\`\`\`python
class ToDoList:
    def __init__(self):
        self.tasks = []

    def add_task(self, task):
        self.tasks.append(task)
        print(f'Added task: "{task}"')

\`\`\`
`;

      expect(truncateChildrenContent(markdown, 10000)).toMatchInlineSnapshot(`
        [
          "
        \`\`\`python
        class ToDoList:
            def __init__(self):
                self.tasks = []

            def add_task(self, task):
                self.tasks.append(task)
                print(f'Added task: "{task}"')

        \`\`\`
        ",
        ]
      `);
    });
  });
});

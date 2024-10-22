import { describe, expect } from 'vitest';

import {
  ChatMarkdown,
  mergeAdjacentDetailsWithSameSummary,
} from '~/components/chat/ChatMarkdown';
import { addReferenceToLinks } from '~/components/chat/ChatMessages';
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
              class="my-2 break-words whitespace-pre-wrap text-sm"
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
              class="my-2 break-words whitespace-pre-wrap text-sm"
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
              class="my-2 break-words whitespace-pre-wrap text-sm"
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
  describe(addReferenceToLinks.name, () => {
    it('should add link reference at the bottom of the markdown', () => {
      const markdown = `
### **Grilled Lemon Herb Chicken**

**Ingredients:**
- 4 boneless, skinless chicken breasts
- 1/4 cup olive oil

[Grilled Lemon Herb Chicken Recipe](https://www.foodnetwork.com/recipes/food-network-kitchen/grilled-lemon-herb-chicken-recipe-2103607)
[Some other Chicken Recipe](http://www.text.com)
`;

      const result = addReferenceToLinks(markdown);

      expect(result.message).toMatchInlineSnapshot(`
        "
        ### **Grilled Lemon Herb Chicken**

        **Ingredients:**
        - 4 boneless, skinless chicken breasts
        - 1/4 cup olive oil

        [Grilled Lemon Herb Chicken Recipe](https://www.foodnetwork.com/recipes/food-network-kitchen/grilled-lemon-herb-chicken-recipe-2103607) <span style="width: 18px; height: 18px; border-radius: 4px; background-color: #fcfcfc; display: inline-flex; justify-content: center; align-items: center; margin-left: 4px; font-size: 12px; color: #61616A; font-weight: 400;">1</span>
        [Some other Chicken Recipe](http://www.text.com) <span style="width: 18px; height: 18px; border-radius: 4px; background-color: #fcfcfc; display: inline-flex; justify-content: center; align-items: center; margin-left: 4px; font-size: 12px; color: #61616A; font-weight: 400;">2</span>
        "
      `);
      expect(result.links).toEqual([
        new URL(
          'https://www.foodnetwork.com/recipes/food-network-kitchen/grilled-lemon-herb-chicken-recipe-2103607',
        ),
        new URL('http://www.text.com/'),
      ]);
    });
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
});

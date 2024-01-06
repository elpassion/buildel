import classNames from "classnames";
import { IMembership } from "./organization.types";
import { ItemList } from "~/components/list/ItemList";
import { Link, useLoaderData } from "@remix-run/react";
import { routes } from "~/utils/routes.utils";
import { loader } from "./loader";
import { Button } from "@elpassion/taco";

interface MembershipsProps {
  memberships: IMembership[];
}

export const Memberships: React.FC<MembershipsProps> = ({ memberships }) => {
  const {
    organization: {
      data: { id: organizationId },
    },
  } = useLoaderData<typeof loader>();
  return (
    <section className="text-white">
      <h2 className="text-lg">Memberships</h2>
      <p className="text-xs">Members of your organization.</p>
      <Link
        to={routes.membershipsNew(organizationId)}
        className="mb-6 block w-fit mt-2"
      >
        <Button tabIndex={0} size="sm">
          New Member
        </Button>
      </Link>
      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex gap-2 items-center">
          <ItemList
            items={memberships}
            renderItem={(membership) => (
              <MembershipListItem membership={membership} />
            )}
            className={"flex flex-col gap-2"}
          />
        </div>
      </div>
    </section>
  );
};

interface MembershipListItemProps {
  membership: IMembership;
}
export const MembershipListItem = ({ membership }: MembershipListItemProps) => {
  return (
    <article
      className={classNames(
        "group bg-neutral-800 px-6 py-4 rounded-lg text-basic-white hover:bg-neutral-850 transition cursor-pointer"
      )}
    >
      {membership.user.email}
    </article>
  );
};
